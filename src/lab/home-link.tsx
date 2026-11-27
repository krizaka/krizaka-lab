import type React from "react";
import { type LabPage, resolvePage } from "../core/router";
import { useLab } from "./context";

/** An internal link: a real anchor (it keeps its `href`), taken over by the lab's router for the page `to`. */
export function PageLink({ to, ...props }: React.ComponentProps<"a"> & { to: LabPage }) {
  const { go } = useLab();
  return <a {...props} href={props.href} onClick={go(to)} />;
}

/** The back link of a page: the home. */
export function HomeLink(props: React.ComponentProps<"a">) {
  return <PageLink {...props} to="home" />;
}

/** An internal link whose target page is resolved from its `href` (for `linkAs` slots that cannot pass `to`). */
export function LabLink(props: React.ComponentProps<"a">) {
  if (!props.href?.startsWith("/")) {
    return <a {...props} href={props.href} />;
  }
  return <PageLink {...props} to={resolvePage({ pathname: props.href })} />;
}
