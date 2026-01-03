# Learning Management System (LMS)

A full-stack Learning Management System built with React, Node.js, Express, and MongoDB. Features include course management, user authentication, real-time chat, calendar integration, and an AI assistant powered by local Ollama.

## Features

- **User Management**: Role-based access control (Admin, Professor, Student)
- **Course Management**: Create, manage, and enroll in courses
- **Section/Class Management**: Organize students into sections
- **Real-time Chat**: Socket.IO powered messaging for courses and staff
- **Calendar Integration**: Schedule and view events
- **AI Assistant**: Local AI powered by Ollama (Qwen2.5:7b) for admins and professors
- **Password Management**: Change password and forgot password functionality
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Socket.IO Client
- Lucide React Icons
- React Hot Toast
- Vercel AI SDK

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt
- Ollama (Local AI)
- Zod (Validation)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Ollama (for AI features)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd lms
```

### 2. Install Ollama and Pull Model
```bash
# Install Ollama from https://ollama.com
# Then pull the Qwen2.5 model
ollama pull qwen2.5:7b
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# - Set MONGODB_URI to your MongoDB connection string
# - Set JWT_SECRET to a secure random string
# - Update other variables as needed
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env

# Update .env if needed (default values should work for local development)
```

## Running the Application

### Development Mode

1. **Start Ollama** (Required for AI features):
```bash
ollama serve
```

2. **Start MongoDB** (if running locally):
```bash
mongod
```

3. **Start Backend** (in `backend` directory):
```bash
npm run dev
```
Backend will run on http://localhost:5001

4. **Start Frontend** (in `frontend` directory):
```bash
npm run dev
```
Frontend will run on http://localhost:5173

### Seed Database (Optional)

To populate the database with sample data:
```bash
cd backend
npm run seed
```

Default credentials after seeding:
- **Admin**: admin@college.edu / admin123
- **Professor**: prof1@college.edu / prof123
- **Student**: student1@college.edu / student123

## Project Structure

```
lms/
├── backend/
│   ├── config/          # Configuration files (DB, Ollama)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & other middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI tools, file parsing)
│   ├── scripts/         # Seed scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context (Auth, Socket)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities
│   │   └── App.jsx      # Main app component
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code

### Dashboard
- `GET /api/dashboard` - Get dashboard stats and data

### Chat
- `GET /api/chat/rooms` - Get available chat rooms
- `GET /api/chat/:roomId/messages` - Get messages for a room
- `POST /api/chat/:roomId/message` - Send a message

### AI Agent
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/upload` - Upload files for processing

## Deployment

### Backend Deployment (e.g., Render, Railway, Heroku)

1. Set environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secure random string
   - `CORS_ORIGIN` - Your frontend URL
   - `OLLAMA_URL` - Your Ollama instance URL
   - `NODE_ENV=production`

2. Build command: `npm install`
3. Start command: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Set environment variables:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_SOCKET_URL` - Your backend WebSocket URL

2. Build command: `npm run build`
3. Output directory: `dist`

### Note on Ollama for Production
For production, you'll need to host Ollama separately:
- Option 1: Self-host Ollama on a server
- Option 2: Use Ollama cloud service (when available)
- Option 3: Replace with another AI provider (OpenAI, Anthropic, etc.)

## Features in Detail

### User Roles

**Admin**:
- Manage users (students, professors)
- Manage courses and sections
- View all system data
- Access AI assistant

**Professor**:
- Manage assigned courses
- View enrolled students
- Create events
- Access AI assistant
- Participate in staff chat

**Student**:
- View enrolled courses
- Access course materials
- Submit assignments
- Check attendance
- Participate in course chat

### AI Assistant

The AI assistant is powered by Ollama running locally with the Qwen2.5:7b model. It can:
- Create students and professors
- Create courses and sections
- List courses and students
- Create calendar events
- Answer questions about the system

The AI uses function calling to interact with the database, making it a powerful administrative tool.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected API routes with middleware
- CORS configuration
- Input validation with Zod
- SQL injection protection via Mongoose

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
