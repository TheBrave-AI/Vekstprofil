-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('yes_no', 'open', 'numeric');

-- CreateTable
CREATE TABLE "question" (
    "q_id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "hint" TEXT,
    "placeholder" TEXT,
    "suffix" TEXT,
    "prefix" TEXT,
    "category" TEXT,
    "answer_type" "AnswerType" NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("q_id")
);

-- CreateTable
CREATE TABLE "template" (
    "t_id" SERIAL NOT NULL,
    "question_ids" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "short_title" TEXT,

    CONSTRAINT "template_pkey" PRIMARY KEY ("t_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "c_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("c_id")
);

-- CreateTable
CREATE TABLE "questionnaire" (
    "qu_id" SERIAL NOT NULL,
    "t_id" INTEGER NOT NULL,
    "c_id" INTEGER NOT NULL,
    "answer_ids" JSONB,
    "link" TEXT NOT NULL,

    CONSTRAINT "questionnaire_pkey" PRIMARY KEY ("qu_id")
);

-- CreateTable
CREATE TABLE "answer" (
    "a_id" SERIAL NOT NULL,
    "q_id" INTEGER NOT NULL,
    "value" TEXT,
    "empty" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("a_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_link_key" ON "questionnaire"("link");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_t_id_fkey" FOREIGN KEY ("t_id") REFERENCES "template"("t_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_c_id_fkey" FOREIGN KEY ("c_id") REFERENCES "customer"("c_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_q_id_fkey" FOREIGN KEY ("q_id") REFERENCES "question"("q_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
