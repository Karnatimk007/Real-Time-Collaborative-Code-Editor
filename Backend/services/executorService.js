import axios from 'axios';

// ── JDoodle Language Mapping ──────────────────────────────────────────────────
const LANGUAGE_IDS = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python:     { language: 'python3', versionIndex: '4' },
  cpp:        { language: 'cpp', versionIndex: '5' },
  c:          { language: 'c', versionIndex: '5' },
  java:       { language: 'java', versionIndex: '4' },
  ruby:       { language: 'ruby', versionIndex: '4' },
  go:         { language: 'go', versionIndex: '4' },
};

// ── Config ────────────────────────────────────────────────────────────────────
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || 'ddaf8d4381d9fe2884626c22816c87be';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || 'ff49a36244847e9ea18d5d8ab349040efddd957740b9ee54c2670b120a79d4c8';

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Execute code via JDoodle API.
 * @param {string} language  - e.g. 'javascript', 'python'
 * @param {string} code      - source code
 * @param {string} stdin     - optional standard input
 * @returns {Promise<{output, status, success, time?, memory?}>}
 */
export const executeCode = async (language, code, stdin = '') => {
  const langConfig = LANGUAGE_IDS[language.toLowerCase()];

  if (!langConfig) {
    return {
      output:  `Unsupported language: ${language}`,
      status:  'Error',
      success: false,
    };
  }

  try {
    const payload = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: stdin,
      language: langConfig.language,
      versionIndex: langConfig.versionIndex,
    };

    const response = await axios.post('https://api.jdoodle.com/v1/execute', payload);

    if (response.data.error) {
      return {
        output: response.data.error,
        status: 'Error',
        success: false,
      };
    }

    return {
      output: response.data.output,
      status: 'Success',
      success: true,
      time: response.data.cpuTime,
      memory: response.data.memory,
    };
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error';
    console.error('[JDoodle] Execution error:', msg);
    return {
      output:  `Execution service error: ${msg}`,
      status:  'Error',
      success: false,
    };
  }
};

// ── Exported language list (for routes) ───────────────────────────────────────
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_IDS);

