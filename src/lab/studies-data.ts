/* The notebook studies (Cahier identity): small experiments on native web motion, each one file pair
   studies/<id>.tsx + studies/<id>.css that is both rendered and printed. Honest status for all: lab only. */
export const STUDIES = [
  { id: "ink", api: ["SVG stroke-dashoffset", "pathLength"] },
  { id: "stamp", api: ["Web Animations API", "linear() easing"] },
  { id: "underline", api: ["animation-timeline: scroll()", "@supports fallback"] },
  { id: "marginalia", api: ["anchor-name", "position-area", "popover", "@starting-style"] },
  { id: "page-turn", api: ["document.startViewTransition", "view-transition-name"] },
] as const;

export type StudyId = (typeof STUDIES)[number]["id"];
