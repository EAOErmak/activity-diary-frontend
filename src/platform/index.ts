import type { RuntimePlatform } from "@/platform/contracts";
import {
  webBootstrap,
  webDialog,
  webRuntime,
  webSession,
  webStorage,
} from "./web";

const desktopRuntime: RuntimePlatform = {
  kind: "desktop",
  appName: "Activity Diary",
  reload() {
    window.location.reload();
  },
};

const isDesktopRuntime =
  typeof window !== "undefined" && window.electronAPI?.isDesktop === true;

export const isDesktopApp = isDesktopRuntime;

export const bootstrap = webBootstrap;
export const dialog = webDialog;
export const runtime = isDesktopRuntime ? desktopRuntime : webRuntime;
export const session = webSession;
export const storage = webStorage;
