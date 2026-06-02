import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Paths
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for database structure
interface ILocalDbSchema {
  subjects: any[];
  chapters: any[];
  lessons: any[];
  studysessions: any[];
  achievements: any[];
  executionlogs: any[];
  learningpaths: any[];
  knowledgenodes: any[];
}

let db: ILocalDbSchema = {
  subjects: [],
  chapters: [],
  lessons: [],
  studysessions: [],
  achievements: [],
  executionlogs: [],
  learningpaths: [],
  knowledgenodes: [],
};

// Save Database to file
const saveDb = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to mock JSON database:', error);
  }
};

// Load Database from file
const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
    } else {
      seedInitialData();
      saveDb();
    }
  } catch (error) {
    console.error('Failed to read from mock JSON database, seeding defaults:', error);
    seedInitialData();
    saveDb();
  }
};

// Seed initial course data if database is empty
const seedInitialData = () => {
  console.log('🌱 Seeding mock course syllabus data to local JSON database...');

  const userId = 'default-user';

  // 1. Subjects
  const s1 = {
    _id: 'sub-webdev',
    name: 'Full-Stack Web Development',
    description: 'Master React 19, Next.js 15, Node.js API Architecture, and modern styling systems.',
    color: '#8b5cf6', // Violet
    icon: '🌐',
    userId,
    totalChapters: 2,
    completedChapters: 1,
    totalLessons: 5,
    completedLessons: 3,
    progressPercent: 60,
    totalTimeSpent: 7500, // 125 mins
    xpEarned: 350,
    tags: ['Web Dev', 'React', 'Node'],
    isArchived: false,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const s2 = {
    _id: 'sub-aisys',
    name: 'AI & LLM Systems Engineering',
    description: 'Learn structured outputs, token budgets, prompt orchestration, and vector search integration.',
    color: '#06b6d4', // Cyan
    icon: 'Bot',
    userId,
    totalChapters: 1,
    completedChapters: 0,
    totalLessons: 2,
    completedLessons: 0,
    progressPercent: 0,
    totalTimeSpent: 0,
    xpEarned: 0,
    tags: ['AI', 'OpenAI', 'Prompting'],
    isArchived: false,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const s3 = {
    _id: 'sub-sysdesign',
    name: 'Software System Design',
    description: 'Deep dive into database replication, caching layers, rate limiting, and sharding scaling policies.',
    color: '#ec4899', // Pink
    icon: '🏗️',
    userId,
    totalChapters: 1,
    completedChapters: 0,
    totalLessons: 2,
    completedLessons: 1,
    progressPercent: 50,
    totalTimeSpent: 3000, // 50 mins
    xpEarned: 120,
    tags: ['System Design', 'Scaling', 'Databases'],
    isArchived: false,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.subjects = [s1, s2, s3];

  // 2. Chapters
  const c1_1 = {
    _id: 'chap-reactnext',
    subjectId: 'sub-webdev',
    userId,
    title: 'React 19 Core & Next.js 15 App Router',
    description: 'Learn server-centric state management, file-based layouts, and data pipelines.',
    order: 1,
    totalLessons: 3,
    completedLessons: 2,
    progressPercent: 66,
    totalTimeSpent: 4800,
    isLocked: false,
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const c1_2 = {
    _id: 'chap-nodeapi',
    subjectId: 'sub-webdev',
    userId,
    title: 'Node.js & TypeScript API Architecture',
    description: 'Build enterprise Express apps with strict type checks and clean modular architectures.',
    order: 2,
    totalLessons: 2,
    completedLessons: 1,
    progressPercent: 50,
    totalTimeSpent: 2700,
    isLocked: false,
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const c2_1 = {
    _id: 'chap-aiprompt',
    subjectId: 'sub-aisys',
    userId,
    title: 'OpenAI Prompt Orchestration',
    description: 'System design for chaining prompts, function calling, and structured JSON responses.',
    order: 1,
    totalLessons: 2,
    completedLessons: 0,
    progressPercent: 0,
    totalTimeSpent: 0,
    isLocked: false,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const c3_1 = {
    _id: 'chap-sysrep',
    subjectId: 'sub-sysdesign',
    userId,
    title: 'Replication & Scalability Patterns',
    description: 'Understand master-slave setups, consensus protocols, and read-heavy caching strategies.',
    order: 1,
    totalLessons: 2,
    completedLessons: 1,
    progressPercent: 50,
    totalTimeSpent: 3000,
    isLocked: false,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.chapters = [c1_1, c1_2, c2_1, c3_1];

  // 3. Lessons
  db.lessons = [
    {
      _id: 'les-rsc',
      chapterId: 'chap-reactnext',
      subjectId: 'sub-webdev',
      userId,
      title: 'React Server Components (RSC) vs Client Components',
      content: `# React Server Components (RSC) vs Client Components\n\nIn Next.js, components default to **Server Components** (RSC). Understanding when to opt into Client Components is fundamental to building high-performance modern web apps.\n\n### Core Differences\n1. **Execution**: Server Components execute *only* on the server. Client Components are pre-rendered on the server and hydrated in the browser.\n2. **Payload Size**: RSCs do not add to the client bundle size, resulting in much faster load times.\n3. **Use Cases**: Use Server Components for data fetching, static text, or secure operations. Use Client Components for event listeners (\`onClick\`), react hooks (\`useState\`, \`useEffect\`), or browser APIs.\n\n\`\`\`tsx\n// Server Component by default\nimport { db } from '@/lib/db';\n\nexport default async function SubjectList() {\n  const subjects = await db.subject.findMany();\n  return (\n    <div>\n      {subjects.map(s => <p key={s.id}>{s.name}</p>)}\n    </div>\n  );\n}\n\`\`\`\n\nTo make a Client Component, add the \`"use client"\` directive at the very top of your file.`,
      status: 'completed',
      codeSnippets: [
        {
          language: 'typescript',
          code: '"use client";\nimport { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}',
          title: 'Counter Client Component'
        }
      ],
      resources: [
        { title: 'Next.js RSC Documentation', url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components', type: 'article' }
      ],
      timeSpent: 2400,
      xpEarned: 100,
      isBookmarked: true,
      order: 1,
      difficulty: 'beginner',
      notes: 'Learned the basic rendering differences. RSC is server-only execution.',
      summary: 'React Server Components improve application boot times by rendering server-side without adding JavaScript code weight to client bundles.',
      tags: ['React', 'NextJS', 'RSC'],
      lastReviewedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      nextReviewAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      reviewCount: 2,
      masteryScore: 85,
      completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-actions',
      chapterId: 'chap-reactnext',
      subjectId: 'sub-webdev',
      userId,
      title: 'Data Fetching and Mutation with Server Actions',
      content: `# Data Fetching and Mutation with Server Actions\n\nServer Actions allow you to run server-side code without defining API endpoints manually. They are declared with the \`"use server"\` directive.\n\n### Benefits\n- No REST/GraphQL boilerplate.\n- Automatic progressive enhancement: Forms submit even before JS is fully loaded.\n- Secure code execution.\n\n\`\`\`typescript\n// app/actions.ts\n"use server";\n\nexport async function updateProfile(formData: FormData) {\n  const name = formData.get("name");\n  // Write to DB\n  await db.user.update({ name });\n}\n\`\`\`\n\nIn your client-side form, simply assign this action parameter:\n\`\`\`tsx\n<form action={updateProfile}>\n  <input name="name" />\n  <button type="submit">Save</button>\n</form>\n\`\`\``,
      status: 'completed',
      codeSnippets: [
        {
          language: 'typescript',
          code: '"use server";\nimport { revalidatePath } from "next/cache";\n\nexport async function addSubject(data: any) {\n  await db.subject.create({ data });\n  revalidatePath("/subjects");\n}',
          title: 'Add Subject Server Action'
        }
      ],
      resources: [
        { title: 'Server Actions Guide', url: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations', type: 'article' }
      ],
      timeSpent: 2400,
      xpEarned: 100,
      isBookmarked: false,
      order: 2,
      difficulty: 'intermediate',
      notes: 'Server actions are great for form actions. Progressive enhancement is supported natively.',
      summary: 'Server actions enable direct execution of server functions from React forms and components, avoiding REST endpoint creation.',
      tags: ['NextJS', 'Server Actions', 'Forms'],
      lastReviewedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      nextReviewAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      reviewCount: 1,
      masteryScore: 80,
      completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 - 40 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-routing',
      chapterId: 'chap-reactnext',
      subjectId: 'sub-webdev',
      userId,
      title: 'Dynamic Routing and Metadata Optimization',
      content: `# Dynamic Routing and Metadata Optimization\n\nNext.js utilizes file-system routing. Folders inside \`app\` define the routes.\n\n### Dynamic Segments\nA dynamic segment is defined by wrapping a folder name in square brackets: \`[id]\` or \`[slug]\`.\n\n### Metadata\nTo optimize search indexing (SEO), export a \`metadata\` object or \`generateMetadata\` function from your page.\n\n\`\`\`typescript\nimport { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: 'Next Chapter Study OS',\n  description: 'AI-Powered Study Planner',\n};\n\`\`\``,
      status: 'in-progress',
      codeSnippets: [],
      resources: [],
      timeSpent: 1200,
      xpEarned: 0,
      isBookmarked: false,
      order: 3,
      difficulty: 'intermediate',
      notes: 'Read routing schema. Dynamic layout rules are clear.',
      summary: '',
      tags: ['Routing', 'SEO', 'Metadata'],
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      masteryScore: 30,
      completedAt: null,
      startedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-di',
      chapterId: 'chap-nodeapi',
      subjectId: 'sub-webdev',
      userId,
      title: 'Express Server Design and Dependency Injection',
      content: `# Express Server Design and Dependency Injection\n\nWriting clean servers in Node requires decoupled architectures. **Dependency Injection (DI)** helps pass subservices explicitly rather than requiring them statically.\n\n### Example design:\n\`\`\`typescript\nexport class SubjectController {\n  constructor(private subjectService: SubjectService) {}\n\n  async getAll(req: Request, res: Response) {\n    const data = await this.subjectService.find();\n    res.json(data);\n  }\n}\n\`\`\``,
      status: 'completed',
      codeSnippets: [],
      resources: [],
      timeSpent: 2700,
      xpEarned: 150,
      isBookmarked: false,
      order: 1,
      difficulty: 'advanced',
      notes: 'DI is good for mock tests.',
      summary: 'Dependency injection decouples controller code from service implementation, easing testing and code reuse.',
      tags: ['NodeJS', 'Express', 'Architecture'],
      lastReviewedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      nextReviewAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      reviewCount: 3,
      masteryScore: 90,
      completedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000 - 45 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-tsc',
      chapterId: 'chap-nodeapi',
      subjectId: 'sub-webdev',
      userId,
      title: 'TypeScript Compilation and Type Verification',
      content: `# TypeScript Compilation and Type Verification\n\nSetting up tsconfig.json properly protects against runtime errors. Be sure to configure:\n- \`strict: true\`\n- \`noImplicitAny: true\`\n- \`strictNullChecks: true\``,
      status: 'pending',
      codeSnippets: [],
      resources: [],
      timeSpent: 0,
      xpEarned: 0,
      isBookmarked: false,
      order: 2,
      difficulty: 'intermediate',
      notes: '',
      summary: '',
      tags: ['TypeScript', 'TSC', 'Configuration'],
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      masteryScore: 0,
      completedAt: null,
      startedAt: null,
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-temp',
      chapterId: 'chap-aiprompt',
      subjectId: 'sub-aisys',
      userId,
      title: 'Temperature and Structured JSON Response Formats',
      content: `# Temperature and Structured JSON Response Formats\n\nStructured outputs force the model to output a schema that matches your exact specification. Using \`response_format: { type: "json_object" }\` ensures parsing is safe.`,
      status: 'pending',
      codeSnippets: [],
      resources: [],
      timeSpent: 0,
      xpEarned: 0,
      isBookmarked: false,
      order: 1,
      difficulty: 'intermediate',
      notes: '',
      summary: '',
      tags: ['AI', 'OpenAI', 'JSON'],
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      masteryScore: 0,
      completedAt: null,
      startedAt: null,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-tokens',
      chapterId: 'chap-aiprompt',
      subjectId: 'sub-aisys',
      userId,
      title: 'Token Window Budgets & System Prompts',
      content: `# Token Window Budgets & System Prompts\n\nManaging text generation budgets is crucial when deploying LLMs. System prompts act as hard behavioral constraints.`,
      status: 'pending',
      codeSnippets: [],
      resources: [],
      timeSpent: 0,
      xpEarned: 0,
      isBookmarked: false,
      order: 2,
      difficulty: 'intermediate',
      notes: '',
      summary: '',
      tags: ['AI', 'OpenAI', 'Prompting'],
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      masteryScore: 0,
      completedAt: null,
      startedAt: null,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-replica',
      chapterId: 'chap-sysrep',
      subjectId: 'sub-sysdesign',
      userId,
      title: 'Database Replication and Master-Slave Setups',
      content: `# Database Replication and Master-Slave Setups\n\nReplication provides high-availability and read-scalability. Master handles writes, slaves process read operations.`,
      status: 'completed',
      codeSnippets: [],
      resources: [],
      timeSpent: 3000,
      xpEarned: 120,
      isBookmarked: false,
      order: 1,
      difficulty: 'advanced',
      notes: 'Learned Master-Slave differences and read replicas scaling limits.',
      summary: 'Replication routes write loads to master instances, replicating them to read-only slaves to distribute traffic.',
      tags: ['Database', 'Scale', 'Replication'],
      lastReviewedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      nextReviewAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
      reviewCount: 1,
      masteryScore: 70,
      completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 - 50 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'les-shard',
      chapterId: 'chap-sysrep',
      subjectId: 'sub-sysdesign',
      userId,
      title: 'MongoDB Sharding and Index Optimization',
      content: `# MongoDB Sharding and Index Optimization\n\nSharding distributes database segments horizontally. Indexes speed up query matching.`,
      status: 'pending',
      codeSnippets: [],
      resources: [],
      timeSpent: 0,
      xpEarned: 0,
      isBookmarked: false,
      order: 2,
      difficulty: 'advanced',
      notes: '',
      summary: '',
      tags: ['MongoDB', 'Index', 'Sharding'],
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      masteryScore: 0,
      completedAt: null,
      startedAt: null,
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // 4. StudySessions
  db.studysessions = [
    {
      _id: 'sess-1',
      userId,
      lessonId: { _id: 'les-rsc', title: 'React Server Components (RSC) vs Client Components' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6' },
      chapterId: { _id: 'chap-reactnext', title: 'React 19 Core & Next.js 15 App Router' },
      duration: 1500, // 25 mins
      pomodoroCount: 1,
      startTime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 25 * 60 * 1000).toISOString(),
      type: 'study',
      notes: 'Read theoretical differences between RSC and client hydration.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'sess-2',
      userId,
      lessonId: { _id: 'les-actions', title: 'Data Fetching and Mutation with Server Actions' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6' },
      chapterId: { _id: 'chap-reactnext', title: 'React 19 Core & Next.js 15 App Router' },
      duration: 1800, // 30 mins
      pomodoroCount: 1,
      startTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 30 * 60 * 1000).toISOString(),
      type: 'review',
      notes: 'Practiced action form submissions.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'sess-3',
      userId,
      lessonId: { _id: 'les-di', title: 'Express Server Design and Dependency Injection' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6' },
      chapterId: { _id: 'chap-nodeapi', title: 'Node.js & TypeScript API Architecture' },
      duration: 2400, // 40 mins
      pomodoroCount: 2,
      startTime: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 40 * 60 * 1000).toISOString(),
      type: 'practice',
      notes: 'Constructed explicit interface dependency container.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'sess-4',
      userId,
      lessonId: { _id: 'les-replica', title: 'Database Replication and Master-Slave Setups' },
      subjectId: { _id: 'sub-sysdesign', name: 'Software System Design', color: '#ec4899' },
      chapterId: { _id: 'chap-sysrep', title: 'Replication & Scalability Patterns' },
      duration: 3000,
      pomodoroCount: 2,
      startTime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 50 * 60 * 1000).toISOString(),
      type: 'study',
      notes: 'Learned replica failover scenarios.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  // 5. ExecutionLogs
  db.executionlogs = [
    {
      _id: 'log-1',
      userId,
      lessonId: { _id: 'les-rsc', title: 'React Server Components (RSC) vs Client Components' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6', icon: '🌐' },
      chapterId: { _id: 'chap-reactnext', title: 'React 19 Core & Next.js 15 App Router' },
      action: 'completed',
      duration: 2400,
      timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      notes: 'Completed lesson and marked study module finished.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'log-2',
      userId,
      lessonId: { _id: 'les-actions', title: 'Data Fetching and Mutation with Server Actions' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6', icon: '🌐' },
      chapterId: { _id: 'chap-reactnext', title: 'React 19 Core & Next.js 15 App Router' },
      action: 'completed',
      duration: 2400,
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      notes: 'Completed form updates.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'log-3',
      userId,
      lessonId: { _id: 'les-di', title: 'Express Server Design and Dependency Injection' },
      subjectId: { _id: 'sub-webdev', name: 'Full-Stack Web Development', color: '#8b5cf6', icon: '🌐' },
      chapterId: { _id: 'chap-nodeapi', title: 'Node.js & TypeScript API Architecture' },
      action: 'completed',
      duration: 2700,
      timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      notes: 'Dependency container compilation verified.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'log-4',
      userId,
      lessonId: { _id: 'les-replica', title: 'Database Replication and Master-Slave Setups' },
      subjectId: { _id: 'sub-sysdesign', name: 'Software System Design', color: '#ec4899', icon: '🏗️' },
      chapterId: { _id: 'chap-sysrep', title: 'Replication & Scalability Patterns' },
      action: 'completed',
      duration: 3000,
      timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      notes: 'Logged replication patterns.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  // 6. LearningPaths
  db.learningpaths = [
    {
      _id: 'path-fullstack',
      userId,
      title: 'Full-Stack Developer Sprint Plan',
      lessonIds: [
        { _id: 'les-rsc', title: 'React Server Components (RSC) vs Client Components', status: 'completed', masteryScore: 85 },
        { _id: 'les-actions', title: 'Data Fetching and Mutation with Server Actions', status: 'completed', masteryScore: 80 },
        { _id: 'les-routing', title: 'Dynamic Routing and Metadata Optimization', status: 'in-progress', masteryScore: 30 }
      ],
      scheduledDates: [
        new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString()
      ],
      spacedRepetitionInterval: [1, 3, 7],
      nextReviewAt: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
      completedCount: 2,
      totalCount: 3,
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  // 7. KnowledgeNodes (for graph visualization)
  db.knowledgenodes = [
    // Subject Nodes
    { _id: 'node-s1', userId, subjectId: 'sub-webdev', type: 'subject', label: 'Full-Stack Web Development', masteryScore: 60, connections: ['node-s2'] },
    { _id: 'node-s2', userId, subjectId: 'sub-aisys', type: 'subject', label: 'AI & LLM Systems Engineering', masteryScore: 0, connections: [] },
    { _id: 'node-s3', userId, subjectId: 'sub-sysdesign', type: 'subject', label: 'Software System Design', masteryScore: 50, connections: ['node-s1'] },
    // Chapter Nodes
    { _id: 'node-c1_1', userId, subjectId: 'sub-webdev', type: 'chapter', label: 'React 19 Core & Next.js 15 App Router', masteryScore: 66, connections: ['node-s1'] },
    { _id: 'node-c1_2', userId, subjectId: 'sub-webdev', type: 'chapter', label: 'Node.js & TypeScript API Architecture', masteryScore: 50, connections: ['node-s1', 'node-c1_1'] },
    { _id: 'node-c2_1', userId, subjectId: 'sub-aisys', type: 'chapter', label: 'OpenAI Prompt Orchestration', masteryScore: 0, connections: ['node-s2'] },
    { _id: 'node-c3_1', userId, subjectId: 'sub-sysdesign', type: 'chapter', label: 'Replication & Scalability Patterns', masteryScore: 50, connections: ['node-s3'] },
    // Lesson Nodes
    { _id: 'node-l1', userId, subjectId: 'sub-webdev', type: 'lesson', label: 'React Server Components (RSC) vs Client Components', masteryScore: 85, connections: ['node-c1_1'] },
    { _id: 'node-l2', userId, subjectId: 'sub-webdev', type: 'lesson', label: 'Data Fetching and Mutation with Server Actions', masteryScore: 80, connections: ['node-c1_1', 'node-l1'] },
    { _id: 'node-l3', userId, subjectId: 'sub-webdev', type: 'lesson', label: 'Dynamic Routing and Metadata Optimization', masteryScore: 30, connections: ['node-c1_1'] },
    { _id: 'node-l4', userId, subjectId: 'sub-webdev', type: 'lesson', label: 'Express Server Design and Dependency Injection', masteryScore: 90, connections: ['node-c1_2'] },
    { _id: 'node-l5', userId, subjectId: 'sub-webdev', type: 'lesson', label: 'TypeScript Compilation and Type Verification', masteryScore: 0, connections: ['node-c1_2'] }
  ];
};

// Custom Query class to mimic Mongoose Query Chain
class MockQuery<T> {
  private data: T[];

  constructor(data: T[]) {
    this.data = data;
  }

  sort(arg: any) {
    if (!this.data || !Array.isArray(this.data)) return this;
    
    if (typeof arg === 'string') {
      const isDesc = arg.startsWith('-');
      const field = isDesc ? arg.slice(1) : arg;
      this.data.sort((a: any, b: any) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    } else if (typeof arg === 'object' && arg !== null) {
      const field = Object.keys(arg)[0];
      const order = arg[field];
      this.data.sort((a: any, b: any) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return order === -1 ? 1 : -1;
        if (valA > valB) return order === -1 ? -1 : 1;
        return 0;
      });
    }
    return this;
  }

  limit(count: number) {
    if (!this.data || !Array.isArray(this.data)) return this;
    this.data = this.data.slice(0, count);
    return this;
  }

  select(fields: string) {
    return this;
  }

  populate(path: string, select?: string) {
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any) {
    return Promise.resolve(this.data).catch(onrejected);
  }
}

// Generate random ID helper
const generateId = (prefix: string = 'id') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

// Patch dynamic helper functions onto a Model instance
const decorateInstance = (instance: any, tableName: keyof ILocalDbSchema) => {
  if (!instance) return instance;

  instance.save = async function () {
    const table: any[] = db[tableName];
    const dataObj = JSON.parse(JSON.stringify(this));

    if (!dataObj._id) {
      dataObj._id = generateId(tableName.slice(0, 3));
      dataObj.createdAt = new Date().toISOString();
    }
    dataObj.updatedAt = new Date().toISOString();

    const idx = table.findIndex((x) => String(x._id) === String(dataObj._id));
    if (idx >= 0) {
      table[idx] = { ...table[idx], ...dataObj };
    } else {
      table.push(dataObj);
    }
    saveDb();
    return this;
  };

  return instance;
};

// Map mongoose model names to db key names
const getTableName = (modelName: string): keyof ILocalDbSchema => {
  const map: Record<string, keyof ILocalDbSchema> = {
    Subject: 'subjects',
    Chapter: 'chapters',
    Lesson: 'lessons',
    StudySession: 'studysessions',
    Achievement: 'achievements',
    ExecutionLog: 'executionlogs',
    LearningPath: 'learningpaths',
    KnowledgeNode: 'knowledgenodes',
  };
  return map[modelName] || 'subjects';
};

// Setup Mock Mongoose Methods
export const hookLocalDbFallback = () => {
  loadDb();
  console.log('🔌 Injecting JSON DB Fallback interfaces onto Mongoose Models...');

  const modelNames = ['Subject', 'Chapter', 'Lesson', 'StudySession', 'Achievement', 'ExecutionLog', 'LearningPath', 'KnowledgeNode'];

  modelNames.forEach((modelName) => {
    try {
      const Model = mongoose.model(modelName) as any;
      const tableName = getTableName(modelName);

      // 1. Mock find
      Model.find = function (query: any = {}) {
        let list = [...(db[tableName] || [])];
        
        // Simple query filter matching
        if (query && typeof query === 'object') {
          Object.keys(query).forEach((key) => {
            const val = query[key];
            if (val && typeof val === 'object' && ('$in' in val || '$gte' in val || '$lt' in val || '$lte' in val)) {
              if ('$in' in val) {
                const arr = val['$in'].map(String);
                list = list.filter((item: any) => arr.includes(String(item[key])));
              }
              if ('$gte' in val) {
                const dateLimit = new Date(val['$gte']).getTime();
                list = list.filter((item: any) => new Date(item[key]).getTime() >= dateLimit);
              }
              if ('$lte' in val) {
                const dateLimit = new Date(val['$lte']).getTime();
                list = list.filter((item: any) => new Date(item[key]).getTime() <= dateLimit);
              }
              if ('$lt' in val) {
                const dateLimit = new Date(val['$lt']).getTime();
                list = list.filter((item: any) => new Date(item[key]).getTime() < dateLimit);
              }
            } else if (key === 'userId' || key === '_id') {
              list = list.filter((item: any) => String(item[key]) === String(val));
            } else {
              list = list.filter((item: any) => String(item[key]) === String(val));
            }
          });
        }
        
        const instances = list.map((data) => decorateInstance(new Model(data), tableName));
        return new MockQuery(instances);
      };

      // 2. Mock findOne
      Model.findOne = function (query: any = {}) {
        const queryResult = Model.find(query);
        const promise = queryResult.then((list: any[]) => list[0] || null);
        
        // Add direct then mapping
        return {
          then: (onfulfilled?: any) => promise.then(onfulfilled),
        };
      };

      // 3. Mock findById
      Model.findById = function (id: string) {
        return Model.findOne({ _id: id });
      };

      // 4. Mock findByIdAndUpdate
      Model.findByIdAndUpdate = async function (id: string, update: any = {}, options: any = {}) {
        const table: any[] = db[tableName];
        const idx = table.findIndex((x) => String(x._id) === String(id));
        if (idx >= 0) {
          // Handle increment tags like $inc
          if (update.$inc) {
            Object.keys(update.$inc).forEach((incKey) => {
              table[idx][incKey] = (table[idx][incKey] || 0) + update.$inc[incKey];
            });
            delete update.$inc;
          }
          table[idx] = { ...table[idx], ...update, updatedAt: new Date().toISOString() };
          saveDb();
          return decorateInstance(new Model(table[idx]), tableName);
        }
        return null;
      };

      // 5. Mock findOneAndUpdate
      Model.findOneAndUpdate = async function (query: any = {}, update: any = {}) {
        const list = await Model.find(query).then((rows: any[]) => rows);
        if (!list.length) return null;
        const id = list[0]._id;
        return Model.findByIdAndUpdate(id, update, { new: true });
      };

      // 6. Mock findByIdAndDelete
      Model.findByIdAndDelete = async function (id: string) {
        const table: any[] = db[tableName];
        const idx = table.findIndex((x) => String(x._id) === String(id));
        if (idx >= 0) {
          const removed = table.splice(idx, 1)[0];
          saveDb();
          return decorateInstance(new Model(removed), tableName);
        }
        return null;
      };

      // 6. Mock deleteMany
      Model.deleteMany = async function (query: any = {}) {
        const table: any[] = db[tableName];
        if (Object.keys(query).length === 0) {
          db[tableName] = [];
        } else {
          // Filter out matches
          const field = Object.keys(query)[0];
          const val = query[field];
          if (val && typeof val === 'object' && '$in' in val) {
            const arr = val['$in'].map(String);
            db[tableName] = table.filter((item: any) => !arr.includes(String(item[field])));
          } else {
            db[tableName] = table.filter((item: any) => String(item[field]) !== String(val));
          }
        }
        saveDb();
        return { deletedCount: table.length - db[tableName].length };
      };

      // 7. Mock aggregate for AnalyticsService
      if (modelName === 'StudySession') {
        Model.aggregate = async function (pipeline: any[]) {
          // We look for group by date matching
          const matchStage = pipeline.find((p) => p.$match);
          const groupStage = pipeline.find((p) => p.$group);
          let filtered = [...db.studysessions];

          if (matchStage?.$match?.userId) {
            filtered = filtered.filter((s) => String(s.userId) === String(matchStage.$match.userId));
          }

          if (matchStage && matchStage.$match.startTime && matchStage.$match.startTime.$gte) {
            const limitTime = new Date(matchStage.$match.startTime.$gte).getTime();
            filtered = filtered.filter((s) => new Date(s.startTime).getTime() >= limitTime);
          }

          if (groupStage && groupStage.$group) {
            // Group by YYYY-MM-DD
            const groups: Record<string, any> = {};
            filtered.forEach((session) => {
              const dateStr = session.startTime.split('T')[0];
              if (!groups[dateStr]) {
                groups[dateStr] = {
                  _id: dateStr,
                  totalDuration: 0,
                  sessionCount: 0,
                  pomodoroCount: 0,
                };
              }
              groups[dateStr].totalDuration += session.duration;
              groups[dateStr].sessionCount += 1;
              groups[dateStr].pomodoroCount += session.pomodoroCount || 0;
            });
            const result = Object.values(groups);
            result.sort((a: any, b: any) => a._id.localeCompare(b._id));
            return result;
          }

          return [];
        };
      }

    } catch (e) {
      console.warn(`Could not hook local fallback for model: ${modelName}. Model might not be loaded yet.`);
    }
  });

  // Override Model constructor's save prototype
  const saveOrig = mongoose.Model.prototype.save;
  mongoose.Model.prototype.save = async function (options?: any) {
    const modelName = this.constructor.modelName;
    const tableName = getTableName(modelName);
    
    // Check if MongoDB connection is open, otherwise route to JSON db
    if (mongoose.connection.readyState === 1) {
      return saveOrig.call(this, options);
    }
    
    const table: any[] = db[tableName];
    const dataObj = JSON.parse(JSON.stringify(this));

    if (!dataObj._id) {
      dataObj._id = generateId(tableName.slice(0, 3));
      dataObj.createdAt = new Date().toISOString();
    }
    dataObj.updatedAt = new Date().toISOString();

    const idx = table.findIndex((x) => String(x._id) === String(dataObj._id));
    if (idx >= 0) {
      table[idx] = { ...table[idx], ...dataObj };
    } else {
      table.push(dataObj);
    }
    saveDb();
    return this;
  };
};
