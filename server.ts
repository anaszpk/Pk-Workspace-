import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// -------------------------------------------------------------
// MongoDB Configuration & Schemas
// -------------------------------------------------------------
let isMongoConnected = false;
let mongoConnectionError: string | null = null;

const WorkspaceSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, default: 'muhammed_anas_default', unique: true },
    state: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

const WorkspaceModel =
  mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not provided. Workspace running with local storage sync.');
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    mongoConnectionError = null;
    console.log('✅ Connected to MongoDB successfully!');
  } catch (err: any) {
    isMongoConnected = false;
    mongoConnectionError = err.message || 'Failed to connect to MongoDB';
    console.error('⚠️ MongoDB Connection Error:', mongoConnectionError);
  }
}

// Check MongoDB connection status
app.get('/api/mongodb/status', async (_req, res) => {
  res.json({
    configured: !!process.env.MONGODB_URI,
    connected: isMongoConnected && mongoose.connection.readyState === 1,
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
    error: mongoConnectionError,
  });
});

// Load workspace state from MongoDB
app.get('/api/workspace', async (_req, res) => {
  try {
    if (!isMongoConnected || mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        source: 'local_fallback',
        message: 'MongoDB is not configured or offline. Running locally.',
        state: null,
      });
    }
    const doc = await WorkspaceModel.findOne({ workspaceId: 'muhammed_anas_default' });
    if (!doc) {
      return res.status(200).json({ source: 'mongodb_empty', state: null });
    }
    res.json({ source: 'mongodb', state: doc.state, updatedAt: doc.updatedAt });
  } catch (error: any) {
    console.error('Error fetching workspace from MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save / upsert workspace state to MongoDB
app.post('/api/workspace', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: 'Workspace state is required' });
    }
    if (!isMongoConnected || mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        source: 'local_buffered',
        message: 'Saved to local buffer. MongoDB not configured yet.',
      });
    }
    const doc = await WorkspaceModel.findOneAndUpdate(
      { workspaceId: 'muhammed_anas_default' },
      { state, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, source: 'mongodb', updatedAt: doc.updatedAt });
  } catch (error: any) {
    console.error('Error saving workspace to MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, workspaceContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "Hello Anas! Gemini AI is integrated into your workspace. Please attach your GEMINI_API_KEY in the Secrets panel to activate live AI answers. In the meantime, your entire workspace, tasks, finance ledgers, and study hub are fully functional locally!",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are Google's Gemini AI, integrated directly into Muhammed Anas P K's personal Academic & Life Management dashboard and FinTech workspace.
You have real-time access to his live workspace state:
- DOB: 13-02-2004
- Academic courses: B.Ed English, MA Arabic (Distance), Fiqhul Usra (Islamic PG), Certified Training Course
- Qualifications: BA English Literature (Calicut University), Diploma in Counselling Psychology (TSSR Council), Plus Two Commerce, SSLC
- Financial Ledger: Net Tally (Savings + Receivables - Payables), bank account details at SBI, UPI/GPay ID
- Tasks: Action Task Scheduler, Finishing Tasks, General Tasks
- Design Studio: Client projects, deadlines, design statuses
- Travels & Events ledger

WORKSPACE REAL-TIME DATA:
${JSON.stringify(workspaceContext ?? {}, null, 2)}

GUIDELINES:
1. Always be helpful, precise, friendly, and motivating.
2. If Anas asks about his pending tasks, finances, exams, or clients, answer with high specificity using the workspace data above.
3. If he asks in Malayalam (either Malayalam script or Manglish), respond warmly and naturally in Malayalam with clear formatting. If he asks in English, reply in English.
4. You can calculate budgets, plan study sessions, draft emails to clients, suggest design ideas, or help with academic coursework.
5. Format your answers cleanly with markdown bullets, bold headers, and concise tables where useful.`;

    // Map conversation contents
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response at this moment.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to communicate with Gemini API',
      reply: "An error occurred while connecting to Gemini: " + (error.message || 'Unknown error'),
    });
  }
});

async function startServer() {
  await connectMongoDB();

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
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
