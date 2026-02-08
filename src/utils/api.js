export async function synthesize(mechanisms, model, systemPrompt) {
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mechanisms, model, systemPrompt })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Synthesis failed');
  }

  const data = await response.json();
  return data.result;
}

export function parseHybridResult(text) {
  const sections = {};
  const lines = text.split('\n');
  let currentKey = '';
  
  for (const line of lines) {
    const match = line.match(/^(NAME|BODY|INTEGRATED MECHANISM|COMPOUNDING CONSTRAINTS|NARRATIVE POTENTIAL):\s*(.*)/);
    if (match) {
      currentKey = match[1];
      sections[currentKey] = match[2];
    } else if (currentKey && line.trim()) {
      sections[currentKey] = (sections[currentKey] || '') + ' ' + line.trim();
    }
  }

  return {
    name: sections['NAME'] || 'Unknown Hybrid',
    body: sections['BODY'] || '',
    mechanism: sections['INTEGRATED MECHANISM'] || '',
    constraints: sections['COMPOUNDING CONSTRAINTS'] || '',
    narrative: sections['NARRATIVE POTENTIAL'] || '',
    raw: text
  };
}
