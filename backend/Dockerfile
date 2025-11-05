# 1. Partir d'une image Node.js officielle (version 18, légère)
FROM node:18-alpine

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# 3. Copier les fichiers de dépendances
COPY package*.json ./

# 4. Installer les dépendances
# 'npm install' fonctionnera aussi très bien
RUN npm install

# 5. Exposer le port sur lequel votre API Express écoute
# Mettez le port que vous utilisez (ex: 3000, 5000, 8000)
EXPOSE 3000

# 6. La commande par défaut (sera souvent remplacée par docker-compose)
CMD [ "npm", "start" ]