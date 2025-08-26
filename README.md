# GradeSave
https://www.conventionalcommits.org/en/v1.0.0/

## Docker

### Requirements

- Docker Desktop/Docker Compose
- `.env` with db environment variables

#### .ENV

> [!IMPORTANT] # Goofy ah intellij supported keine blockquotes  
> very basic .env file with just db credentials \
> kp ob wir irgendwas für spring spezifisch brauchen oder nur db connection credentials \
> sleither hatte auf jedenfall irgendeine datei mit secrets in spring \
> kp ob wir was für frontend brauchen 

Create .env in root dir

**Example**

```.env
POSTGRES_USER=example
POSTGRES_PASSWORD=example
POSTGRES_DB=gradesave
```


### Local Development

For local development just start db in container and run Front/Backend locally via gradle/npm

```bash
docker-compose up db -d
```

#### Frontend

```bash
npm install
npm run dev
```

#### Backend

```bash
./gradlew bootRun
```

### Production/Full Setup

To run entire stack in Docker

```bash
docker-compose up -d
```

### Ports

- Backend -> `8080`
- Frontend -> `3000`
- DataBase -> `5433`

### Commands

- Stop all Containers

```bash
docker-compose down
```

- Stop all Containers and delete Containers/Data

```bash
docker-compose down -v
```

- Rebuild images

```bash
docker-compose up -d --build
```

- View Logs

```bash
docker-compose logs -f
```

Or just use docker desktop, idk