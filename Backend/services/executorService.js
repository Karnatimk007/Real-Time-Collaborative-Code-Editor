import axios from 'axios';

// ── Judge0 Language IDs ───────────────────────────────────────────────────────
// Full list: https://judge0-ce.p.rapidapi.com/languages
const LANGUAGE_IDS = {
  javascript: 63,   // Node.js 12.14.0
  python:     71,   // Python 3.8.1
  cpp:        54,   // C++ (GCC 9.2.0)
  c:          50,   // C (GCC 9.2.0)
  java:       62,   // Java (OpenJDK 13.0.1)
  typescript: 74,   // TypeScript 3.7.4
  go:         60,   // Go 1.13.5
  rust:       73,   // Rust 1.40.0
  kotlin:     78,   // Kotlin 1.3.70
  ruby:       72,   // Ruby 2.7.0
};

// ── Config ────────────────────────────────────────────────────────────────────
const JUDGE0_BASE_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY  = process.env.JUDGE0_API_KEY || '';  // Set in .env for RapidAPI hosted Judge0
const USE_RAPIDAPI    = !!JUDGE0_API_KEY;                   // false → use self-hosted / public instance

const POLL_INTERVAL_MS = 1000;   // 1 second between status polls
const MAX_POLLS        = 15;     // max 15 seconds wait
const CPU_TIME_LIMIT   = 5;      // seconds (Judge0 param)
const MEMORY_LIMIT     = 128000; // KB = 128 MB

// ── Status codes returned by Judge0 ──────────────────────────────────────────
const STATUS = {
  1:  'In Queue',
  2:  'Processing',
  3:  'Accepted',
  4:  'Wrong Answer',
  5:  'Time Limit Exceeded',
  6:  'Compilation Error',
  7:  'Runtime Error (SIGSEGV)',
  8:  'Runtime Error (SIGXFSZ)',
  9:  'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

// ── Axios instance ────────────────────────────────────────────────────────────
const judge0Client = axios.create({
  baseURL: JUDGE0_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(USE_RAPIDAPI && {
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    }),
  },
});

// ── Helper: base64 encode / decode ────────────────────────────────────────────
const b64 = (str) => Buffer.from(str || '').toString('base64');
const atob = (str) => Buffer.from(str || '', 'base64').toString('utf-8');

// ── Submit code to Judge0 ─────────────────────────────────────────────────────
const submitSubmission = async (languageId, sourceCode, stdin) => {
  const payload = {
    language_id:    languageId,
    source_code:    b64(sourceCode),
    stdin:          b64(stdin),
    cpu_time_limit: CPU_TIME_LIMIT,
    memory_limit:   MEMORY_LIMIT,
    encode_output:  true,
  };

  const { data } = await judge0Client.post('/submissions?base64_encoded=true&wait=false', payload);
  return data.token;
};

// ── Poll until execution is done ──────────────────────────────────────────────
const pollSubmission = async (token) => {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const { data } = await judge0Client.get(
      `/submissions/${token}?base64_encoded=true&fields=status_id,stdout,stderr,compile_output,message,time,memory`
    );

    const statusId = data.status_id;

    // Still queued or running → keep polling
    if (statusId === 1 || statusId === 2) continue;

    // Done (any terminal status)
    const stdout        = atob(data.stdout);
    const stderr        = atob(data.stderr);
    const compileOutput = atob(data.compile_output);
    const message       = atob(data.message);
    const statusLabel   = STATUS[statusId] || 'Unknown';

    if (statusId === 3) {
      // Accepted
      return {
        output:  stdout || '(no output)',
        status:  'Success',
        success: true,
        time:    data.time,
        memory:  data.memory,
      };
    }

    if (statusId === 6) {
      // Compilation Error
      return {
        output:  compileOutput || stderr || 'Compilation failed',
        status:  'Compilation Error',
        success: false,
      };
    }

    if (statusId === 5) {
      return {
        output:  'Time Limit Exceeded',
        status:  'Time Limit Exceeded',
        success: false,
      };
    }

    // All other errors (runtime, internal, etc.)
    return {
      output:  stderr || compileOutput || message || statusLabel,
      status:  statusLabel,
      success: false,
    };
  }

  // Timed out waiting for Judge0
  return {
    output:  'Execution timed out waiting for sandbox response',
    status:  'Timeout',
    success: false,
  };
};

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Execute code securely via Judge0 sandbox.
 * @param {string} language  - e.g. 'javascript', 'python'
 * @param {string} code      - source code
 * @param {string} stdin     - optional standard input
 * @returns {Promise<{output, status, success, time?, memory?}>}
 */
export const executeCode = async (language, code, stdin = '') => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];

  if (!languageId) {
    return {
      output:  `Unsupported language: ${language}`,
      status:  'Error',
      success: false,
    };
  }

  try {
    const token = await submitSubmission(languageId, code, stdin);
    const result = await pollSubmission(token);
    return result;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Unknown error';
    console.error('[Judge0] Execution error:', msg);
    return {
      output:  `Execution service error: ${msg}`,
      status:  'Error',
      success: false,
    };
  }
};

// ── Exported language list (for routes) ───────────────────────────────────────
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_IDS);
