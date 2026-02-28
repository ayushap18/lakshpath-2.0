# LakshPath - Tech Stack Reference

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Vite | 5.0.8 | Build tool + dev server |
| Tailwind CSS | 3.4.0 | Utility-first styling |
| Framer Motion | 10.16.16 | Animations |
| Axios | 1.6.2 | HTTP client |
| React Router DOM | 6.20.0 | Client-side routing |
| @react-oauth/google | 0.12.2 | Google OAuth frontend |
| Recharts | 2.10.3 | Data visualization |
| Lucide React | 0.300.0 | Icon library |
| Capacitor Core | 7.4.4 | Mobile app bridge |
| Capacitor Android | 7.4.4 | Android support |
| @capgo/capacitor-updater | 7.27.9 | OTA mobile updates |
| firebase | 10.7.1 | **Unused** - legacy dependency |

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Express | 4.18.2 | REST API framework |
| TypeScript | 5.3.3 | Type safety |
| Prisma | 6.19.0 | ORM (database access) |
| SQLite | - | Database (development) |
| @google/generative-ai | 0.11.0 | Gemini AI integration |
| google-auth-library | 9.4.2 | Google OAuth verification |
| jsonwebtoken | 9.0.2 | JWT creation/verification |
| Nodemailer | 7.0.10 | Email sending |
| Zod | 3.22.4 | Schema validation |
| Helmet | 7.0.0 | Security headers |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Morgan | 1.10.0 | HTTP request logging |
| ts-node-dev | 2.0.0 | Dev server with hot reload |

## Infrastructure

| Technology | Purpose |
|---|---|
| SQLite | Development database |
| PostgreSQL | Recommended for production |
| SMTP/Ethereal | Email delivery |
| Google Cloud | OAuth + Gemini AI APIs |
| Capacitor | iOS + Android packaging |
| Capgo | Over-the-air mobile updates |

## External APIs

| Service | Usage |
|---|---|
| Google OAuth 2.0 | User authentication |
| Google Gemini 2.0 Flash | All AI features (career matching, interviews, portfolio analysis, chat, etc.) |
| GitHub API | Repository data for portfolio analysis |
| Ethereal Email | Dev email testing |

## Design Stack

| Tool | Details |
|---|---|
| Colors | Primary: Cyan (#0ea5e9), Background: Black (#000), Text: White |
| Typography | System fonts, weights 400-900, uppercase labels |
| Layout | Mobile-first responsive grid (1 -> 2 -> 3 columns) |
| Effects | Glassmorphism, gradient blobs, blur-3xl, backdrop-blur |
| Animations | Framer Motion (fade-in, slide-up, scale, stagger) |
| Icons | Lucide React (300+ icons) |
