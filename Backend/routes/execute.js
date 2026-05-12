import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { executeCode } from '../services/executorService.js';

const router = express.Router();

// All languages supported by the local executor
const SUPPORTED_LANGUAGES = ['javascript', 'python', 'cpp', 'java', 'c'];

// POST /api/execute
router.post('/', verifyToken, async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'code and language are required' });
    }

    const lang = language.toLowerCase();

    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({
        message: 'Unsupported language',
        supported: SUPPORTED_LANGUAGES,
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({ message: 'Code too long (max 50 KB)' });
    }

    const result = await executeCode(lang, code, stdin);

    res.status(200).json({
      output: result.output,
      status: result.status,
      success: result.success,
      language: lang,
    });
  } catch (err) {
    console.error('Execute Error:', err.message);
    res.status(500).json({ message: 'Execution failed', error: err.message });
  }
});

// GET /api/execute/languages
router.get('/languages', (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

export default router;
