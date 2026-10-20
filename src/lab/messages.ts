/* The lab's words, bound once with @krizaka/i18n: messages/en.json is the reference (its shape types fr.json — a missing
   French key fails the type check), `krizaka-i18n check messages` (CI) checks keys, placeholders and markup.
   English is the default, like every Krizaka site; French when chosen (?lang=fr, then remembered). */

import { createI18n } from "@krizaka/i18n";

import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

export type Locale = "en" | "fr";
export type Messages = typeof en;
export const LOCALES: readonly Locale[] = ["en", "fr"];
export const i18n = createI18n<Messages, Locale>({ en, fr }, { defaultLocale: "en" });
export { format } from "@krizaka/i18n";

/** The language of the page: `?lang=`, then the visitor's last choice — English otherwise (never the browser's guess). */
export function pickLocale(search: string, stored: string | null): Locale {
  const asked = new URLSearchParams(search.replace(/^\?\/[^&]*&?/, "?")).get("lang");
  for (const l of [asked, stored]) if (l === "en" || l === "fr") return l;
  return "en";
}
