export type Tag = {
  id: number;
  name: string;
  status: "PROPOSED" | "APPROVED" | "DEPRECATED" | "REJECTED";
};
