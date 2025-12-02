# GradeSave
https://www.conventionalcommits.org/en/v1.0.0/

## Docker

### Requirements

- Docker Desktop/Docker Compose
- `.env` with db environment variables

#### .ENV

Create .env in root dir

**Example**

```.env
POSTGRES_USER=example
POSTGRES_PASSWORD=example
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

### Port Mapping

| Service  | Host Port | Container Port | Notes                            |
|----------|-----------|----------------|----------------------------------|
| Backend  | 8080      | 8080           |                                  |
| Frontend | 3000      | 3000           |                                  |
| Database | 15432     | 5432           | Windows uses 5432 for `iphlpsvc` |


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

Alternatively, you can use Docker Desktop for container managemen