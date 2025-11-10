# Nom du Projet

Une brève description de votre projet.

## Démarrage rapide

Suivez ces instructions pour obtenir une copie du projet opérationnelle sur votre machine locale.

### Prérequis

Assurez-vous que les outils suivants sont installés sur votre système :
*   Node.js
*   npm
*   Docker
*   Docker Compose

### Installation

1.  **Installer les dépendances du Backend**
    Placez-vous dans le répertoire `backend` et exécutez la commande :
    ```sh
    cd backend
    npm install
    ```

2.  **Installer les dépendances de l'application Mobile**
    Placez-vous dans le répertoire `mobile` et exécutez la commande :
    ```sh
    cd ../mobile
    npm install
    ```

3.  **Configurer les variables d'environnement**
    Vous devrez peut-être créer ou mettre à jour un fichier `.env` à la racine du projet ou dans le dossier `backend`. Remplissez-le avec les informations de configuration nécessaires. Par exemple :
    ```env
    # .env example
    DB_HOST=database
    DB_USER=user
    DB_PASSWORD=password

    ```

### Lancement

Pour démarrer l'ensemble de l'application (backend, base de données, etc.), exécutez la commande suivante à la racine de votre projet :

```sh
docker-compose up --build
```

ensuite , pour lancer l'application mobile, ouvrez un nouveau terminal, placez-vous dans le répertoire `mobile` et exécutez :

```sh
cd mobile
npm start
```