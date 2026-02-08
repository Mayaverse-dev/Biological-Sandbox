import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the dist folder (Vite build output)
app.use(express.static(join(__dirname, 'dist')));

// API endpoint for synthesis
app.post('/api/synthesize', async (req, res) => {
  const { mechanisms, model, systemPrompt } = req.body;

  if (!mechanisms || mechanisms.length < 2) {
    return res.status(400).json({ error: 'At least 2 mechanisms required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const ingredients = mechanisms.map(m => `
— ${m.name} (${m.mech})
  What: ${m.what}
  How: ${m.how}
  Constraints: ${m.constraints}
  Combinatorial notes: ${m.combo}
  Narrative hooks: ${m.hooks}
  Tags: ${m.tags.join(', ')}`).join('\n');

  const defaultPrompt = `You are a xenobiologist designing speculative alien species for a hard science fiction universe. You are given ${mechanisms.length} real biological mechanisms from Earth organisms. Your job is to combine them into ONE coherent speculative species.

MECHANISMS TO COMBINE:
${ingredients}

Generate a speculative hybrid species. Format your response EXACTLY like this (plain text, no markdown):

NAME: [A evocative species name — scientific-sounding or mythic]

BODY: [2-3 sentences describing physical form, size, habitat]

INTEGRATED MECHANISM: [3-4 sentences explaining HOW these mechanisms work together in one organism. Be specific about the biology. The mechanisms should not just coexist — they should interact, creating emergent properties neither has alone.]

COMPOUNDING CONSTRAINTS: [2-3 sentences on the costs, vulnerabilities, and tradeoffs of combining these systems. What new failure modes emerge?]

NARRATIVE POTENTIAL: [2-3 sentences on why this species is dramatically interesting — what stories does it enable? What philosophical questions does it raise?]

Be scientifically grounded but creatively bold. No generic descriptions. Every sentence should be specific and surprising.`;

  const finalPrompt = systemPrompt 
    ? systemPrompt.replace('${mechanisms.length}', mechanisms.length).replace('${ingredients}', ingredients)
    : defaultPrompt;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-opus-4-5-20251101',
        max_tokens: 20000,
        thinking: {
          type: 'enabled',
          budget_tokens: 12000
        },
        messages: [{ role: 'user', content: finalPrompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'API request failed' });
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('') || 'Synthesis failed — try again.';

    res.json({ result: text });
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ error: error.message || 'Synthesis failed' });
  }
});

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
