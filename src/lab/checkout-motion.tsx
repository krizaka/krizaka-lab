/* Local prototypes to move into krizaka-ui: directional PageTransition, animated intrinsic height and a done Button.
   Page changes still run through the UI motion API; the fallback is scoped to the card, never the document. */
import { Button } from "@krizaka/ui/button";
import { transitionPage, canViewTransition, type ViewTransitionEnv } from "@krizaka/ui/motion";
import { flushSync } from "react-dom";
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

export type CheckoutTransition = { change: (update: () => void, direction: "forward" | "back") => Promise<void> };

export function AnimatedCheckoutHeight({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const outer = host.current!;
    const inner = content.current!;
    const resize = () => {
      outer.style.height = `${inner.getBoundingClientRect().height}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={host} className="lab-checkout-height" data-reduced={reduced}>
      <div ref={content}>{children}</div>
    </div>
  );
}

export function CheckoutPageTransition({
  ref,
  children,
  reduced,
  duration,
  easing,
}: {
  ref: Ref<CheckoutTransition>;
  children: ReactNode;
  reduced: boolean;
  duration: number;
  easing: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const nativeTransition = useRef<{ skipTransition: () => void } | null>(null);
  const ghost = useRef<HTMLElement | null>(null);
  useEffect(
    () => () => {
      nativeTransition.current?.skipTransition();
      animations.current.forEach((a) => a.cancel());
      ghost.current?.remove();
    },
    [],
  );
  useEffect(() => {
    if (reduced) {
      nativeTransition.current?.skipTransition();
      animations.current.forEach((a) => a.finish());
    }
  }, [reduced]);
  useImperativeHandle(
    ref,
    () => ({
      async change(update, direction) {
        const host = stage.current!;
        const inner = content.current!;
        const doc = document as unknown as ViewTransitionEnv["doc"];
        const native = canViewTransition(doc);
        const root = document.documentElement;
        const sign = direction === "forward" ? 1 : -1;
        if (!reduced && native) {
          root.dataset.checkoutDirection = direction;
          root.style.setProperty("--lab-checkout-duration", `${duration}ms`);
          root.style.setProperty("--lab-checkout-ease", easing);
        } else if (!reduced && duration > 0) {
          ghost.current = inner.cloneNode(true) as HTMLElement;
          ghost.current.setAttribute("aria-hidden", "true");
          ghost.current.inert = true;
          ghost.current.classList.add("lab-checkout-outgoing");
          host.append(ghost.current);
        }
        try {
          await transitionPage(
            () => flushSync(update),
            {
              reduced,
              doc: native
                ? {
                    startViewTransition: (change) => {
                      const active = document.startViewTransition(change);
                      nativeTransition.current = active;
                      return active;
                    },
                  }
                : {
                    documentElement: {
                      animate: () => {
                        const options = { duration, easing };
                        animations.current = [
                          inner.animate(
                            [
                              { opacity: 0, transform: `translateX(${sign * 100}%)` },
                              { opacity: 1, transform: "translateX(0)" },
                            ],
                            options,
                          ),
                          ...(ghost.current
                            ? [
                                ghost.current.animate(
                                  [
                                    { opacity: 1, transform: "translateX(0)" },
                                    { opacity: 0, transform: `translateX(${-sign * 100}%)` },
                                  ],
                                  options,
                                ),
                              ]
                            : []),
                        ];
                      },
                    },
                  },
            },
            { duration, easing },
          );
          await Promise.all(animations.current.map((a) => a.finished.catch(() => {})));
        } finally {
          ghost.current?.remove();
          ghost.current = null;
          nativeTransition.current = null;
          animations.current = [];
          delete root.dataset.checkoutDirection;
          root.style.removeProperty("--lab-checkout-duration");
          root.style.removeProperty("--lab-checkout-ease");
        }
      },
    }),
    [reduced, duration, easing],
  );
  return (
    <div ref={stage} className="lab-checkout-transition">
      <AnimatedCheckoutHeight reduced={reduced}>
        <div ref={content}>{children}</div>
      </AnimatedCheckoutHeight>
    </div>
  );
}

function announcementOf(phase: "idle" | "working" | "done", working: string, done: string): string | undefined {
  if (phase === "working") return working;
  return phase === "done" ? done : undefined;
}

export function CheckoutPayButton({
  phase,
  label,
  working,
  done,
  onClick,
  disabled,
  errorId,
}: {
  phase: "idle" | "working" | "done";
  label: string;
  working: string;
  done: string;
  onClick: () => void;
  disabled: boolean;
  errorId?: string;
}) {
  return (
    <Button
      variant="primary"
      className="lab-checkout-pay"
      loading={phase === "working"}
      status={phase === "done" ? "success" : null}
      announce={announcementOf(phase, working, done)}
      disabled={disabled || phase !== "idle"}
      onClick={onClick}
      aria-describedby={errorId}
    >
      <span className="lab-checkout-pay-label">
        <span className="lab-checkout-pay-reserve" aria-hidden>
          {label}
        </span>
        <span className="lab-checkout-pay-state">
          {phase === "working" ? working : phase === "done" ? done : label}
        </span>
      </span>
    </Button>
  );
}

export function checkoutMotionStyle(duration: string, easing: string): CSSProperties {
  return { "--lab-checkout-duration": `var(${duration})`, "--lab-checkout-ease": `var(${easing})` } as CSSProperties;
}
