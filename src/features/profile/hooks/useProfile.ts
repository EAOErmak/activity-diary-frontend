import { useEffect, useState } from "react";
import type { UserDto } from "@/shared/types/user";
import { getCurrentUser } from "@/api/userApi";

export function useProfile() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"profile.loadError" | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getCurrentUser()
      .then(setUser)
      .catch(() => setError("profile.loadError"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
