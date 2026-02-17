# 🔍 EventHub — Full-Stack Project Audit & Improvement Plan

> **Date:** February 17, 2026  
> **Scope:** Complete review of frontend (React/Vite), backend (Spring Boot 3), database (MongoDB), security, DevOps, and UX.

---

## 📊 Executive Summary

| Category | Before | After | Status |
|----------|--------|-------|--------|
| **Security** | 2/10 | 7/10 | 🟢 JWT + RBAC implemented |
| **Code Quality** | 4/10 | 6/10 | 🟠 Improved (more work needed) |
| **Project Structure** | 3/10 | 5/10 | 🟠 Better (root duplication remains) |
| **API Design** | 5/10 | 6/10 | 🟠 Auth endpoints added |
| **Error Handling** | 4/10 | 6/10 | 🟢 401/403 handling added |
| **Testing** | 1/10 | 1/10 | 🔴 None (still needed) |
| **DevOps/Docker** | 2/10 | 7/10 | 🟢 Full stack Docker Compose |
| **Documentation** | 4/10 | 7/10 | 🟢 README rewritten |
| **UI/UX** | 7/10 | 8/10 | 🟢 Theme-aware Navbar |
| **Scalability** | 3/10 | 5/10 | 🟠 Better config, still needs caching |

---

## 🐛 DETECTED BUGS

### Critical Bugs

1. **✅ ~BUG-001: Guest auto-login bypasses all security~ — FIXED**
   - **File:** `AuthContext.jsx` — REWRITTEN with JWT auth
   - **Issue:** When no user is saved in localStorage, a hardcoded guest user with `ADMIN` role is automatically created. This means **anyone opening the app is automatically an admin** with no authentication required.
   - **Impact:** Complete security bypass. Any visitor can create/delete events, manage problems, view analytics.

2. **✅ ~BUG-002: Hardcoded admin credentials in frontend~ — FIXED**
   - **File:** `AuthContext.jsx` — All hardcoded bypasses removed. Login now uses JWT via `/api/auth/login`.
   - ~~**Issue:** `admin/admin` is hardcoded as a bypass login.~~
   - **Resolution:** Credentials removed. Auth now uses proper JWT flow.

3. **✅ ~BUG-003: Hardcoded admin user in backend~ — FIXED**
   - **File:** `CustomUserDetailsService.java` — Rewritten. `AdminSeeder.java` creates admin on first startup with configurable credentials via env vars.
   - ~~**Issue:** A hardcoded admin user with a fixed BCrypt hash.~~
   - **Resolution:** Admin user is now created in MongoDB via `AdminSeeder`, fully configurable.

4. **✅ ~BUG-004: Password field exposed in UserResponse DTO~ — FIXED**
   - **File:** `UserResponse.java` — Password field completely removed from DTO.
   - ~~**Issue:** `UserResponse` has a `password` field.~~
   - **Resolution:** Field deleted. `UserService.mapToResponse()` updated.

5. **✅ ~BUG-005: All API endpoints are `permitAll()`~ — FIXED**
   - **File:** `SecurityConfig.java` — Completely rewritten with proper role-based auth.
   - ~~**Issue:** `.anyRequest().permitAll()` makes every endpoint publicly accessible.~~
   - **Resolution:** JWT filter + `hasRole("ADMIN")` on create/update/delete endpoints. `.anyRequest().authenticated()` for all others.

6. **✅ ~BUG-006: Docker Compose MongoDB credentials mismatch~ — FIXED**
   - **File:** `docker-compose.yml` — Rewritten with full stack (MongoDB + Backend + Frontend). Credentials removed from MongoDB for dev simplicity, backend uses env var `MONGODB_URI`.
   - **Resolution:** `application.yaml` reads `${MONGODB_URI}` and Docker Compose passes it correctly.

7. **🟠 BUG-007: Duplicate `pom.xml` and `src/` at root level**
   - **Files:** Root has `pom.xml`, `mvnw`, `src/` AND `EventProject-main/` subfolder with identical copies.
   - **Issue:** The backend exists in **two places**: root and `EventProject-main/`. The frontend references `EventProject-main` in README for backend, but the root also has the same code. This causes confusion about which is the "real" backend.
   - **Impact:** Developers may edit the wrong copy, leading to divergent codebases.

8. **🟡 BUG-008: Login uses `getAllUsers()` to find user**
   - **File:** `AuthContext.jsx` (lines 57-60)
   - **Issue:** To login, the frontend fetches ALL users, then finds the matching username client-side. This is a "fetch the entire users table" anti-pattern.
   - **Impact:** Exposes all user data to any authenticated user. Performance degrades with user count. Data leak.

