export {};

declare global {
  interface Window {
    /**
     * Set by <Preloader> once the reveal finishes. Lets late-mounting
     * components (the dynamically imported 3D hero) know they missed the
     * `preloader:done` event and should run their intro immediately.
     */
    __preloaderDone?: boolean;
  }
}
