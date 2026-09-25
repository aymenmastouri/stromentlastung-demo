/**
 * English cards and subtitles of the demonstration video: a faithful
 * translation of texte.ts (drehbuch.md, version 2, section 3). Same chapters,
 * same keys, same order; the spec picks this table with SPRACHE=en. A change
 * of wording in German is a change here too — `npm run typen` fails when a key
 * exists in one language only.
 *
 * The reference procedure itself stays German in both versions: it is a German
 * public-sector procedure, and its screens, amounts and the ticket are shown as
 * they are. The subtitles carry the meaning.
 */

import type { Akt, Kapitel } from "./texte.ts";

export const AKTE_EN: Readonly<Record<Akt, string>> = {
  1: "The assignment",
  2: "The run",
  3: "The result",
};

export const TITEL_EN = {
  haupt: "From requirement to delivery",
  neben: "one continuous, governed, verifiable process.",
} as const;

export const KAPITEL_EN = {
  K1: {
    nr: 1,
    akt: 1,
    titel: "Title card",
    kurz: true,
    karte: ["One public-sector procedure. One ticket. One chain to the branch."],
    text: {},
  },
  K2: {
    nr: 2,
    akt: 1,
    titel: "The procedure",
    kurz: true,
    karte: [
      "Electricity is taxed.",
      "Manufacturing companies get part of it back: the tax relief under § 9b of the German Electricity Tax Act, applied for at the main customs office for one year of consumption.",
      "If too much was paid out, an amending notice is issued and the difference is reclaimed.",
      "Whoever does not pay the reclaimed amount by its due date owes late-payment surcharges.",
    ],
    text: {
      a: "The reference procedure is rebuilt and simplified: created by AI from public sources only. Not a procedure of the customs administration, no relation to any Capgemini client project.",
    },
  },
  K3: {
    nr: 3,
    akt: 1,
    titel: "Sign-in and cases",
    kurz: true,
    text: {
      a: "The clerk of the office signs in. The header band names the state the services run on: main.",
      b: "The office keeps its cases in a list: file number, company, year, state and assessed amount, filterable by state. The case we are about to see is one of many.",
    },
  },
  K4: {
    nr: 4,
    akt: 1,
    titel: "Reclaims",
    kurz: true,
    text: {
      a: "An open reclaim: € 6,230.00, due in March, six months begun in arrears — counted up to the day the ticket names. Late-payment surcharge: € 373.80.",
      b: "That figure cannot be right. A late-payment surcharge is one percent per month of an amount first rounded down to full 50 euros. It never ends in 80 cents.",
    },
  },
  K5: {
    nr: 5,
    akt: 1,
    titel: "The case",
    kurz: false,
    text: {
      a: "Inside the case, under payments, the same amount. The clerk knows no more, and needs to know no more: they report what they see.",
    },
  },
  K6: {
    nr: 6,
    akt: 1,
    titel: "The ticket in the browser",
    kurz: true,
    text: {
      a: "The report becomes an assignment: a ticket as the team always writes it — use case, observed amount, the regulation, acceptance criteria. No prompt.",
      b: "What it says: an amount and a rule. What it does not say: where the defect is and how large it is. That is exactly the work ahead.",
    },
  },
  K7: {
    nr: 7,
    akt: 2,
    titel: "Settings",
    kurz: true,
    text: {
      a: "Own data. Own rules. Own AI. The platform mode is decided once, when the run starts: SovAI, Capgemini's sovereign platform. Offline would be the local platform on this machine, with the same rules.",
      b: "Reuse of finished work: work whose inputs have not changed since the last run is taken over, not computed again. The run ahead shows what that means.",
    },
  },
  K8: {
    nr: 8,
    akt: 2,
    titel: "The ticket in the tool",
    kurz: true,
    text: {
      a: "The ticket comes live from Jira, with its links. From here a first solution concept could be drafted straight from the code base — we leave that to the pipeline.",
      b: "Use in pipeline: the ticket is now the task of the run. One task, one run, nothing in parallel.",
    },
  },
  K9: {
    nr: 9,
    akt: 2,
    titel: "The run starts",
    kurz: true,
    text: {
      a: "Before the run: seven repositories on main, each at its commit. Model services and vector store answer. The whole way: nine phases, linear, one ticket.",
    },
  },
  K10: {
    nr: 10,
    akt: 2,
    titel: "The knowledge stands",
    kurz: true,
    text: {
      a: "Facts first — without AI. Inventory, facts, understanding and dossier stand from the first contact with the code and are taken over.",
      b: "What has not changed is not computed again. When the code base changes, the tool recomputes exactly that, and every result states which inputs it comes from.",
    },
  },
  K11: {
    nr: 11,
    akt: 2,
    titel: "A tour of the knowledge",
    kurz: true,
    text: {
      a: "Architecture facts: read from the code without AI. Every relation with file and line.",
      b: "Architecture synthesis: the AI explains the code base, checked against the facts. Where the facts are silent, it says so.",
      c: "Architecture dossier: sixteen chapters — C4 levels 1 to 4 and arc42 §1 to §12 —, each with evidence and scored by a separate reviewer. The AI writes. Review is separate. Three chapters are shown here as examples.",
      d: "C4, level 1: the system context. Who talks to the procedure, what it needs from outside — a whole document, not a slide.",
      e: "arc42, building block view: which services the procedure consists of and how they fit together. Read from the code, not from yesterday's drawing.",
      f: "arc42, runtime view: how a case runs through the services. On this understanding, triage is about to look for the cause.",
    },
  },
  K12: {
    nr: 12,
    akt: 2,
    titel: "Solution triage",
    kurz: true,
    text: {
      v: "First the understanding of the ticket: goal, current state against target state, affected scope — written down before anything is proposed.",
      t: "Then the technical context: which services, which classes, which contracts the case touches. This is the ground the concept is about to stand on.",
      a: "Solution triage: the ticket is read against the code base. Here the regulation from the ticket and the method in the code meet for the first time — that is where the work lies.",
      a2: "Cause: SaeumnisRechner.berechne takes one percent of the unrounded amount, 6 × € 6,230.00 / 100 = € 373.80. The rounding down to full 50 euros under § 240 of the Fiscal Code is missing.",
      b: "Fix: round down before taking the percentage. € 6,230.00 becomes € 6,200.00, the surcharge € 372.00. A new test covers an amount not divisible by 50.",
      c: "Every statement carries its evidence: file and line. The guardrails check evidence, change sites and the coverage of the acceptance criteria before a person sees the concept.",
    },
  },
  K13: {
    nr: 13,
    akt: 2,
    titel: "Waiting point 1: the concept",
    kurz: true,
    text: {
      a: "The run stops where a decision is made. The AI proposes. The evidence checks. The human decides — and carries the responsibility.",
      b: "Continue chain: the phases before stand, the plan is taken over. What is decided stays decided; what stands is not computed again.",
    },
  },
  K14: {
    nr: 14,
    akt: 2,
    titel: "Delivery plan and waiting point 2",
    kurz: true,
    text: {
      a: "The plan names the places, the order and the tests. A second decision, before an agent writes code.",
    },
  },
  K15: {
    nr: 15,
    akt: 2,
    titel: "Controlled execution",
    kurz: true,
    text: {
      a: "Agents act — the execution proves. The agent wrote on a branch in a fenced workspace: only the planned places, with build and tests running alongside. The report records it.",
    },
  },
  K16: {
    nr: 16,
    akt: 2,
    titel: "Validation gate",
    kurz: true,
    text: {
      a: "Validation gate: it is not the agent who says it works. The tests ran against the running application, and the run showed it.",
    },
  },
  K17: {
    nr: 17,
    akt: 2,
    titel: "Waiting point 3 and delivery",
    kurz: true,
    text: {
      a: "Third decision: delivery remains an engineering decision.",
      b: "Delivery readiness: the branch is on origin, the pull request is prepared. Nine phases, three decisions, one chain, and nothing was computed twice.",
    },
  },
  K18: {
    nr: 18,
    akt: 3,
    titel: "Changes",
    kurz: true,
    text: {
      a: "The result is not a chat. It is a branch with diff, tests and report: readable in the tool, continued in the editor.",
    },
  },
  K19: {
    nr: 19,
    akt: 3,
    titel: "GitHub",
    kurz: true,
    text: {
      a: "On origin: two files in the collection service, one test in the test suite. Traceable to the line, reviewable like any other change.",
    },
  },
  K20: {
    nr: 20,
    akt: 3,
    titel: "History",
    kurz: true,
    text: {
      a: "The history keeps the chain: every run, every decision, every duration. Computed once, taken over in seconds today.",
    },
  },
  K21: {
    nr: 21,
    akt: 3,
    titel: "The second world",
    kurz: true,
    text: {
      a: "The same application, with the collection service built from the delivered branch. The header band says so: main + codegen/STROM-4.",
      b: "Before € 373.80. After € 372.00. Same data, a different rule.",
    },
  },
  K22: {
    nr: 22,
    akt: 3,
    titel: "Closing card",
    kurz: true,
    karte: [
      "The AI proposes. The evidence checks. The human decides — and carries the responsibility.",
      "The approach is transferable. The experience is there.",
    ],
    text: {},
  },
} as const satisfies Record<string, Kapitel>;
