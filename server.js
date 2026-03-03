import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the dist folder (Vite build output)
app.use(express.static(join(__dirname, 'dist')));

// GET /api/species - List all species with optional filters
app.get('/api/species', async (req, res) => {
  try {
    const { search, category, synthesized } = req.query;
    let query = 'SELECT * FROM species WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (synthesized === 'true') {
      query += ' AND is_synthesized = true';
    } else if (synthesized === 'false') {
      query += ' AND is_synthesized = false';
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      const searchIdx = params.length;
      query += ` AND (
        LOWER(name) LIKE $${searchIdx} OR 
        LOWER(mech) LIKE $${searchIdx} OR 
        LOWER(source) LIKE $${searchIdx} OR 
        LOWER(what) LIKE $${searchIdx} OR
        LOWER(body) LIKE $${searchIdx} OR
        EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE $${searchIdx})
      )`;
    }

    query += ' ORDER BY is_synthesized, category, name';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching species:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/species/:id - Get single species with lineage
app.get('/api/species/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: speciesRows } = await pool.query(
      'SELECT * FROM species WHERE id = $1',
      [id]
    );

    if (speciesRows.length === 0) {
      return res.status(404).json({ error: 'Species not found' });
    }

    const species = speciesRows[0];

    // Get parents if synthesized
    if (species.is_synthesized) {
      const { rows: parents } = await pool.query(
        `SELECT s.* FROM species s
         JOIN lineage l ON s.id = l.parent_id
         WHERE l.child_id = $1`,
        [id]
      );
      species.parents = parents;
    }

    // Get children (species synthesized from this one)
    const { rows: children } = await pool.query(
      `SELECT s.id, s.name, s.icon, s.generation FROM species s
       JOIN lineage l ON s.id = l.child_id
       WHERE l.parent_id = $1`,
      [id]
    );
    species.children = children;

    res.json(species);
  } catch (err) {
    console.error('Error fetching species:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/species - Create new species (base or synthesized)
app.post('/api/species', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      name, icon, category, is_synthesized, generation,
      mech, source, what, how, combo, hooks,
      body, mechanism_text, narrative,
      constraints_text, tags, stats, model_used,
      parent_ids
    } = req.body;

    const { rows } = await client.query(
      `INSERT INTO species (
        name, icon, category, is_synthesized, generation,
        mech, source, what, how, combo, hooks,
        body, mechanism_text, narrative,
        constraints_text, tags, stats, model_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        name, icon || '🧬', category, is_synthesized || false, generation || 0,
        mech, source, what, how, combo, hooks,
        body, mechanism_text, narrative,
        constraints_text, tags || [], stats ? JSON.stringify(stats) : null, model_used
      ]
    );

    const newSpecies = rows[0];

    // Insert lineage records for synthesized species
    if (is_synthesized && parent_ids && parent_ids.length > 0) {
      for (const parentId of parent_ids) {
        await client.query(
          'INSERT INTO lineage (parent_id, child_id) VALUES ($1, $2)',
          [parentId, newSpecies.id]
        );
      }

      // Fetch parents to include in response
      const { rows: parents } = await client.query(
        `SELECT * FROM species WHERE id = ANY($1)`,
        [parent_ids]
      );
      newSpecies.parents = parents;
    }

    await client.query('COMMIT');
    res.status(201).json(newSpecies);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating species:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/species/:id - Update species
app.put('/api/species/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, icon, category,
      mech, source, what, how, combo, hooks,
      body, mechanism_text, narrative,
      constraints_text, tags, stats
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE species SET
        name = COALESCE($1, name),
        icon = COALESCE($2, icon),
        category = COALESCE($3, category),
        mech = COALESCE($4, mech),
        source = COALESCE($5, source),
        what = COALESCE($6, what),
        how = COALESCE($7, how),
        combo = COALESCE($8, combo),
        hooks = COALESCE($9, hooks),
        body = COALESCE($10, body),
        mechanism_text = COALESCE($11, mechanism_text),
        narrative = COALESCE($12, narrative),
        constraints_text = COALESCE($13, constraints_text),
        tags = COALESCE($14, tags),
        stats = COALESCE($15, stats)
      WHERE id = $16
      RETURNING *`,
      [
        name, icon, category,
        mech, source, what, how, combo, hooks,
        body, mechanism_text, narrative,
        constraints_text, tags, stats ? JSON.stringify(stats) : null,
        id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Species not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating species:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/species/:id - Delete species
app.delete('/api/species/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM species WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Species not found' });
    }

    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error('Error deleting species:', err);
    res.status(500).json({ error: err.message });
  }
});

