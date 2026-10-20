/* The lab's shell, on Krizaka UI like ui.krizaka.com: the family's bar (the Krizaka mark, the family switcher, the
   pages, the repository, the theme, the language), the page blocks (PageHero, Section, CardGrid of live previews,
   CodeBlock), the family's footer, the tokens in dark and light. One motion system: @krizaka/ui's MotionObserver is
   mounted once; the lab's canvas views pause off screen and stand still under reduced motion.
   Every page is an address that works on GitHub Pages (scripts/generate-routes.mjs + 404.html, core/router.ts). */

import { MoonIcon, SunIcon } from "@krizaka/icons";
import { KrizakaLogo } from "@krizaka/ui";
import { Button } from "@krizaka/ui/button";
import { languageNames } from "@krizaka/ui/language-switch";
import { MotionObserver } from "@krizaka/ui/motion";
import { NavBar } from "@krizaka/ui/nav-bar";
import { SiteFooter } from "@krizaka/ui/site-footer";
import { familyLabels } from "@krizaka/ui/sites";
import { ThemeProvider, useTheme } from "@krizaka/ui/theme";
import { type MouseEvent, useEffect, useMemo, useState } from "react";

import { getHrefForTab, homeHref, type LabPage, resolvePage, type TabId } from "./core/router";
import { DemoPage } from "./lab/DemoPage";
import { Home } from "./lab/Home";
import { LabContext } from "./lab/context";
import { i18n, LOCALES, type Locale, pickLocale } from "./lab/messages";

const REPO = "https://github.com/krizaka/krizaka-motion";
const LANG_KEY = "kz-lab-lang";

function readLocale(): Locale {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LANG_KEY);
  } catch {}
  const locale = pickLocale(window.location.search, stored);
  try {
    if (new URLSearchParams(window.location.search).get("lang")) localStorage.setItem(LANG_KEY, locale);
  } catch {}
  return locale;
}

function Shell() {
  const [page, setPage] = useState<LabPage>(() => resolvePage(window.location));
  const [locale] = useState<Locale>(readLocale);
  const t = i18n.getDictionary(locale);
  const { mode, setMode } = useTheme();
  const dark = mode === "dark" || (mode === "system" && !window.matchMedia("(prefers-color-scheme: light)").matches);

  useEffect(() => {
    const onPop = () => setPage(resolvePage(window.location));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = page === "home" ? `${t.bar.label} — ${t.home.eyebrow}` : `${t.demos[page].name} — ${t.bar.label}`;
  }, [page, locale, t]);

  const lab = useMemo(() => {
    const href = (to: LabPage) => (to === "home" ? homeHref(window.location.pathname) : getHrefForTab(to, window.location.pathname));
    /** An internal link: the history API, the page's top, no reload. */
    const go = (to: LabPage) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      window.history.pushState(null, "", href(to));
      setPage(to);
      window.scrollTo({ top: 0 });
    };
    return { t, locale, href, go };
  }, [t, locale]);

  const languages = LOCALES.map((code) => ({ code, name: languageNames[code] ?? code, href: `?lang=${code}` }));
  const nav: { id: LabPage; label: string }[] = [
    { id: "home", label: t.bar.demos },
    { id: "kz-ui", label: t.bar.gallery },
    { id: "architecture", label: t.bar.specs },
  ];

  return (
    <LabContext.Provider value={lab}>
      <MotionObserver />
      <div className="lab-bar-wrap">
        <NavBar.Root label={t.bar.mainAria} className="lab-bar">
          <NavBar.Brand asChild>
            <a href={lab.href("home")} onClick={lab.go("home")} aria-label={t.bar.homeAria}>
              <KrizakaLogo size={26} />
              {t.bar.label}
            </a>
          </NavBar.Brand>
          <NavBar.Family current="github" labels={familyLabels[locale]} />
          <NavBar.Items>
            {nav.map((n) => (
              <NavBar.Link key={n.id} asChild active={page === n.id || (n.id === "home" && !["kz-ui", "architecture"].includes(page))}>
                <a href={lab.href(n.id)} onClick={lab.go(n.id)}>
                  {n.label}
                </a>
              </NavBar.Link>
            ))}
          </NavBar.Items>
          <NavBar.Actions className="gap-1">
            <NavBar.Repo href={REPO} label={t.bar.githubAria} className="hidden md:inline-flex" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              shape="pill"
              onClick={() => setMode(dark ? "light" : "dark")}
              aria-label={dark ? t.bar.lightMode : t.bar.darkMode}
              className="h-9 w-9"
            >
              {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </Button>
            <NavBar.Language label={t.bar.language} current={locale} languages={languages} />
            <NavBar.Mobile openLabel={t.bar.openMenu} closeLabel={t.bar.closeMenu}>
              {nav.map((n) => (
                <NavBar.MobileLink key={n.id} href={lab.href(n.id)}>
                  {n.label}
                </NavBar.MobileLink>
              ))}
              <NavBar.Family current="github" labels={familyLabels[locale]} />
            </NavBar.Mobile>
          </NavBar.Actions>
        </NavBar.Root>
      </div>

      <main className="lab-main">{page === "home" ? <Home /> : <DemoPage id={page as TabId} />}</main>

      <SiteFooter current="github" labels={familyLabels[locale]}>
        <SiteFooter.Column title={t.footer.lab}>
          <SiteFooter.Link href={lab.href("home")}>{t.footer.demos}</SiteFooter.Link>
          <SiteFooter.Link href={lab.href("kz-ui")}>{t.bar.gallery}</SiteFooter.Link>
          <SiteFooter.Link href={lab.href("architecture")}>{t.bar.specs}</SiteFooter.Link>
          <SiteFooter.Link href={REPO}>{t.footer.source}</SiteFooter.Link>
        </SiteFooter.Column>
      </SiteFooter>
    </LabContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultMode="system">
      <Shell />
    </ThemeProvider>
  );
}