9. **🟡 BUG-009: StudentId passed as HTTP header instead of from auth**
   - **Files:** `McqController.java`, `EventRegistrationController.java`
   - **Issue:** The `studentId` is passed via `@RequestHeader("studentId")`. A malicious user can spoof any student ID and submit tests or register as someone else.
   - **Impact:** Identity spoofing vulnerability.

10. **🟡 BUG-010: No duplicate username/email check on signup**
    - **File:** `UserService.java` (line 34-38)
    - **Issue:** The `insertUser` method catches a generic `Exception` on save (which would be a MongoDB duplicate key error) but throws `IllegalStateException("Could not save user")`. No user-friendly "username already taken" message.
    - **Impact:** Poor UX on signup. Users see a generic error.

### Minor Bugs

11. **🟡 BUG-011: `UserRequest` has unused JPA annotations**
    - **File:** `UserRequest.java` (lines 8-9)
    - **Issue:** Imports `@Id` and `@Indexed` from Spring Data MongoDB, but these annotations are not used on any field.

12. **✅ ~BUG-012: Navbar theme dropdown has hardcoded white backgrounds~ — FIXED**
    - **File:** `Navbar.jsx` — Fully rewritten with theme-aware utility classes.

13. **✅ ~BUG-013: `Config.java` uses `@Component` instead of `@Configuration`~ — FIXED**
    - **File:** `Config.java` — Changed to `@Configuration`.

14. **✅ ~BUG-014: Missing `.env.example` for frontend~ — FIXED**
    - Created `.env.example` for both frontend and backend.

---

## 🔒 SECURITY RISKS

| # | Risk | Severity | Status |
|---|------|----------|--------|
| SEC-001 | ~~No JWT authentication~~ | ~~🔴 Critical~~ | ✅ **FIXED** — JWT with JJWT library |
| SEC-002 | ~~All endpoints are `permitAll()`~~ | ~~🔴 Critical~~ | ✅ **FIXED** — Role-based auth |
| SEC-003 | ~~Hardcoded admin backdoors~~ | ~~🔴 Critical~~ | ✅ **FIXED** — AdminSeeder + env vars |
| SEC-004 | ~~Password field in response DTO~~ | ~~🟠 High~~ | ✅ **FIXED** — Field removed |
| SEC-005 | studentId header spoofing | 🟠 High | ⏳ TODO — Extract from JWT principal |
| SEC-006 | `getAllUsers()` exposed | 🟠 High | ⏳ TODO — Add admin-only guard |
| SEC-007 | No rate limiting | 🟡 Medium | ⏳ TODO |
| SEC-008 | No CSRF protection | 🟡 Medium | ✅ OK — CSRF disabled is correct for JWT |
| SEC-009 | ~~JDoodle API credentials hardcoded~~ | ~~🟡 Medium~~ | ✅ **FIXED** — Env vars |
| SEC-010 | ~~MongoDB URI hardcoded~~ | ~~🟡 Medium~~ | ✅ **FIXED** — Env vars |
| SEC-011 | No input sanitization on code submission | 🟡 Medium | ⏳ TODO |
| SEC-012 | CORS allows all origins | 🟡 Medium | ⏳ TODO — Restrict in production |

---

## 🧹 CODE SMELLS

