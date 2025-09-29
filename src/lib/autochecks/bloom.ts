const bloomVerbs = {
  remember: ['list', 'identify', 'name', 'state', 'define', 'recall'],
  understand: ['explain', 'describe', 'interpret', 'summarize', 'classify'],
  apply: ['demonstrate', 'calculate', 'solve', 'use', 'implement'],
  analyze: ['compare', 'contrast', 'differentiate', 'examine', 'analyze'],
  evaluate: ['assess', 'critique', 'judge', 'evaluate', 'justify'],
  create: ['design', 'construct', 'create', 'develop', 'formulate'],
}

export async function guessBloom(text: string): Promise<string> {
  const lowerText = text.toLowerCase()
  
  for (const [level, verbs] of Object.entries(bloomVerbs)) {
    for (const verb of verbs) {
      if (lowerText.includes(verb)) {
        return level
      }
    }
  }
  
  // Default to 'remember' if no verbs found
  return 'remember'
}