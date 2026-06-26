export interface ChapterConfig {
  id: string;
  filename: string;
  title: string;
  heading: string;
  systemPrompt: string;
  userPrompt: string;
  includePatterns: string[];
}

export const CHAPTERS: ChapterConfig[] = [
  {
    id: "1",
    filename: "chapter_1_introduction.md",
    title: "Introduction",
    heading: "CHAPTER 1: INTRODUCTION",
    includePatterns: ["README.md", "AGENTS.md", "package.json", "frontend/package.json", "backend/**/*.csproj"],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences.`,
    userPrompt: `Generate 'CHAPTER 1: INTRODUCTION' based on the provided repository context.

Follow the Al-Azhar University rubric and include these sections:

## 1.1 Background and Motivation
Describe the problem that the project sets out to solve. Explain the background the reader needs to understand the problem. Include a clear and detailed statement of the project aims and provide an overview of the structure of the solution. Conventionally, the last part of the introduction outlines the remainder of the report.

## 1.2 Problem Statement
Clearly define the core problem being addressed. Why is this problem significant? Who is affected by it?

## 1.3 Project Objectives
List the specific objectives the project aims to achieve. Distinguish between functional and non-functional requirements.

## 1.4 Methodology
Explain how you analyzed the problem, including user requirements. Give an appropriate specification of the solution (method used, functional requirements, non-functional requirements, security requirements).

## 1.5 Report Organization
Briefly outline each remaining chapter of the report.

Start with '# CHAPTER 1: INTRODUCTION' as the top-level heading.`,
  },
  {
    id: "2",
    filename: "chapter_2_background.md",
    title: "Background Materials",
    heading: "CHAPTER 2: BACKGROUND MATERIALS",
    includePatterns: [
      "README.md",
      "package.json",
      "frontend/package.json",
      "backend/**/*.csproj",
      "frontend/next.config.*",
      "frontend/middleware.*",
      "frontend/providers/**",
      "backend/Api/Program.cs",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences. Limit background to what the reader needs to know to understand the solution developed.`,
    userPrompt: `Generate 'CHAPTER 2: BACKGROUND MATERIALS' based on the provided repository context.

This chapter introduces the necessary background material related to the underlying project. Limit yourself to what the reader needs to know to understand the solution that has been developed.

Include these sections:

## 2.1 Introduction
Brief overview of the chapter's purpose and structure.

## 2.2 Technology Stack
Present the technologies, frameworks, and libraries used in the project. For each, explain what it is, why it was chosen, and how it fits into the architecture. Cover:
- Backend technologies (e.g., .NET, Entity Framework, SQL Server)
- Frontend technologies (e.g., Next.js, React, TypeScript, Material UI)
- Infrastructure and tooling (e.g., Bun, Docker, CI/CD)

## 2.3 Domain Concepts
Explain key domain concepts relevant to the car rental system (e.g., booking workflows, payment processing, fleet management).

## 2.4 Related Work and Literature Review
Review existing approaches to similar problems. Compare alternative solutions and justify the chosen approach.

Use standard markdown numbering hierarchy (e.g., 2.2.1, 2.2.2 for subsections, and A.I, A.I.1 for further nesting).

Start with '# CHAPTER 2: BACKGROUND MATERIALS' as the top-level heading.`,
  },
  {
    id: "3",
    filename: "chapter_3_system_design.md",
    title: "System Design",
    heading: "CHAPTER 3: SYSTEM DESIGN",
    includePatterns: [
      "backend/Api/**/*.cs",
      "backend/Core/**/*.cs",
      "backend/Shared/**/*.cs",
      "frontend/src/**/*.ts",
      "frontend/src/**/*.tsx",
      "frontend/src/**/*.css",
      "frontend/providers/**",
      "!**/*.test.*",
      "!**/*.spec.*",
      "!**/node_modules/**",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences. Focus on architectural and implementation significance; do not list every minor function in elaborate detail.`,
    userPrompt: `Generate 'CHAPTER 3: SYSTEM DESIGN' based on the provided repository context.

Follow the Al-Azhar University rubric. Provide these sections:

## 3.1 Introduction
Brief overview of the system design chapter.

## 3.2 High-Level Software Structure
Give a high-level account of the structure of the software and how it works. Describe the overall architecture (frontend, backend, database layers), components, and their interactions. Use Mermaid diagram descriptions where helpful.

## 3.3 Algorithms and Data Structures
Explain the conceptual structure of the core algorithms and data structures used. How do these compare with alternatives?

## 3.4 Database Design
Detail the database schema, entity relationships, and key data models. Include entity relationship diagrams (described in Mermaid syntax).

## 3.5 API Design
Document the main API endpoints, their purposes, and data flow. Describe RESTful endpoints, authentication, and authorization mechanisms.

## 3.6 Implementation Decisions and Justifications
Detail the main implementation decisions taken and justify them. What design patterns were used and why? What tradeoffs were made?

## 3.7 User Interface Design
Describe the frontend architecture, component hierarchy, state management approach, and key UI/UX decisions.

Do not list every minor function; focus on architectural and implementation significance.

Start with '# CHAPTER 3: SYSTEM DESIGN' as the top-level heading.`,
  },
  {
    id: "4",
    filename: "chapter_4_results.md",
    title: "Results and Discussion",
    heading: "CHAPTER 4: RESULTS AND DISCUSSION",
    includePatterns: [
      "README.md",
      "package.json",
      "frontend/package.json",
      "backend/**/*.csproj",
      ".github/workflows/**",
      "frontend/cypress/**",
      "frontend/.storybook/**",
      "run-ci-tests.ps1",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences. Be completely honest about deficiencies and inadequacies.`,
    userPrompt: `Generate 'CHAPTER 4: RESULTS AND DISCUSSION' based on the provided repository context.

Follow the Al-Azhar University rubric and include:

## 4.1 Results
Assess the success of the project. How does it compare with the original specification? How reliable is it? How has it been tested? Comment on robustness. Present measurable outcomes such as:
- Feature completeness against requirements
- Performance observations (load times, API response times)
- Testing coverage and results
- Security audit results

## 4.2 Discussion
Summarize achievements and also the deficiencies of the project. Be completely honest and list the technical deficiencies, remaining problems, and inadequacies found in the current implementation. State what could have been done with more time. Address:
- What works well and why
- What doesn't work well and why
- Known bugs and limitations
- Areas that need improvement
- What would be done differently with more time

Start with '# CHAPTER 4: RESULTS AND DISCUSSION' as the top-level heading.`,
  },
  {
    id: "5",
    filename: "chapter_5_conclusion.md",
    title: "Conclusion and Future Work",
    heading: "CHAPTER 5: CONCLUSION AND FUTURE WORK",
    includePatterns: [
      "README.md",
      "AGENTS.md",
      "package.json",
      "frontend/package.json",
      "backend/**/*.csproj",
      "backend/Api/Program.cs",
      "frontend/next.config.*",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences. Do not introduce new material in the conclusion.`,
    userPrompt: `Generate 'CHAPTER 5: CONCLUSION AND FUTURE WORK' based on the provided repository context.

Follow the Al-Azhar University rubric and include:

## 5.1 Conclusion
Give a brief statement of how the solution provided addresses the problem stated in the introduction. Provide an evaluative statement based on the results. Do not introduce new material.

## 5.2 Future Work
Recommend what needs to be done in the future. Suggest specific enhancements, features, and improvements. Include:
- Short-term improvements (bug fixes, performance optimization)
- Medium-term features (new functionality, expanded scope)
- Long-term vision (architectural changes, scalability)

Start with '# CHAPTER 5: CONCLUSION AND FUTURE WORK' as the top-level heading.`,
  },
  {
    id: "appendix-a",
    filename: "appendix_a.md",
    title: "Appendices - File Structure & Execution",
    heading: "APPENDIX A: APPENDICES",
    includePatterns: [
      "README.md",
      "AGENTS.md",
      "package.json",
      "scripts/setup/**",
      "scripts/docs/**",
      "frontend/package.json",
      "backend/**/*.csproj",
      ".devcontainer/**",
      ".github/**",
      ".husky/**",
      ".gitignore",
      "run-ci-tests.ps1",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences.`,
    userPrompt: `Generate 'APPENDIX A: APPENDICES' based on the provided repository context.

Follow the Al-Azhar University rubric. The appendix must:

1. Explain the file structure of the submitted project
2. Contain instructions on how the code should be run
3. Include step-by-step setup instructions

Structure the appendix as follows:

## A.1 File Structure
Provide a clear explanation of the repository's file and folder structure. Organize by:
- Root-level directories and their purposes
- Backend structure and key files
- Frontend structure and key files
- Configuration files and their roles
- Scripts and tooling

## A.2 System Requirements
List all required software, versions, and where to get them.

## A.3 Installation and Setup
Provide detailed, step-by-step instructions on how the code should be configured, built, and executed. Include:
- Prerequisites installation
- Environment variable configuration
- Database setup
- Backend build and run instructions
- Frontend build and run instructions

## A.4 Running the Application
Step-by-step guide to run the full application (both backend and frontend).

## A.5 Development and Testing
Instructions for development workflow, running tests, and code quality tools.

Start with '# APPENDIX A: APPENDICES' as the top-level heading.`,
  },
  {
    id: "appendix-b",
    filename: "appendix_b_references.md",
    title: "References",
    heading: "APPENDIX B: REFERENCES",
    includePatterns: [
      "README.md",
      "package.json",
      "frontend/package.json",
      "backend/**/*.csproj",
      "scripts/docs/package.json",
      "scripts/setup/package.json",
    ],
    systemPrompt: `You are an expert academic documentation writer for a graduation project at Al-Azhar University, Faculty of Engineering, Systems & Computers Department. You write in formal academic English following the university's rubric guidelines. Output raw Markdown only, never wrap content in codeblock fences. Use APA citation style.`,
    userPrompt: `Generate 'APPENDIX B: REFERENCES' based on the provided repository context.

Cite and reference work to which the project owes an intellectual debt. Use APA citation style.

Include references for:
- All frameworks and libraries used (with version numbers where detectable)
- Technical documentation and APIs referenced
- Academic papers or books consulted
- Online resources and tutorials used
- Official documentation for core technologies

Format each reference entry in APA style, e.g.:
- Author, A. A. (Year). *Title of work*. Publisher. DOI or URL

All reference items should be listed in 10pt font equivalent (use normal text, no special formatting).

Start with '# APPENDIX B: REFERENCES' as the top-level heading.`,
  },
];

export function getChapterById(id: string): ChapterConfig | undefined {
  return CHAPTERS.find(ch => ch.id === id);
}

export function getChaptersByIds(ids: string[]): ChapterConfig[] {
  return ids.map(id => getChapterById(id)).filter((ch): ch is ChapterConfig => ch !== undefined);
}

export function getAllChapterIds(): string[] {
  return CHAPTERS.map(ch => ch.id);
}
