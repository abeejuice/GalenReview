import { db } from '@/lib/db'
import { extractNumericClaims } from '@/lib/types'

export async function extractClaims(text: string): Promise<string[]> {
  return extractNumericClaims(text)
}

export async function findConflicts(itemId: string): Promise<string[]> {
  try {
    const item = await db.item.findUnique({
      where: { id: itemId },
      include: { flashcard: true, mcq: true },
    })

    if (!item) return []

    let content = ''
    if (item.flashcard) {
      content = `${item.flashcard.question} ${item.flashcard.answer}`
    } else if (item.mcq) {
      content = `${item.mcq.question} ${item.mcq.options.join(' ')}`
    }

    const claims = await extractClaims(content)
    // Simple conflict detection - look for contradictory ranges
    const conflicts: string[] = []
    
    // This is a simplified implementation
    // In practice, you'd want more sophisticated conflict detection
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        if (claims[i] !== claims[j] && 
            claims[i].replace(/[\d.]/g, '') === claims[j].replace(/[\d.]/g, '')) {
          conflicts.push(`${claims[i]} vs ${claims[j]}`)
        }
      }
    }

    return conflicts
  } catch (error) {
    console.error('Error finding conflicts:', error)
    return []
  }
}

export async function referenceCoverage(itemId: string): Promise<number> {
  try {
    const item = await db.item.findUnique({
      where: { id: itemId },
      include: { 
        flashcard: true, 
        mcq: true, 
        references: true 
      },
    })

    if (!item) return 0

    let content = ''
    if (item.flashcard) {
      content = `${item.flashcard.question} ${item.flashcard.answer}`
    } else if (item.mcq) {
      content = `${item.mcq.question} ${item.mcq.options.join(' ')}`
    }

    const claims = await extractClaims(content)
    const referencesWithPages = item.references.filter(ref => ref.page)

    if (claims.length === 0) return 1.0
    return referencesWithPages.length > 0 ? 1.0 : 0.5
  } catch (error) {
    console.error('Error calculating reference coverage:', error)
    return 0
  }
}