import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const bookcaseService = {
  getBookcase: () => api.get(API_ENDPOINTS.BOOKCASE.USER),

  registerToRead: (bookData) => api.post(API_ENDPOINTS.BOOKCASE.REGISTER_TO_READ, bookData),

  startReading: (bookId) =>
    api.post(API_ENDPOINTS.BOOKCASE.START_READING, null, {
      params: { bookId },
    }),

  finishReading: (bookId) =>
    api.post(API_ENDPOINTS.BOOKCASE.FINISH_READING, null, {
      params: { bookId },
    }),
};
