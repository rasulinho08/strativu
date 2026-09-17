# Strativu — website

Marketing site for Strativu: a GRC platform company, first product in development.
Built with React 18, Vite, Tailwind v4, motion, react-router.

## Run

```
npm i
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where to change things (no code needed)

| What | File |
| --- | --- |
| Logo, status line, company details, Formspree ID, mock-proof toggles | `src/app/data/site.ts` |
| Logo file | drop `public/logo.svg` (or set `logo.src` in `site.ts`) |
| Logo divarı, statistika, testimonial-lar (MOCK) | `src/app/data/proof.ts` |
| Komanda (ad, rol, şəkil, linklər) | `src/app/data/team.ts` + `public/team/` |
| Framework coverage və statuslar | `src/app/data/coverage.ts` |
| Changelog girişləri | `src/app/data/changelog.ts` |
| Ana səhifədəki 3 capability bloku | `src/app/data/capabilities.ts` |
| Rəng / şrift / radius tokenləri | `src/styles/theme.css`, `src/styles/fonts.css` |

## Routes

`/` · `/platform` · `/platform/grc` · `/platform/architecture` · `/coverage` · `/coverage/:slug` ·
`/company/about` · `/company/contact` · `/trust` · `/changelog` · `/early-access` · `/legal/privacy|terms|dpa`
