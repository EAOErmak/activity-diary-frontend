import { useAuthStore } from "@/shared/store/authStore";
import type { UserDto } from "@/shared/types/user";

export function syncAuthStateWithCurrentUser(user: UserDto) {
  const authState = useAuthStore.getState();

  if (
    authState.userId === user.id &&
    authState.username === user.username &&
    authState.role === user.role &&
    authState.twoFactorRequired === false
  ) {
    return;
  }

  authState.setAuthData({
    accessToken: authState.accessToken,
    refreshToken: authState.refreshToken,
    userId: user.id,
    username: user.username,
    role: user.role,
    twoFactorRequired: false,
  });
}
