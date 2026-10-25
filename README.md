# WindowsNotch

Petite application Windows avec une notch interactive pour les commandes du média en cours et l'accès aux paramètres.

## Première version

- Notch compacte, centrée en haut de l'écran et toujours au premier plan.
- Ouverture au survol.
- Détection des sessions média Windows (musique et vidéo) et affichage des informations disponibles.
- Commandes lecture/pause, précédent et suivant.
- Fenêtre de paramètres accessible depuis la notch.
- Compilation Windows automatisée avec GitHub Actions.

Le projet vise d'abord Windows 10/11 x64. Les fonctionnalités seront ajoutées par étapes afin de garder l'application légère.

## Développement et installation

La compilation et les versions de test seront produites par GitHub Actions. Il ne sera pas nécessaire d'installer les outils de développement sur le PC pour télécharger et essayer une version publiée.

## Mises à jour

Les mises à jour intégrées seront activées après la configuration de la signature Tauri. La clé privée de signature doit être stockée dans les secrets GitHub Actions et ne doit jamais être commitée dans ce dépôt.
