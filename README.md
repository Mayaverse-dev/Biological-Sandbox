# The Biological Sandbox

A speculative species synthesizer that combines real-world biological mechanisms from Earth organisms into coherent, scientifically-grounded hybrid species using Claude 4.5/4.6 Opus with extended thinking.

## 🧬 Features

- **Specimen Database**: Browse, add, edit, and delete biological mechanisms.
- **AI Synthesizer**: Combine 2-3 mechanisms to generate complex hybrid species.
- **Extended Thinking**: Leverages Claude's reasoning capabilities for deep biological plausibility and speculative design.
- **Synthesis History**: Automatically logs all syntheses in a collapsible sidebar for easy retrieval.
- **Modern UI**: Sleek, minimal interface with light/dark mode support and intuitive filtering.
- **Secure Integration**: Server-side API handling to keep your Anthropic keys safe.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js
- **AI**: Anthropic API (Claude 4.5/4.6 Opus)
- **Icons**: Lucide React
- **Persistence**: `localStorage` (Entries, History, Settings)

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Mayaverse-dev/Biological-Sandbox.git
   cd Biological-Sandbox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   PORT=3001
   ```

4. **Run the application**:
   - **Frontend (Dev)**: `npm run dev`
   - **Backend**: `node server.js` (runs on port 3001)

5. **Access the App**:
   Navigate to `http://localhost:5173`.

## 🚢 Deployment

The project is pre-configured for **Railway** deployment as a single service. It uses `railway.json` and `server.js` to serve both the static frontend and the API endpoints.

## 📜 License

MIT
