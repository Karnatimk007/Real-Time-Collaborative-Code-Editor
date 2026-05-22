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
const JDOODLE_CLIENT_ID     = process.env.JDOODLE_CLIENT_ID     || 'YOUR_CLIENT_ID';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

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

  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error';
    console.error('[JDoodle] Execution error:', msg);
    return { output: `Execution service error: ${msg}`, status: 'Error', success: false };
  }
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_IDS);