# 🏛️ Smart Campus Operations Hub (SLIIT)

An elite, high-performance web platform designed to streamline campus facility management and resource allocation at SLIIT. Built for the **IT3030 - Platform as a Service (PAF)** assignment.

## 🚀 Performance Overview
The platform has been engineered for "Cinematic Performance," focusing on sub-second interactions even with large media assets.

*   **⚡ Metadata-First Architecture:** Catalogue load times reduced from 30s to **< 2s** using intelligent MongoDB projections and lazy-loading asset strategies.
*   **🏎️ Parallel Analytics Engine:** Dashboard metrics are computed using a non-blocking `CompletableFuture` architecture, ensuring real-time data sync without UI freezing.
*   **🛡️ Multi-Tier Security:** Stateless JWT authentication integrated with **Google OAuth2 (restricted to @my.sliit.lk)** for seamless student access.

---

## 💎 Elite Features

### 🏢 Intelligent Facility Catalogue
*   **Hybrid Asset Engine:** If a facility has no photo, the system intelligently defaults to high-resolution SLIIT campus assets (`/images/*.png`) to maintain a premium brand identity.
*   **Dynamic Filtering:** Instant search by name, building, floor, and specialized equipment (e.g., Projectors, Whiteboards).
*   **Real-time Availability:** Smart indicators (ONLINE/OFFLINE/MAINTENANCE) driven by active technician reports.

### 📊 Administrative Command Center
*   **Operations Dashboard:** Parallel-processed analytics on resource distribution, peak booking hours, and facility health.
*   **Smart Booking Review:** Automated conflict detection and multi-stage approval workflows.
*   **System Integrity Logs:** Complete traceability of user actions and automated maintenance alerts.

### 🛠️ Maintenance & Technician Portal
*   **Self-Service Check-in:** QR-code based arrival verification and "I'm Here" confirmation system.
*   **Issue Escalation:** Automated booking blocks when high-priority tickets are opened for a facility.
*   **Maintenance History:** Full audit logs for technicians to track equipment longevity.

---

## 🛠️ Technology Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons, Vanilla CSS (Glassmorphism Tier) |
| **Backend** | Spring Boot 3.4, Spring Security, MongoDB Atlas |
| **Auth** | JWT, OAuth2 (Google), BCrypt |
| **DevOps** | Maven, NPM, Git Branching Strategy |

---

## 👥 Group Y3S1-WD-97
*   **Group Members:** 4 Members
*   **Project Context:** SLIIT - IT3030 Platform as a Service (PAF)
*   **Year:** 2026

---

## 🚦 Getting Started

### Backend
1. Ensure MongoDB Atlas is accessible.
2. Run `./mvnw.cmd spring-boot:run` in `/backend`.
3. Server starts on `port 8082`.

### Frontend
1. Run `npm install`.
2. Run `npm run dev`.
3. Application available on `port 5175`.
