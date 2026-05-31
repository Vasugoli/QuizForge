import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import HashService from '../lib/hash'

// Self-contained connection pool to ensure clean termination
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') ? { rejectUnauthorized: false } : undefined,
})

const db = drizzle(pool, { schema })

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // 0. Clean database
    console.log('🗑️ Cleaning existing database records...')
    await db.delete(schema.answers)
    await db.delete(schema.attempts)
    await db.delete(schema.options)
    await db.delete(schema.questions)
    await db.delete(schema.quizzes)
    await db.delete(schema.users)

    // 1. Seed Users
    console.log('👤 Seeding users...')
    const hashedPassword = await HashService.hash('password123')

    const [adminUser] = await db.insert(schema.users).values({
      name: 'Admin Forge',
      email: 'admin@quizforge.com',
      password: hashedPassword,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    }).returning()

    const [user] = await db.insert(schema.users).values({
      name: 'Rahul Kumar',
      email: 'user@quizforge.com',
      password: hashedPassword,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    }).returning()

    const [arjun] = await db.insert(schema.users).values({
      name: 'Arjun K.',
      email: 'arjun@quizforge.com',
      password: hashedPassword,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    }).returning()

    const [priya] = await db.insert(schema.users).values({
      name: 'Priya M.',
      email: 'priya@quizforge.com',
      password: hashedPassword,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    }).returning()

    console.log(`✅ Seeded ${4} users successfully.`)

    // 2. Seed Quizzes
    console.log('📝 Seeding quizzes...')

    const [quizHTML] = await db.insert(schema.quizzes).values({
      title: 'Advanced HTML5 Semantics',
      description: 'Test your understanding of modern semantic layout elements, details/summary, and accessibility rules.',
      category: 'Web Development',
      difficulty: 'EASY',
      durationMinutes: 10,
      totalMarks: 5,
      passMarks: 3,
      negativeMarks: '0.25',
      isPublished: true,
      createdBy: adminUser.id,
    }).returning()

    const [quizReact] = await db.insert(schema.quizzes).values({
      title: 'React Hooks & State Management',
      description: 'Deeper dive into React functional hooks (useMemo, useCallback), context rendering, and Redux patterns.',
      category: 'Frontend Engineering',
      difficulty: 'MEDIUM',
      durationMinutes: 15,
      totalMarks: 20,
      passMarks: 10,
      negativeMarks: '0.00',
      isPublished: true,
      createdBy: adminUser.id,
    }).returning()

    const [quizDSA] = await db.insert(schema.quizzes).values({
      title: 'Data Structures & Algorithms',
      description: 'Master complexity bounds, QuickSort tree operations, stacks, and standard memory performance.',
      category: 'Computer Science',
      difficulty: 'HARD',
      durationMinutes: 30,
      totalMarks: 30,
      passMarks: 15,
      negativeMarks: '0.50',
      isPublished: true,
      createdBy: adminUser.id,
    }).returning()

    console.log(`✅ Seeded ${3} quizzes successfully.`)

    // Helper data mapping
    const htmlQuestionsData = [
      {
        text: 'Which HTML5 element represents self-contained content, like illustrations, code listings, or diagrams?',
        marks: 1,
        options: [
          { text: '<section>', isCorrect: false },
          { text: '<figure>', isCorrect: true },
          { text: '<aside>', isCorrect: false },
          { text: '<article>', isCorrect: false },
        ]
      },
      {
        text: 'What is the correct tag to define the main content section of a page that is unique to the document?',
        marks: 1,
        options: [
          { text: '<body>', isCorrect: false },
          { text: '<section>', isCorrect: false },
          { text: '<main>', isCorrect: true },
          { text: '<content>', isCorrect: false },
        ]
      },
      {
        text: 'Which attribute should be added to form fields to provide screen readers with descriptive text explaining errors?',
        marks: 1,
        options: [
          { text: 'aria-hidden', isCorrect: false },
          { text: 'aria-describedby', isCorrect: true },
          { text: 'aria-live', isCorrect: false },
          { text: 'alt-text', isCorrect: false },
        ]
      },
      {
        text: 'Which element is used to group a set of <td> tags inside a table to denote header cells?',
        marks: 1,
        options: [
          { text: '<thead>', isCorrect: true },
          { text: '<tbody>', isCorrect: false },
          { text: '<tfoot>', isCorrect: false },
          { text: '<header>', isCorrect: false },
        ]
      },
      {
        text: 'What does the <aside> tag typically represent in modern HTML5 document layout?',
        marks: 1,
        options: [
          { text: 'The footer portion of a block element', isCorrect: false },
          { text: 'A sidebar or content tangentially related to the main article content', isCorrect: true },
          { text: 'A separate navigation block', isCorrect: false },
          { text: 'An external loading script', isCorrect: false },
        ]
      }
    ]

    const reactQuestionsData = [
      {
        text: 'Which React hook is used specifically to cache computed calculations between renders?',
        marks: 4,
        options: [
          { text: 'useCallback', isCorrect: false },
          { text: 'useMemo', isCorrect: true },
          { text: 'useEffect', isCorrect: false },
          { text: 'useRef', isCorrect: false },
        ]
      },
      {
        text: 'What is the principal purpose of dispatching an Action in Redux state architectures?',
        marks: 4,
        options: [
          { text: 'To perform API calls directly', isCorrect: false },
          { text: 'To signal a state transition intent to a reducer', isCorrect: true },
          { text: 'To trigger component compilation', isCorrect: false },
          { text: 'To connect component layers', isCorrect: false },
        ]
      },
      {
        text: 'When using context triggers, what hook allows functional components to read active Context values?',
        marks: 4,
        options: [
          { text: 'useState', isCorrect: false },
          { text: 'useContext', isCorrect: true },
          { text: 'useReducer', isCorrect: false },
          { text: 'useLayoutEffect', isCorrect: false },
        ]
      },
      {
        text: 'Which of the following describes a pure function inside Redux implementations?',
        marks: 4,
        options: [
          { text: 'A component rendering visual states', isCorrect: false },
          { text: 'A reducer returning new state without mutating input args', isCorrect: true },
          { text: 'An active middleware performing async fetch actions', isCorrect: false },
          { text: 'A hook binding active stores', isCorrect: false },
        ]
      },
      {
        text: 'What does React use to track dynamic items in an array list to render changes efficiently?',
        marks: 4,
        options: [
          { text: 'Index elements exclusively', isCorrect: false },
          { text: 'Unique key prop', isCorrect: true },
          { text: 'State flags', isCorrect: false },
          { text: 'Virtual references', isCorrect: false },
        ]
      }
    ]

    const dsaQuestionsData = [
      {
        text: 'What is the absolute worst-case asymptotic time complexity of the QuickSort algorithm?',
        marks: 6,
        options: [
          { text: 'O(n log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: true },
          { text: 'O(n)', isCorrect: false },
          { text: 'O(2^n)', isCorrect: false },
        ]
      },
      {
        text: 'Which abstract data structure relies strictly on the Last In First Out (LIFO) methodology?',
        marks: 6,
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Binary Search Tree', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Graph', isCorrect: false },
        ]
      },
      {
        text: 'Which data structure represents hierarchical nodes where each parent can have a maximum of two children?',
        marks: 6,
        options: [
          { text: 'Linked List', isCorrect: false },
          { text: 'Heap', isCorrect: false },
          { text: 'Binary Tree', isCorrect: true },
          { text: 'Trie', isCorrect: false },
        ]
      },
      {
        text: 'What sorting algorithm possesses a guaranteed O(n log n) complexity in average, best, and worst cases?',
        marks: 6,
        options: [
          { text: 'Bubble Sort', isCorrect: false },
          { text: 'Merge Sort', isCorrect: true },
          { text: 'QuickSort', isCorrect: false },
          { text: 'Insertion Sort', isCorrect: false },
        ]
      },
      {
        text: 'Which type of search algorithm provides constant-time O(1) checks on average when configured cleanly?',
        marks: 6,
        options: [
          { text: 'Linear Search', isCorrect: false },
          { text: 'Binary Search', isCorrect: false },
          { text: 'Hash Table lookup', isCorrect: true },
          { text: 'Breadth First Search', isCorrect: false },
        ]
      }
    ]

    // Seeding Questions and Options
    console.log('❓ Seeding HTML5 Questions...')
    const htmlQuestions = []
    for (let i = 0; i < htmlQuestionsData.length; i++) {
      const qData = htmlQuestionsData[i]
      const [dbQ] = await db.insert(schema.questions).values({
        quizId: quizHTML.id,
        text: qData.text,
        marks: qData.marks,
        orderIndex: i,
      }).returning()

      const dbOpts = []
      for (const opt of qData.options) {
        const [dbOpt] = await db.insert(schema.options).values({
          questionId: dbQ.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }).returning()
        dbOpts.push(dbOpt)
      }
      htmlQuestions.push({ question: dbQ, options: dbOpts })
    }

    console.log('❓ Seeding React Questions...')
    const reactQuestions = []
    for (let i = 0; i < reactQuestionsData.length; i++) {
      const qData = reactQuestionsData[i]
      const [dbQ] = await db.insert(schema.questions).values({
        quizId: quizReact.id,
        text: qData.text,
        marks: qData.marks,
        orderIndex: i,
      }).returning()

      const dbOpts = []
      for (const opt of qData.options) {
        const [dbOpt] = await db.insert(schema.options).values({
          questionId: dbQ.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }).returning()
        dbOpts.push(dbOpt)
      }
      reactQuestions.push({ question: dbQ, options: dbOpts })
    }

    console.log('❓ Seeding DSA Questions...')
    const dsaQuestions = []
    for (let i = 0; i < dsaQuestionsData.length; i++) {
      const qData = dsaQuestionsData[i]
      const [dbQ] = await db.insert(schema.questions).values({
        quizId: quizDSA.id,
        text: qData.text,
        marks: qData.marks,
        orderIndex: i,
      }).returning()

      const dbOpts = []
      for (const opt of qData.options) {
        const [dbOpt] = await db.insert(schema.options).values({
          questionId: dbQ.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }).returning()
        dbOpts.push(dbOpt)
      }
      dsaQuestions.push({ question: dbQ, options: dbOpts })
    }

    console.log('✅ Seeded questions and choices successfully.')

    // 3. Seed Attempts & Answers (Mocking History & Leaderboard Stats)
    console.log('📈 Seeding Finished attempts and answers data...')

    // --- ARJUN SEED (The Top Ranker: Perfect Attempts) ---
    // Arjun Quiz 1
    const [attArjunHTML] = await db.insert(schema.attempts).values({
      userId: arjun.id,
      quizId: quizHTML.id,
      startedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      submittedAt: new Date(Date.now() - 3600000 * 2 + 1000 * 60 * 6), // 6 mins taken
      score: '5.00',
      totalMarks: 5,
      timeTaken: 360,
      status: 'SUBMITTED',
    }).returning()

    for (const qBlock of htmlQuestions) {
      const correctOpt = qBlock.options.find(o => o.isCorrect)!
      await db.insert(schema.answers).values({
        attemptId: attArjunHTML.id,
        questionId: qBlock.question.id,
        optionId: correctOpt.id,
        isCorrect: true,
        marksEarned: '1.00',
      })
    }

    // Arjun Quiz 2
    const [attArjunReact] = await db.insert(schema.attempts).values({
      userId: arjun.id,
      quizId: quizReact.id,
      startedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
      submittedAt: new Date(Date.now() - 3600000 * 4 + 1000 * 60 * 11), // 11 mins taken
      score: '20.00',
      totalMarks: 20,
      timeTaken: 660,
      status: 'SUBMITTED',
    }).returning()

    for (const qBlock of reactQuestions) {
      const correctOpt = qBlock.options.find(o => o.isCorrect)!
      await db.insert(schema.answers).values({
        attemptId: attArjunReact.id,
        questionId: qBlock.question.id,
        optionId: correctOpt.id,
        isCorrect: true,
        marksEarned: '4.00',
      })
    }

    // Arjun Quiz 3
    const [attArjunDSA] = await db.insert(schema.attempts).values({
      userId: arjun.id,
      quizId: quizDSA.id,
      startedAt: new Date(Date.now() - 3600000 * 6), // 6 hours ago
      submittedAt: new Date(Date.now() - 3600000 * 6 + 1000 * 60 * 18), // 18 mins taken
      score: '30.00',
      totalMarks: 30,
      timeTaken: 1080,
      status: 'SUBMITTED',
    }).returning()

    for (const qBlock of dsaQuestions) {
      const correctOpt = qBlock.options.find(o => o.isCorrect)!
      await db.insert(schema.answers).values({
        attemptId: attArjunDSA.id,
        questionId: qBlock.question.id,
        optionId: correctOpt.id,
        isCorrect: true,
        marksEarned: '6.00',
      })
    }


    // --- PRIYA SEED (Strong performer, occasional errors) ---
    // Priya Quiz 1: 4 correct, 1 wrong (Score: 4 * 1 - 1 * 0.25 = 3.75)
    const [attPriyaHTML] = await db.insert(schema.attempts).values({
      userId: priya.id,
      quizId: quizHTML.id,
      startedAt: new Date(Date.now() - 3600000 * 3), 
      submittedAt: new Date(Date.now() - 3600000 * 3 + 1000 * 60 * 7), // 7 mins taken
      score: '3.75',
      totalMarks: 5,
      timeTaken: 420,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < htmlQuestions.length; idx++) {
      const qBlock = htmlQuestions[idx]
      const shouldCorrect = idx !== 4
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attPriyaHTML.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '1.00' : '-0.25',
      })
    }

    // Priya Quiz 2: 4 correct, 1 wrong (Score: 16.00, negative marking is 0.00)
    const [attPriyaReact] = await db.insert(schema.attempts).values({
      userId: priya.id,
      quizId: quizReact.id,
      startedAt: new Date(Date.now() - 3600000 * 5),
      submittedAt: new Date(Date.now() - 3600000 * 5 + 1000 * 60 * 12), // 12 mins taken
      score: '16.00',
      totalMarks: 20,
      timeTaken: 720,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < reactQuestions.length; idx++) {
      const qBlock = reactQuestions[idx]
      const shouldCorrect = idx !== 2
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attPriyaReact.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '4.00' : '0.00',
      })
    }

    // Priya Quiz 3: 4 correct, 1 wrong (Score: 4 * 6 - 1 * 0.50 = 23.50)
    const [attPriyaDSA] = await db.insert(schema.attempts).values({
      userId: priya.id,
      quizId: quizDSA.id,
      startedAt: new Date(Date.now() - 3600000 * 7),
      submittedAt: new Date(Date.now() - 3600000 * 7 + 1000 * 60 * 22), // 22 mins
      score: '23.50',
      totalMarks: 30,
      timeTaken: 1320,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < dsaQuestions.length; idx++) {
      const qBlock = dsaQuestions[idx]
      const shouldCorrect = idx !== 0
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attPriyaDSA.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '6.00' : '-0.50',
      })
    }


    // --- USER/RAHUL SEED (Average stats for the active user login) ---
    // Rahul Quiz 1: 3 correct, 2 wrong (Score: 3 * 1 - 2 * 0.25 = 2.50) - Failed (passing score is 3)
    const [attUserHTML] = await db.insert(schema.attempts).values({
      userId: user.id,
      quizId: quizHTML.id,
      startedAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
      submittedAt: new Date(Date.now() - 3600000 * 1 + 1000 * 60 * 8), // 8 mins taken
      score: '2.50',
      totalMarks: 5,
      timeTaken: 480,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < htmlQuestions.length; idx++) {
      const qBlock = htmlQuestions[idx]
      const shouldCorrect = idx < 3
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attUserHTML.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '1.00' : '-0.25',
      })
    }

    // Rahul Quiz 2: 3 correct, 2 wrong (Score: 12.00) - Passed (passing score is 10)
    const [attUserReact] = await db.insert(schema.attempts).values({
      userId: user.id,
      quizId: quizReact.id,
      startedAt: new Date(Date.now() - 3600000 * 3.5),
      submittedAt: new Date(Date.now() - 3600000 * 3.5 + 1000 * 60 * 14), // 14 mins taken
      score: '12.00',
      totalMarks: 20,
      timeTaken: 840,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < reactQuestions.length; idx++) {
      const qBlock = reactQuestions[idx]
      const shouldCorrect = idx < 3
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attUserReact.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '4.00' : '0.00',
      })
    }

    // Rahul Quiz 3: 2 correct, 3 wrong (Score: 2 * 6 - 3 * 0.50 = 10.50) - Failed (passing is 15)
    const [attUserDSA] = await db.insert(schema.attempts).values({
      userId: user.id,
      quizId: quizDSA.id,
      startedAt: new Date(Date.now() - 3600000 * 5.5),
      submittedAt: new Date(Date.now() - 3600000 * 5.5 + 1000 * 60 * 25), // 25 mins
      score: '10.50',
      totalMarks: 30,
      timeTaken: 1500,
      status: 'SUBMITTED',
    }).returning()

    for (let idx = 0; idx < dsaQuestions.length; idx++) {
      const qBlock = dsaQuestions[idx]
      const shouldCorrect = idx < 2
      const chosenOpt = shouldCorrect 
        ? qBlock.options.find(o => o.isCorrect)! 
        : qBlock.options.find(o => !o.isCorrect)!

      await db.insert(schema.answers).values({
        attemptId: attUserDSA.id,
        questionId: qBlock.question.id,
        optionId: chosenOpt.id,
        isCorrect: shouldCorrect,
        marksEarned: shouldCorrect ? '6.00' : '-0.50',
      })
    }

    console.log('✅ Seeded attempts and answers successfully.')

    console.log('🎉 Seed operation completed successfully!')
  } catch (error) {
    console.error('❌ Database seed failed:', error)
  } finally {
    await pool.end()
    console.log('🔌 Database pool closed cleanly.')
  }
}

seed()
