import axios from "./axios";

export const getChats = async (projectId) => {
  const response = await axios.get(`/chat/project/${projectId}`);
  return response.data;
};

export const createChat = async (data) => {
  const response = await axios.post("/chat/create", data);
  return response.data;
};

export const deleteChat = async (chatId) => {
  await axios.delete(`/chat/${chatId}`);
};

export const getMessages = async (chatId) => {
  const response = await axios.get(`/chat/${chatId}/messages`);
  return response.data;
};

export const sendMessage = async (chatId, content) => {
  const response = await axios.post(`/chat/${chatId}/send`, {
    role: "USER",
    content,
  });
  return response.data;
};
