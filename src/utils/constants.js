export const CAT_COLORS = {
  Metabolism: 'var(--cat-metabolism)',
  Structure: 'var(--cat-structure)',
  Sensing: 'var(--cat-sensing)',
  Reproduction: 'var(--cat-reproduction)',
  Defense: 'var(--cat-defense)',
  Symbiosis: 'var(--cat-symbiosis)',
  Parasitism: 'var(--cat-parasitism)',
  Collective: 'var(--cat-collective)',
  Quantum: 'var(--cat-quantum)',
  Synthesized: 'var(--accent)'
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

export const SYNTHESIS_SLIDERS = [
  // Biological (5)
  { key: 'cognitive', label: 'Cognitive Complexity', lowLabel: 'Instinct/Reflex', highLabel: 'Abstract/Sapient', group: 'biological' },
  { key: 'physical', label: 'Physical Power', lowLabel: 'Fragile/Weak', highLabel: 'Colossal/Herculean', group: 'biological' },
  { key: 'agility', label: 'Kinetic Agility', lowLabel: 'Lumbering/Static', highLabel: 'Fluid/Lightning-fast', group: 'biological' },
  { key: 'metabolic', label: 'Metabolic Rate', lowLabel: 'Dormant/Slow', highLabel: 'Voracious/High-energy', group: 'biological' },
  { key: 'sensory', label: 'Sensory Acuity', lowLabel: 'Near-blind/Limited', highLabel: 'Hyper-aware/Multispectral', group: 'biological' },
  // Survival & Social (5)
  { key: 'hardiness', label: 'Environmental Hardiness', lowLabel: 'Niche Specialist', highLabel: 'Apex Generalist', group: 'survival' },
  { key: 'reproductive', label: 'Reproductive Output', lowLabel: 'K-Selection/Rare', highLabel: 'r-Selection/Swarms', group: 'survival' },
  { key: 'social', label: 'Social Connectivity', lowLabel: 'Hyper-Solitary', highLabel: 'Hive Mind/Eusocial', group: 'survival' },
  { key: 'longevity', label: 'Individual Longevity', lowLabel: 'Ephemeral (Days)', highLabel: 'Millennial/Immortal', group: 'survival' },
  { key: 'communication', label: 'Communication Bandwidth', lowLabel: 'Basic Cues', highLabel: 'Total Information Transfer', group: 'survival' }
];

export const DEFAULT_SLIDERS = SYNTHESIS_SLIDERS.reduce((acc, slider) => {
  acc[slider.key] = 5; // Neutral midpoint
  return acc;
}, {});

export const DEFAULT_SYSTEM_PROMPT = `You are a xenobiologist designing speculative alien species for a hard science fiction universe. You are given \${speciesList.length} \${entityType}. Your job is to combine them into ONE coherent speculative species.

ENTITIES TO COMBINE:
\${ingredients}

\${sliderProfile}
Design a speculative hybrid species that combines these mechanisms. The mechanisms should not just coexist — they should interact, creating emergent properties neither has alone.

Consider:
- How the biological mechanisms integrate and enhance each other
- What new capabilities and limitations emerge from their combination
- The costs, vulnerabilities, and tradeoffs
- How this species could further combine with other mechanisms
- What stories and philosophical questions this species enables

Base the stats on how the parent mechanisms combine - consider whether traits amplify, average, or create new dynamics.

Be scientifically grounded but creatively bold. No generic descriptions. Every detail should be specific and surprising.`;
