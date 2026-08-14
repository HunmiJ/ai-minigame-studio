const windowMs = 60_000;
const maxRequests = 5;
const attempts = new Map<string, number[]>();

export function allowGeneration(key: string, now = Date.now()) {
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= maxRequests) { attempts.set(key, recent); return false; }
  recent.push(now); attempts.set(key, recent); return true;
}

export function resetGenerationRateLimit() { attempts.clear(); }
