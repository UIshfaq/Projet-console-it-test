# 📱 Application Technicien (MVP)

Application mobile destinée aux techniciens en intervention (MVP).
Gère l'authentification, la liste des interventions, les détails et la géolocalisation.

**Stack Technique :**
- **Mobile :** React Native (Expo)
- **Backend :** Node.js (Express) + Knex.js
- **Base de données :** MySQL (via Docker)

---

## 🛠 Prérequis

* [Node.js](https://nodejs.org/)
* [Docker](https://www.docker.com/) & Docker Compose
* [Expo Go](https://expo.dev/client) (sur votre mobile) ou un émulateur.

---

## 🚀 Installation & Configuration

### 1. Installation des dépendances

Placez-vous dans les dossiers respectifs pour installer les librairies :

```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install
```

### 2. Configuration de la base de données
Créez un fichier `.env` dans le dossier `backend` et a la racine avec les variables suivantes :

```env
PORT=3000
DB_HOST=db
DB_USER=user_database
DB_PASSWORD=password123
DB_NAME=name_database
DB_PORT=3306
MYSQL_ROOT_PASSWORD=rootpassword
JWT_SECRET=votre_super_secret_jwt
```

Créez un fichier `.env` dans le dossier `mobile` avec les variables suivantes :

```env
EXPO_PUBLIC_API_URL="http://votreAdresseIP:3000"
```

### 3. Démarrage de la base de données
```bash
docker compose up --build
```

### 4. Initialisation de la base de données
Dans le dossier `backend`, exécutez les migrations et les seeds :
```bash
cd backend

# Créer les tables
npx knex migrate:latest

# Remplir avec les fausses données
npx knex seed:run
```

### 5. Démarrage 
Démarrez le serveur backend :
```bash
cd mobile

npm start

# tester sur web ou expo go
```