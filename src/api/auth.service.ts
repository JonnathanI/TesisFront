// src/api/auth.service.ts

// --- CONFIGURACIÓN BASE ---
const BASE_URL = 'http://localhost:8081/api';
// Cambia esto por tu IP real
//const BASE_URL = "http://192.168.20.207:8081/api";
//const BASE_URL = 'https://rex-unantagonised-tommy.ngrok-free.dev/api';

// ==========================================
// 1. INTERFACES DE DATOS (DTOs)
// ==========================================

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

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
   // username: string;
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
  options: string[];
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
export interface DetailedStudentProgress {
    fullName: String;
    username: string;
    avatarData: string | null;
    totalXp: number;
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
  audioUrl?: string;
  questionType: {
    id: string;
    typeName: string;
  };
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
  questionTypeId: string; // UUID
  textSource: string;
  textTarget?: string;
  options: string[];
  audioUrl?: string;
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

export interface QuestionType {
  id: string;
  typeName: string;
  description?: string;
}

// --- AGREGAR A LAS INTERFACES DE DATOS (Sección 1) ---
export interface UserChallengesDTO {
    dailyExpProgress: number;
    dailyExpGoal: number;
    minutesLearned: number;
    minutesGoal: number;
    perfectLessonsCount: number;
    perfectLessonsGoal: number;
    challengesCompleted: number;
}

// --- PROGRESO DETALLADO ACTUALIZADO ---
export interface DetailedStudentProgress {
  currentStreak: number; // 🔥 Agregado para solucionar error TS2339
  xpTotal: number;       // ⚡ Agregado para mostrar en el perfil
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

export const getUserRole = (): string | null => { 
    return localStorage.getItem(ROLE_KEY);
};

// ==========================================
// 3. FUNCIÓN DE FETCH (CORREGIDA: AHORA EXPORTADA)
// ==========================================
export const apiFetch = async ( // ✅ Añadido 'export' aquí
  endpoint: string,
  options: RequestInit = {},
  isAuthenticated: boolean = true
): Promise<Response> => {
  const headers = new Headers(options.headers);
  headers.set('ngrok-skip-browser-warning', 'true');

  if (isAuthenticated) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.method === 'POST' || options.method === 'PUT') {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

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
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Credenciales inválidas");
    }

    const data: AuthResponse = await response.json();
    saveToken(data.token);
    localStorage.setItem(ROLE_KEY, data.role); 
    
    return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      fullName: credentials.fullName,
      cedula: credentials.cedula,
      registrationCode: credentials.registrationCode,
      adminCode: credentials.adminCode || null
    }),
  }, false);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error del Backend:", errorData);
    throw new Error(errorData.message || "Error 400: Datos inválidos");
  }

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

// ✅ FUNCIÓN CORREGIDA
export const completeLesson = async (
  lessonId: string, 
  correctAnswers: number, 
  mistakesCount: number // <--- Agregamos este parámetro
): Promise<any> => {
    // Enviamos ambos valores en la Query String
    const response = await apiFetch(
      `/progress/lessons/${lessonId}/complete?correct=${correctAnswers}&mistakes=${mistakesCount}`, 
      {
        method: 'POST',
      }
    );
    return response.json();
};

