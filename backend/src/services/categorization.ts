// Rule-based categorization & prioritization service.
// Structured so a real AI API call could replace `analyzeIssue` later without
// changing any calling code - just swap the implementation of this function.

export interface AnalysisResult {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  priorityReason: string;
}

const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: 'Plumbing', keywords: ['water', 'leak', 'pipe', 'tap', 'drain', 'flood'] },
  { category: 'Electrical', keywords: ['light', 'electricity', 'switch', 'fan', 'power', 'wire', 'shock', 'socket'] },
  { category: 'Furniture', keywords: ['chair', 'table', 'desk', 'bench', 'furniture', 'broken seat'] },
  { category: 'Cleanliness', keywords: ['garbage', 'dustbin', 'dirty', 'clean', 'trash', 'smell', 'washroom'] },
  { category: 'Internet/WiFi', keywords: ['wifi', 'internet', 'network', 'router', 'connection'] },
  { category: 'Security', keywords: ['theft', 'security', 'stranger', 'lock broken', 'trespass', 'unsafe'] },
  { category: 'Infrastructure', keywords: ['ceiling', 'wall', 'crack', 'door', 'window', 'roof', 'stairs'] },
];

const HIGH_PRIORITY_KEYWORDS = [
  'danger', 'emergency', 'hazard', 'fire', 'shock', 'electrical hazard',
  'major leak', 'flooding', 'gas leak', 'unsafe', 'security threat', 'theft',
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'broken', 'not working', 'internet', 'wifi down', 'damaged', 'malfunction',
];

function textIncludesAny(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

export function categorize(description: string): string {
  const lower = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (textIncludesAny(lower, rule.keywords)) {
      return rule.category;
    }
  }
  return 'Other';
}

export function prioritize(description: string, category: string): { priority: 'LOW' | 'MEDIUM' | 'HIGH'; reason: string } {
  const highHit = textIncludesAny(description, HIGH_PRIORITY_KEYWORDS);
  if (highHit || category === 'Security') {
    return {
      priority: 'HIGH',
      reason: highHit
        ? `Marked HIGH priority because the description mentions "${highHit}", which indicates a potential safety risk.`
        : 'Marked HIGH priority because security-related issues are treated as safety risks.',
    };
  }

  if (category === 'Electrical' && textIncludesAny(description, ['spark', 'burn', 'short circuit'])) {
    return { priority: 'HIGH', reason: 'Marked HIGH priority because electrical faults involving sparks or burning are fire hazards.' };
  }

  if (category === 'Plumbing' && textIncludesAny(description, ['flood', 'major', 'burst'])) {
    return { priority: 'HIGH', reason: 'Marked HIGH priority because a major water leak can cause structural damage.' };
  }

  const mediumHit = textIncludesAny(description, MEDIUM_PRIORITY_KEYWORDS);
  if (mediumHit || category === 'Furniture' || category === 'Internet/WiFi' || category === 'Infrastructure') {
    return {
      priority: 'MEDIUM',
      reason: mediumHit
        ? `Marked MEDIUM priority because the description mentions "${mediumHit}", indicating a functional problem that affects usability.`
        : `Marked MEDIUM priority as a typical ${category.toLowerCase()} issue affecting day-to-day use.`,
    };
  }

  return {
    priority: 'LOW',
    reason: 'Marked LOW priority as a minor or cosmetic issue with no immediate safety or functional impact.',
  };
}

export function analyzeIssue(title: string, description: string): AnalysisResult {
  const combined = `${title} ${description}`;
  const category = categorize(combined);
  const { priority, reason } = prioritize(combined, category);
  return { category, priority, priorityReason: reason };
}
