---
id: "tests-e2e-12-choix-outillage-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "e2e"]
order: "e12"
---
# E2E 12 — trancher l'outillage, et sa contrainte de plateforme

**Objectif** : decider AVANT d'ecrire un seul parcours, parce que la contrainte est dure.

## La contrainte

**Les tests E2E iOS exigent macOS.** Detox comme Maestro pilotent le simulateur iOS, qui
n'existe pas sous Windows. Sur cette machine, trois options seulement :

1. **Maestro et emulateur Android** — tourne sous Windows, syntaxe YAML, s'accroche a une
   build Expo. Ne teste pas iOS, donc pas la plateforme cible.
2. **Detox et emulateur Android** — plus rapide a l'execution, bien plus fragile a
   configurer.
3. **Une ferme d'appareils** (EAS Build plus Maestro Cloud ou equivalent) — teste iOS pour
   de vrai, coute de l'argent et un compte.

Decider laquelle, et l'ecrire dans un `DECISIONS.md`. Les tickets 13 a 16 en dependent
entierement.
