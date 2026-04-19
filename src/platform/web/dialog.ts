import type { DialogPlatform } from "@/platform/contracts";

export const webDialog: DialogPlatform = {
  confirm(message) {
    return window.confirm(message);
  },
};
