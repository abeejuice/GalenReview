import { randomUUID } from 'crypto'

export type DevAutoChecks = {
  duplicates: string[]
  conflicts: string[]
  coverage: number
  bloomLevel?: string
  suggestedComps: string[]
}

export type DevCompetency = {
  id: string
  name: string
}

export type DevFlashcard = {
  question: string
  answer: string
}

export type DevItem = {
  id: string
  type: 'FLASHCARD' | 'MCQ'
  subject: string
  topic: string
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED'
  userId: string
  competencyId?: string
  competency?: DevCompetency
  flashcard?: DevFlashcard
  mcq?: {
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
  }
  references: Array<{ title: string; page?: string; url?: string }>
  autoChecks?: DevAutoChecks
  createdAt: string
  updatedAt: string
}

export type DevUser = {
  id: string
  email: string
  name: string
  role: 'REVIEWER'
}

export type DevStore = {
  users: Map<string, DevUser>
  items: DevItem[]
  competencies: Map<string, DevCompetency>
}

const globalStore = globalThis as typeof globalThis & {
  __devStore?: DevStore
}

const seedItems = (): DevItem[] => {
  const now = new Date().toISOString()
  return [
    {
      id: randomUUID(),
      type: 'FLASHCARD',
      subject: 'Cardiology',
      topic: 'Heart Rate',
      status: 'NEEDS_REVIEW',
      userId: 'dev-user-1',
      competencyId: 'comp-1',
      competency: {
        id: 'comp-1',
        name: 'Physiology Basics',
      },
      flashcard: {
        question: 'What is the normal resting heart rate range?',
        answer: 'A typical resting heart rate for adults ranges from 60 to 100 beats per minute.',
      },
      references: [
        {
          title: "Harrison's Principles of Internal Medicine",
          page: '234',
        },
      ],
      autoChecks: {
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
      id: randomUUID(),
      type: 'MCQ',
      subject: 'Neurology',
      topic: 'Cranial Nerves',
      status: 'CHANGES_REQUESTED',
      userId: 'dev-user-1',
      competencyId: 'comp-2',
      competency: {
        id: 'comp-2',
        name: 'Neuroanatomy',
      },
      mcq: {
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
      id: randomUUID(),
      type: 'FLASHCARD',
      subject: 'Pharmacology',
      topic: 'Beta Blockers',
      status: 'PUBLISHED',
      userId: 'dev-user-2',
      competencyId: 'comp-3',
      competency: {
        id: 'comp-3',
        name: 'Pharmacologic Interventions',
      },
      flashcard: {
        question: 'Name a common contraindication for beta blocker therapy.',
        answer: 'Severe asthma is a contraindication because beta blockers can precipitate bronchospasm.',
      },
      references: [
        {
          title: 'Goodman & Gilman\'s The Pharmacological Basis of Therapeutics',
          page: '157',
        },
      ],
      autoChecks: {
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
  const items = seedItems()
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
  ])

  const competencies: DevStore['competencies'] = new Map()
  items.forEach((item) => {
    if (item.competency) {
      competencies.set(item.competency.id, item.competency)
    }
  })

  return {
    users,
    items,
    competencies,
  }
}

export const getDevStore = () => {
  if (!globalStore.__devStore) {
    globalStore.__devStore = createStore()
  }
  return globalStore.__devStore
}

export const addDevFlashcard = (params: {
  subject: string
  topic: string
  competencyId?: string
  userId: string
  flashcard: DevFlashcard
  references: Array<{ title: string; page?: string; url?: string }>
}) => {
  const store = getDevStore()
  const now = new Date().toISOString()
  const competency = params.competencyId
    ? store.competencies.get(params.competencyId) ?? {
        id: params.competencyId,
        name: params.competencyId,
      }
    : undefined

  const item: DevItem = {
    id: randomUUID(),
    type: 'FLASHCARD',
    subject: params.subject,
    topic: params.topic,
    status: 'NEEDS_REVIEW',
    userId: params.userId,
    competencyId: params.competencyId,
    competency,
    flashcard: params.flashcard,
    references: params.references,
    autoChecks: {
      duplicates: [],
      conflicts: [],
      coverage: 0.5 + Math.random() * 0.4,
      suggestedComps: competency ? [competency.name] : [],
      bloomLevel: 'Understand',
    },
    createdAt: now,
    updatedAt: now,
  }

  store.items = [item, ...store.items]
  if (competency) {
    store.competencies.set(competency.id, competency)
  }

  return item
}

export const registerDevUser = (user: DevUser) => {
  const store = getDevStore()
  store.users.set(user.email, user)
}

export const findDevUserByEmail = (email: string) => {
  const store = getDevStore()
  return store.users.get(email)
}
