// (Copia y pega esto en tu archivo de conexión API)

// --- CONFIGURACIÓN BASE ---
const BASE_URL = 'http://localhost:8081/api';

// --- INTERFACES DE DATOS (AUTENTICACIÓN Y CURSOS) ---
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AuthResponse {
    token: string;
    userId: string;
    role: UserRole; 
    fullName: string;
}

interface LoginCredentials {
    username: string; // (email)
    password: string;
}

export interface RegisterCredentials {
    username: string; // (email)
    password: string;
    fullName: string;
    adminCode?: string; // <-- ¡AÑADIDO!
}

interface Course {
    id: number;
    title: string;
    description: string;
}

// ¡CORREGIDO! Añadida la interfaz UserProgress que faltaba
interface UserProgress {
    totalPoints: number;
    lastLessonId: number; 
    // ... otros detalles de progreso
}

export interface LessonProgressDTO {
    id: string; 
    title: string;
    lessonOrder: number;
    requiredXp: number;
    isCompleted: boolean;
    masteryLevel: number;
    lastPracticed: string | null; 
}
export interface QuestionDTO {
    id: string;
    questionText: string;
    questionType: { typeName: string }; 
    options: string[]; 
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
export interface StudentData {
  id: string;
  fullName: string;
  xpTotal: number;
  currentStreak: number;
}

// --- ¡NUEVAS INTERFACES AÑADIDAS PARA EL TEACHER DASHBOARD! ---
// (Esto soluciona los errores 4 y 5)
// Coincide con QuestionEntity.kt
export interface QuestionData {
  id: string;
  textSource: string;
  textTarget: string | null;
  options: string[];
}

// Coincide con QuestionRequest.kt
export interface NewQuestionPayload {
  lessonId: string;
  questionTypeId: string;
  textSource: string;
  textTarget: string;
  options: string[];
}
// --- ---

// --- MANEJO DEL TOKEN JWT ---
const TOKEN_KEY = 'jwt-token';

export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// --- FUNCIÓN DE FETCH AUTENTICADA ---
const apiFetch = async (
    endpoint: string,
    options: RequestInit = {},
    isAuthenticated: boolean = true
): Promise<Response> => {
    // ... (Tu función apiFetch está perfecta, no necesita cambios)
    const headers = new Headers(options.headers);
    if (isAuthenticated) {
        const token = getToken();
        if (!token) {
            removeToken(); 
            throw new Error('No autorizado: Token JWT no encontrado o sesión expirada.');
        }
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (options.method === 'POST' || options.method === 'PUT') {
        headers.set('Content-Type', 'application/json');
    }
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        removeToken();
        throw new Error('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.');
    }
    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
            const errorBody = await response.json();
            if (errorBody.message) {
                errorMessage = errorBody.message;
            }
        } catch (e) { /* Ignorar */ }
        throw new Error(errorMessage);
    }
    return response;
};

// --- MÉTODOS PÚBLICOS (AUTENTICACIÓN) ---
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.username, password: credentials.password }),
    }, false); 
    const data: AuthResponse = await response.json(); 
    saveToken(data.token);
    return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
            email: credentials.username, 
            password: credentials.password, 
            fullName: credentials.fullName,
            adminCode: credentials.adminCode 
        }),
    }, false);
    
    const data: AuthResponse = await response.json();
    saveToken(data.token);
    return data;
};

// --- MÉTODOS DE CURSOS Y PROGRESO ---
export const getCourses = async (): Promise<Course[]> => {
    const response = await apiFetch('/courses', { method: 'GET' }, false); 
    return response.json();
};

export const getUserProgress = async (): Promise<UserProgress> => {
    const response = await apiFetch('/progress/me', { method: 'GET' }); 
    return response.json();
};

export const purchaseItem = async (itemId: number): Promise<void> => {
    await apiFetch(`/shop/purchase/${itemId}`, { method: 'POST' }); 
};

export const getUnitProgress = async (unitId: string): Promise<LessonProgressDTO[]> => {
  const response = await apiFetch(`/progress/units/${unitId}`, {
    method: 'GET',
  });
  return response.json();
};

export const getLessonQuestions = async (lessonId: string): Promise<QuestionDTO[]> => {
  const response = await apiFetch(`/progress/lessons/${lessonId}/questions`, {
    method: 'GET',
  });
  return response.json();
};

export const submitAnswer = async (submission: AnswerSubmissionDTO): Promise<AnswerResultDTO> => {
  const response = await apiFetch('/progress/submit', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
  return response.json();
};

export const completeLesson = async (lessonId: string, correctAnswers: number): Promise<any> => {
  const response = await apiFetch(`/progress/lessons/${lessonId}/complete?correct=${correctAnswers}`, {
    method: 'POST',
  });
  return response.json();
};

export const getStudentList = async (): Promise<StudentData[]> => {
  const response = await apiFetch('/teacher/students', {
    method: 'GET',
  });
  return response.json();
};

// --- ¡NUEVAS FUNCIONES AÑADIDAS PARA EL TEACHER DASHBOARD! ---
// (Esto soluciona los errores 1, 2 y 3)

/**
 * Obtiene todas las preguntas de una lección específica (vista de profesor).
 */
export const getQuestionsByLesson = async (lessonId: string): Promise<QuestionData[]> => {
  const response = await apiFetch(`/teacher/content/lessons/${lessonId}/questions`, {
    method: 'GET',
  });
  return response.json();
};

/**
 * Crea una nueva pregunta.
 */
export const createQuestion = async (payload: NewQuestionPayload): Promise<QuestionData> => {
  const response = await apiFetch('/teacher/content/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * Elimina una pregunta por su ID.
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  await apiFetch(`/teacher/content/questions/${questionId}`, {
    method: 'DELETE',
  });
};

export interface UserProfileData {
  fullName: string;
  username: string;
  joinedAt: string; // ISO Date
  totalXp: number;
  currentStreak: number;
  lingots: number;
  league: string;
  avatarData?: string;
}

// Función para obtener el perfil
export const getUserProfile = async (): Promise<UserProfileData> => {
  const response = await apiFetch('/users/me', {
    method: 'GET',
  });
  return response.json();
};

// Nueva función
export const updateUserAvatar = async (avatarData: any): Promise<void> => {
  await apiFetch('/users/me/avatar', {
    method: 'POST',
    body: JSON.stringify({ avatarData: JSON.stringify(avatarData) }), // Enviamos como string
  });
};