export const LANGUAGE_CATALOG = [
  { id: "javascript", label: "JavaScript", monacoId: "javascript", executable: true },
  { id: "python", label: "Python", monacoId: "python", executable: true },
  { id: "java", label: "Java", monacoId: "java", executable: true },
  { id: "c", label: "C", monacoId: "c", executable: true },
  { id: "cpp", label: "C++", monacoId: "cpp", executable: true },
  { id: "go", label: "Go", monacoId: "go", executable: true },
  { id: "ruby", label: "Ruby", monacoId: "ruby", executable: true },
];

export const EXECUTABLE_LANGUAGE_IDS = LANGUAGE_CATALOG
  .filter((language) => language.executable)
  .map((language) => language.id);

export const LANGUAGE_BY_ID = LANGUAGE_CATALOG.reduce((map, language) => {
  map[language.id] = language;
  return map;
}, {});

export const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,
  python: `# Python\nprint("Hello, World!")`,
  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  c: `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  go: `// Go\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  ruby: `# Ruby\nputs "Hello, World!"`,
};
