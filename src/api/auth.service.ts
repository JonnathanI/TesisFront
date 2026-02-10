// src/api/auth.service.ts
// src/api/auth.service.ts

import {
  UserRole,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Course,
  UnitData,
  UnitWithLessons,
  UserProgress,
  LessonProgressDTO,
  QuestionDTO,
  AnswerSubmissionDTO,
  AnswerResultDTO,
  UserProfileData,
  DetailedStudentProgress,
  StudentData,
  QuestionData,
  Lesson,
  ClassroomData,
  AssignmentData,
  LessonData,
  NewUnitPayload,
  NewLessonPayload,
  NewQuestionPayload,
  LeaderboardEntry,
  BulkUserItem,
  BulkRegisterResponse,
  QuestionType,
  UserChallengesDTO,
  EvaluationRequest,
  EvaluationAssignment,
  EvaluationQuestion,
  PendingEvaluationDTO,
  StudentEvaluation,
  BulkRegisterRequest,
  CreateCoursePayload,
  ChatMessage,
} from "./auth.types";

// --- CONFIGURACIÓN BASE ---
const BASE_URL = 'http://localhost:8081/api';
// Cambia esto por tu IP real
//const BASE_URL = "http://192.168.20.207:8081/api";
//const BASE_URL = 'https://rex-unantagonised-tommy.ngrok-free.dev/api';

