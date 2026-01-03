import { tools } from '../services/aiTools.js';
import { streamOllamaResponse, checkOllamaAvailability } from '../config/ollama.js';

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

export const chatWithAgent = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = `You are a direct, concise AI assistant for an LMS. When users want to create, add, list, or manage data, USE THE AVAILABLE TOOLS.

CRITICAL RULES:
1. When user wants to CREATE/ADD something → Use the appropriate tool (createStudent, createCourse, etc.)
2. When user wants to LIST/VIEW something → Use the appropriate tool (listCourses, listSections, etc.)
3. When user wants to COUNT something → Use the appropriate tool (getCourseCount, getStudentCount)
4. Answer ONLY what was asked - nothing more
5. NEVER ask follow-up questions like "Would you like..." or "Is there anything else..."
6. Be brief and direct

Available tools: ${Object.keys(tools).join(', ')}

Examples of when to use tools:
- "Add a student John" → Use createUser with role="student"
- "Add a professor Sarah" → Use createUser with role="professor"
- "Create student" → Use createUser with role="student"
- "Create professor" → Use createUser with role="professor"
- "How many students?" → Use getStudentCount tool
- "Show courses" or "List courses" → Use listCourses tool
- "Add course" or "Create a course" → Use createCourse tool
- "New section" → Use createSection tool`;

    console.log('[AI Agent] Using Ollama model:', OLLAMA_MODEL);

    const isOllamaAvailable = await checkOllamaAvailability(OLLAMA_MODEL);
    if (!isOllamaAvailable) {
      return res.status(503).json({
        message: 'Ollama is not available',
        error: 'Please ensure Ollama is running with: ollama serve',
        help: 'Install Ollama from https://ollama.com and run: ollama pull qwen2.5:7b'
      });
    }

    const stream = streamOllamaResponse(OLLAMA_MODEL, messages, tools, systemPrompt);

    for await (const chunk of stream) {
      res.write(`0:${JSON.stringify(chunk)}\n`);
    }

    res.end();
  } catch (error) {
    console.error('[AI Agent] Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: 'AI agent error',
        error: error.message
      });
    }
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { parseStudentFile } = await import('../services/fileParser.js');

    const result = await parseStudentFile(req.file.buffer, req.file.mimetype);

    res.json(result);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      message: 'File parsing error',
      error: error.message
    });
  }
};
