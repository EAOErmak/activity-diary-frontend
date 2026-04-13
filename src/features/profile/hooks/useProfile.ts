import { useCurrentUserStore } from "@/shared/store/currentUserStore";

export function useProfile() {
  const user = useCurrentUserStore((state) => state.user);
  const isLoading = useCurrentUserStore((state) => state.isLoading);
  const isReady = useCurrentUserStore((state) => state.isReady);
  const error = useCurrentUserStore((state) => state.error);
  const reloadProfile = useCurrentUserStore((state) => state.loadCurrentUser);

  return {
    user,
    loading: !isReady && isLoading,
    error: error ? ("profile.loadError" as const) : null,
    reloadProfile,
  };
}
