export const LANGUAGE_CATALOG = [
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript', executable: true },
  { id: 'python', label: 'Python', monacoId: 'python', executable: true },
  { id: 'java', label: 'Java', monacoId: 'java', executable: true },
  { id: 'c', label: 'C', monacoId: 'c', executable: true },
  { id: 'cpp', label: 'C++', monacoId: 'cpp', executable: true },
  { id: 'go', label: 'Go', monacoId: 'go', executable: true },
  { id: 'ruby', label: 'Ruby', monacoId: 'ruby', executable: true },
];

export const ROOM_LANGUAGES = LANGUAGE_CATALOG.map((language) => language.id);

export const EXECUTION_LANGUAGE_CONFIG = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '4' },
  cpp: { language: 'cpp', versionIndex: '5' },
  c: { language: 'c', versionIndex: '5' },
  java: { language: 'java', versionIndex: '4' },
  ruby: { language: 'ruby', versionIndex: '4' },
  go: { language: 'go', versionIndex: '4' },
};

export const EXECUTABLE_LANGUAGES = Object.keys(EXECUTION_LANGUAGE_CONFIG);
