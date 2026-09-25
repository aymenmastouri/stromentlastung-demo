# Der Text des Videos

> Englische Fassung: Übersetzung des freigegebenen deutschen Wortlauts aus `texte.en.ts`, zur Freigabe.

Wortlaut aller Karten und Untertitel, Kapitel für Kapitel, erzeugt aus `texte.ts` am 25. September 2026.
Was hier steht, steht so im Video; eine Änderung am Wortlaut geschieht in `texte.ts`,
danach erzeugt `npm run texte` dieses Dokument neu.

**Botschaft:** From requirement to delivery – one continuous, governed, verifiable process.

Die Spalte *Kurzfassung* sagt, ob das Kapitel in die etwa sechsminütige Fassung kommt;
Kürzungen innerhalb eines Kapitels (K2, K7, K11) nimmt der Schnitt vor.

---

## Akt 1 · The assignment

### K1 · Title card

*Kurzfassung: ja*

**Titelkarte**

> From requirement to delivery
>
> one continuous, governed, verifiable process.

**Darunter**

> One public-sector procedure. One ticket. One chain to the branch.

### K2 · The procedure

*Kurzfassung: ja*

**Kapitelkarte**

> Electricity is taxed.
>
> Manufacturing companies get part of it back: the tax relief under § 9b of the German Electricity Tax Act, applied for at the main customs office for one year of consumption.
>
> If too much was paid out, an amending notice is issued and the difference is reclaimed.
>
> Whoever does not pay the reclaimed amount by its due date owes late-payment surcharges.

**Untertitel**

The reference procedure is rebuilt and simplified: created by AI from public sources only. Not a procedure of the customs administration, no relation to any Capgemini client project.

### K3 · Sign-in and cases

*Kurzfassung: ja*

**Untertitel 1**

The clerk of the office signs in. The header band names the state the services run on: main.

**Untertitel 2**

The office keeps its cases in a list: file number, company, year, state and assessed amount, filterable by state. The case we are about to see is one of many.

### K4 · Reclaims

*Kurzfassung: ja*

**Untertitel 1**

An open reclaim: € 6,230.00, due in March, six months begun in arrears — counted up to the day the ticket names. Late-payment surcharge: € 373.80.

**Untertitel 2**

That figure cannot be right. A late-payment surcharge is one percent per month of an amount first rounded down to full 50 euros. It never ends in 80 cents.

### K5 · The case

*Kurzfassung: nein*

**Untertitel**

Inside the case, under payments, the same amount. The clerk knows no more, and needs to know no more: they report what they see.

### K6 · The ticket in the browser

*Kurzfassung: ja*

**Untertitel 1**

The report becomes an assignment: a ticket as the team always writes it — use case, observed amount, the regulation, acceptance criteria. No prompt.

**Untertitel 2**

What it says: an amount and a rule. What it does not say: where the defect is and how large it is. That is exactly the work ahead.

---

## Akt 2 · The run

### K7 · Settings

*Kurzfassung: ja*

**Untertitel 1**

Own data. Own rules. Own AI. The platform mode is decided once, when the run starts: SovAI, Capgemini's sovereign platform. Offline would be the local platform on this machine, with the same rules.

**Untertitel 2**

Reuse of finished work: work whose inputs have not changed since the last run is taken over, not computed again. The run ahead shows what that means.

### K8 · The ticket in the tool

*Kurzfassung: ja*

**Untertitel 1**

The ticket comes live from Jira, with its links. From here a first solution concept could be drafted straight from the code base — we leave that to the pipeline.

**Untertitel 2**

Use in pipeline: the ticket is now the task of the run. One task, one run, nothing in parallel.

### K9 · The run starts

*Kurzfassung: ja*

**Untertitel**

Before the run: seven repositories on main, each at its commit. Model services and vector store answer. The whole way: nine phases, linear, one ticket.

### K10 · The knowledge stands

*Kurzfassung: ja*

**Untertitel 1**

Facts first — without AI. Inventory, facts, understanding and dossier stand from the first contact with the code and are taken over.

**Untertitel 2**

What has not changed is not computed again. When the code base changes, the tool recomputes exactly that, and every result states which inputs it comes from.

