export type AdminDatabaseTableTypeApi =
  | string
  | {
      value?: string | null;
      name?: string | null;
      tableName?: string | null;
    };

export type AdminDatabaseTableType = {
  value: string;
  label: string;
  tableName: string | null;
};
