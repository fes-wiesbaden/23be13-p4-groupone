> [!IMPORTANT]
> WIP, only commit for device transfer

# Test Strategien Projekt

## Table of Contents

0. [Ziele](#ziele)
1. [Backend](#backend-java-spring-boot)
2. [Frontend]()
3. [Docker]()
4. [Datenbank]()
5. [Alles zusammen]()
6. [Ci/Cd]()
7. [Todo]()

## Ziele

- DSGVO konform
- Korrektheit der Daten
- Korrekte berechnungen
- Sicherheit (Authentifizierung, Input Validierung in jedem Layer etc)
- DSGVO konformität (Daten löschen etc)
- Stabilität
- Logs

## Backend (Java/Spring Boot)

- Java 21
- Spring Boot
- REST
- JPA
- Spring Security maybe @Daniel was benutzten

### Tests

- REST Enpoints
- JPA queries
- authentifizierungs tests
- benchmarks (performance test)

## Frontend (Typescript/React/Npm)

- React + Typescript
- Vite als Server

### Tests

- vitets
- netzwerk operationen
- authentifizierungen
- anzeigeeinstellungen
- cookies msg für dsgvo falls notwendig
- ui zum datenlöschen, falls nötig, eventuell dürfen shcüler nicht entscheiden weil für schile ist **TODO**

## Docker

### Tests

- build tests
- ??? was noch

## Datenbank (PostgreSQL)

### Tests

- Constraints
- Deletes (cascade)
- backups (eventuell brauchen für dsgvo) **TODO**

## Alles Zusammen

### Load & Stress Tests

- kp so 1000 User die Seiten Laden + 100 Lehrer die gleichzeitig noten eintragen wollen

## Ci Cd

CI/CD Pipeline für automatisiete Tests/Deploys

### Tools 
- Github Actions

### Strategie
- Bei jedem Push/Pr: 
    - Bauen
    - Unit/Integration Tests

- Automatische Deploy für Lehrerteam



## Todo

- [ ] add here :D
