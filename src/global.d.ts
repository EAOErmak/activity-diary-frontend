declare global {
  interface Window {
    electronAPI?: {
      isDesktop?: boolean;
    };
  }
}

export {};
