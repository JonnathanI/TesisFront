// src/api/auth.service.ts

// --- CONFIGURACIÓN BASE ---
//const BASE_URL = 'http://localhost:8081/api';
// Cambia esto por tu IP real
const BASE_URL = "http://192.168.20.195:8081/api";

// ==========================================
// 1. INTERFACES DE DATOS (DTOs)
// ==========================================

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type QuestionCategory = 
  | 'GRAMMAR' 
  | 'VOCABULARY' 
  | 'LISTENING'  // Estudiante escucha y escribe/selecciona
  | 'SPEAKING'   // Estudiante habla
  | 'WRITING' 
  | 'ORDERING' 
  | 'IMAGE_SELECT' // ✅ Nuevo: Seleccionar imagen correcta
  | 'MATCHING';    // ✅ Nuevo: Unir palabras

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
    username: string;
    password: string;
    fullName: string;
cedula: string;              // ✅ NUEVO
  registrationCode?: string;
    adminCode?: string; 
}

// --- CURSOS Y UNIDADES ---
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
/*
export interface UnitStatus {
  id: string;
  title: string;
  unitOrder: number;
  isLocked: boolean;
  isCompleted: boolean;
}*/

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
}
export interface QuestionDTO {
    id: string;
    questionText: string; 
    textSource: string;   
    textTarget: string;   // <--- Esta es tu respuesta correcta
    questionType: { typeName: string }; 
    options: string[]; 
    audioUrl?: string;    
    category: QuestionCategory; 
    feedback?: string;    // <--- Añade esta línea
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

export interface UserProfileData {
    fullName: string;
    username: string;
    joinedAt: string; 
    totalXp: number;
    currentStreak: number;
    lingots: number;
    heartsCount: number;
    league: string;
    avatarData?: string; 
}

// --- TEACHER / ADMIN ---

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
    audioUrl?: string;      // Nuevo campo
    category: QuestionCategory; // Nuevo campo
}
export interface Lesson {
  id: string;
  title: string;
  lessonOrder: number;
  requiredXp: number;
  isCompleted: boolean;
  unitId?: string; // 👈 opcional
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

// Payloads
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
    questionTypeId: string;
    textSource: string;
    textTarget: string;
    options: string[];
    audioUrl?: string;     // Nuevo campo
    category: string;      // Nuevo campo
}

export interface LeaderboardEntry {
    userId: string;
    fullName: string;
    xpTotal: number;
    position: number;
}

// --- TIPOS PARA REGISTRO MASIVO ---
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

// ==========================================
// 2. MANEJO DEL TOKEN JWT Y ROL (¡ÚNICA DEFINICIÓN!)
// ==========================================
const TOKEN_KEY = 'jwt-token';
const ROLE_KEY = 'user-role'; 

export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
};

export const getUserRole = (): string | null => { // <--- Definición Única
    return localStorage.getItem(ROLE_KEY);
};

// ==========================================
// 3. FUNCIÓN DE FETCH
// ==========================================
const apiFetch = async (
    endpoint: string,
    options: RequestInit = {},
    isAuthenticated: boolean = true
): Promise<Response> => {
    
    const headers = new Headers(options.headers);
    
    if (isAuthenticated) {
        const token = getToken();
        if (!token) {
            removeToken();
            throw new Error('No autorizado: Token JWT no encontrado.');
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
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
    }

    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
            const errorBody = await response.json();
            if (errorBody.message) errorMessage = errorBody.message;
        } catch (e) { /* Ignorar */ }
        throw new Error(errorMessage);
    }

    return response;
};


// ==========================================
// 4. MÉTODOS EXPORTADOS
// ==========================================

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.username, password: credentials.password }),
    }, false);
    
    const data: AuthResponse = await response.json();
    
    saveToken(data.token);
    localStorage.setItem(ROLE_KEY, data.role); 
    
    return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.username,
      password: credentials.password,
      fullName: credentials.fullName,
      cedula: credentials.cedula,                 // ✅
      registrationCode: credentials.registrationCode, // ✅
      adminCode: credentials.adminCode
    }),
  }, false);

  const data: AuthResponse = await response.json();
  saveToken(data.token);
  localStorage.setItem(ROLE_KEY, data.role);
  return data;
};


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

// --- UNIDADES Y CAMINO ---
export const getCourseStatus = async (courseId: string): Promise<UnitWithLessons[]> => {
  const response = await apiFetch(`/progress/course/${courseId}`, { method: 'GET' });
  return response.json();
};


export const getCourseUnits = async (courseId: string): Promise<UnitData[]> => {
    const response = await apiFetch(`/courses/${courseId}/units`, { method: 'GET' });
    return response.json();
};

export const getUnitProgress = async (unitId: string): Promise<LessonProgressDTO[]> => {
    const response = await apiFetch(`/progress/units/${unitId}`, { method: 'GET' });
    return response.json();
};

export const getLessonQuestions = async (lessonId: string): Promise<QuestionDTO[]> => {
    const response = await apiFetch(`/progress/lessons/${lessonId}/questions`, { method: 'GET' });
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

export const getUserProfile = async (): Promise<UserProfileData> => {
    const response = await apiFetch('/users/me', { method: 'GET' });
    return response.json();
};

export const updateUserAvatar = async (avatarData: any): Promise<void> => {
    await apiFetch('/users/me/avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarData: JSON.stringify(avatarData) }),
    });
};

// --- TEACHER (GESTIÓN DE CONTENIDO Y ESTUDIANTES) ---

