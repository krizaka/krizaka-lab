#!/usr/bin/env bash
# What only the lab checks, run by the shared node-ci (input `after-build`) once the build exists: the catalogue, the gallery,
# the performance budget, then a real browser (reduced motion OFF) on the built demo.
set -euo pipefail

echo "::group::Unit tests (they read the built demo)"
pnpm test
echo "::endgroup::"

echo "::group::Catalogue, gallery, budget"
# The lab is English only: its catalogue is complete (no empty string, valid placeholders and markup, @krizaka/i18n).
pnpm exec krizaka-i18n check messages
# The gallery's code is the demo that renders (one file per card); a card, prop or word that drifts fails here.
node scripts/check-gallery.mjs
# Performance budget (ADR-001 §6): no requestAnimationFrame outside the experiments.
pnpm run check:budget
echo "::endgroup::"

echo "::group::A real browser on the built demo"
pnpm exec vite preview --outDir dist-demo --port 4173 --strictPort &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -fsS http://localhost:4173/ >/dev/null && break; sleep 1; done
node scripts/check-motion.mjs --base http://localhost:4173
node scripts/check-demos.mjs --base http://localhost:4173
CHECKOUT_BASE=http://localhost:4173 node --test tests/checkout-browser.test.mjs
# Every gallery card works as its words say, and the experiments run smooth (reduced motion OFF and ON).
node scripts/check-cards.mjs --base http://localhost:4173
node scripts/check-experiments.mjs --base http://localhost:4173
node scripts/check-studies.mjs --base http://localhost:4173
echo "::endgroup::"
