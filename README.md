# AlloSafe (formerly SoroKobo)

**Track Your Business. Unlock Opportunities.**
AlloSafe is a voice-first financial ledger designed for informal sector merchants (market women, artisans) in Africa. It allows users to log their daily transactions (sales, inventory, debts) using natural language over a standard GSM phone call, without needing a smartphone, internet access, or literacy.

## Architecture

AlloSafe is split into two main components:
1. **Frontend (PWA Dashboard):** A Vite + React application where users can view their ledgers, manage inventory, and interact with their data visually.
2. **Backend (FastAPI):** A Python application that acts as the brain. It handles incoming voice webhooks from Africa's Talking, processes audio using OpenAI Whisper, extracts structured financial data using GPT-4o, and replies with synthesized local-language speech using Azure Edge-TTS.
3. **Database (Appwrite):** A self-hosted or cloud-managed Backend-as-a-Service that stores all users, transactions, and handles real-time synchronization with the PWA.

## Getting Started

### 1. The Frontend (React PWA)
The frontend is located in the `/frontend` directory.
```bash
cd frontend
npm install
npm run dev
```

### 2. The Backend (FastAPI)
The backend is located in the `/backend` directory. It requires a Python virtual environment.
```bash
cd backend

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate

# Install dependencies (only needed once)
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

## Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file in the backend directory based on `.env.example`:
- `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`: Get these from your Appwrite Cloud console.
- `OPENAI_API_KEY`: Your OpenAI key for Whisper (Speech-to-Text) and GPT-4o.
- `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`: Your sandbox or live credentials.

### Frontend (`/frontend/.env`)
- `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` connect the frontend directly to the database for real-time reads.

## Demo Instructions (The "Wow Factor")
To see AlloSafe in action:
1. Start the React Frontend and open the dashboard on your screen.
2. Open the Africa's Talking Simulator (`simulator.africastalking.com`).
3. Dial the AlloSafe sandbox number.
4. Speak a transaction: *"I sold 3 bags of rice for 50,000 naira"*
5. Watch the dashboard update **instantly** in real-time as the backend processes the voice!
