# frontend/Dockerfile

# Wir verwenden ein offizielles Node.js-Image als Basis
FROM node:16-alpine

# Setzen des Arbeitsverzeichnisses im Container
WORKDIR /app

# Kopieren der package.json und package-lock.json, um Abhängigkeiten zu installieren
# Wir kopieren diese zuerst, damit Docker die Installation nur wiederholt, wenn sich diese Dateien ändern.
COPY package*.json ./

# Installieren der JavaScript-Abhängigkeiten
RUN npm install

# Kopieren des gesamten restlichen Frontend-Codes in den Container
COPY . .

# Öffnen des Ports 3000, damit wir vom Browser aus auf den Entwicklungsserver zugreifen können
EXPOSE 3000
