import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import treeKill from 'tree-kill';

// ── Language Config ───────────────────────────────────────────────
// Adjusted for Windows compatibility
const LANGUAGE_CONFIG = {
  javascript: {
    filename: 'main.js',
    runCmd: (dir) => `node "${path.join(dir, 'main.js')}"`,
    compileCmd: null,
  },
  python: {
    filename: 'main.py',
    runCmd: (dir) => `python "${path.join(dir, 'main.py')}"`,
    compileCmd: null,
  },
  cpp: {
    filename: 'main.cpp',
    runCmd: (dir) => `"${path.join(dir, 'main.exe')}"`,
    compileCmd: (dir) =>
      `g++ "${path.join(dir, 'main.cpp')}" -o "${path.join(dir, 'main.exe')}"`,
  },
  c: {
    filename: 'main.c',
    runCmd: (dir) => `"${path.join(dir, 'main.exe')}"`,
    compileCmd: (dir) =>
      `gcc "${path.join(dir, 'main.c')}" -o "${path.join(dir, 'main.exe')}"`,
  },
  java: {
    filename: 'Main.java',
    runCmd: (dir) => `java -cp "${dir}" Main`,
    compileCmd: (dir) => `javac "${path.join(dir, 'Main.java')}"`,
  },
};

// ── Limits ────────────────────────────────────────────────────────
const TIMEOUT_MS = 10_000;   // 10 seconds execution limit
const MAX_BUFFER = 10_000;   // 10 KB max output buffer

// ── Helper: run a shell command with timeout ──────────────────────
const runShellCommand = (cmd, stdin = '') => {
  return new Promise((resolve) => {
    let timedOut = false;

    const child = exec(
      cmd,
      { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER },
      (err, stdout, stderr) => {
        if (timedOut) {
          return resolve({
            output: 'Time Limit Exceeded (10s)',
            status: 'Time Limit Exceeded',
            success: false,
          });
        }

        if (err && !stdout) {
          return resolve({
            output: stderr || err.message,
            status: 'Runtime Error',
            success: false,
          });
        }

        const trimmedStdout = (stdout || '').trim();
        const trimmedStderr = (stderr || '').trim();

        return resolve({
          output: trimmedStdout || trimmedStderr || 'No output',
          status: trimmedStderr ? 'Completed with warnings' : 'Success',
          success: !trimmedStderr,
        });
      }
    );

    // Kill entire process tree on timeout
    const timer = setTimeout(() => {
      timedOut = true;
      if (child.pid) treeKill(child.pid, 'SIGKILL');
    }, TIMEOUT_MS);

    child.on('close', () => clearTimeout(timer));

    // Feed stdin if provided
    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch {
        // stdin may already be closed
      }
    }
  });
};

// ── Main Execute Function ─────────────────────────────────────────
export const executeCode = (language, code, stdin = '') => {
  return new Promise((resolve) => {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return resolve({
        output: `Unsupported language: ${language}`,
        status: 'Error',
        success: false,
      });
    }

    const jobId = uuidv4();
    const tmpDir = path.join(os.tmpdir(), 'codesync', jobId);
    const filePath = path.join(tmpDir, config.filename);

    // 1. Create temp directory and write code file
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(filePath, code, 'utf8');
    } catch (err) {
      return resolve({
        output: 'Failed to create temp files: ' + err.message,
        status: 'Error',
        success: false,
      });
    }

    // 2. Cleanup helper
    const cleanup = () => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch { /* ignore */ }
    };

    // 3. Execute
    const execute = async () => {
      try {
        // Compiled languages (C, C++, Java)
        if (config.compileCmd) {
          const compileResult = await runShellCommand(config.compileCmd(tmpDir));

          if (!compileResult.success && compileResult.status !== 'Completed with warnings') {
            cleanup();
            return resolve({
              output: compileResult.output,
              status: 'Compilation Error',
              success: false,
            });
          }

          const runResult = await runShellCommand(config.runCmd(tmpDir), stdin);
          cleanup();
          return resolve(runResult);
        }

        // Interpreted languages (JS, Python)
        const runResult = await runShellCommand(config.runCmd(tmpDir), stdin);
        cleanup();
        return resolve(runResult);
      } catch (err) {
        cleanup();
        return resolve({
          output: err.message,
          status: 'Error',
          success: false,
        });
      }
    };

    execute();
  });
};
