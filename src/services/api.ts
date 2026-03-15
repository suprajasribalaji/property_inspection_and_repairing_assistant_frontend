import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export interface InspectionItem {
  question: string;
  answer: string;
}

export interface InspectResponse {
  results: InspectionItem[];
}

export interface BackendResponse {
  question_answers: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ChatResponse {
  answer: string;
}

export const inspectImage = async (image: File): Promise<InspectResponse> => {
  try {
    console.log('Sending image to API:', image.name, 'Size:', image.size, 'Type:', image.type);
    const formData = new FormData();
    formData.append("file", image);  // Backend expects "file"
    
    const response = await api.post<BackendResponse>("/api/inspect", formData);
    
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
    
    return {
      results: answersData
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