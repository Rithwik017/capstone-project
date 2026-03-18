# Clinic Management System

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- Node.js ≥ 18 + npm (for the frontend dev server)

---

### Backend (C# .NET 8 Web API)

```bash
cd backend
dotnet build ClinicManagement.sln
dotnet run --project ClinicManagement.Api
```

The API starts on **http://localhost:5000** by default.

Available endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/patients`               | List all patients |
| POST | `/patients`               | Register a new patient |
| GET  | `/appointments`           | List all appointments |
| POST | `/appointments`           | Book a new appointment |
| PUT  | `/appointments/{id}/status` | Update appointment status |

#### Run backend unit tests

```bash
cd backend
dotnet test ClinicManagement.Tests
```

---

### Frontend (TypeScript + Bootstrap SPA)

The SPA lives in `src/index.html` and is built from `src/main.ts`.

#### Development server (Vite)

```bash
npm install
npm run dev
```

Then open the URL shown by Vite and navigate to `/src/index.html`.

> **Note:** The SPA calls the backend at `http://localhost:5000`. Start the backend first.

---

### Project Structure

```
backend/
  ClinicManagement.sln
  ClinicManagement.Core/           # Models, Interfaces, Exceptions
  ClinicManagement.Infrastructure/ # In-memory repositories
  ClinicManagement.Services/       # Business logic (PatientService, AppointmentService)
  ClinicManagement.Api/            # ASP.NET Core Web API (Controllers, Program.cs)
  ClinicManagement.Tests/          # xUnit unit tests

src/
  index.html          # Bootstrap SPA shell
  main.ts             # SPA entry point & router
  api.ts              # fetch-based API client
  interfaces.ts       # TypeScript interfaces matching backend DTOs
  styles.css          # Minimal supplemental styles
  components/
    patients.ts       # Patient list + registration form
    appointments.ts   # Appointment list + booking form (shows double-booking errors)
```
