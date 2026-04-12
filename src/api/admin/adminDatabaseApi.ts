import api from "@/api/http/axiosInstance";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AdminDatabaseTableType,
  AdminDatabaseTableTypeApi,
} from "@/shared/types/adminDatabase";

function normalizeAdminDatabaseTableType(
  tableType: AdminDatabaseTableTypeApi
): AdminDatabaseTableType | null {
  if (typeof tableType === "string") {
    const value = tableType.trim();

    if (!value) {
      return null;
    }

    return {
      value,
      label: value,
      tableName: null,
    };
  }

  const value =
    tableType.value?.trim() ||
    tableType.name?.trim() ||
    tableType.tableName?.trim() ||
    "";

  if (!value) {
    return null;
  }

  const tableName = tableType.tableName?.trim() || null;

  return {
    value,
    label: tableName || value,
    tableName,
  };
}

export const clearAdminDatabase = async (): Promise<string> => {
  const { data } = await api.post<ApiResponse<null>>("/admin/database/clear");
  return data.message ?? "Database cleared";
};

export const getAdminDatabaseTableTypes = async (): Promise<
  AdminDatabaseTableType[]
> => {
  const { data } = await api.get<ApiResponse<AdminDatabaseTableTypeApi[]>>(
    "/admin/database/table-types"
  );

  const rawTableTypes = Array.isArray(data.data) ? data.data : [];

  const normalizedTableTypes = rawTableTypes
    .map(normalizeAdminDatabaseTableType)
    .filter((tableType): tableType is AdminDatabaseTableType => tableType !== null);

  return normalizedTableTypes.filter(
    (tableType, index, array) =>
      array.findIndex((candidate) => candidate.value === tableType.value) === index
  );
};

export const clearAdminDatabaseTable = async (
  tableType: string
): Promise<string> => {
  const { data } = await api.post<ApiResponse<null>>(
    `/admin/database/clear/${encodeURIComponent(tableType)}`
  );

  return data.message ?? "Table cleared";
};
