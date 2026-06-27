# DevForge AI

An AI-powered Software Engineering IDE — design architecture, generate code, run it, all in one place.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19 + Vite + Monaco Editor     |
| Backend  | Spring Boot 3.5 + Java 21           |
| Database | MySQL 8                             |
| AI       | OpenRouter (multi-model routing)    |

---

## Getting Started

### Prerequisites

- Java 21
- Maven 3.8+
- Node.js 18+
- MySQL 8
- An [OpenRouter](https://openrouter.ai) account (free tier works)

---

### 1. Clone

```bash
git clone https://github.com/Shekhar3400/DevForge-AI.git
cd DevForge-AI
```

---

### 2. Configure Backend

```bash
cd backend/src/main/resources
cp application.yml.example application.yml
```

Edit `application.yml` and fill in:

| Key | Where to get it |
|-----|----------------|
| `spring.datasource.password` | Your MySQL root password |
| `security.oauth2.client.registration.google.client-id` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `security.oauth2.client.registration.google.client-secret` | Same as above |
| `jwt.secret` | Any random string, min 32 characters |
| `openrouter.keys` | [openrouter.ai](https://openrouter.ai) → Keys |

> `application.yml` is gitignored — your secrets stay local.

---

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`

---

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

---

### 5. Production Build (optional)

Build frontend into backend static resources:

```bash
cd frontend
npm run build

cd ../backend
mvn package
java -jar target/devforge-ai-1.0.0.jar
```

Single app at `http://localhost:8080`

---

## Features

- **Architecture Canvas** — drag-drop nodes, AI auto-generates architecture + connections
- **Modules & Features** — every node has modules, every module has features
- **AI Full Generate** — type a prompt, AI designs the whole system end-to-end
- **Project Explorer** — VS Code-style file tree with AI file generation
- **Monaco Editor** — multi-tab, run code in 15+ languages, AI modify files
- **Multi-tenant** — complete user isolation, JWT authentication, 403 on unauthorized access
- **Smart Edges** — connection metadata: protocol, data format, endpoints, description

---

## Security

- JWT-based authentication — secrets never leave the backend
- Every API verifies ownership — users can only access their own projects
- `application.yml` is gitignored — never committed to version control
- HTTPS-ready — enable `secure: true` in prod profile
