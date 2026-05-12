# Ares Backend

ASP.NET Core 10 REST API for the Ares Car Rental platform, following Clean Architecture.

## Project structure

```
backend/
├── Api/              # Entry point — controllers, middleware, Program.cs
├── Application/      # Services, DTOs, validators, interfaces, AutoMapper profiles
├── Domain/           # Entities, enums (no dependencies)
├── Infrastructure/   # EF Core DbContext, repositories, migrations
└── Tests/            # xUnit unit tests + FsCheck property tests
```

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| .NET SDK | 10.x | `dotnet --version` |
| dotnet-ef | any | `dotnet tool install -g dotnet-ef` |
| SQL Server | 2022 | Provided via Docker in devcontainer |
| Docker | any | Required for devcontainer |
| fzf | any | Auto-installed by `backend.sh` if missing |

## Quick start (devcontainer)

The devcontainer spins up both the app container and a SQL Server 2022 container automatically.

1. Open the repo in VS Code and click **Reopen in Container**
2. Generate your `.env` file:
   ```bash
   ./scripts/setup-env.sh          # bash — interactive
   ./scripts/setup-env.sh --quick  # bash — use devcontainer defaults
   .\scripts\setup-env.ps1         # PowerShell — interactive
   .\scripts\setup-env.ps1 -Quick  # PowerShell — use devcontainer defaults
   ```
3. Apply database migrations:
   ```bash
   ./scripts/backend.sh    # bash
   .\scripts\backend.ps1   # PowerShell — pick "migrate update"
   ```
4. Run the API:
   ```bash
   ./scripts/backend.sh    # bash — pick "run"
   .\scripts\backend.ps1   # PowerShell — pick "run"
   ```

API is available at `http://localhost:5000`
Swagger UI at `http://localhost:5000/swagger`

## Environment configuration

All secrets and environment-specific settings live in `backend/.env` (gitignored).
The file is never committed — use `backend/.env.example` as the reference.

To generate it interactively (prompts for every value):
```bash
# bash / zsh
./scripts/setup-env.sh

# PowerShell (Windows / pwsh)
.\scripts\setup-env.ps1
```

To copy the example as-is — no prompts, good for devcontainer or CI:
```bash
./scripts/setup-env.sh --quick   # bash
.\scripts\setup-env.ps1 -Quick   # PowerShell
```

ASP.NET Core reads environment variables natively. The `__` double-underscore maps
to JSON section nesting, so `ConnectionStrings__DefaultConnection` overrides
`appsettings.json`'s `ConnectionStrings:DefaultConnection`.

See `backend/.env.example` for all available variables and their descriptions.

## Database migrations

Use the interactive script (recommended):
```bash
./scripts/backend.sh
```

Or run EF commands directly (requires `.env` vars to be exported first):
```bash
# Apply all pending migrations
dotnet ef database update \
  --project backend/Infrastructure \
  --startup-project backend/Api

# Add a new migration
dotnet ef migrations add <MigrationName> \
  --project backend/Infrastructure \
  --startup-project backend/Api

# List migrations
dotnet ef migrations list \
  --project backend/Infrastructure \
  --startup-project backend/Api
```

## Build

```bash
dotnet build backend/Ares.slnx
```

## Tests

```bash
dotnet test backend/Ares.slnx
```

Run with coverage:
```bash
dotnet test backend/Ares.slnx \
  --collect:"XPlat Code Coverage" \
  --results-directory backend/TestResults
```

## Connection string notes

The devcontainer SQL Server uses a self-signed certificate. The connection string
must include `Encrypt=false` to avoid TLS handshake failures with
`Microsoft.Data.SqlClient` v5+:

```
Server=mssql,1433;Database=ares;User=sa;Password=...;TrustServerCertificate=True;Encrypt=false
```

Outside the devcontainer, replace `mssql` with `localhost`.

## Core Services

### Notification Service
The `NotificationService` handles both user-facing notifications and platform-wide admin alerts.
- **Admin Fan-out**: Automatically alerts all administrators when key platform events occur (e.g., new user registration, new supplier submission, vehicle pending review).
- **Extensible**: Integrates with other services via `INotificationService` using a best-effort, non-blocking approach to ensure primary operations remain performant.
