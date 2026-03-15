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
  questions: string[];
  answers: Array<{
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
    
    const response = await api.post<BackendResponse>("/inspect", formData);
    
    console.log('Raw API Response:', response.data);
    
    // Handle different response formats
    let answersData;
    if (typeof response.data.answers === 'string') {
      // Parse JSON string if it's a string
      try {
        const parsed = JSON.parse(response.data.answers.replace(/```json\n|\n```/g, ''));
        const answersArray = Object.values(parsed);
        
        // Use questions from backend if available, otherwise generate generic ones
        answersData = answersArray.map((answer: string, index: number) => ({
          question: response.data.questions?.[index] || `Question ${index + 1}`,
          answer: answer
        }));
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        answersData = [];
      }
    } else if (Array.isArray(response.data.answers)) {
      // Handle array format
      answersData = response.data.answers.map((item: {question?: string, answer: string}, index: number) => ({
        question: item.question || response.data.questions?.[index] || `Question ${index + 1}`,
        answer: item.answer
      }));
    } else {
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