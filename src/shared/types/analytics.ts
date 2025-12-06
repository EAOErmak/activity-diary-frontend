export type ChartPoint = {
  x: string;
  y: number;
};

export type ChartResponse = {
  title: string;
  unit: string | null;
  chartType: "REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE";
  points: ChartPoint[];
};

export type MultiChartResponse = {
  charts: ChartResponse[];
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeToday: number;
  blockedUsers: number;
  newUsersLast7Days: number;
  totalEntries: number;
  entriesToday: number;
  entriesLast7Days: number;
};