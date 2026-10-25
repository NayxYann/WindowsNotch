# WindowsNotch

Application Windows légère avec une notch interactive pour les commandes du média en cours et l'accès aux paramètres.

## Première version

- Notch compacte et commandes de lecture des médias Windows.
- Paramètres accessibles depuis la notch.
- Vérification des mises à jour au démarrage et bouton d'installation dans les paramètres.
- Publication de versions Windows signées depuis GitHub Actions.

## Obtenir une version de test

Les builds de prévisualisation sont fabriquées automatiquement par GitHub Actions. Il n'est pas nécessaire d'installer les outils de développement sur le PC pour télécharger l'application.

## Publier une mise à jour

Une fois les secrets de signature configurés, ouvrir l'onglet **Actions**, choisir **Publier une version Windows**, cliquer sur **Run workflow** et saisir un nouveau numéro de version (par exemple `0.1.1`). GitHub compile l'application, crée une Release et publie le fichier de mise à jour signé. L'application installée détecte ensuite cette version et propose de l'installer.

## Signature de l'updater

Le dépôt utilise deux valeurs de signature :

- La variable de dépôt `TAURI_SIGNING_PUBLIC_KEY`, intégrée à l'application pour vérifier les téléchargements.
- Le secret Actions `TAURI_SIGNING_PRIVATE_KEY`, utilisé uniquement pendant la publication.

Si la clé privée a un mot de passe, le stocker dans le secret Actions `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Ne jamais committer ni partager la clé privée.
