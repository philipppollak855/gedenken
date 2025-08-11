# backend/Dockerfile
# KORRIGIERT: Verwendet ein entrypoint-Skript für Migrationen und Serverstart.

FROM python:3.11-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY backend/ .

# Kopiert das neue entrypoint-Skript in den Container
COPY backend/entrypoint.sh /app/entrypoint.sh
# Macht das Skript ausführbar
RUN chmod +x /app/entrypoint.sh

# Gibt den Port frei, den Render erwartet
EXPOSE 10000

# Führt das entrypoint-Skript aus, wenn der Container startet
CMD ["/app/entrypoint.sh"]
