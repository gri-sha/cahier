# cahier

**your cv as a clean link.**

one markdown file per person, published at `cahier.fyi/you`. sign in with an
email code, write, pick a theme, publish — no passwords, no dashboard, one page.

named for the french school notebook: grayscale, ruled, typographic.

## run it

```bash
bun install
bun run db:up        # postgres 16 in docker
bun run db:migrate   # create the tables
bun dev              # → localhost:3000  (sign-in codes print to this terminal)
```

no keys needed locally — without a Resend key, sign-in codes are printed to the
`bun dev` terminal instead of emailed.

## stack

next.js 16 (app router) · react 19 · typescript · plain css, no framework ·
better-auth (email otp) · drizzle · postgres (docker in dev, neon in prod) · bun

---

[cahier.fyi](https://cahier.fyi)
