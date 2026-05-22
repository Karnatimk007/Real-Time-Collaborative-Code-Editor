import axios from 'axios';

// ── JDoodle Language Mapping ──────────────────────────────────────────────────
const LANGUAGE_IDS = {
  javascript: { language: 'nodejs',   versionIndex: '4' },
  python:     { language: 'python3',  versionIndex: '4' },
  cpp:        { language: 'cpp17',    versionIndex: '1' }, // ✅ cpp17 is the correct language key
  c:          { language: 'c',        versionIndex: '4' }, // ✅ fixed from '5' to '4'
  java:       { language: 'java',     versionIndex: '4' },
  ruby:       { language: 'ruby',     versionIndex: '4' },
  go:         { language: 'go',       versionIndex: '4' },
};

// ── Config ────────────────────────────────────────────────────────────────────
const JDOODLE_CLIENT_ID     = process.env.JDOODLE_CLIENT_ID     || 'ddaf8d4381d9fe2884626c22816c87be';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || 'ff49a36244847e9ea18d5d8ab349040efddd957740b9ee54c2670b120a79d4c8';
const HAS_JDOODLE_CREDS = Boolean(JDOODLE_CLIENT_ID && JDOODLE_CLIENT_SECRET);

// Judge0 fallback config (set JUDGE0_URL to e.g. http://localhost:2358)
const JUDGE0_URL = process.env.JUDGE0_URL || '';
const HAS_JUDGE0 = Boolean(JUDGE0_URL);

// Minimal mapping from language keys to Judge0 language_id
const JUDGE0_LANG_MAP = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13)
  ruby: 72,       // Ruby
  go: 20,         // Go
};

// ── Public API ────────────────────────────────────────────────────────────────
export const executeCode = async (language, code, stdin = '') => {
  const langConfig = LANGUAGE_IDS[language.toLowerCase()];
  if (!langConfig) {
    return { output: `Unsupported language: ${language}`, status: 'Error', success: false };
  }

  try {
    const payload = {
      clientId:     JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script:       code,
      stdin:        stdin,          // ✅ must be a plain string, e.g. "5\n" or "5 10\n"
      language:     langConfig.language,
      versionIndex: langConfig.versionIndex,
    };

    if (HAS_JDOODLE_CREDS) {
      const response = await axios.post('https://api.jdoodle.com/v1/execute', payload);

      // ✅ JDoodle sometimes returns statusCode 400 inside response.data
      if (response.data.error || response.data.statusCode === 400) {
        return {
          output:  response.data.error || response.data.output || 'Unknown JDoodle error',
          status:  'Error',
          success: false,
        };
      }

      return {
        output:  response.data.output,
        status:  'Success',
        success: true,
        time:    response.data.cpuTime,
        memory:  response.data.memory,
      };
    }

    // No JDoodle creds — try Judge0 if configured
    if (HAS_JUDGE0) {
      const langId = JUDGE0_LANG_MAP[language.toLowerCase()];
      if (!langId) {
        const msg = `No Judge0 mapping for language: ${language}`;
        console.error('[Judge0] Mapping missing:', msg);
        return { output: `Execution service error: ${msg}`, status: 'Error', success: false };
      }

      try {
        const judgePayload = {
          source_code: code,
          language_id: langId,
          stdin: stdin,
        };

        const url = `${JUDGE0_URL.replace(/\/+$/, '')}/submissions?wait=true`;
        const resp = await axios.post(url, judgePayload, { timeout: 20000 });

        const data = resp.data;
        const out = data.stdout ?? data.compile_output ?? data.stderr ?? '';
        const statusText = data.status?.description || (data.stdout ? 'Success' : 'Error');

        return {
          output: out || '',
          status: statusText,
          success: data.stdout ? true : false,
          time: data.time ?? null,
          memory: data.memory ?? null,
        };
      } catch (je) {
        const serverMsg = je.response?.data || je.message || 'Judge0 request failed';
        console.error('[Judge0] Execution error:', serverMsg);
        return { output: `Execution service error: ${serverMsg}`, status: 'Error', success: false };
      }
    }

    const msg = 'JDoodle credentials not configured. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in the environment, or set JUDGE0_URL to use a Judge0 instance.';
    console.error('[Execution] Missing execution backend:', msg);
    return { output: `Execution service error: ${msg}`, status: 'Error', success: false };

    // ✅ JDoodle sometimes returns statusCode 400 inside response.data
    if (response.data.error || response.data.statusCode === 400) {
      return {
        output:  response.data.error || response.data.output || 'Unknown JDoodle error',
        status:  'Error',
        success: false,
      };
    }

    return {
      output:  response.data.output,
      status:  'Success',
      success: true,
      time:    response.data.cpuTime,
      memory:  response.data.memory,
    };

  } catch (err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
    console.error(`[JDoodle] Execution error: status=${status} message=${serverMsg}`);
    return { output: `Execution service error: ${serverMsg}`, status: 'Error', success: false };
  }
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_IDS);