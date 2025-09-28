# PRD — GalenReviewer v1

## Problem & Users
- Users: Content contributors & reviewers for MCQs/flashcards
- Pain: Hard to intake, review, and publish consistent items with evidence

## Value Prop (1–2 lines)
Faster intake + automated checks + simple review/publish queue.

## Scope (Must/Should/Won’t)
- MUST: Auth, Intake JSON paste, Queue filters, Item detail, Publish/Request Changes, Auto-checks
- SHOULD: Journal notes, Analytics
- WON’T (v1): Full email magic links, complex roles, bulk imports

## User Stories (Top)
- As a reviewer, I can sign in and see a review queue so I know what to review
- As a contributor, I can paste JSON for an MCQ/flashcard so I can submit quickly
- As a reviewer, I can request changes or publish so I move items forward
- As a reviewer, I can see references and auto-checks so I judge quality fast
- As a reviewer, I can add a journal note so I keep track of decisions
- As an admin, I can see analytics so I understand throughput and quality flags

## IA / Routes
- /sign-in, /queue, /intake, /item/[id], /journal, /analytics, /api/*

## Data Model (first cut)
- User, Item(FR/MCQ), Flashcard, MCQ, Reference, AutoChecks, JournalNote

## Auth & Roles
- Role: REVIEWER (default)
- Gate everything behind auth; /sign-in public

## Success Metrics
- First item submitted & published within 10 minutes
- At least 1 item with references & high coverage

## Risks / Assumptions
- Local Postgres available
- Minimal email flow (use dev credentials now)

## Tech Notes
- Next.js App Router, Prisma, NextAuth (credentials in dev), Tailwind
- Deploy target: Vercel (recommended)

## Out of Scope (for now)
- Email magic links, advanced reviewer workflows