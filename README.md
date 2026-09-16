# corvee

Corvee, c'est un repo contenant les librairies utilisées par [corvee-bib](https://github.com/bibudem/corvee-bib) pour moissonner, analyser et rapporter l'état des liens du site Web de la Direction des bibliothèques de l'Université de Montréal.

Ce dépôt est géré comme un ensemble de *workspaces* npm, orchestrés par [Lerna](https://lerna.js.org/), et regroupe 3 paquets :

| Paquet | Rôle |
| --- | --- |
| [`@corvee/core`](#corveecore) | Utilitaires communs (journalisation, gestion et normalisation des URL) partagés par les autres paquets. |
| [`@corvee/harvester`](#corveeharvester) | Moissonneur de liens basé sur [Crawlee](https://crawlee.dev/) et [Playwright](https://playwright.dev/) : parcourt un site Web et produit les enregistrements bruts (statuts HTTP, redirections, erreurs, etc.). |
| [`@corvee/processor`](#corveeprocessor) | Traite les enregistrements produits par `@corvee/harvester` à l'aide d'une suite de filtres afin de générer des rapports (liens brisés, redirections à corriger, etc.). |

Voir la section [Paquets](#paquets) ci-dessous pour le détail de chacun.

Ce dépôt ne se lance pas seul : c'est le projet [corvee-bib](https://github.com/bibudem/corvee-bib) qui consomme ces 3 paquets (via des dépendances `file:../corvee/packages/...`) pour exécuter le moissonnage, le traitement et la mise à jour de la base de données. Consultez le README de `corvee-bib` pour le déroulement complet, de l'exécution jusqu'à la mise à jour de MongoDB.

## Prérequis

- Node.js version 18.0.0 ou supérieure (voir le champ `engines` de `package.json`).
- Ce dépôt doit être cloné **au même niveau** que `corvee-bib` (c.-à-d. dans un dossier `corvee` voisin de `corvee-bib`), puisque ce dernier référence les paquets d'ici par chemin relatif.

## Installation

Chaque paquet (`core`, `harvester`, `processor`) déclare ses propres dépendances dans son `package.json` et possède son propre `package-lock.json`. Installez-les en exécutant `npm ci` séparément dans chacun des 3 sous-dossiers :

```
cd packages/core && npm ci
cd packages/harvester && npm ci
cd packages/processor && npm ci
```

Comme pour `corvee-bib`, privilégiez `npm ci` à `npm install` : l'installation se fait alors strictement à partir de `package-lock.json`, ce qui garantit un résultat identique et reproductible sur tous les postes ainsi qu'en intégration continue.

`@corvee/harvester` dépend de Playwright, qui télécharge automatiquement les navigateurs nécessaires (Chromium) lors de l'installation, via son propre script `postinstall`. Si ce téléchargement échoue (proxy, pare-feu, etc.), vous pouvez le relancer manuellement :

```
npx playwright install chromium
```

Aucune étape de compilation n'est requise : les 3 paquets sont distribués sous forme de code source JavaScript natif (modules ES) et sont utilisables directement après l'installation.

## Utilisation depuis corvee-bib

Une fois ce dépôt installé, retournez dans le projet `corvee-bib` et exécutez-y `npm ci` : npm résoudra automatiquement les dépendances `@corvee/core`, `@corvee/harvester` et `@corvee/processor` vers les paquets présents dans ce dépôt. Le déroulement du moissonnage, du traitement des données et de la mise à jour de la base de données MongoDB est documenté dans le [README de corvee-bib](../corvee-bib/README.md).

## Paquets

### `@corvee/core`

Utilitaires communs partagés par `@corvee/harvester` et `@corvee/processor` :

- **`logger`** : configuration de journalisation commune (basée sur `winston`/`tracer`) ;
- **`uri`** : normalisation, canonicalisation et validation d'URL (`normalize-url`, `canonicalize-url`, `is-valid-url`, `abs-url`, etc.) ;
- **`utils`** : fonctions utilitaires diverses (calcul de clé unique, inspection d'objets).

```js
import { normalizeUrl, logger } from '@corvee/core'
```

### `@corvee/harvester`

Moissonneur de liens basé sur Crawlee et Playwright. Il parcourt un site Web à partir d'une ou plusieurs URL de départ et produit, pour chaque page visitée, un enregistrement (`record`) contenant les informations pertinentes à l'analyse de l'état des liens : statut HTTP, redirections, temps de réponse, type de ressource, erreurs réseau, etc.

Ce paquet expose un exécutable `cv` à des fins de test manuel (voir `npx cv --help` pour la liste des options) :

```
npx cv https://bib.umontreal.ca
```

Utilisation programmatique :

```js
import { Corvee as Harvester } from '@corvee/harvester'

const harvester = new Harvester({
  maxConcurrency: 1,
  maxRequestsPerCrawl: 1,
  navigationOnly: true
})

harvester.on('record', record => {
  // traiter l'enregistrement
})

harvester.addUrl('https://bib.umontreal.ca')
harvester.run()
```

Dans `corvee-bib`, c'est `npm run harvest` (et non cette CLI) qui utilise ce paquet, avec sa propre configuration (`config/harvester.js`).

### `@corvee/processor`

Analyse les enregistrements produits par `@corvee/harvester` à l'aide d'une suite de filtres, afin de produire des rapports sur l'état des liens (erreurs HTTP, redirections à corriger, liens circulaires, etc.).

À l'installation, un script `postinstall` (`packages/processor/scripts/check-version.js`) vérifie que la version de Node.js utilisée respecte l'exigence du champ `engines` du `package.json` (≥ 18.1.0) et affiche un avertissement dans le cas contraire.

Le dossier `packages/processor/filters` contient les filtres disponibles (préfixés par catégorie : `http-30x-*` pour les redirections, `net-*` pour les erreurs réseau, `url-*` pour le nettoyage d'URL, etc.). C'est dans ce paquet, par exemple, que sont ajoutés ou ajustés les filtres d'exclusion utilisés par `corvee-bib` (voir le dossier `filters` de `corvee-bib`, qui s'appuie sur ceux-ci).

Utilisation programmatique :

```js
import { CorveeProcessor } from '@corvee/processor'

const processor = new CorveeProcessor({
  filters: [
    // liste des filtres à appliquer
  ],
  errorLevel: 'error'
})

processor.on('report', report => {
  // traiter le rapport généré
})

processor.process(records) // records provenant de @corvee/harvester
```

Dans `corvee-bib`, c'est `npm run process -- --job=<identifiant de la job>` qui utilise ce paquet, avec sa propre configuration.

## Développement

Le script suivant génère les déclarations de types TypeScript (`.d.ts`) à des fins d'aide à l'édition, à partir du code source JavaScript. Il n'est pas requis pour l'exécution des paquets :

```
npm run tsc
```

## Auteur

Christian Rémillard

## Licence

Ce projet est sous licence ISC. Veuillez consulter le fichier `LICENSE` pour plus d'informations.
