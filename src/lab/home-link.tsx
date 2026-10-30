import type React from "react";
import { useLab } from "./context";

/** The back link of a page: a real anchor (it keeps its `href`), taken over by the lab's router for the home. */
export function HomeLink(props: React.ComponentProps<"a">) {
  const { go } = useLab();
  return <a {...props} href={props.href} onClick={go("home")} />;
}
