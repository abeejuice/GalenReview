import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a reviewer user
  const user = await prisma.user.upsert({
    where: { email: 'reviewer@example.com' },
    update: {},
    create: {
      email: 'reviewer@example.com',
      name: 'Dr. Reviewer',
      role: 'REVIEWER',
    },
  })

  // Create competencies
  const competencies = [
    { id: 'anatomy', name: 'Anatomy', description: 'Anatomical structures and systems' },
    { id: 'physiology', name: 'Physiology', description: 'Physiological processes and functions' },
    { id: 'pathology', name: 'Pathology', description: 'Disease processes and pathophysiology' },
  ]

  for (const comp of competencies) {
    await prisma.competency.upsert({
      where: { id: comp.id },
      update: {},
      create: comp,
    })
  }

  // Create sample items
  // 1. Flashcard with numeric claim + reference
  const item1 = await prisma.item.create({
    data: {
      type: 'FLASHCARD',
      subject: 'Cardiology',
      topic: 'Heart Rate',
      status: 'NEEDS_REVIEW',
      userId: user.id,
      competencyId: 'physiology',
      flashcard: {
        create: {
          question: 'What is the normal resting heart rate range?',
          answer: 'The normal resting heart rate for adults is typically 60-100 beats per minute.',
        },
      },
      references: {
        create: {
          title: 'Harrison\'s Principles of Internal Medicine',
          page: '234',
        },
      },
    },
  })

  // 2. MCQ + reference
  const item2 = await prisma.item.create({
    data: {
      type: 'MCQ',
      subject: 'Anatomy',
      topic: 'Heart Chambers',
      status: 'NEEDS_REVIEW',
      userId: user.id,
      competencyId: 'anatomy',
      mcq: {
        create: {
          question: 'How many chambers does the human heart have?',
          options: ['2', '3', '4', '5'],
          correctIndex: 2,
          explanation: 'The human heart has 4 chambers: 2 atria and 2 ventricles.',
        },
      },
      references: {
        create: {
          title: 'Gray\'s Anatomy',
          page: '156',
        },
      },
    },
  })

  // 3. Clean flashcard + reference
  const item3 = await prisma.item.create({
    data: {
      type: 'FLASHCARD',
      subject: 'Pathology',
      topic: 'Inflammation',
      status: 'NEEDS_REVIEW',
      userId: user.id,
      competencyId: 'pathology',
      flashcard: {
        create: {
          question: 'What are the classic signs of inflammation?',
          answer: 'The classic signs of inflammation are redness, heat, swelling, pain, and loss of function.',
        },
      },
      references: {
        create: {
          title: 'Robbins Basic Pathology',
          page: '45',
        },
      },
    },
  })

  console.log('Seed data created successfully!')
  console.log(`Created user: ${user.email}`)
  console.log(`Created ${competencies.length} competencies`)
  console.log(`Created 3 items with ID: ${item1.id}, ${item2.id}, ${item3.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })