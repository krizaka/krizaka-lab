/* The lab's shell, on Krizaka UI like ui.krizaka.com: the family's bar (the Krizaka mark, the family switcher, the
   pages, the repository, the theme, the language), the page blocks (PageHero, Section, CardGrid of live previews,
   CodeBlock), the family's footer, the tokens in dark and light. One motion system: @krizaka/ui's MotionObserver is
   mounted once; the lab's canvas views pause off screen and stand still under reduced motion.
   Every page is an address that works on GitHub Pages (scripts/generate-routes.mjs + 404.html, core/router.ts). */

import { MoonIcon, SunIcon } from "@krizaka/icons";
import { KrizakaLogo } from "@krizaka/ui";
import { Button } from "@krizaka/ui/button";
import { MotionObserver } from "@krizaka/ui/motion";
import { NavBar } from "@krizaka/ui/nav-bar";
import { SiteFooter } from "@krizaka/ui/site-footer";
import { familyLabels } from "@krizaka/ui/sites";
import { ThemeProvider, useTheme } from "@krizaka/ui/theme";
import { type MouseEvent, useEffect, useMemo, useState } from "react";

import { GUIDE_PATHS, getCanonicalUrl, getHrefForTab, homeHref, type LabPage, resolvePage, SCENARIO_PATHS, type GuidePage as GuideId, type ScenarioPage as ScenarioId, type TabId } from "./core/router";
import { DemoPage } from "./lab/DemoPage";
import { GuidePage, ScenarioPage } from "./lab/GuidePage";
import { guideById } from "./lab/guides";
import { Experiments, Home } from "./lab/Home";
import { SCENARIOS } from "./lab/scenarios";
import { LabContext } from "./lab/context";
import { i18n, LOCALE } from "./lab/messages";

const REPO = "https://github.com/krizaka/krizaka-motion";
const isGuide = (p: LabPage): p is GuideId => (GUIDE_PATHS as readonly string[]).includes(p);
const isScenario = (p: LabPage): p is ScenarioId => (SCENARIO_PATHS as readonly string[]).includes(p);
function Shell() {
  const [page, setPage] = useState<LabPage>(() => resolvePage(window.location));
  const locale = LOCALE;
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
    const name = page === "home" ? t.home.eyebrow : page === "experiments" ? "Experiments" : isGuide(page) ? guideById(page).title : isScenario(page) ? SCENARIOS[page].title : t.demos[page].name;
    document.title = page === "home" ? `${t.bar.label} — ${name}` : `${name} — ${t.bar.label}`;
    const canonicalUrl = getCanonicalUrl(window.location.pathname);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
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

  const nav: { id: LabPage; label: string }[] = [
    { id: "home", label: "Guides" },
    { id: "kz-ui", label: t.bar.gallery },
    { id: "experiments", label: "Experiments" },
  ];
  const section: LabPage = isGuide(page) || isScenario(page) ? "home" : page === "experiments" || ["orazaka", "jarvis", "caustics", "lattice"].includes(page) ? "experiments" : page;

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
          <NavBar.Items>
            {nav.map((n) => (
              <NavBar.Link key={n.id} asChild active={section === n.id}>
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
            <NavBar.Mobile openLabel={t.bar.openMenu} closeLabel={t.bar.closeMenu}>
              {nav.map((n) => (
                <NavBar.MobileLink key={n.id} href={lab.href(n.id)}>
                  {n.label}
                </NavBar.MobileLink>
              ))}
            </NavBar.Mobile>
          </NavBar.Actions>
        </NavBar.Root>
      </div>

      <main className="lab-main">
        {page === "home" ? <Home /> : page === "experiments" ? <Experiments /> : isGuide(page) ? <GuidePage key={page} id={page} /> : isScenario(page) ? <ScenarioPage key={page} id={page} /> : <DemoPage id={page as TabId} />}
      </main>

      <SiteFooter current="github" labels={familyLabels[locale]}>
        <SiteFooter.Column title={t.footer.lab}>
          <SiteFooter.Link href={lab.href("home")}>Guides</SiteFooter.Link>
          <SiteFooter.Link href={lab.href("experiments")}>Experiments</SiteFooter.Link>
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
