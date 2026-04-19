import type { RuntimePlatform } from "@/platform/contracts";

export const webRuntime: RuntimePlatform = {
  kind: "web",
  appName: "Activity Diary",
  reload() {
    window.location.reload();
  },
};
