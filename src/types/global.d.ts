export {};

declare global {
  interface Window {
    __hk_booted?: boolean;
    __TWEAKS__?: Record<string, unknown>;
    claude?: { complete?: (arg: unknown) => Promise<string> };
  }
}
