# backend/Dockerfile
# KORRIGIERT: COPY-Pfade angepasst für den Build-Kontext des Hauptverzeichnisses.

# Wir verwenden eine neuere, unterstützte Version von Python und Debian ("Bullseye")
FROM python:3.11-slim-bullseye

# Setzen von Umgebungsvariablen für Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Setzen des Arbeitsverzeichnisses im Container
WORKDIR /app

# Kopieren der Anforderungsdatei aus dem 'backend'-Unterordner
COPY backend/requirements.txt .

# Installieren der Python-Abhängigkeiten
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Kopieren des gesamten restlichen Backend-Codes aus dem 'backend'-Unterordner
COPY backend/ .

# Macht das Build-Skript ausführbar
RUN chmod +x /app/build.sh

# Port freigeben, auf dem Gunicorn laufen wird
EXPOSE 8000

# Start-Befehl für den Gunicorn-Server, wird von Render automatisch verwendet
CMD ["gunicorn", "core.wsgi"]
