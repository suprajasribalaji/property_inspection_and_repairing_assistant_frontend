import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export interface InspectionItem {
  question: string;
  answer: string;
}

export interface InspectResponse {
  results: InspectionItem[];
}

export interface ChatResponse {
  answer: string;
}

export const inspectImage = async (image: File): Promise<InspectResponse> => {
  const formData = new FormData();
  formData.append("image", image);
  const response = await api.post<InspectResponse>("/inspect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const sendChatMessage = async (question: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/chat", { question });
  return response.data;
};
