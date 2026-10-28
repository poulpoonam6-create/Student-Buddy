import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Check if real Gemini API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

  let aiClient: GoogleGenAI | null = null;
  if (isKeyConfigured) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Status & Health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: isKeyConfigured,
      serverTime: new Date().toISOString(),
    });
  });

  // AI Study Assistant Endpoint
  app.post('/api/study-assist', async (req, res) => {
    const { subject, topic } = req.body;

    if (!subject || !topic || typeof subject !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'Please provide both subject and topic as non-empty strings.',
      });
    }

    // If Gemini client is not configured, inform the client to use curated demo mode
    if (!aiClient) {
      return res.json({
        isDemo: true,
        reason: 'No GEMINI_API_KEY found in server environment. Provided sample study guide.',
        data: getSampleStudyResponse(subject, topic),
      });
    }

    try {
      const prompt = `You are an expert college tutor and academic mentor. Create a high-yield, structured study guide for a college student on:
Subject: "${subject.trim()}"
Topic: "${topic.trim()}"

Provide:
1. A clear, easy-to-understand explanation (2-3 paragraphs) highlighting intuition and core concepts.
2. A short, actionable 4-step study plan tailored for mastery.
3. Exactly 3 high-quality practice questions with answers and detailed explanations.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out after 8 seconds')), 8000)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a warm, supportive, and academically rigorous college tutor. Always produce clear, student-friendly explanations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicTitle: { type: Type.STRING, description: 'Subject and topic formatted title' },
              explanation: { type: Type.STRING, description: 'Clear conceptual explanation with real-world analogy' },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 key core takeaways to remember'
              },
              studyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER }
                  },
                  required: ['stepNumber', 'title', 'description', 'durationMinutes']
                },
                description: 'Sequential 4-step study action plan'
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ['id', 'question', 'options', 'correctAnswer', 'explanation']
                },
                description: 'Three practice questions testing comprehension'
              }
            },
            required: ['topicTitle', 'explanation', 'keyTakeaways', 'studyPlan', 'practiceQuestions']
          }
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from AI model');
      }

      const parsedData = JSON.parse(responseText);

      return res.json({
        isDemo: false,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Error generating AI study guide:', err);
      // Fallback cleanly to curated demo response with explicit notice
      return res.status(200).json({
        isDemo: true,
        fallbackDueToError: true,
        errorMessage: err.message || 'AI service unavailable',
        data: getSampleStudyResponse(subject, topic),
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Focus Buddy server listening on port ${PORT}`);
  });
}

