-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CONTRIBUTOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('FLASHCARD', 'MCQ');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Competency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "type" "public"."ItemType" NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "userId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flashcard" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MCQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "MCQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reference" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "page" TEXT,
    "url" TEXT,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutoChecks" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "duplicates" TEXT[],
    "conflicts" TEXT[],
    "coverage" DOUBLE PRECISION NOT NULL,
    "bloomLevel" TEXT,
    "suggestedComps" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoChecks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JournalNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "itemId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Flashcard_itemId_key" ON "public"."Flashcard"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "MCQ_itemId_key" ON "public"."MCQ"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "AutoChecks_itemId_key" ON "public"."AutoChecks"("itemId");

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flashcard" ADD CONSTRAINT "Flashcard_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MCQ" ADD CONSTRAINT "MCQ_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reference" ADD CONSTRAINT "Reference_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutoChecks" ADD CONSTRAINT "AutoChecks_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JournalNote" ADD CONSTRAINT "JournalNote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JournalNote" ADD CONSTRAINT "JournalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