// ==========================================
// 1. INTERFACES DE DATOS (DTOs)
// ==========================================



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
export const apiFetch = async (
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

  // 🚨 CORRECCIÓN: Solo poner JSON si NO es FormData
  if ((options.method === 'POST' || options.method === 'PUT') && !(options.body instanceof FormData)) {
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

export const getTeacherCourses = async (): Promise<any[]> => {
  const response = await apiFetch("/teacher/content/courses", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Error al cargar cursos del profesor");
  }

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
    const response = await apiFetch('/teacher/content/students', { method: 'GET' });
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

export const createQuestion = async (formData: FormData): Promise<QuestionData> => {
    const response = await apiFetch('/teacher/content/questions', {
        method: 'POST',
        body: formData, // Enviamos el FormData directamente
    });
    return response.json();
};
export const updateQuestion = async (
  id: string,
  formData: FormData
): Promise<QuestionData> => {
  const response = await apiFetch(`/teacher/content/questions/${id}`, {
    method: "PUT",
    body: formData, // 👈 IMPORTANTE: FormData, sin JSON.stringify
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    console.error("Error al actualizar pregunta:", response.status, txt);
    throw new Error("No se pudo actualizar la pregunta");
  }

  return response.json();
};


export const deleteQuestion = async (questionId: string): Promise<void> => {
    await apiFetch(`/teacher/content/questions/${questionId}`, {
        method: 'DELETE',
    });
};

// --- GRUPOS DEL PROFESOR ---
/*export const getTeacherClassrooms = async (): Promise<ClassroomData[]> => {
  const response = await apiFetch('/teacher/classrooms', { method: 'GET' });
  return response.json();
};*/

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



// Antes apuntaba a /teacher/content/courses
export const createCourse = async (
  payload: CreateCoursePayload
): Promise<any> => {
  const response = await apiFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Error al crear curso:', response.status, errorText);
    throw new Error('No se pudo crear el curso');
  }

  return response.json();
};


export const createCourseAsTeacher = async (
  payload: CreateCoursePayload
): Promise<any> => {
  const response = await apiFetch("/teacher/content/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    console.error("Error creando curso como profesor:", response.status, txt);
    throw new Error("No se pudo crear el curso del profesor");
  }

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

export const createFullEvaluation = async (payload: EvaluationRequest): Promise<any> => {
  const response = await apiFetch('/teacher/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Error al crear la evaluación");
  return response.json();
};

export const getAllEvaluations = async (): Promise<any[]> => {
  const response = await apiFetch('/teacher/evaluations', {
    method: 'GET'
  });
  return response.json();
};

// Reemplaza las funciones duplicadas al final de tu auth.service.ts con estas:

export const getTeacherEvaluations = async (): Promise<any[]> => {
  const response = await apiFetch('/teacher/evaluations', { method: 'GET' });
  if (!response.ok) throw new Error('Error al obtener evaluaciones');
  return response.json();
};

export const getTeacherClassrooms = async (): Promise<ClassroomData[]> => {
  const response = await apiFetch('/teacher/classrooms', { method: 'GET' });
  if (!response.ok) throw new Error('Error al obtener aulas');
  return response.json();
};

export const assignEvaluationToClassroom = async (evaluationId: string, classroomId: string): Promise<string> => {
  const response = await apiFetch(`/teacher/evaluations/${evaluationId}/assign/${classroomId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Error en la asignación');
  return response.text(); 
};

export const assignEvaluationToStudent = async (evaluationId: string, studentId: string): Promise<string> => {
    const response = await apiFetch(`/teacher/evaluations/${evaluationId}/assign-student/${studentId}`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Error en la asignación individual');
    return response.text(); 
};

// --- EVALUACIONES (ALUMNO) ---

// Obtener los detalles de una asignación específica para empezar el examen
// IMPORTANTE: Cambié el nombre de getEvaluationAssignment a getEvaluationDetails para que coincida con el componente
export const getEvaluationDetails = async (
  assignmentId: string
): Promise<StudentEvaluation> => {
  const response = await apiFetch(
    `/student/evaluations/assignment/${assignmentId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar la evaluación");
  }

  return response.json();
};



// Guardar el resultado final del examen
// Adaptamos para recibir un objeto con 'score' o 'status' según necesites
// DESPUÉS: leemos texto en vez de JSON
// Guardar el resultado final del examen
export const submitEvaluationResult = async (
  assignmentId: string,
  payload: { score?: number; status: string }
): Promise<string> => {
  const response = await apiFetch(
    `/student/evaluations/assign/${assignmentId}/complete`, // 👈 OJO: "assign", no "assignment"
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Error al enviar resultados");
  }

  // El backend devuelve un String: "Evaluación completada y respuestas guardadas"
  const text = await response.text();
  return text;
};




// Obtener evaluaciones pendientes del alumno
// En src/api/auth.service.ts
export const getStudentPendingEvaluations = async (
  studentId: string
): Promise<PendingEvaluationDTO[]> => {
  const response = await apiFetch(
    `/student/evaluations/pending?studentId=${studentId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error("Error al obtener evaluaciones pendientes");
  }

  return response.json();
};

// Todas (pendientes + completadas)
export const getStudentAllEvaluations = async (
  studentId: string
): Promise<PendingEvaluationDTO[]> => {
  const response = await apiFetch(
    `/student/evaluations/all?studentId=${studentId}`,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("Error al obtener evaluaciones");
  }

  return response.json();
};


export const searchUsersByQuery = async (query: string) => {
  // Según tu UserController, el parámetro se llama 'query'
  const response = await apiFetch(`/users/search?query=${query}`, { 
    method: 'GET' 
  });
  if (!response.ok) return [];
  return response.json();
};

// 🔹 Subir archivo (audio / imagen) para evaluaciones
// 🔹 Subir archivo (audio / imagen) para evaluaciones
export async function uploadEvaluationFile(
  file: File,
  folder: string = "misc"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // 👇 Usamos apiFetch para que agregue BASE_URL (http://localhost:8081/api)
  const res = await apiFetch("/teacher/evaluations/upload", {
    method: "POST",
    body: formData, // NO se pone Content-Type a mano
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Error subiendo archivo:", res.status, text);
    throw new Error("Error al subir archivo");
  }

  // Tu endpoint devuelve solo la URL como texto plano
  const url = await res.text();
  return url;
}

export const getAllUsersAdmin = async (): Promise<StudentData[]> => {
    try {
        // CORRECCIÓN: La ruta debe ser /users/admin/all para coincidir con tu UserController.kt
        const response = await apiFetch('/users/admin/all', { method: 'GET' });
        
        if (!response.ok) {
            console.error("Error en respuesta admin/all:", response.status);
            return [];
        }

        const data = await response.json();
        
        // El backend de Kotlin envía List<UserEntity>, que llega como un Array directo [{}, {}]
        if (Array.isArray(data)) return data;
        
        // Fallback por si lo envuelve en un objeto
        if (data && Array.isArray(data.users)) return data.users;
        
        return [];
    } catch (error) {
        console.error("Error en API getAllUsersAdmin:", error);
        return [];
    }
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await apiFetch(`/users/admin/role/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",   // 👈 OBLIGATORIO
    },
    body: JSON.stringify({ role }),         // 👈 Body JSON con { role: "TEACHER" }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar rol");
  }

  return response.json();
};

export const assignCourseToTeacher = async (courseId: string, teacherId: string) => {
  return apiFetch(`/courses/${courseId}/assign-teacher/${teacherId}`, {
    method: "POST",
  });
};

export const assignCourseToStudent = async (courseId: string, studentId: string) => {
  return apiFetch(`/courses/${courseId}/assign-student/${studentId}`, {
    method: "POST",
  });
};

export async function updateUser(userId: string, data: any) {
  return apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }).then(res => res.json());
};

export async function updateUserStatus(userId: string, active: boolean) {
  return apiFetch(`/users/admin/status/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ active }), // 👈 debe llamarse igual que en el DTO
  }).then((res) => res.json());
}

export async function getChatMessages(friendId: string): Promise<ChatMessage[]> {
  // 👈 OJO: sin /api porque BASE_URL ya lo trae
  const res = await apiFetch(`/chat/${friendId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Error al cargar mensajes de chat");
  }

  const data = await res.json();
  return data as ChatMessage[];
}

export async function sendChatMessage(
  friendId: string,
  content: string
): Promise<ChatMessage> {
  const res = await apiFetch(`/chat/${friendId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("Error al enviar mensaje");
  }

  const data = await res.json();
  return data as ChatMessage;
}

// auth.service.ts

export async function sendChatFile(
  friendId: string,
  file: File,
  content?: string
): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append("file", file);
  if (content && content.trim().length > 0) {
    formData.append("content", content.trim());
  }

  const res = await apiFetch(`/chat/${friendId}/file`, {
    method: "POST",
    body: formData, // apiFetch ya NO pone Content-Type si es FormData
  });

  if (!res.ok) {
    throw new Error("Error al enviar archivo");
  }

  const data = await res.json();
  return data as ChatMessage;
}

// 🔹 Unidades del profesor logueado
export const getTeacherUnits = async (): Promise<any[]> => {
  const res = await apiFetch("/teacher/content/units", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Error al cargar unidades del profesor");
  }

  return res.json();
};
