CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🧬',
  category TEXT NOT NULL,

  -- Classification
  is_synthesized BOOLEAN DEFAULT FALSE,
  generation INTEGER DEFAULT 0,

  -- Base mechanism fields (NULL for synthesized)
  mech TEXT,
  source TEXT,
  what TEXT,
  how TEXT,
  combo TEXT,
  hooks TEXT,

  -- Synthesis result fields (NULL for base)
  body TEXT,
  mechanism_text TEXT,
  narrative TEXT,

  -- Shared fields
  constraints_text TEXT,
  tags TEXT[] DEFAULT '{}',
  stats JSONB,
  model_used TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lineage (
  parent_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_species_category ON species(category);
CREATE INDEX IF NOT EXISTS idx_species_generation ON species(generation);
CREATE INDEX IF NOT EXISTS idx_species_synthesized ON species(is_synthesized);
CREATE INDEX IF NOT EXISTS idx_species_tags ON species USING GIN(tags);
