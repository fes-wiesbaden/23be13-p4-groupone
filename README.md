# GradeSave

Ein modernes Notenverwaltungssystem, entwickelt mit React, Spring Boot und PostgreSQL. GradeSave bietet eine intuitive Oberfläche für Lehrer und Administratoren zur effizienten Verwaltung von Kursen, Schülern, Noten und Projekten.

## Funktionen

- Moderne Benutzeroberfläche mit Light/Dark Mode
- Benutzerverwaltung mit rollenbasierter Zugriffskontrolle (Admin, Lehrer, Schüler)
- Kursverwaltung zur Organisation von Klassen und Fächern
- Umfassende Notenverwaltung
- Projektverwaltung für Aufgaben und Kursarbeiten
- CSV Import/Export für Massendatenoperationen
- Sichere Authentifizierung mit Session-Management

## Schnellstart

### Voraussetzungen

Folgende Software muss installiert sein:
- Docker Desktop (mit Docker Compose)
- Java 17+ (für lokale Backend-Entwicklung)
- Node.js 18+ und npm (für lokale Frontend-Entwicklung)
- Git

### Installation

1. Repository klonen
   ```bash
   git clone https://github.com/fes-wiesbaden/23be13-p4-groupone.git
   cd 23be13-p4-groupone
   ```

2. Umgebungsvariablen konfigurieren
   
   Erstellen Sie eine `.env` Datei im Hauptverzeichnis mit folgendem Inhalt:

   ```env
   POSTGRES_USER=gradesave
   POSTGRES_PASSWORD=gradesave123
   POSTGRES_DB=gradesave
   VITE_API_URL=http://localhost:8080
   APP_INIT_DEFAULT_USERS=true
   APP_DEFAULT_ADMIN_USERNAME=admin
   APP_DEFAULT_ADMIN_PASSWORD=admin
   APP_DEFAULT_TEACHER_USERNAME=teacher
   APP_DEFAULT_TEACHER_PASSWORD=teacher
   APP_DEFAULT_STUDENT_USERNAME=student
   APP_DEFAULT_STUDENT_PASSWORD=student
   ```

### Anwendung starten

#### Variante 1: Lokale Entwicklung (empfohlen für Entwicklung)

Bei dieser Variante laufen Frontend und Backend lokal, während die Datenbank in Docker läuft.

1. Datenbank starten
   ```bash
   docker compose up db -d
   ```

2. Backend starten (in einem neuen Terminal)
   ```bash
   cd backend
   ./gradlew bootRun
   ```
   
   Das Backend ist erreichbar unter `http://localhost:8080`

3. Frontend starten (in einem weiteren Terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   Das Frontend ist erreichbar unter `http://localhost:5173`

4. Anwendung aufrufen
   - Browser öffnen und zu `http://localhost:5173` navigieren
   - Anmelden mit Standard-Zugangsdaten:
     - Admin: `admin` / `admin`
     - Lehrer: `teacher` / `teacher`
     - Schüler: `student` / `student`

#### Variante 2: Vollständiges Docker-Setup (produktionsähnliche Umgebung)

Alle Komponenten (Frontend, Backend und Datenbank) werden in Docker-Containern ausgeführt.

```bash
docker compose up -d
```

Die Anwendung ist dann erreichbar unter `http://localhost:3000`

Logs anzeigen:
```bash
docker compose logs -f
```

Container stoppen:
```bash
docker compose down
```

## Port-Konfiguration

| Service  | Host-Port | Container-Port | Beschreibung |
|----------|-----------|----------------|--------------|
| Frontend | 3000      | 3000           | React Anwendung |
| Backend  | 8080      | 8080           | Spring Boot API |
| Database | 5432      | 5432           | PostgreSQL Datenbank |

Hinweis: Die Datenbank verwendet Port 5432 auf dem Host.

## Entwicklung

### Backend-Entwicklung

```bash
cd backend

# Tests ausführen
./gradlew test

# Anwendung bauen
./gradlew build

# Mit Hot Reload starten
./gradlew bootRun
```

### Frontend-Entwicklung

```bash
cd frontend

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Typprüfung durchführen
npm run typecheck
```

## Docker-Befehle

### Nützliche Befehle

- Alle Container stoppen
  ```bash
  docker compose down
  ```

- Container stoppen und alle Daten entfernen
  ```bash
  docker compose down -v
  ```

- Images neu bauen
  ```bash
  docker compose up -d --build
  ```

- Logs für einen bestimmten Service anzeigen
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f db
  ```

- Datenbank-Shell öffnen
  ```bash
  docker compose exec db psql -U gradesave -d gradesave
  ```

## Commit-Konventionen

Dieses Projekt folgt der [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) Spezifikation.

Format: `<type>(<scope>): <description>`

Typen:
- `feat`: Neue Funktionalität
- `fix`: Fehlerbehebung
- `docs`: Dokumentationsänderungen
- `style`: Code-Stil-Änderungen (Formatierung, etc.)
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen oder aktualisieren
- `chore`: Wartungsaufgaben

Beispiel:
```bash
git commit -m "feat(grades): CSV-Export hinzugefügt"
```

## Weitere Dokumentation

- [CSV Import/Export Anleitung](docs/csv.md)

## Mitwirken

1. Erstellen Sie einen Feature-Branch von `main`
2. Nehmen Sie Ihre Änderungen vor und beachten Sie die Commit-Konventionen
3. Testen Sie Ihre Änderungen gründlich
4. Erstellen Sie einen Pull Request

## Lizenz
GPLv3

## Team

Entwickelt von Gruppe One (Michael Holl, Daniel Hess, Paul Geisthardt, Noah Bach, Kebba Cessay, Yvan Kamgang) - P4 2025

---

Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklungsteam oder erstellen Sie ein Issue im Repository.