// Format species for AI prompt (unified format for both base and synthesized)
function formatSpeciesForPrompt(species) {
  const stats = species.stats || {};
  const statsStr = `Resilience: ${stats.resilience ?? 50}, Offense: ${stats.offense ?? 50}, Regen: ${stats.regen ?? 50}, Complexity: ${stats.complexity ?? 50}, Social: ${stats.social ?? 50}`;
  
  if (species.is_synthesized) {
    return `
— ${species.name} (Synthesized Species — Gen ${species.generation})
  What It Does: ${species.what || 'Unknown'}
  How It Works: ${species.how || 'Unknown'}
  Constraints: ${species.constraints_text || 'Unknown'}
  Combinatorial Notes: ${species.combo || 'Unknown'}
  Narrative Hooks: ${species.hooks || 'Unknown'}
  Stats: ${statsStr}
  Tags: ${species.tags?.join(', ') || 'none'}`;
  } else {
    return `
— ${species.name} (${species.mech})
  What It Does: ${species.what || 'Unknown'}
  How It Works: ${species.how || 'Unknown'}
  Constraints: ${species.constraints_text || 'Unknown'}
  Combinatorial Notes: ${species.combo || 'Unknown'}
  Narrative Hooks: ${species.hooks || 'Unknown'}
  Stats: ${statsStr}
  Tags: ${species.tags?.join(', ') || 'none'}`;
  }
}

// Build JSON schema for structured synthesis output with dynamic tags enum
function buildSynthesisOutputSchema(availableTags) {
  return {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Evocative species name — scientific-sounding or mythic' },
      what: { type: 'string', description: '1-2 short sentences describing what this organism does, its primary function and behavior' },
      how: { type: 'string', description: '1-2 short sentences explaining HOW the combined mechanisms work together biologically' },
      constraints: { type: 'string', description: '1-2 short sentences on costs, vulnerabilities, and tradeoffs' },
      combo: { type: 'string', description: '1-2 short sentences on how this could combine with other mechanisms' },
      hooks: { type: 'string', description: '1-2 short sentences on story potential and philosophical questions' },
      stats: {
        type: 'object',
        properties: {
          resilience: { type: 'integer', description: 'Durability and survival capability (0-100)' },
          offense: { type: 'integer', description: 'Combat and predatory capability (0-100)' },
          regen: { type: 'integer', description: 'Healing and recovery speed (0-100)' },
          complexity: { type: 'integer', description: 'Biological complexity and specialization (0-100)' },
          social: { type: 'integer', description: 'Group behavior and cooperation (0-100)' }
        },
        required: ['resilience', 'offense', 'regen', 'complexity', 'social'],
        additionalProperties: false
      },
      tags: { 
        type: 'array', 
        items: { 
          type: 'string',
          enum: availableTags  // Dynamic enum from database
        },
        description: '3-5 relevant tags from the available list'
      }
    },
    required: ['name', 'what', 'how', 'constraints', 'combo', 'hooks', 'stats', 'tags'],
    additionalProperties: false
  };
}

// Slider definitions for prompt generation
const SLIDER_DEFINITIONS = {
  cognitive: { label: 'Cognitive Complexity', low: 'Instinct/Reflex', high: 'Abstract/Sapient' },
  physical: { label: 'Physical Power', low: 'Fragile/Weak', high: 'Colossal/Herculean' },
  agility: { label: 'Kinetic Agility', low: 'Lumbering/Static', high: 'Fluid/Lightning-fast' },
  metabolic: { label: 'Metabolic Rate', low: 'Dormant/Slow', high: 'Voracious/High-energy' },
  sensory: { label: 'Sensory Acuity', low: 'Near-blind/Limited', high: 'Hyper-aware/Multispectral' },
  hardiness: { label: 'Environmental Hardiness', low: 'Niche Specialist', high: 'Apex Generalist' },
  reproductive: { label: 'Reproductive Output', low: 'K-Selection/Rare', high: 'r-Selection/Swarms' },
  social: { label: 'Social Connectivity', low: 'Hyper-Solitary', high: 'Hive Mind/Eusocial' },
  longevity: { label: 'Individual Longevity', low: 'Ephemeral (Days)', high: 'Millennial/Immortal' },
  communication: { label: 'Communication Bandwidth', low: 'Basic Cues', high: 'Total Information Transfer' }
};

