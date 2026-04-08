import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface InspectionItem {
  question: string;
  answer: string;
}

/** Present when the backend uploaded the inspection image to Firebase Storage */
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
  question_answers: Array<{
    question: string;
    answer: string;
  }>;
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

// Session management functions
export const createSession = async (): Promise<Session> => {
  try {
    const response = await api.post<Session>("/api/sessions");
    return response.data;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};

export const getSessionHistory = async (sessionId: string): Promise<SessionHistory> => {
  try {
    const response = await api.get<SessionHistory>(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get session history error:', error);
    throw error;
  }
};

export const getLatestSessionByDateHour = async (): Promise<Session | null> => {
  try {
    const response = await api.get<Session | { message: string }>("/api/sessions/latest");
    
    // Check if response is a session object or a message
    if ('message' in response.data) {
      // No session found
      return null;
    }
    
    // It's a session object
    return response.data;
  } catch (error) {
    console.error('Get latest session error:', error);
    return null; // Return null instead of throwing
  }
};

export const getLatestSessionWithResults = async (): Promise<Session | null> => {
  try {
    const response = await api.get<Session | { message: string }>("/api/sessions/latest-with-results");
    
    // Check if response is a session object or a message
    if ('message' in response.data) {
      // No session found
      return null;
    }
    
    // It's a session object
    return response.data;
  } catch (error) {
    console.error('Get latest session with results error:', error);
    return null; // Return null instead of throwing
  }
};

export const getAllSessions = async (): Promise<{ sessions: Session[] }> => {
  try {
    const response = await api.get<{ sessions: Session[] }>("/api/sessions");
    return response.data;
  } catch (error) {
    console.error('Get all sessions error:', error);
    throw error;
  }
};

export const inspectImage = async (image: File, sessionId?: string): Promise<InspectResponse & { session_id: string }> => {
  try {
    console.log('Sending image to API:', image.name, 'Size:', image.size, 'Type:', image.type);
    const formData = new FormData();
    formData.append("files", image);  // Backend expects "files"
    
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await api.post<BackendResponse>("/api/inspect", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Raw API Response:', response.data);
    console.log('Number of question_answers:', response.data.question_answers?.length || 0);
    
    // Handle clean question_answers format from backend
    let answersData: InspectionItem[] = [];
    
    if (response.data.question_answers && Array.isArray(response.data.question_answers)) {
      console.log('Found question_answers array');
      answersData = response.data.question_answers;
    } else {
      console.error('Unexpected response format:', response.data);
      answersData = [];
    }
    
    console.log('Processed answers:', answersData);

    const storage = response.data.storage ?? null;

    return {
      results: answersData,
      storage,
      session_id: response.data.session_id,
    };
  } catch (error) {
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const sendChatMessage = async (question: string): Promise<ChatResponse> => {
  try {
    console.log('Sending chat message:', question);
    const response = await api.post<ChatResponse>("/chat", { question });
    console.log('Chat API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Chat API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Chat Error details:', error.response?.data);
      console.error('Chat Status:', error.response?.status);
    }
    throw error;
  }
};