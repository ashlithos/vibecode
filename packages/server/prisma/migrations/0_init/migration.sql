-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "loadType" TEXT NOT NULL,
    "loadIncrement" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "defaultSets" INTEGER NOT NULL DEFAULT 3,
    "defaultRepsLow" INTEGER NOT NULL DEFAULT 8,
    "defaultRepsHigh" INTEGER NOT NULL DEFAULT 12,
    "machineIdentification" TEXT,
    "instructions" TEXT NOT NULL,
    "keyCues" TEXT NOT NULL,
    "commonMistakes" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaKind" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMuscle" (
    "exerciseId" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "ExerciseMuscle_pkey" PRIMARY KEY ("exerciseId","muscle")
);

-- CreateTable
CREATE TABLE "ExercisePattern" (
    "exerciseId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,

    CONSTRAINT "ExercisePattern_pkey" PRIMARY KEY ("exerciseId","pattern")
);

-- CreateTable
CREATE TABLE "ExerciseAlternative" (
    "exerciseId" TEXT NOT NULL,
    "alternativeId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseAlternative_pkey" PRIMARY KEY ("exerciseId","alternativeId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'build muscle, reduce body fat',
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "defaultSessionMinutes" INTEGER NOT NULL DEFAULT 45,
    "unit" TEXT NOT NULL DEFAULT 'lb',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "EquipmentAvailability" (
    "userId" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EquipmentAvailability_pkey" PRIMARY KEY ("userId","equipment")
);

-- CreateTable
CREATE TABLE "ExercisePreference" (
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'neutral',
    "skipUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExercisePreference_pkey" PRIMARY KEY ("userId","exerciseId")
);

-- CreateTable
CREATE TABLE "RecoveryReport" (
    "userId" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "RecoveryReport_pkey" PRIMARY KEY ("userId","date","muscle")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "targetMinutes" INTEGER NOT NULL DEFAULT 45,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetRepsLow" INTEGER NOT NULL,
    "targetRepsHigh" INTEGER NOT NULL,
    "suggestedLoad" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rationale" TEXT,
    "swappedFromId" TEXT,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "setIndex" INTEGER NOT NULL,
    "load" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT 'lb',
    "reps" INTEGER NOT NULL,
    "rir" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_bodyRegion_idx" ON "Exercise"("bodyRegion");

-- CreateIndex
CREATE INDEX "Exercise_equipment_idx" ON "Exercise"("equipment");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_muscle_idx" ON "ExerciseMuscle"("muscle");

-- CreateIndex
CREATE INDEX "ExercisePattern_pattern_idx" ON "ExercisePattern"("pattern");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ExercisePreference_status_idx" ON "ExercisePreference"("status");

-- CreateIndex
CREATE INDEX "Workout_userId_date_idx" ON "Workout"("userId", "date");

-- CreateIndex
CREATE INDEX "Workout_status_idx" ON "Workout"("status");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutId_order_idx" ON "WorkoutExercise"("workoutId", "order");

-- CreateIndex
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "SetLog_completedAt_idx" ON "SetLog"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SetLog_workoutExerciseId_setIndex_key" ON "SetLog"("workoutExerciseId", "setIndex");

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePattern" ADD CONSTRAINT "ExercisePattern_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAlternative" ADD CONSTRAINT "ExerciseAlternative_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAlternative" ADD CONSTRAINT "ExerciseAlternative_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAvailability" ADD CONSTRAINT "EquipmentAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePreference" ADD CONSTRAINT "ExercisePreference_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePreference" ADD CONSTRAINT "ExercisePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryReport" ADD CONSTRAINT "RecoveryReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
