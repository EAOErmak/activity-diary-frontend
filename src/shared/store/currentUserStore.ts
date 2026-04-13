import { create } from "zustand";

import { getCurrentUser } from "@/api/userApi";
import type { UserDto } from "@/shared/types/user";

type CurrentUserStoreState = {
  user: UserDto | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  loadCurrentUser: () => Promise<UserDto>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load the current user profile.";
}

export const useCurrentUserStore = create<CurrentUserStoreState>((set) => ({
  user: null,
  isLoading: false,
  isReady: false,
  error: null,
  loadCurrentUser: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const user = await getCurrentUser();
      set({
        user,
        isLoading: false,
        isReady: true,
        error: null,
      });
      return user;
    } catch (error) {
      set({
        user: null,
        isLoading: false,
        isReady: true,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },
}));
