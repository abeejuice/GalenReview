import { db } from '@/lib/db'
import { findSimilarItems } from './duplicates'
import { extractClaims, findConflicts, referenceCoverage } from './numbers'
import { guessBloom } from './bloom'
import { suggestCompetencies } from './competency'

export async function runAutoChecks(itemId: string) {
  try {
    const item = await db.item.findUnique({
      where: { id: itemId },
      include: {
        flashcard: true,
        mcq: true,
        references: true,
      },
    })

    if (!item) return

    // Extract content for analysis
    let content = ''
    if (item.flashcard) {
      content = `${item.flashcard.question} ${item.flashcard.answer}`
    } else if (item.mcq) {
      content = `${item.mcq.question} ${item.mcq.options.join(' ')} ${item.mcq.explanation || ''}`
    }

    // Run all checks
    const [duplicates, conflicts, coverage, bloomLevel, suggestedComps] = await Promise.all([
      findSimilarItems(itemId),
      findConflicts(itemId),
      referenceCoverage(itemId),
      guessBloom(content),
      suggestCompetencies(item.subject, item.topic, content),
    ])

    // Upsert auto checks
    await db.autoChecks.upsert({
      where: { itemId },
      update: {
        duplicates,
        conflicts,
        coverage,
        bloomLevel,
        suggestedComps,
        updatedAt: new Date(),
      },
      create: {
        itemId,
        duplicates,
        conflicts,
        coverage,
        bloomLevel,
        suggestedComps,
      },
    })
  } catch (error) {
    console.error('Auto-checks error for item', itemId, error)
  }
}