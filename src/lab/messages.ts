/* The lab's words, bound once with @krizaka/i18n: the lab is English only (Oussama, 2026-10-20). messages/en.json is the
   one catalogue; `krizaka-i18n check messages` (CI) checks it is complete (no empty string, valid placeholders and markup). */

import { createI18n } from "@krizaka/i18n";

import en from "../../messages/en.json";

export type Locale = "en";
export type Messages = typeof en;
export const LOCALE: Locale = "en";
export const i18n = createI18n<Messages, Locale>({ en }, { defaultLocale: "en" });
export { format } from "@krizaka/i18n";