### K11 · A tour of the knowledge

*Kurzfassung: ja*

**Untertitel 1**

Architecture facts: read from the code without AI. Every relation with file and line.

**Untertitel 2**

Architecture synthesis: the AI explains the code base, checked against the facts. Where the facts are silent, it says so.

**Untertitel 3**

Architecture dossier: sixteen chapters — C4 levels 1 to 4 and arc42 §1 to §12 —, each with evidence and scored by a separate reviewer. The AI writes. Review is separate. Three chapters are shown here as examples.

**Untertitel 4**

C4, level 1: the system context. Who talks to the procedure, what it needs from outside — a whole document, not a slide.

**Untertitel 5**

arc42, building block view: which services the procedure consists of and how they fit together. Read from the code, not from yesterday's drawing.

**Untertitel 6**

arc42, runtime view: how a case runs through the services. On this understanding, triage is about to look for the cause.

### K12 · Solution triage

*Kurzfassung: ja*

**Untertitel 1**

First the understanding of the ticket: goal, current state against target state, affected scope — written down before anything is proposed.

**Untertitel 2**

Then the technical context: which services, which classes, which contracts the case touches. This is the ground the concept is about to stand on.

**Untertitel 3**

Solution triage: the ticket is read against the code base. Here the regulation from the ticket and the method in the code meet for the first time — that is where the work lies.

**Untertitel 4**

Cause: SaeumnisRechner.berechne takes one percent of the unrounded amount, 6 × € 6,230.00 / 100 = € 373.80. The rounding down to full 50 euros under § 240 of the Fiscal Code is missing.

**Untertitel 5**

Fix: round down before taking the percentage. € 6,230.00 becomes € 6,200.00, the surcharge € 372.00. A new test covers an amount not divisible by 50.

**Untertitel 6**

Every statement carries its evidence: file and line. The guardrails check evidence, change sites and the coverage of the acceptance criteria before a person sees the concept.

### K13 · Waiting point 1: the concept

*Kurzfassung: ja*

**Untertitel 1**

The run stops where a decision is made. The AI proposes. The evidence checks. The human decides — and carries the responsibility.

**Untertitel 2**

Continue chain: the phases before stand, the plan is taken over. What is decided stays decided; what stands is not computed again.

### K14 · Delivery plan and waiting point 2

*Kurzfassung: ja*

**Untertitel**

The plan names the places, the order and the tests. A second decision, before an agent writes code.

### K15 · Controlled execution

*Kurzfassung: ja*

**Untertitel**

Agents act — the execution proves. The agent wrote on a branch in a fenced workspace: only the planned places, with build and tests running alongside. The report records it.

### K16 · Validation gate

*Kurzfassung: ja*

**Untertitel**

Validation gate: it is not the agent who says it works. The tests ran against the running application, and the run showed it.

### K17 · Waiting point 3 and delivery

*Kurzfassung: ja*

**Untertitel 1**

Third decision: delivery remains an engineering decision.

**Untertitel 2**

Delivery readiness: the branch is on origin, the pull request is prepared. Nine phases, three decisions, one chain, and nothing was computed twice.

---

## Akt 3 · The result

### K18 · Changes

*Kurzfassung: ja*

**Untertitel**

The result is not a chat. It is a branch with diff, tests and report: readable in the tool, continued in the editor.

### K19 · GitHub

*Kurzfassung: ja*

**Untertitel**

On origin: two files in the collection service, one test in the test suite. Traceable to the line, reviewable like any other change.

### K20 · History

*Kurzfassung: ja*

**Untertitel**

The history keeps the chain: every run, every decision, every duration. Computed once, taken over in seconds today.

### K21 · The second world

*Kurzfassung: ja*

**Untertitel 1**

The same application, with the collection service built from the delivered branch. The header band says so: main + codegen/STROM-4.

**Untertitel 2**

Before € 373.80. After € 372.00. Same data, a different rule.

### K22 · Closing card

*Kurzfassung: ja*

**Schlusskarte**

> The AI proposes. The evidence checks. The human decides — and carries the responsibility.
>
> The approach is transferable. The experience is there.

