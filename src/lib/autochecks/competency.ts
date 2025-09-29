const competencyMap: Record<string, string[]> = {
  anatomy: ['structure', 'anatomical', 'organ', 'tissue', 'system', 'bone', 'muscle'],
  physiology: ['function', 'process', 'mechanism', 'regulation', 'homeostasis', 'metabolism'],
  pathology: ['disease', 'disorder', 'pathology', 'abnormal', 'dysfunction', 'infection'],
}

export async function suggestCompetencies(
  subject: string, 
  topic: string, 
  text: string
): Promise<string[]> {
  const lowerText = `${subject} ${topic} ${text}`.toLowerCase()
  const suggestions: string[] = []
  
  for (const [competency, keywords] of Object.entries(competencyMap)) {
    const hasKeyword = keywords.some(keyword => lowerText.includes(keyword))
    if (hasKeyword) {
      suggestions.push(competency)
    }
  }
  
  return suggestions.length > 0 ? suggestions : ['anatomy'] // default
}