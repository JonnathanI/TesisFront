// src/api/auth.types.ts

// --- ROLES Y AUTH BÁSICO ---
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthResponse {
  token: string;
  userId: string;
  role: UserRole;
  fullName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  cedula: string; // ✅ NUEVO
  registrationCode?: string;
  adminCode?: string;
}

// --- CURSOS / UNIDADES / LECCIONES ---
export interface Course {
  id: number;
  title: string;
  description: string;
}

export interface UnitData {
  id: string;
  title: string;
  unitOrder: number;
  description?: string;
}

export interface Lesson {
  id: string;
  title: string;
  lessonOrder: number;
  requiredXp: number;
  isCompleted: boolean;
  unitId?: string;
}

export interface UnitWithLessons {
  id: string;
  title: string;
  unitOrder: number;
  isLocked: boolean;
  isCompleted: boolean;
  lessons: Lesson[];
}

// --- PROGRESO ---
export interface UserProgress {
  totalPoints: number;
  lastLessonId: number;
}

export interface LessonProgressDTO {
  id: string;
  title: string;
  lessonOrder: number;
  requiredXp: number;
  isCompleted: boolean;
  masteryLevel: number;
  lastPracticed: string | null;
  xpEarned: number;
}

export interface QuestionDTO {
  id: string;
  textSource: string;
  textTarget: string;
  questionType: {
    id: string;
    typeName: string;
  };
  options: any[];
  audioUrl?: string;
  feedback?: string;
}

export interface AnswerSubmissionDTO {
  questionId: string;
  userAnswer: string;
}

export interface AnswerResultDTO {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

// --- PERFIL USUARIO ---
export interface UserProfileData {
  userId?: string;
  fullName: string;
  username: string;
  joinedAt: string;
  totalXp: number;
  currentStreak: number;
  lingots: number;
  heartsCount: number;
  nextHeartRegenTime: string | null;
  league: string;
  avatarData?: string;
}

// Versión consolidada (tenías 2 declaraciones distintas)
export interface DetailedStudentProgress {
  fullName?: string;
  username?: string;
  avatarData?: string | null;
  totalXp?: number;
  xpTotal: number;
  currentStreak: number;
  units: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      isCompleted: boolean;
      mistakesCount: number;
      correctAnswers: number;
      lastPracticed: string | null;
      xpEarned: number;
    }[];
  }[];
}

// --- TEACHER / ADMIN / STUDENTS ---
export interface StudentData {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
  xpTotal: number;
  currentStreak: number;
  isActive: boolean;
}

export interface QuestionData {
  id: string;
  textSource: string;
  textTarget: string | null;
  options: string[];
  audioUrl?: string;
  active?: boolean;
  questionType: {
    id: string;
    typeName: string;
  };
}

export interface ClassroomData {
  id: string;
  name: string;
  code: string;
}

export interface AssignmentData {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  dueDate?: string;
}

export interface LessonData {
  id: string;
  title: string;
  lessonOrder: number;
}

// --- PAYLOADS DE CREACIÓN ---
export interface NewUnitPayload {
  courseId: string;
  title: string;
  unitOrder: number;
}

export interface NewLessonPayload {
  unitId: string;
  title: string;
  lessonOrder: number;
  requiredXp: number;
}

export interface NewQuestionPayload {
  lessonId: string;
  questionTypeId: string; // UUID
  textSource: string;
  textTarget?: string;
  options: string[];
  audioUrl?: string;
  active?: boolean;
}

export interface CreateCoursePayload {
  title: string;
  targetLanguage: string;
  baseLanguage: string;
}

// --- LEADERBOARD ---
export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  xpTotal: number;
  position: number;
}

// --- REGISTRO MASIVO ---
export interface BulkUserItem {
  fullName: string;
  email: string;
  password?: string;
}

export interface BulkRegisterResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: { email: string; message: string }[];
}

export interface BulkRegisterRequest {
  users: BulkUserItem[];
  registrationCode: string;
  roleToAssign: UserRole;
}

// --- TIPOS EXTRA ---
export interface QuestionType {
  id: string;
  typeName: string;
  description?: string;
}

export interface UserChallengesDTO {
  dailyExpProgress: number;
  dailyExpGoal: number;
  minutesLearned: number;
  minutesGoal: number;
  perfectLessonsCount: number;
  perfectLessonsGoal: number;
  challengesCompleted: number;
}

// --- EVALUACIONES ---
export interface EvaluationRequest {
  title: string;
  description?: string;
  questions: {
    textSource: string;
    textTarget?: string;
    questionTypeId: string;
    options: string[];
  }[];
}

export interface EvaluationQuestion {
  id: string;
  textSource: string;
  textTarget: string;
  options: string[];
  questionType: {
    id: string;
    typeName: string;
  };
}

export interface EvaluationAssignment {
  id: string;
  evaluation: {
    id: string;
    title: string;
    description: string;
    questions: EvaluationQuestion[];
  };
  dueDate: string;
  completed: boolean;
  score?: number;
}

export interface PendingEvaluationDTO {
  assignmentId: string;
  evaluationId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  score: number | null;
}

export interface StudentEvaluation {
  id: string;
  title: string;
  description: string;
  questions: EvaluationQuestion[];
}

export interface BulkRegisterRequest {
    users: BulkUserItem[];      // Coincide con tu lista en Kotlin
    registrationCode: string;     // Añadido para que TS no dé error
    roleToAssign: UserRole;       // Añadido para enviar el rol dinámico
}

export interface CreateCoursePayload {
  title: string;
  targetLanguage: string;
  baseLanguage: string;
}

export interface StudentData {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
  xpTotal: number;
  currentStreak: number;
  isActive: boolean;
  cedula?: string;      // ✅ nueva
  role?: UserRole;      // ✅ nueva (STUDENT | TEACHER | ADMIN)
}