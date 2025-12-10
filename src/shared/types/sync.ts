export type SyncEntityType = "DIARY" | "SETTINGS" | "GOALS" | "PROFILE";

export type SyncStateResponse = {
  state: Record<SyncEntityType, number>;
};
