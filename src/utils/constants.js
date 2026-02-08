export const CAT_COLORS = {
  Metabolism: 'var(--cat-metabolism)',
  Structure: 'var(--cat-structure)',
  Sensing: 'var(--cat-sensing)',
  Reproduction: 'var(--cat-reproduction)',
  Defense: 'var(--cat-defense)',
  Symbiosis: 'var(--cat-symbiosis)',
  Parasitism: 'var(--cat-parasitism)',
  Collective: 'var(--cat-collective)',
  Quantum: 'var(--cat-quantum)'
};

export const CATEGORIES = [
  'Metabolism',
  'Structure', 
  'Sensing',
  'Reproduction',
  'Defense',
  'Symbiosis',
  'Parasitism',
  'Collective',
  'Quantum'
];

export const MODELS = [
  { id: 'claude-opus-4-5-20251101', name: 'Claude 4.5 Opus' },
  { id: 'claude-opus-4-6', name: 'Claude 4.6 Opus' }
];

export const DEFAULT_SYSTEM_PROMPT = `You are a xenobiologist designing speculative alien species for a hard science fiction universe. You are given \${mechanisms.length} real biological mechanisms from Earth organisms. Your job is to combine them into ONE coherent speculative species.

MECHANISMS TO COMBINE:
\${ingredients}

Generate a speculative hybrid species. Format your response EXACTLY like this (plain text, no markdown):

NAME: [A evocative species name — scientific-sounding or mythic]

BODY: [2-3 sentences describing physical form, size, habitat]

INTEGRATED MECHANISM: [3-4 sentences explaining HOW these mechanisms work together in one organism. Be specific about the biology. The mechanisms should not just coexist — they should interact, creating emergent properties neither has alone.]

COMPOUNDING CONSTRAINTS: [2-3 sentences on the costs, vulnerabilities, and tradeoffs of combining these systems. What new failure modes emerge?]

NARRATIVE POTENTIAL: [2-3 sentences on why this species is dramatically interesting — what stories does it enable? What philosophical questions does it raise?]

Be scientifically grounded but creatively bold. No generic descriptions. Every sentence should be specific and surprising.`;
