import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/shared/lib/queryKeys";
import { syncAuthStateWithCurrentUser } from "@/shared/lib/syncAuthStateWithCurrentUser";
import { useCurrentUserStore } from "@/shared/store/currentUserStore";

export function useProfile() {
  const queryClient = useQueryClient();
  const user = useCurrentUserStore((state) => state.user);
  const isLoading = useCurrentUserStore((state) => state.isLoading);
  const isReady = useCurrentUserStore((state) => state.isReady);
  const error = useCurrentUserStore((state) => state.error);
  const loadCurrentUser = useCurrentUserStore((state) => state.loadCurrentUser);

  const reloadProfile = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: userKeys.me,
      exact: true,
      refetchType: "none",
    });

    const nextUser = await loadCurrentUser();
    syncAuthStateWithCurrentUser(nextUser);
    return nextUser;
  }, [loadCurrentUser, queryClient]);

  return {
    user,
    loading: !isReady && isLoading,
    error: error ? ("profile.loadError" as const) : null,
    reloadProfile,
  };
}
