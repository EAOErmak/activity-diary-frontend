import { useEffect, useState } from "react";
import type { UserDto } from "@/shared/types/user";
import { getCurrentUser } from "@/api/userApi";

export function useProfile() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getCurrentUser()
      .then(setUser)
      .catch(() => setError("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
