import stringSimilarity from 'string-similarity';

export async function runAutoChecks(itemId: string, data: any) {
  const checks: any = {};

  // Groundedness scoring (simple heuristic)
  checks.groundednessScore = calculateGroundednessScore(data);

  // Faithfulness scoring
  checks.faithfulnessScore = calculateFaithfulnessScore(data);

  // Reference coverage analysis
  checks.referenceCoverage = analyzeReferenceCoverage(data);

  // Duplicate detection (basic string similarity)
  checks.possibleDuplicates = await findPossibleDuplicates(data);

  // Claims with numbers detection
  checks.claimsWithNumbers = extractNumericClaims(data);

  return checks;
}

function calculateGroundednessScore(data: any): number {
  // Simple scoring based on presence of references and content length
  let score = 3; // Base score
  
  const references = data.references || data.explanation?.references || [];
  if (references.length > 0) score += 1;
  if (references.length > 2) score += 1;
  
  // Check if references have page numbers
  const referencesWithPages = references.filter((r: any) => r.page);
  if (referencesWithPages.length > 0) score += 1;
  
  return Math.min(score, 5);
}

function calculateFaithfulnessScore(data: any): number {
  // Simple heuristic based on content structure and completeness
  let score = 3;
  
  if (data.front_text && data.back_text) {
    // Flashcard scoring
    if (data.back_text.length > 50) score += 1;
    if (data.back_text.length > 200) score += 1;
  } else if (data.stem && data.explanation) {
    // MCQ scoring
    if (data.explanation.summary.length > 50) score += 1;
    if (data.options && data.options.length >= 4) score += 1;
  }
  
  return Math.min(score, 5);
}

function analyzeReferenceCoverage(data: any): 'high' | 'medium' | 'low' {
  const references = data.references || data.explanation?.references || [];
  const content = data.back_text || data.explanation?.summary || '';
  
  // Look for numeric claims
  const numericClaims = extractNumericClaims(data);
  const hasNumbers = numericClaims.length > 0;
  
  // Check if numeric claims have supporting references with pages
  if (hasNumbers) {
    const referencesWithPages = references.filter((r: any) => r.page);
    if (referencesWithPages.length === 0) return 'low';
    if (referencesWithPages.length < numericClaims.length) return 'medium';
  }
  
  // General reference quality
  if (references.length === 0) return 'low';
  if (references.length < 2) return 'medium';
  return 'high';
}

async function findPossibleDuplicates(data: any): Promise<string[]> {
  // In a real implementation, this would query the database for similar items
  // For now, return empty array as we don't have access to existing items
  return [];
}

function extractNumericClaims(data: any): Array<{ claim: string; value: string }> {
  const content = [
    data.front_text,
    data.back_text,
    data.stem,
    data.explanation?.summary
  ].filter(Boolean).join(' ');
  
  // Regex to find numbers, percentages, and units
  const numericPattern = /\b\d+(?:\.\d+)?%?(?:\s*(?:mg|g|kg|ml|l|cm|mm|m|years?|months?|days?|hours?|minutes?))?/gi;
  
  const matches = content.match(numericPattern) || [];
  
  return matches.map(match => ({
    claim: `Contains numeric value: ${match}`,
    value: match,
  }));
}
