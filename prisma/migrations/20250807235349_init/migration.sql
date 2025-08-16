-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "companySize" TEXT,
    "phone" TEXT,
    "productInterest" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "partnerOptIn" BOOLEAN NOT NULL DEFAULT false,
    "leadScore" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "finalScore" INTEGER NOT NULL DEFAULT 0,
    "prizeLevel" TEXT,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "lifelinesUsed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "eventId" TEXT,
    CONSTRAINT "Game_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "timeSpent" INTEGER,
    "difficulty" TEXT NOT NULL,
    "category" TEXT,
    "lifelineUsed" TEXT,
    "answeredAt" DATETIME,
    CONSTRAINT "GameQuestion_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'openai',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "correctRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "eventId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT,
    "code" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prize_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "settings" JSONB,
    "prizeConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "type" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL,
    "gameTime" INTEGER,
    "date" DATETIME NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "Leaderboard_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_email_idx" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_createdAt_idx" ON "Player"("createdAt");

-- CreateIndex
CREATE INDEX "Game_playerId_idx" ON "Game"("playerId");

-- CreateIndex
CREATE INDEX "Game_startedAt_idx" ON "Game"("startedAt");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_eventId_idx" ON "Game"("eventId");

-- CreateIndex
CREATE INDEX "GameQuestion_gameId_idx" ON "GameQuestion"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameQuestion_gameId_questionNumber_key" ON "GameQuestion"("gameId", "questionNumber");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_code_key" ON "Prize"("code");

-- CreateIndex
CREATE INDEX "Prize_playerId_idx" ON "Prize"("playerId");

-- CreateIndex
CREATE INDEX "Prize_eventId_idx" ON "Prize"("eventId");

-- CreateIndex
CREATE INDEX "Prize_claimed_idx" ON "Prize"("claimed");

-- CreateIndex
CREATE INDEX "Event_isActive_idx" ON "Event"("isActive");

-- CreateIndex
CREATE INDEX "Event_startDate_endDate_idx" ON "Event"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Leaderboard_eventId_idx" ON "Leaderboard"("eventId");

-- CreateIndex
CREATE INDEX "Leaderboard_type_idx" ON "Leaderboard"("type");

-- CreateIndex
CREATE INDEX "Leaderboard_date_idx" ON "Leaderboard"("date");

-- CreateIndex
CREATE INDEX "Leaderboard_score_idx" ON "Leaderboard"("score");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_category_idx" ON "SystemLog"("category");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");
