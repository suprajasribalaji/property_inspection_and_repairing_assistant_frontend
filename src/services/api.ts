import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ── JWT Interceptor ───────────────────────────────────────
// Automatically attaches token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ── Auth Types ────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// ── Auth Functions ────────────────────────────────────────
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Backend uses OAuth2PasswordRequestForm — needs form data, not JSON
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2 uses "username" field
  formData.append("password", password);

  const response = await api.post<AuthResponse>("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await api.get<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
  return response.data.exists;
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  const response = await api.get<{ exists: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
  return response.data.exists;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/";
};


export interface InspectionItem {
  question: string;
  answer: string;
}

export interface InspectionStorageInfo {
  storage_path: string;
  download_url: string;
  content_type: string;
}

export interface InspectResponse {
  results: InspectionItem[];
  storage: InspectionStorageInfo | null;
}

export interface BackendResponse {
  session_id: string;
  question_answers: Array<{ question: string; answer: string }>;
  storage: InspectionStorageInfo | null;
}

export interface ChatResponse {
  answer: string;
}

export interface Session {
  id: string;
  created_at: string;
}

export interface SessionHistory {
  session: Session;
  images: Array<{
    id: string;
    session_id: string;
    image_url: string;
    uploaded_at: string;
  }>;
  inspection_results: Array<{
    id: string;
    session_id: string;
    image_id: string;
    results: {
      question_answers: InspectionItem[];
      raw_analysis: string;
    };
    created_at: string;
  }>;
  conversations: Array<{
    id: string;
    session_id: string;
    role: string;
    message: string;
    created_at: string;
  }>;
}


export const createSession = async (): Promise<Session> => {
  const response = await api.post<Session>("/api/sessions");
  return response.data;
};

export const getSessionHistory = async (sessionId: string): Promise<SessionHistory> => {
  const response = await api.get<SessionHistory>(`/api/sessions/${sessionId}`);
  return response.data;
};

export const getLatestSessionByDateHour = async (): Promise<Session | null> => {
  try {
    const response = await api.get<Session>("/api/sessions/latest");
    return response.data;
  } catch {
    return null;
  }
};

export const getLatestSessionWithResults = async (): Promise<Session | null> => {
  try {
    const response = await api.get<Session>("/api/sessions/latest-with-results");
    return response.data;
  } catch {
    return null;
  }
};

export const getAllSessions = async (): Promise<{ sessions: Session[] }> => {
  const response = await api.get<{ sessions: Session[] }>("/api/sessions");
  return response.data;
};

export const inspectImage = async (
  images: File[],                                    // ← array
  sessionId?: string
): Promise<InspectResponse & { session_id: string }> => {
  const formData = new FormData();
  images.forEach((image) => formData.append("files", image));  // ← append each
  if (sessionId) formData.append("session_id", sessionId);

  const response = await api.post<BackendResponse>("/api/inspect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const answersData: InspectionItem[] =
    Array.isArray(response.data.question_answers)
      ? response.data.question_answers
      : [];

  return {
    results: answersData,
    storage: response.data.storage ?? null,
    session_id: response.data.session_id,
  };
};
export const sendChatMessage = async (question: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/chat", { question });
  return response.data;
};

export default api;
