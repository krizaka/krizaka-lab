import { NavBar } from "@krizaka/ui/nav-bar";
import { useState } from "react";

const pages = [
  ["home", "Home"],
  ["demos", "Demos"],
  ["about", "About"],
] as const;

export function Example() {
  const [at, setAt] = useState("home");
  return (
    <NavBar.Root label="A navigation bar" className="lab-g-nav">
      <NavBar.Items>
        {pages.map(([key, label]) => (
          <NavBar.Link key={key} active={at === key} asChild>
            <button type="button" onClick={() => setAt(key)}>
              {label}
            </button>
          </NavBar.Link>
        ))}
      </NavBar.Items>
    </NavBar.Root>
  );
}
