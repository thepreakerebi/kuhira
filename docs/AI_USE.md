# AI use disclosure

The hackathon rules ask entrants to disclose AI use. We used **Claude (Anthropic)** through Claude Code as a
pair programmer and research assistant throughout.

**What AI did**

- Wrote most of the code, under our direction and review: survey harmonizer, regression, aggregates, API, web
  app and tests.
- Searched public sources for policy figures (PSTA5 targets, subsidy rules, kit prices) and pointed us to the
  documents. We checked each figure against the source document cited in the app.
- Drafted text: the README, the method page, these documents, and the first draft of all Kinyarwanda text in the
  app.

**What we did**

- Chose the problem, the track and the design.
- Decided the method, including keeping the negative bean result.
- Reviewed the code and the results.
- Paulette Dushime, our Rwandan team member, reviewed and corrected all the Kinyarwanda text in the app.

**Checks on AI output**

- Every model result is reproducible from the notebooks.
- The model is tested on synthetic data with a known effect: it must recover +20% and −10%.
- Unit and end-to-end tests were run with the code deliberately broken, to confirm they fail.
- Three of AI's mistakes were caught this way and fixed:
  - It first read a farmer-total harvest variable as a per-plot harvest.
  - It later stated a correlation that the data did not support.
  - The farmer calculator returned zero for a crop a district barely grows; it now falls back to the national yield.
