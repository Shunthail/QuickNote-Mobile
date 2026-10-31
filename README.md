<h1 align="center">QuickNote Mobile</h1>

QuickNote Mobile est une application de prise de notes développée avec React Native, Expo et TypeScript. Elle propose une sauvegarde locale, des tags personnalisables et un mode nuit.

Nous l’avons mise gratuitement à disposition de plusieurs Maisons du Bel Âge et EHPAD pour leur permettre de l’utiliser au quotidien.

Les notes restent disponibles sur l’appareil sans compte ni serveur.

## Installation

### Prérequis

- Git
- Node.js 24 avec npm
- Expo Go sur le téléphone pour tester l’application mobile

### Récupérer le projet

    git clone https://github.com/Shunthail/QuickNote-Mobile.git
    cd QuickNote-Mobile

### Installer les dépendances

    npm ci

### Lancer l’application

    npm start

Scanne le QR code affiché dans le terminal avec ton téléphone. Pour une connexion locale, le téléphone et l’ordinateur doivent être sur le même réseau Wi-Fi.

Sur un iPhone physique, Expo Go et Expo CLI doivent être connectés au même compte Expo. Pour connecter le terminal :

    npx expo login

Si la connexion locale ne fonctionne pas, utilise un tunnel :

    npx expo start --tunnel ngrok

Laisse le terminal ouvert pendant l’utilisation de l’application.

### Aperçu web

Pour ouvrir l’application dans un navigateur :

    npm run web

### Vérifications

Pour vérifier les types et exécuter les tests :

    npm run check

## Fonctionnement

L’application permet de créer, modifier et supprimer des notes. Chaque note peut recevoir une couleur, des tags et être épinglée en haut du carnet.

Les notes et les préférences sont enregistrées localement sur l’appareil. Elles ne sont pas synchronisées entre plusieurs téléphones.

Le carnet est vide au premier lancement. Une option dans les réglages permet de supprimer toutes les notes, les tags et les préférences.

## À propos du projet

QuickNote Mobile a été développé en duo. Nous avons présenté l’application à plusieurs Maisons du Bel Âge et EHPAD puis l’avons mise gratuitement à leur disposition dans le cadre d’une démarche bénévole.

J’ai pris en charge la logique de gestion des notes, leur enregistrement sur l’appareil et leur restauration au lancement de l’application. Mon travail comprenait également le traitement des tags, la recherche et la gestion des erreurs de sauvegarde pour éviter la perte de données.

Pour préserver notre anonymat et la confidentialité des établissements concernés, cette version publique ne contient aucun nom de participant, contact ni donnée issue des présentations.

Ce dépôt accompagne la présentation de mes compétences sur [shunthail.fr](https://shunthail.fr). Il permet notamment aux recruteurs de consulter le projet et son code sans avoir à me contacter au préalable.

## Réutilisation et contact

Vous pouvez utiliser le code ou vous inspirer du projet sans me demander d’autorisation. Un message reste toujours apprécié si ce travail vous aide à lancer un projet ou à développer une idée.

Pour toute question ou demande d’aide, vous pouvez me contacter sur Discord : **shunthail**.
