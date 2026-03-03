const API_BASE = '/api';

// Fetch all species with optional filters
export async function fetchSpecies({ search, category, synthesized } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'all') params.set('category', category);
  if (synthesized !== undefined) params.set('synthesized', synthesized);

  const url = `${API_BASE}/species${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch species');
  }

  return response.json();
}

// Fetch single species with lineage
export async function fetchSpeciesById(id) {
  const response = await fetch(`${API_BASE}/species/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch species');
  }

  return response.json();
}

// Fetch only lineage (parents/children) for a species
export async function fetchSpeciesLineage(id) {
  const response = await fetch(`${API_BASE}/species/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch lineage');
  }

  const data = await response.json();
  return {
    parents: data.parents || [],
    children: data.children || []
  };
}

// Create new species
export async function createSpecies(speciesData) {
  const response = await fetch(`${API_BASE}/species`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(speciesData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create species');
  }

  return response.json();
}

// Update species
export async function updateSpecies(id, speciesData) {
  const response = await fetch(`${API_BASE}/species/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(speciesData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update species');
  }

  return response.json();
}

// Delete species
export async function deleteSpecies(id) {
  const response = await fetch(`${API_BASE}/species/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete species');
  }

  return response.json();
}

// Run AI synthesis (returns structured JSON result, does NOT save)
export async function synthesize(speciesList, model, systemPrompt, sliders) {
  const response = await fetch(`${API_BASE}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ species: speciesList, model, systemPrompt, sliders })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Synthesis failed');
  }

  // Server returns: { result: {...}, generation, parent_ids, parent_tags }
  // result is already parsed JSON from structured output
  return response.json();
}

// Save synthesis result as new species (unified structure with base mechanisms)
export async function saveSynthesisResult(parsed, generation, parentIds, parentTags, model) {
  // Merge AI-generated tags with parent tags, deduplicated
  const mergedTags = [...new Set([...parentTags, ...(parsed.tags || [])])];

  const speciesData = {
    name: parsed.name,
    icon: '🧬',
    category: 'Synthesized',
    is_synthesized: true,
    generation,
    // Unified fields (same as base mechanisms)
    what: parsed.what,
    how: parsed.how,
    constraints_text: parsed.constraints,
    combo: parsed.combo,
    hooks: parsed.hooks,
    stats: parsed.stats,
    tags: mergedTags,
    model_used: model,
    parent_ids: parentIds
  };

  return createSpecies(speciesData);
}
