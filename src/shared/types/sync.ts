// shared/types/sync.ts

// ================= USER =================
export enum UserSyncEntityType {
  DIARY = "DIARY",
  GOALS = "GOALS",
  PROFILE = "PROFILE",
}

// ================= GLOBAL =================
export enum GlobalSyncEntityType {
  DICTIONARY = "DICTIONARY",
  ENTRY_FIELD_CONFIG = "ENTRY_FIELD_CONFIG",
  SETTINGS = "SETTINGS",
  TAG = "TAG",
}

// ================= COMMON =================
export type SyncFeature =
  | UserSyncEntityType
  | GlobalSyncEntityType;

// ================= API RESPONSES =================
export type SyncState<T extends SyncFeature> =
  Partial<Record<T, number>>;

export type UserSyncStateResponse = {
  state: SyncState<UserSyncEntityType>;
};

export type GlobalSyncStateResponse = {
  state: SyncState<GlobalSyncEntityType>;
};
