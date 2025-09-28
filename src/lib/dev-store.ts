import { randomUUID } from 'crypto'

// These types are manually crafted to mirror the Prisma-generated types
// for the in-memory store when a database is not connected.

export type DevAutoChecks = {
  id: string
  itemId: string
  duplicates: string[]
  conflicts: string[]
  coverage: number
  bloomLevel?: string
  suggestedComps: string[]
}

export type DevCompetency = {
  id: string
  name: string
  description: string | null
}

export type DevFlashcard = {
  id: string
  itemId: string
  question: string
  answer: string
}

export type DevMCQ = {
  id: string
  itemId: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string | null
}

export type DevUser = {
  id: string
  email: string
  name: string
  role: 'REVIEWER'
}

export type DevJournalNote = {
  id: string
  userId: string
  content: string
  itemId: string | null
  createdAt: string
}

export type DevItem = {
  id: string
  type: 'FLASHCARD' | 'MCQ'
  subject: string
  topic: string
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED'
  userId: string
  user: { email: string; name: string }
  competencyId: string
  competency: DevCompetency
  flashcard: DevFlashcard | null
  mcq: DevMCQ | null
  references: Array<{ title: string; page?: string; url?: string }>
  autoChecks: DevAutoChecks | null
  createdAt: string
  updatedAt: string
}

export type DevStore = {
  users: Map<string, DevUser>
  items: DevItem[]
  competencies: Map<string, DevCompetency>
  journalNotes: DevJournalNote[]
}

const globalStore = globalThis as typeof globalThis & {
  __devStore?: DevStore
}