export const getStudentList = async (): Promise<StudentData[]> => {
    const response = await apiFetch('/teacher/students', { method: 'GET' });
    return response.json();
};

export const getQuestionsByLesson = async (lessonId: string): Promise<QuestionData[]> => {
    const response = await apiFetch(`/teacher/content/lessons/${lessonId}/questions`, { method: 'GET' });
    return response.json();
};

export const getLessonsByUnit = async (unitId: string): Promise<LessonData[]> => {
    const response = await apiFetch(`/progress/units/${unitId}`, { method: 'GET' });
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      lessonOrder: item.lessonOrder
    }));
};

export const createUnit = async (payload: NewUnitPayload): Promise<any> => {
    const response = await apiFetch('/teacher/content/units', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return response.json();
};

// --- CRUD DE UNIDADES, LECCIONES Y PREGUNTAS ---

export const updateUnit = async (id: string, payload: any): Promise<any> => {
    const response = await apiFetch(`/teacher/content/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return response.json();
};

export const deleteUnit = async (id: string): Promise<void> => {
    await apiFetch(`/teacher/content/units/${id}`, {
        method: 'DELETE',
    });
};

export const createLesson = async (payload: NewLessonPayload): Promise<any> => {
    const response = await apiFetch('/teacher/content/lessons', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return response.json();
};

export const updateLesson = async (id: string, payload: any): Promise<any> => {
    const response = await apiFetch(`/teacher/content/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return response.json();
};

export const deleteLesson = async (id: string): Promise<void> => {
    await apiFetch(`/teacher/content/lessons/${id}`, {
        method: 'DELETE',
    });
};

export const createQuestion = async (payload: NewQuestionPayload): Promise<QuestionData> => {
    const response = await apiFetch('/teacher/content/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
console.log(payload);
    return response.json();
};

export const updateQuestion = async (id: string, payload: any): Promise<QuestionData> => {
    const response = await apiFetch(`/teacher/content/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return response.json();
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
    await apiFetch(`/teacher/content/questions/${questionId}`, {
        method: 'DELETE',
    });
};

// --- GRUPOS DEL PROFESOR ---
export const getTeacherClassrooms = async (): Promise<ClassroomData[]> => {
  const response = await apiFetch('/teacher/classrooms', { method: 'GET' });
  return response.json();
};

export const createClassroom = async (name: string): Promise<ClassroomData> => {
  const response = await apiFetch('/teacher/classrooms', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return response.json();
};

export const deleteClassroom = async (id: string): Promise<void> => {
  await apiFetch(`/teacher/classrooms/${id}`, { method: 'DELETE' });
};

// --- DETALLES DE GRUPO ---
export const getClassroomDetails = async (classId: string): Promise<any> => {
  const response = await apiFetch(`/teacher/classrooms/${classId}`, { method: 'GET' });
  return response.json();
};

export const addStudentToClassroom = async (classId: string, email: string): Promise<void> => {
  await apiFetch(`/teacher/classrooms/${classId}/students`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const createAssignment = async (classId: string, payload: any): Promise<AssignmentData> => {
  const response = await apiFetch(`/teacher/classrooms/${classId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const getClassroomAssignments = async (classId: string): Promise<AssignmentData[]> => {
  const response = await apiFetch(`/teacher/classrooms/${classId}/assignments`, { method: 'GET' });
  return response.json();
};

// --- ALUMNO (UNIRSE A GRUPO) ---
export const joinClassroom = async (code: string): Promise<void> => {
  await apiFetch('/student/classrooms/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
};

export const getStudentClassrooms = async (): Promise<any[]> => {
    const response = await apiFetch('/student/classrooms', { method: 'GET' });
    return response.json();
};

export const getStudentClassroomDetails = async (classId: string): Promise<any> => {
    const response = await apiFetch(`/student/classrooms/${classId}`, { method: 'GET' });
    return response.json();
};

// Obtener ranking del grupo
export const getClassroomLeaderboard = async (classId: string): Promise<LeaderboardEntry[]> => {
    const response = await apiFetch(`/student/classrooms/${classId}/leaderboard`, { method: 'GET' });
    return response.json();
};

export const getGlobalLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const response = await apiFetch('/users/leaderboard/global', { method: 'GET' });
    return response.json();
};

// Función para comprar ítems en la tienda
export const buyShopItem = async (itemType: string): Promise<void> => {
    await apiFetch('/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemType }),
    });
};

// --- FUNCIÓN DE EXPORTACIÓN ---
export const registerBulk = async (data: { students: BulkUserItem[] }): Promise<BulkRegisterResponse> => {
    const response = await apiFetch('/auth/register-bulk', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export interface CreateCoursePayload {
  title: string;
  targetLanguage: string;
  baseLanguage: string;
}

export const createCourse = async (
  payload: CreateCoursePayload
): Promise<any> => {
  const response = await apiFetch('/teacher/content/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
};



const TeacherAPI = {
  getCourses: () => apiFetch('/courses'),
};
export const generateTeacherRegistrationCode = async (): Promise<string> => {
  const response = await apiFetch('/teacher/generate-code', {
    method: 'POST',
  });

  const data = await response.json();
  return data.code;
};
// --- RECUPERACIÓN DE CONTRASEÑA ---

export const forgotPassword = async (email: string): Promise<any> => {
    // Nota: Tu controlador mapea a /api/auth/password/forgot
    const response = await apiFetch('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }, false); // false porque no requiere estar logueado
    return response.json();
};

export const resetPasswordConfirm = async (token: string, newPassword: string): Promise<any> => {
    const response = await apiFetch('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    }, false);
    return response.json();
};