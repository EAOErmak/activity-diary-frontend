import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function useApiErrorHandler() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return (error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      
      // Handle authentication errors
      if (status === 401 || status === 403) {
        logout();
        navigate('/login', { replace: true });
        return new ApiError('Сессия истекла. Пожалуйста, войдите снова.', status);
      }

      // Handle validation errors
      if (status === 400) {
        return new ApiError('Проверьте правильность введенных данных', status);
      }

      // Handle not found
      if (status === 404) {
        return new ApiError('Запрашиваемый ресурс не найден', status);
      }

      // Handle server errors
      if (status && status >= 500) {
        return new ApiError('Произошла ошибка сервера. Попробуйте позже.', status);
      }
    }

    // Handle network errors
    if (error instanceof Error && error.message === 'Network Error') {
      return new ApiError('Ошибка сети. Проверьте подключение к интернету.', 0);
    }

    // Handle unknown errors
    return new ApiError('Произошла непредвиденная ошибка', 500);
  };
}