/**
 * Page transitions on the platform: `document.startViewTransition` with a cross-fade fallback and an instant change
 * under reduced motion. Pure functions over an injected document, so they are testable without a browser.
 *
 * The contract (docs/direction-2027.md): the DOM always updates; motion is only the way it gets there.
 */

export interface ViewTransitionLike {
  readonly finished: Promise<void>;
}

export type StartViewTransition = (update: () => void) => ViewTransitionLike;

export interface ViewTransitionEnv {
  /** The document whose transition runs. Defaults to the global one when the call happens in a browser. */
  readonly doc?: {
    startViewTransition?: StartViewTransition;
    documentElement?: { animate?: (frames: Keyframe[], options: KeyframeAnimationOptions) => unknown };
  };
  /** `prefers-reduced-motion: reduce`. */
  readonly reduced?: boolean;
}

export interface CrossFadeOptions {
  /** Milliseconds of the fallback cross-fade. */
  readonly duration?: number;
  readonly easing?: string;
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_-]*$/;

/** True when the browser can run a native view transition. */
export function canViewTransition(doc: ViewTransitionEnv["doc"]): boolean {
  return typeof doc?.startViewTransition === "function";
}

/**
 * Runs `update` inside a view transition when the platform has one and motion is allowed; otherwise it runs `update`
 * at once. Resolves when the transition has finished (or straight away when there is none). It never rejects: a
 * skipped or aborted transition still leaves the DOM in its new state.
 */
export function runViewTransition(update: () => void, env: ViewTransitionEnv = {}): Promise<void> {
  if (env.reduced || !canViewTransition(env.doc)) {
    update();
    return Promise.resolve();
  }
  const transition = env.doc!.startViewTransition!(update);
  return transition.finished.then(
    () => undefined,
    () => undefined,
  );
}

/**
 * The fallback for a browser without view transitions: the change is applied, then the root cross-fades from
 * transparent. Reduced motion means no fade at all. Returns the animation when one was started, otherwise `null`.
 */
export function crossFallback(update: () => void, env: ViewTransitionEnv = {}, options: CrossFadeOptions = {}): unknown {
  update();
  if (env.reduced || canViewTransition(env.doc)) return null;
  const root = env.doc?.documentElement;
  if (typeof root?.animate !== "function") return null;
  return root.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: options.duration ?? 200,
    easing: options.easing ?? "ease-out",
  });
}

/** One call for a change of page or step: a view transition where it exists, a cross-fade otherwise, instant under reduced motion. */
export function transitionPage(update: () => void, env: ViewTransitionEnv = {}, options: CrossFadeOptions = {}): Promise<void> {
  if (canViewTransition(env.doc) && !env.reduced) return runViewTransition(update, env);
  crossFallback(update, env, options);
  return Promise.resolve();
}

/**
 * The `view-transition-name` for a shared element: the element morphs between the two states wherever it lands. The
 * name must be one CSS identifier and unique on the page while the transition runs.
 */
export function sharedElementStyle(name: string): { viewTransitionName: string } {
  if (!IDENT.test(name)) throw new RangeError(`view-transition-name must be one identifier, got "${name}"`);
  return { viewTransitionName: name };
}