export const getUserProfile = async (): Promise<UserProfileData> => {
    const response = await apiFetch('/users/me', { method: 'GET' });
    
    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
        }
        const errorText = await response.text();
        throw new Error(errorText || "Error al obtener perfil");
    }
    
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
export const createUnit = async (
  payload: NewUnitPayload
): Promise<any> => {
  const response = await apiFetch("/teacher/content/units", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.json();
};


// --- CRUD DE UNIDADES, LECCIONES Y PREGUNTAS ---

export const updateUnit = async (
  id: string,
  payload: { title: string; unitOrder: number }
) => {
  const res = await apiFetch(`/teacher/content/units/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteUnit = async (id: string) => {
  await apiFetch(`/teacher/content/units/${id}`, {
    method: "DELETE",
  });
};
export const getAllUnits = async (): Promise<any[]> => {
  const response = await apiFetch("/teacher/content/units", {
    method: "GET",
  });
  return response.json();
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
  const response = await apiFetch('/shop/buy', {
    method: 'POST',
    body: JSON.stringify({ itemType }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `Error ${response.status}: No se pudo completar la compra`;
    throw new Error(errorMessage);
  }
};

// --- MODIFICA ESTA INTERFAZ ---
export interface BulkRegisterRequest {
    users: BulkUserItem[];      // Coincide con tu lista en Kotlin
    registrationCode: string;     // Añadido para que TS no dé error
    roleToAssign: UserRole;       // Añadido para enviar el rol dinámico
}

// --- MODIFICA ESTA FUNCIÓN ---
export const registerBulk = async (data: BulkRegisterRequest): Promise<BulkRegisterResponse> => {
    const response = await apiFetch('/auth/register-bulk', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error en la carga masiva");
    }
    
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
  // Cambiamos la ruta para que coincida exactamente con @PostMapping("/admin/generate-teacher-code")
  // Recuerda que apiFetch ya le pone el prefijo /auth si tu controlador tiene @RequestMapping("/api/auth")
  const response = await apiFetch('/auth/admin/generate-teacher-code', { 
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al generar código de profesor");
  }

  const data = await response.json();
  return data.code; // Retorna el string "PROF-XXXXXX"
};
// --- RECUPERACIÓN DE CONTRASEÑA ---

export const forgotPassword = async (email: string): Promise<any> => {
    const response = await apiFetch('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }, false); 
    return response.json();
};

export const resetPasswordConfirm = async (token: string, newPassword: string): Promise<any> => {
    const response = await apiFetch('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    }, false);
    return response.json();
};

export const updateCourse = async (
  id: string,
  payload: any
): Promise<any> => {
  const response = await apiFetch(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.json();
};


export const deleteCourse = async (id: string): Promise<void> => {
  await apiFetch(`/courses/${id}`, {
    method: "DELETE",
  });
};


export const getQuestionTypes = async (): Promise<QuestionType[]> => {
  const response = await apiFetch("/question-types", {
    method: "GET",
  });
  return response.json();
};

// En api/auth.service.ts
export const subtractHeart = async (): Promise<UserProfileData> => {
  const response = await apiFetch('/users/me/subtract-heart', {
    method: 'POST',
  });
  if (!response.ok) throw new Error("Error al restar vida");
  return response.json();
};

export const getUserChallenges = async (): Promise<UserChallengesDTO> => {
    const response = await apiFetch('/users/me/challenges', { method: 'GET' });
    
    if (!response.ok) {
        throw new Error("No se pudieron cargar los desafíos diarios");
    }
    
    return response.json();
};

// BUSCA O AGREGA ESTA FUNCIÓN EN TU auth.service.ts
export const generateClassroomCode = async (): Promise<string> => {
  // 1. Apuntamos a /teacher/ (Ruta del Profesor), NO a /auth/admin/
  const response = await apiFetch('/teacher/generate-classroom-code', { 
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error("No se pudo generar el código de aula");
  }

  const data = await response.json();
  // Retornará el JSON { "code": "AULA-XXXXXX" }
  return data.code; 
};

// En auth.service.ts
export const getStudentDetailProgress = async (studentId: string): Promise<DetailedStudentProgress> => {
  const response = await apiFetch(`/users/friends/${studentId}/progress`, { 
    method: 'GET' 
  });

  if (!response.ok) throw new Error("Error al cargar");
  
  const data = await response.json();

  // Simplemente retornamos la data porque ya viene con el formato correcto desde Kotlin
  return {
    ...data,
    xpTotal: data.totalXp // Aseguramos compatibilidad si usas nombres distintos
  };
};
// Buscar usuarios para agregar
export const searchUsers = async (query: string): Promise<StudentData[]> => {
  const response = await apiFetch(`/users/search?query=${query}`, { method: 'GET' });
  return response.json();
};

// Enviar solicitud de amistad (Follow)
export const followUser = async (followedId: string): Promise<void> => {
  await apiFetch(`/users/${followedId}/follow`, { method: 'POST' });
};

// Obtener lista de amigos aceptados
export const getFriendsList = async (): Promise<StudentData[]> => {
  const response = await apiFetch('/users/friends', { method: 'GET' });
  return response.json();
};

// Obtener solicitudes pendientes
export const getPendingRequests = async (): Promise<StudentData[]> => {
  const response = await apiFetch('/users/friend-requests/pending', { method: 'GET' });
  return response.json();
};

// Aceptar solicitud
export const acceptFriendRequest = async (senderId: string): Promise<void> => {
  await apiFetch(`/users/friends/accept/${senderId}`, { method: 'POST' });
};

// Rechazar o eliminar solicitud (Opcional pero recomendado)
export const rejectFriendRequest = async (senderId: string): Promise<void> => {
  await apiFetch(`/users/friends/reject/${senderId}`, { method: 'DELETE' });
};