1. **Massive code duplication in `SubmissionService.java`**
   - The `mapToResponse()` pattern is copy-pasted 5 times (lines 154-246). Should use a single reusable mapper method (which already exists on line 109 but isn't used for the other methods).

2. **Controller-level business logic**
   - `EventController.java` and `QuestionController.java` contain validation logic directly in controllers instead of services.

3. **Missing service layer for Events**
   - `EventController` directly uses `EventRepository`. No `EventService` exists. Other modules (contest, problem) properly use the service pattern.

4. **Magic strings throughout**
   - Verdicts like `"PENDING"`, `"ACCEPTED"`, `"WRONG_ANSWER"` are inline strings. Should be an enum.

5. **`ResponseEntity<?>` everywhere**
   - Generic wildcard return types provide no OpenAPI documentation and make the API hard to consume.

6. **No DTO validation on Contest/Problem creation**
   - `ContestRequest` and `ProblemRequest` have no `@NotBlank` or `@Valid` annotations.

7. **Inconsistent API path naming**
   - Quiz events: `/api/events/createEvent`, `/api/events/getAllEvent`
   - Contests: `/contest/insert`, `/contest/getAll`
   - Problems: `/problem/insert`, `/problem/getAll`
   - Users: `/user/insert`, `/user/getAll`
   - Should follow REST conventions: `POST /api/events`, `GET /api/events`

---

## 🚫 MISSING PRODUCTION FEATURES

### Must-Have (Priority 1)

| # | Feature | Status | Effort |
|---|---------|--------|--------|
| F-001 | JWT-based authentication | ✅ Done | — |
| F-002 | Role-based endpoint authorization | ✅ Done | — |
| F-003 | Proper login endpoint (`POST /api/auth/login`) | ✅ Done | — |
| F-004 | Environment variable configuration | ✅ Done | — |
| F-005 | API pagination for events, users, submissions | ❌ Missing | Medium |
| F-006 | Backend search/filter endpoints | ❌ Missing | Medium |
| F-007 | Input validation on all DTOs | ❌ Partial | Low |
| F-008 | Proper error messages for duplicate username/email | ✅ Done | — |
| F-009 | Backend event update/delete endpoints | ✅ Done | — |
| F-010 | Logout / token invalidation | ✅ Done (client-side) | — |

### Should-Have (Priority 2)

| # | Feature | Status | Effort |
|---|---------|--------|--------|
| F-011 | Email notifications (event registration/reminders) | ❌ Missing | High |
| F-012 | Swagger/OpenAPI documentation annotations | ❌ Not configured (dependency exists but no annotations) | Medium |
| F-013 | Unit and integration tests | ❌ Zero tests | High |
| F-014 | Logging framework (SLF4J with structured logs) | ❌ Only `console.error` / `System.out` | Medium |
| F-015 | Database indexes for query performance | ❌ Only on `username` and `email` | Low |
| F-016 | API rate limiting | ❌ Missing | Medium |

### Nice-to-Have (Priority 3)

| # | Feature | Status | Effort |
|---|---------|--------|--------|
| F-017 | Docker sandbox for code execution (replace JDoodle) | ❌ Missing | Very High |
| F-018 | WebSocket for real-time leaderboard updates | ❌ Missing | High |
| F-019 | Live contest mode with countdown + auto-submit | ❌ Partial | Medium |
| F-020 | Automatic PDF certificate generation | ❌ Partial | Medium |
| F-021 | Full Docker Compose for frontend + backend + MongoDB | ✅ Done | — |
| F-022 | CI/CD pipeline (GitHub Actions) | ❌ Missing | Medium |
| F-023 | Redis caching for leaderboard | ❌ Missing | Medium |

---

## 📁 RECOMMENDED FOLDER STRUCTURE

### Current (Problematic)
```
EventProject-main/
├── EventProject-main/    ← ⚠️ DUPLICATE backend (confusing!)
│   ├── pom.xml
│   ├── src/main/java/...
│   └── ...
├── event-frontend/       ← Frontend (OK)
├── pom.xml               ← ⚠️ ROOT also has backend files
├── src/main/java/...     ← ⚠️ ROOT also has backend source
├── mvnw, mvnw.cmd        ← ⚠️ ROOT also has Maven wrapper
├── docker-compose.yml
└── README.md
```

### Recommended (Clean)
```
EventHub/
├── README.md
├── docker-compose.yml           ← Full stack: MongoDB + Backend + Frontend
├── .env.example                 ← Environment variable template
├── .github/
│   └── workflows/
│       └── ci.yml               ← CI/CD pipeline
├── event-backend/               ← Renamed from EventProject-main
│   ├── pom.xml
│   ├── mvnw, mvnw.cmd
│   ├── Dockerfile
│   └── src/main/java/com/company/event/
│       ├── EventApplication.java
│       ├── config/              ← Security, CORS, Swagger configs
│       ├── auth/                ← JWT filter, auth controller
│       ├── user/                ← User domain
│       ├── quiz/                ← MCQ quiz domain
│       ├── contest/             ← Coding contest domain (renamed from contestPackage)
│       └── common/              ← Shared DTOs, exceptions, utils
└── event-frontend/
    ├── Dockerfile
    ├── .env.example
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        ├── services/
        ├── hooks/              ← Custom hooks (useDebounce, useAuth, etc.)
        └── utils/              ← Helpers, constants
```

---

## 🛠️ STEP-BY-STEP IMPROVEMENT ROADMAP

### Phase 1: Critical Security Fixes ✅ COMPLETED
1. ✅ Remove hardcoded guest/admin auto-login from `AuthContext.jsx`
2. ✅ Remove hardcoded admin from `CustomUserDetailsService.java`
3. ✅ Implement JWT authentication with JJWT
4. ✅ Add role-based endpoint access in `SecurityConfig.java`
5. ✅ Remove `password` field from `UserResponse.java`
6. ✅ Replace `permitAll()` with proper security rules
7. ⏳ Replace `studentId` header with authenticated user principal

### Phase 2: Code Quality & Structure (Partially Done)
8. ⏳ Clean up duplicate root-level backend files
9. ✅ Create `.env.example` files for both frontend and backend
10. ✅ Externalize all secrets to environment variables (`application.yaml`)
11. ⏳ Fix API path naming to follow REST conventions
12. ⏳ Add validation annotations to all DTOs
13. ⏳ Create proper `EventService` layer
14. ⏳ Eliminate code duplication in `SubmissionService`
15. ⏳ Add Swagger/OpenAPI annotations to all controllers
16. ✅ Fix `Config.java` to use `@Configuration`

### Phase 3: Feature Completeness (Partially Done)
17. ✅ Add proper login endpoint (`POST /api/auth/login`)
18. ⏳ Implement pagination on list endpoints
19. ⏳ Add backend search/filter for events
20. ✅ Implement event update and delete endpoints
21. ⏳ Add email notification service (Spring Mail)
22. ✅ Fix Navbar for theme consistency

### Phase 4: Production Readiness (Partially Done)
23. ⏳ Add comprehensive unit tests (JUnit 5 + Mockito)
24. ⏳ Add frontend tests (React Testing Library)
25. ✅ Set up structured logging (SLF4J in exception handler)
26. ✅ Create full Docker Compose (backend + frontend + MongoDB)
27. ✅ Add Dockerfiles for frontend and backend
28. ⏳ Set up GitHub Actions CI/CD
29. ✅ Add health check endpoints (Spring Actuator)
30. ⏳ Add Redis caching for leaderboard

### Phase 5: Advanced Features
31. ⏳ Docker sandbox code execution
32. ⏳ WebSocket real-time leaderboard
33. ⏳ Backend auto-submission on contest end
34. ⏳ PDF certificate generation with OpenPDF
35. ⏳ Real-time notifications

---

## 🧰 RECOMMENDED TECH ADDITIONS

| Tool | Purpose | Priority |
|------|---------|----------|
| **JJWT (io.jsonwebtoken)** | JWT token creation and validation | 🔴 Critical |
| **Spring Mail** | Email notifications | 🟠 High |
| **Spring Actuator** | Health checks and metrics (already partially used) | 🟡 Medium |
| **Testcontainers** | Integration testing with real MongoDB | 🟡 Medium |
| **Spring WebSocket (STOMP)** | Real-time leaderboard updates | 🟡 Medium |
| **Redis** | Caching leaderboard, session management | 🟡 Medium |
| **MapStruct** | DTO mapping (replace manual mappers) | 🟢 Nice-to-have |
| **GitHub Actions** | CI/CD pipeline | 🟡 Medium |
| **Docker** | Containerized deployment | 🟡 Medium |

---

## 📋 SUMMARY (Updated After Phase 1 Implementation)

### ✅ Completed Fixes
1. **JWT authentication** — JJWT library integrated, `AuthController` with login/register/me endpoints
2. **Role-based authorization** — `SecurityConfig` with proper `hasRole("ADMIN")` rules
3. **All hardcoded credentials removed** — Frontend, backend, and `CustomUserDetailsService` cleaned up
4. **Admin seeder** — Configurable admin user created on first startup via `AdminSeeder`
5. **Password field removed** from `UserResponse` DTO
6. **Environment variables** — All secrets externalized in `application.yaml` with `${VAR:default}` pattern
7. **Docker deployment fixed** — Full stack `docker-compose.yml` with Dockerfiles for both services
8. **Frontend auth rewritten** — `AuthContext.jsx` and `api.js` use JWT Bearer tokens
9. **Navbar theme consistency** — All hardcoded colors replaced with theme-aware classes
10. **Error handling improved** — `BadCredentialsException` handler returns 401, generic handler logs errors
11. **README rewritten** — Correct setup instructions, API docs, configuration reference
12. **Health check endpoints** — Spring Actuator exposing `/actuator/health`

### ⏳ Remaining Work
1. **Replace `studentId` header** with JWT principal across quiz/contest controllers
2. **API pagination** for list endpoints
3. **Unit and integration tests** — Still at zero coverage
4. **Swagger/OpenAPI annotations** — Dependency exists but no controller annotations
5. **Clean up root-level duplicate** backend files
6. **CI/CD pipeline** — GitHub Actions
7. **Advanced features** — WebSocket leaderboard, Docker sandbox execution, email notifications

> **Updated Bottom Line:** The critical security vulnerabilities have been fixed. The application now has proper JWT authentication, role-based authorization, and no hardcoded backdoors. It is significantly closer to production-ready. The remaining work focuses on code quality improvements, test coverage, and advanced features.
