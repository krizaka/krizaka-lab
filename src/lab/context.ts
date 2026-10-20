import { createContext, type MouseEvent, useContext } from "react";

import type { LabPage } from "../core/router";
import type { Locale, Messages } from "./messages";

export interface Lab {
  t: Messages;
  locale: Locale;
  /** The address of a page under the current base. */
  href: (to: LabPage) => string;
  /** The click handler of an internal link (history API, no reload). */
  go: (to: LabPage) => (e: MouseEvent<HTMLAnchorElement>) => void;
}

export const LabContext = createContext<Lab | null>(null);

export function useLab(): Lab {
  const lab = useContext(LabContext);
  if (!lab) throw new Error("useLab outside the lab's shell");
  return lab;
}
