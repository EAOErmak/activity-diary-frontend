import axios from "axios";

import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  FoodUpsertDto,
  GeneralFoodResponseDto,
} from "@/shared/types/food";

function toAdminGeneralFoodApiError(
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

export async function createGeneralFood(
  payload: FoodUpsertDto
): Promise<GeneralFoodResponseDto> {
  try {
    const { data } = await api.post<ApiResponse<GeneralFoodResponseDto>>(
      "/admin/general-foods",
      payload
    );

    return data.data;
  } catch (error) {
    throw toAdminGeneralFoodApiError(error, "Не удалось создать продукт.");
  }
}

export async function updateGeneralFood(
  id: number,
  payload: FoodUpsertDto
): Promise<GeneralFoodResponseDto> {
  try {
    const { data } = await api.put<ApiResponse<GeneralFoodResponseDto>>(
      `/admin/general-foods/${id}`,
      payload
    );

    return data.data;
  } catch (error) {
    throw toAdminGeneralFoodApiError(error, "Не удалось обновить продукт.");
  }
}

export async function deleteGeneralFood(id: number): Promise<void> {
  try {
    await api.delete(`/admin/general-foods/${id}`);
  } catch (error) {
    throw toAdminGeneralFoodApiError(error, "Не удалось удалить продукт.");
  }
}
