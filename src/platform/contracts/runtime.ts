export type PlatformKind = "web" | "desktop";

export interface RuntimePlatform {
  kind: PlatformKind;
  appName: string;
  reload: () => void;
}