// Curated high quality demo responses for popular college topics
function getSampleStudyResponse(subject: string, topic: string) {
  const normalized = `${subject} ${topic}`.toLowerCase();

  if (normalized.includes('tree') || normalized.includes('binary') || normalized.includes('data structure') || normalized.includes('algorithm')) {
    return {
      topicTitle: `${subject}: ${topic}`,
      explanation: `A Binary Search Tree (BST) is a hierarchical node-based data structure where each node contains at most two children: a left child and a right child. The defining invariant of a BST is that for any node X, all values in its left subtree are strictly less than X's key, and all values in its right subtree are strictly greater than X's key.\n\nThink of a BST like a well-organized university phone directory where you can repeatedly cut your search space in half. Under balanced conditions (like in AVL or Red-Black trees), searching, insertion, and deletion achieve an efficient O(log n) time complexity. However, if items are inserted in pre-sorted order, the tree degenerates into a linked list with worst-case O(n) operations.`,
      keyTakeaways: [
        'Left subtree values < Parent < Right subtree values.',
        'Average lookup/insert/delete is O(log n); worst-case degraded is O(n).',
        'In-order traversal of a BST yields values in ascending sorted order.'
      ],
      studyPlan: [
        {
          stepNumber: 1,
          title: 'Review the BST Invariant & Pointer Structure',
          description: 'Draw a BST with 7 nodes on paper. Trace left child vs right child constraints.',
          durationMinutes: 15
        },
        {
          stepNumber: 2,
          title: 'Code Node Search & Insertion Recursively',
          description: 'Implement search(node, val) and insert(node, val) in your preferred language.',
          durationMinutes: 25
        },
        {
          stepNumber: 3,
          title: 'Master Node Deletion (The 3 Cases)',
          description: 'Examine deleting a leaf, a node with 1 child, and a node with 2 children (finding in-order successor).',
          durationMinutes: 20
        },
        {
          stepNumber: 4,
          title: 'Practice Tree Traversals',
          description: 'Perform In-Order (L-Root-R), Pre-Order (Root-L-R), and Post-Order (L-R-Root) traversals.',
          durationMinutes: 15
        }
      ],
      practiceQuestions: [
        {
          id: 1,
          question: 'What is the time complexity of searching for a value in a balanced Binary Search Tree containing N nodes?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correctAnswer: 'O(log N)',
          explanation: 'In a balanced BST, each comparison halves the remaining search space, giving logarithmic time complexity O(log N).'
        },
        {
          id: 2,
          question: 'Which tree traversal visits the nodes of a Binary Search Tree in non-decreasing (sorted) order?',
          options: ['Pre-order traversal', 'Post-order traversal', 'In-order traversal', 'Breadth-first search'],
          correctAnswer: 'In-order traversal',
          explanation: 'In-order traversal visits Left subtree, then Current Node, then Right subtree. Due to the BST invariant, this always prints elements in ascending numerical/alphabetical order.'
        },
        {
          id: 3,
          question: 'When deleting a node with two children from a BST, which node can safely replace it while maintaining the BST property?',
          options: ['Any immediate neighbor in memory', 'The root of the entire tree', 'The in-order successor (minimum value in right subtree) or in-order predecessor', 'The leftmost leaf of the left subtree only'],
          correctAnswer: 'The in-order successor (minimum value in right subtree) or in-order predecessor',
          explanation: 'The in-order successor is the smallest value greater than the target node. Placing it at the deleted position preserves the invariant that all left children are smaller and all right children are larger.'
        }
      ]
    };
  }

  // General curated collegiate template tailored to user's input
  return {
    topicTitle: `${subject}: ${topic}`,
    explanation: `${topic} is a fundamental concept in ${subject}. Understanding this topic requires connecting foundational principles with practical problem-solving strategies.\n\nIn academic study, mastering ${topic} begins with breaking the core mechanism down into its primary components, understanding why each component behaves the way it does, and testing your retention through active recall rather than passive rereading.`,
    keyTakeaways: [
      `Grasp the core definition and fundamental equations/principles of ${topic}.`,
      `Identify common student pitfalls and boundary conditions early.`,
      `Apply active recall and timed practice problems to build exam intuition.`
    ],
    studyPlan: [
      {
        stepNumber: 1,
        title: `Core Concept Deconstruction: ${topic}`,
        description: `Read the foundational lecture notes or textbook chapter for 15 minutes, highlighting key terminology and formulas.`,
        durationMinutes: 20
      },
      {
        stepNumber: 2,
        title: 'Active Feynman Technique Explanation',
        description: 'Close your book and write down an explanation of the concept in plain English as if teaching a classmate.',
        durationMinutes: 20
      },
      {
        stepNumber: 3,
        title: 'Worked Example Walkthrough',
        description: 'Complete 2 guided practice problems from start to finish without looking at the solutions first.',
        durationMinutes: 25
      },
      {
        stepNumber: 4,
        title: 'Synthesis & Review Notes',
        description: 'Summarize the 3 most critical formulas or axioms onto a one-page summary sheet.',
        durationMinutes: 15
      }
    ],
    practiceQuestions: [
      {
        id: 1,
        question: `What is the most critical foundational principle underlying ${topic}?`,
        options: [
          `Understanding its theoretical definition and operational constraints`,
          `Memorizing sample problems without checking proofs`,
          `Relying exclusively on surface-level intuition`,
          `Ignoring real-world boundary conditions`
        ],
        correctAnswer: `Understanding its theoretical definition and operational constraints`,
        explanation: `Academic mastery requires understanding the governing definitions and limits before tackling complex variations.`
      },
      {
        id: 2,
        question: `When analyzing a complex problem involving ${topic}, what should be your first step?`,
        options: [
          `Immediately guess the final numerical outcome`,
          `Identify given variables, constraints, and the target unknown`,
          `Skip to the end of the problem statement`,
          `Disregard units of measurement and context`
        ],
        correctAnswer: `Identify given variables, constraints, and the target unknown`,
        explanation: `Systematic problem-solving always starts with clarifying known parameters and target outputs.`
      },
      {
        id: 3,
        question: `How does active self-testing on ${topic} improve exam performance compared to passive rereading?`,
        options: [
          `It stimulates retrieval pathways and exposes specific knowledge gaps`,
          `It takes zero mental effort`,
          `It only works for multiple-choice questions`,
          `It guarantees you will never need to review the material again`
        ],
        correctAnswer: `It stimulates retrieval pathways and exposes specific knowledge gaps`,
        explanation: `Cognitive science demonstrates that retrieval practice strengthens memory consolidation and reveals precise conceptual misunderstandings.`
      }
    ]
  };
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