const seedItems = (users: Map<string, DevUser>): DevItem[] => {
  const now = new Date().toISOString()
  const user1 = users.get('reviewer@example.com')!
  const user2 = users.get('editor@example.com')!

  const item1Id = randomUUID()
  const item2Id = randomUUID()
  const item3Id = randomUUID()

  return [
    {
      id: item1Id,
      type: 'FLASHCARD',
      subject: 'Cardiology',
      topic: 'Heart Rate',
      status: 'NEEDS_REVIEW',
      userId: user1.id,
      user: { email: user1.email, name: user1.name },
      competencyId: 'comp-1',
      competency: {
        id: 'comp-1',
        name: 'Physiology Basics',
        description: 'Basic physiological concepts.',
      },
      flashcard: {
        id: randomUUID(),
        itemId: item1Id,
        question: 'What is the normal resting heart rate range?',
        answer: 'A typical resting heart rate for adults ranges from 60 to 100 beats per minute.',
      },
      mcq: null,
      references: [
        {
          title: "Harrison's Principles of Internal Medicine",
          page: '234',
        },
      ],
      autoChecks: {
        id: randomUUID(),
        itemId: item1Id,
        duplicates: [],
        conflicts: [],
        coverage: 0.92,
        bloomLevel: 'Remember',
        suggestedComps: ['Vital Signs Assessment'],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: item2Id,
      type: 'MCQ',
      subject: 'Neurology',
      topic: 'Cranial Nerves',
      status: 'CHANGES_REQUESTED',
      userId: user1.id,
      user: { email: user1.email, name: user1.name },
      competencyId: 'comp-2',
      competency: {
        id: 'comp-2',
        name: 'Neuroanatomy',
        description: 'The study of the structure of the nervous system.',
      },
      flashcard: null,
      mcq: {
        id: randomUUID(),
        itemId: item2Id,
        question: 'Which cranial nerve innervates the lateral rectus muscle?',
        options: ['CN III', 'CN IV', 'CN VI', 'CN VII'],
        correctIndex: 2,
        explanation: 'The abducens nerve (CN VI) innervates the lateral rectus muscle.',
      },
      references: [
        {
          title: "Gray's Anatomy",
          page: '412',
        },
      ],
      autoChecks: {
        id: randomUUID(),
        itemId: item2Id,
        duplicates: ['Potential overlap with neuro exam item ID 102'],
        conflicts: [],
        coverage: 0.65,
        bloomLevel: 'Understand',
        suggestedComps: ['Ophthalmologic Exam Skills'],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: item3Id,
      type: 'FLASHCARD',
      subject: 'Pharmacology',
      topic: 'Beta Blockers',
      status: 'PUBLISHED',
      userId: user2.id,
      user: { email: user2.email, name: user2.name },
      competencyId: 'comp-3',
      competency: {
        id: 'comp-3',
        name: 'Pharmacologic Interventions',
        description: null,
      },
      flashcard: {
        id: randomUUID(),
        itemId: item3Id,
        question: 'Name a common contraindication for beta blocker therapy.',
        answer: 'Severe asthma is a contraindication because beta blockers can precipitate bronchospasm.',
      },
      mcq: null,
      references: [
        {
          title: "Goodman & Gilman's The Pharmacological Basis of Therapeutics",
          page: '157',
        },
      ],
      autoChecks: {
        id: randomUUID(),
        itemId: item3Id,
        duplicates: [],
        conflicts: ['Conflicts with Item 204: Beta Blockers in COPD'],
        coverage: 0.78,
        bloomLevel: 'Apply',
        suggestedComps: ['Medication Safety'],
      },
      createdAt: now,
      updatedAt: now,
    },
  ]
}

const createStore = (): DevStore => {
  const users: DevStore['users'] = new Map([
    [
      'reviewer@example.com',
      {
        id: 'dev-user-1',
        email: 'reviewer@example.com',
        name: 'Reviewer One',
        role: 'REVIEWER',
      },
    ],
    [
      'editor@example.com',
      {
        id: 'dev-user-2',
        email: 'editor@example.com',
        name: 'Editor Two',
        role: 'REVIEWER',
      },
    ],
    [
      'arunbiju3010@gmail.com',
      {
        id: 'dev-user-3',
        email: 'arunbiju3010@gmail.com',
        name: 'Arun Biju',
        role: 'REVIEWER',
      },
    ],
  ])

  const items = seedItems(users)
  const competencies: DevStore['competencies'] = new Map()
  items.forEach((item) => {
    if (item.competency) {
      competencies.set(item.competency.id, item.competency)
    }
  })

  const journalNotes: DevJournalNote[] = [
    {
      id: randomUUID(),
      userId: 'dev-user-1',
      content: 'Reviewed flashcard on heart rate—needs updated reference.',
      itemId: items[0]?.id ?? null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: randomUUID(),
      userId: 'dev-user-1',
      content: 'Follow up with contributor about cranial nerve item changes.',
      itemId: items[1]?.id ?? null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: randomUUID(),
      userId: 'dev-user-2',
      content: 'Beta blocker question ready for final publish review.',
      itemId: items[2]?.id ?? null,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ]

  return {
    users,
    items,
    competencies,
    journalNotes,
  }
}

export const getDevStore = () => {
  if (!globalStore.__devStore) {
    globalStore.__devStore = createStore()
  }
  return globalStore.__devStore
}

export const getDevItemById = (id: string) => {
  const store = getDevStore()
  return store.items.find((item) => item.id === id)
}

export const addDevFlashcard = (params: {
  subject: string
  topic: string
  competencyId?: string
  userId: string
  flashcard: { question: string; answer: string; }
  references: Array<{ title: string; page?: string; url?: string }>
}) => {
  const store = getDevStore()
  const user = store.users.get(params.userId) ?? {
    id: params.userId,
    email: 'unknown',
    name: 'Unknown',
    role: 'REVIEWER',
  }

  const now = new Date().toISOString()
  const competencyId = params.competencyId ?? 'general'
  const competency = store.competencies.get(competencyId) ?? {
    id: competencyId,
    name: competencyId,
    description: null,
  }

  const itemId = randomUUID()
  const item: DevItem = {
    id: itemId,
    type: 'FLASHCARD',
    subject: params.subject,
    topic: params.topic,
    status: 'NEEDS_REVIEW',
    userId: params.userId,
    user: { email: user.email, name: user.name },
    competencyId,
    competency,
    flashcard: {
      id: randomUUID(),
      itemId: itemId,
      ...params.flashcard,
    },
    mcq: null,
    references: params.references,
    autoChecks: {
      id: randomUUID(),
      itemId: itemId,
      duplicates: [],
      conflicts: [],
      coverage: 0.5 + Math.random() * 0.4,
      suggestedComps: [competency.name],
      bloomLevel: 'Understand',
    },
    createdAt: now,
    updatedAt: now,
  }

  store.items = [item, ...store.items]
  store.competencies.set(competency.id, competency)

  return item
}

export const addDevMCQ = (params: {
  subject: string
  topic: string
  competencyId?: string
  userId: string
  mcq: { question: string; options: string[]; correctIndex: number; explanation?: string | null }
  references: Array<{ title: string; page?: string; url?: string }>
  autoChecks?: Partial<DevAutoChecks>
}) => {
  const store = getDevStore()
  const user = store.users.get(params.userId) ?? {
    id: params.userId,
    email: 'unknown',
    name: 'Unknown',
    role: 'REVIEWER',
  }

  const competencyId = params.competencyId ?? 'general'
  const competency = store.competencies.get(competencyId) ?? {
    id: competencyId,
    name: competencyId,
    description: null,
  }

  const now = new Date().toISOString()
  const itemId = randomUUID()

  const autoChecks: DevAutoChecks = {
    id: randomUUID(),
    itemId,
    duplicates: params.autoChecks?.duplicates ?? [],
    conflicts: params.autoChecks?.conflicts ?? [],
    coverage:
      typeof params.autoChecks?.coverage === 'number'
        ? params.autoChecks.coverage
        : 0.5 + Math.random() * 0.4,
    bloomLevel: params.autoChecks?.bloomLevel ?? 'Apply',
    suggestedComps:
      params.autoChecks?.suggestedComps ??
      (competency.name ? [competency.name] : []),
  }

  const item: DevItem = {
    id: itemId,
    type: 'MCQ',
    subject: params.subject,
    topic: params.topic,
    status: 'NEEDS_REVIEW',
    userId: params.userId,
    user: { email: user.email, name: user.name },
    competencyId,
    competency,
    flashcard: null,
    mcq: {
      id: randomUUID(),
      itemId,
      question: params.mcq.question,
      options: params.mcq.options,
      correctIndex: params.mcq.correctIndex,
      explanation: params.mcq.explanation ?? null,
    },
    references: params.references,
    autoChecks,
    createdAt: now,
    updatedAt: now,
  }

  store.items = [item, ...store.items]
  store.competencies.set(competency.id, competency)

  return item
}

export const updateDevItemStatus = (params: { id: string; status: DevItem['status'] }) => {
  const store = getDevStore()
  const itemIndex = store.items.findIndex((item) => item.id === params.id)
  if (itemIndex === -1) {
    return undefined
  }
  const item = store.items[itemIndex]
  const updated: DevItem = {
    ...item,
    status: params.status,
    updatedAt: new Date().toISOString(),
  }
  store.items[itemIndex] = updated
  return updated
}

export const registerDevUser = (user: DevUser) => {
  const store = getDevStore()
  store.users.set(user.email, user)
}

export const findDevUserByEmail = (email: string) => {
  const store = getDevStore()
  for (const user of store.users.values()) {
    if (user.email === email) {
      return user
    }
  }
  return undefined
}

export const getDevJournalNotesForUser = (userId: string) => {
  const store = getDevStore()
  return store.journalNotes
    .filter((note) => note.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export const addDevJournalNote = (params: {
  userId: string
  content: string
  itemId?: string | null
}) => {
  const store = getDevStore()
  const note: DevJournalNote = {
    id: randomUUID(),
    userId: params.userId,
    content: params.content,
    itemId: params.itemId ?? null,
    createdAt: new Date().toISOString(),
  }
  store.journalNotes = [note, ...store.journalNotes]
  return note
}