function buildSliderProfileText(sliders) {
  if (!sliders) return '';
  
  const lines = Object.entries(sliders).map(([key, value]) => {
    const def = SLIDER_DEFINITIONS[key];
    if (!def) return null;
    const position = value <= 3 ? `toward ${def.low}` : value >= 8 ? `toward ${def.high}` : 'moderate';
    return `- ${def.label}: ${value}/10 (${position})`;
  }).filter(Boolean);
  
  if (lines.length === 0) return '';
  
  return `
DESIRED SPECIES PROFILE (1=low/minimal, 10=high/extreme):
${lines.join('\n')}

The generated species MUST reflect these attribute levels. Low values (1-3) mean the trait is weak or minimal. High values (8-10) mean the trait is dominant or extreme. Mid values (4-7) are moderate.
`;
}

// POST /api/synthesize - Run AI synthesis with structured output (does NOT save to DB)
app.post('/api/synthesize', async (req, res) => {
  const { species: speciesList, model, systemPrompt, sliders } = req.body;

  if (!speciesList || speciesList.length < 2) {
    return res.status(400).json({ error: 'At least 2 species/mechanisms required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const ingredients = speciesList.map(formatSpeciesForPrompt).join('\n');
  const sliderProfile = buildSliderProfileText(sliders);

  const hasSynthesized = speciesList.some(s => s.is_synthesized);
  const entityType = hasSynthesized ? 'biological entities (some already synthesized species)' : 'real biological mechanisms from Earth organisms';

  // Simplified prompt - output format is enforced by the schema
  const defaultPrompt = `You are a xenobiologist designing speculative alien species for a hard science fiction universe. You are given ${speciesList.length} ${entityType}. Your job is to combine them into ONE coherent speculative species.

ENTITIES TO COMBINE:
${ingredients}
${sliderProfile}
Design a speculative hybrid species that combines these mechanisms. The mechanisms should not just coexist — they should interact, creating emergent properties neither has alone.

Consider:
- How the biological mechanisms integrate and enhance each other
- What new capabilities and limitations emerge from their combination
- The costs, vulnerabilities, and tradeoffs
- How this species could further combine with other mechanisms
- What stories and philosophical questions this species enables

Base the stats on how the parent mechanisms combine - consider whether traits amplify, average, or create new dynamics.

Be scientifically grounded but creatively bold. No generic descriptions. Every detail should be specific and surprising.`;

  const finalPrompt = systemPrompt 
    ? systemPrompt
        .replace('${speciesList.length}', speciesList.length)
        .replace('${entityType}', entityType)
        .replace('${ingredients}', ingredients)
        .replace('${sliderProfile}', sliderProfile)
    : defaultPrompt;

  try {
    // Fetch all unique tags from the database for the enum
    const { rows: tagRows } = await pool.query(
      `SELECT DISTINCT unnest(tags) as tag FROM species WHERE array_length(tags, 1) > 0 ORDER BY tag`
    );
    const availableTags = tagRows.map(r => r.tag);
    
    // Build schema with dynamic tags enum
    const synthesisOutputSchema = buildSynthesisOutputSchema(availableTags);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-opus-4-5-20251101',
        max_tokens: 16000,
        thinking: {
          type: 'enabled',
          budget_tokens: 10000
        },
        messages: [{ role: 'user', content: finalPrompt }],
        output_config: {
          format: {
            type: 'json_schema',
            schema: synthesisOutputSchema
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'API request failed' });
    }

    const data = await response.json();
    
    // Find the text block (structured output) - not thinking blocks
    const textBlock = data.content?.find(block => block.type === 'text');
    if (!textBlock?.text) {
      return res.status(500).json({ error: 'No output from synthesis' });
    }

    // Parse the guaranteed-valid JSON from structured output
    const synthesisResult = JSON.parse(textBlock.text);

    // Calculate generation for the new species
    const maxParentGen = Math.max(...speciesList.map(s => s.generation || 0));
    const newGeneration = maxParentGen + 1;

    // Collect parent tags for merging
    const parentTags = [...new Set(speciesList.flatMap(s => s.tags || []))];

    res.json({ 
      result: synthesisResult,
      generation: newGeneration,
      parent_ids: speciesList.map(s => s.id),
      parent_tags: parentTags
    });
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
