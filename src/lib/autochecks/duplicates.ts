import { db } from '@/lib/db'
import { compareTwoStrings } from 'string-similarity'

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

export async function findSimilarItems(itemId: string, threshold: number = 0.85): Promise<string[]> {
  if (!db) return []
  try {
    const currentItem = await db.item.findUnique({
      where: { id: itemId },
      include: {
        flashcard: true,
        mcq: true,
      },
    })

    if (!currentItem) return []

    // Get current item content
    let currentContent = ''
    if (currentItem.flashcard) {
      currentContent = `${currentItem.flashcard.question} ${currentItem.flashcard.answer}`
    } else if (currentItem.mcq) {
      currentContent = `${currentItem.mcq.question} ${currentItem.mcq.options.join(' ')}`
    }

    const normalizedCurrent = normalizeText(currentContent)

    // Get all other items of the same type
    const otherItems = await db.item.findMany({
      where: {
        id: { not: itemId },
        type: currentItem.type,
      },
      include: {
        flashcard: true,
        mcq: true,
      },
    })

    const similarItems: string[] = []

    for (const item of otherItems) {
      let content = ''
      if (item.flashcard) {
        content = `${item.flashcard.question} ${item.flashcard.answer}`
      } else if (item.mcq) {
        content = `${item.mcq.question} ${item.mcq.options.join(' ')}`
      }

      const normalizedOther = normalizeText(content)
      const similarity = compareTwoStrings(normalizedCurrent, normalizedOther)

      if (similarity >= threshold) {
        similarItems.push(item.id)
      }
    }

    return similarItems
  } catch (error) {
    console.error('Error finding similar items:', error)
    return []
  }
}