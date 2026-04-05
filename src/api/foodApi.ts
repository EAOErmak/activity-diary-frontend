import axios from "axios";

import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  FoodUpsertDto,
  GeneralFoodResponseDto,
  UserFoodResponseDto,
} from "@/shared/types/food";

function toFoodApiError(
  error: unknown,
  fallbackMessage: string
): Error {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const apiMessage = error.response?.data?.message?.trim();

    if (apiMessage) {
      error.message = apiMessage;
      return error;
    }

    if (error.message) {
      return error;
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export async function getGeneralFoods(
  q?: string
): Promise<GeneralFoodResponseDto[]> {
  try {
    const { data } = await api.get<ApiResponse<GeneralFoodResponseDto[]>>(
      "/general-foods",
      {
        params: q?.trim() ? { q: q.trim() } : undefined,
      }
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось загрузить общую базу продуктов.");
  }
}

export async function getGeneralFoodById(
  id: number
): Promise<GeneralFoodResponseDto> {
  try {
    const { data } = await api.get<ApiResponse<GeneralFoodResponseDto>>(
      `/general-foods/${id}`
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось загрузить продукт.");
  }
}

export async function getUserFoods(
  q?: string
): Promise<UserFoodResponseDto[]> {
  try {
    const { data } = await api.get<ApiResponse<UserFoodResponseDto[]>>(
      "/user-foods",
      {
        params: q?.trim() ? { q: q.trim() } : undefined,
      }
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось загрузить ваши продукты.");
  }
}

export async function getUserFoodById(
  id: number
): Promise<UserFoodResponseDto> {
  try {
    const { data } = await api.get<ApiResponse<UserFoodResponseDto>>(
      `/user-foods/${id}`
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось загрузить продукт пользователя.");
  }
}

export async function createUserFood(
  payload: FoodUpsertDto
): Promise<UserFoodResponseDto> {
  try {
    const { data } = await api.post<ApiResponse<UserFoodResponseDto>>(
      "/user-foods",
      payload
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось создать продукт.");
  }
}

export async function updateUserFood(
  id: number,
  payload: FoodUpsertDto
): Promise<UserFoodResponseDto> {
  try {
    const { data } = await api.put<ApiResponse<UserFoodResponseDto>>(
      `/user-foods/${id}`,
      payload
    );

    return data.data;
  } catch (error) {
    throw toFoodApiError(error, "Не удалось обновить продукт.");
  }
}

export async function deleteUserFood(id: number): Promise<void> {
  try {
    await api.delete(`/user-foods/${id}`);
  } catch (error) {
    throw toFoodApiError(error, "Не удалось удалить продукт.");
  }
}
