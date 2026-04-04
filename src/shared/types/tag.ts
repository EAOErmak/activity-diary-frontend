export type Tag = {
  id: number;
  name: string;
  status?: "PROPOSED" | "APPROVED" | "DEPRECATED" | "REJECTED";
};

export type TagCreate = {
  name: string;
};
