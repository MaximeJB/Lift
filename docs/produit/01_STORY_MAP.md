# 01_STORY_MAP.md — Story Map (Jeff Patton)

**Date** : 08/06/2026  
**Méthode** : Story Mapping (Jeff Patton) — axe horizontal = parcours utilisateur, axe vertical = priorité  
**Sources** : `Spec.md`, `ROADMAP.md`, code réel des 4 apps Django

---

## Constat préalable : zéro colonne frontend traversée de bout en bout

Le projet a construit 4 apps backend (accounts, liftapp, bjjapp, nutrition) avec models, serializers, views et URLs. Mais **il n'existe aucun fichier frontend** dans le dépôt : pas de `package.json`, pas de dossier `app/`, `mobile/` ou `frontend/`. Aucune colonne du parcours utilisateur n'est traversée de bout en bout. Un utilisateur réel ne peut interagir avec l'application qu'en faisant des requêtes HTTP brutes (Postman/curl), ce qui n'est pas un produit.

Source : inspection de l'arborescence complète — seuls des fichiers Python, JSON et Markdown existent.

---

## Story Map

```
PARCOURS  │ S'inscrire /    │ Trouver un      │ Faire une séance  │ Revoir sa         │ Suivre son BJJ   │ Gérer son profil
UTILISAT. │ se connecter    │ exercice        │ de musculation    │ progression       │                  │ & données
══════════╪═════════════════╪═════════════════╪═══════════════════╪═══════════════════╪══════════════════╪══════════════════
          │ S'inscrire      │ Parcourir la    │ Choisir un        │ Voir l'histori-   │ Logger une       │ Voir mon profil
          │ par email       │ liste d'exos    │ template de       │ que de mes        │ séance BJJ       │
          │                 │                 │ séance            │ séances           │ (rolls)          │
          │                 │                 │                   │                   │                  │
LIGNE MVP ├─────────────────┼─────────────────┼───────────────────┼───────────────────┼──────────────────┼──────────────────
(Must)    │                 │                 │                   │                   │                  │
          │ Se connecter    │ Rechercher un   │ Enregistrer une   │ Voir le détail    │ Voir ma          │ Modifier mon
          │ avec email +    │ exercice par    │ série (poids +    │ d'une séance      │ ceinture         │ email / pseudo
          │ password        │ nom / muscle    │ reps)             │ passée            │ actuelle         │
          │                 │                 │                   │                   │                  │
          │ Recevoir un     │ Voir la fiche   │ Lancer le timer   │ Voir mon PR       │ Enregistrer      │ Voir mon poids
          │ JWT (access +   │ d'un exercice   │ de repos entre    │ sur un exercice   │ une promotion    │ corporel
          │ refresh)        │ (muscles, vidéo)│ les séries        │                   │ de ceinture      │ (courbe)
══════════╪═════════════════╪═════════════════╪═══════════════════╪═══════════════════╪══════════════════╪══════════════════
(Should)  │                 │                 │                   │                   │                  │
          │ Rafraîchir      │ Filtrer par     │ Modifier / suppr. │ Voir le volume    │ Logger les       │ Export CSV
          │ son token JWT   │ groupe muscu-   │ une série en      │ total par semaine │ soumissions      │ de mes données
          │                 │ laire           │ cours de séance   │                   │ (données / reçues│
          │                 │                 │                   │                   │                  │
          │                 │                 │ Faire une séance  │ Graphique de      │ Stats BJJ        │
          │                 │                 │ libre (sans       │ progression d'un  │ (ratio subs,     │
          │                 │                 │ template)         │ exercice          │ fréquence)       │
══════════╪═════════════════╪═════════════════╪═══════════════════╪═══════════════════╪══════════════════╪══════════════════
(Could)   │                 │                 │                   │                   │                  │
          │ Se connecter    │ Créer un        │ Réordonner des    │ Comparer deux     │ Thème technique  │ Dark mode
          │ avec Google     │ exercice custom │ exercices dans    │ séances           │ du jour          │
          │ (OAuth)         │                 │ une séance        │                   │                  │
          │                 │                 │                   │                   │                  │
          │ Se connecter    │ Partager un     │ Mode superset     │ Notification push │ Objectif         │ Mensurations
          │ avec Apple      │ template        │                   │ nouveau PR        │ mensuel sessions │ corporelles
══════════╪═════════════════╪═════════════════╪═══════════════════╪═══════════════════╪══════════════════╪══════════════════
(Won't    │                 │                 │                   │                   │                  │
│ MVP)    │ Inscription     │ Marketplace     │ Coaching IA       │ 1RM calculé auto  │ Compétitions BJJ │ Features sociales
          │ par téléphone   │ de templates    │ automatique       │ (formule Epley)   │ (planning)       │ (follow, explore)
          │                 │                 │                   │                   │                  │
          │                 │                 │                   │ Export PDF        │                  │ Calories / macros
```

---

## État réel par colonne (référence code)

| Colonne | Backend | Frontend | Verdict |
|---------|---------|----------|---------|
| S'inscrire / se connecter | [EXISTE & FONCTIONNE] `accounts/views.py`, `accounts/urls.py` | [ABSENT] Zéro écran | Pas de flux utilisateur |
| Trouver un exercice | [EXISTE MAIS CASSÉ] `liftapp/views.py:17` — SyntaxError models.py | [ABSENT] | Pas de flux utilisateur |
| Faire une séance | [EXISTE MAIS CASSÉ] `liftapp/views.py:48-65` | [ABSENT] | Pas de flux utilisateur |
| Revoir sa progression | [PRÉVU, ABSENT] Aucun endpoint /stats/ | [ABSENT] | Pas de flux utilisateur |
| Suivre son BJJ | [EXISTE & FONCTIONNE] `bjjapp/views.py` (BeltPromotion uniquement) | [ABSENT] | Pas de flux utilisateur |
| Gérer profil | [EXISTE & FONCTIONNE] `accounts/views.py:54` | [ABSENT] | Pas de flux utilisateur |

---

## Ligne MVP — Justification

La ligne MVP est tracée après les fonctionnalités **Must** car :
1. L'inscription, le login et l'enregistrement d'une séance sont le coeur du produit (ROADMAP.md:Milestone 3-4)
2. La visualisation de la progression (PRs, historique) est la raison première d'utiliser une app de tracking — elle est dans le MVP mais dans la tranche inférieure
3. Le BJJ et le profil sont des fonctionnalités importantes mais secondaires par rapport au flux muscu (ROADMAP.md:Milestone 9 = post-MVP BJJ)

**Ce qui est au-dessus de la ligne (Must) représente ~6-8 semaines de travail** selon ROADMAP.md.
