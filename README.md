# Tabdeel Pulse+

<div align="center">
  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="12" fill="#4f46e5"/><path d="M10 32 H18 L24 16 L32 48 L40 24 L46 32 H54" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>

<h1 align="center">Business Management System</h1>

Tabdeel Pulse+ is a comprehensive, web-based business management application designed to provide a centralised hub for a company's core operations. It offers real-time insights and streamlined workflows for finance, service job management, internal communication, administrative tasks, and user administration. The platform is built as a responsive Single Page Application (SPA), ensuring a seamless experience across desktop and mobile devices.

---

## ✨ Key Features

-   **Centralized Dashboard**: At-a-glance KPIs, financial overview charts, and live activity feeds.
-   **Finance Module**: Manage payment instructions with approval workflows, log collections with document attachments (camera/upload), and track bank deposits.
-   **Service Job Management**: Create, assign, and track service jobs with status updates, priority levels, and a detailed commenting system for communication.
-   **Internal Messaging**: A real-time chat system for team communication.
-   **Asset Management**: A complete asset lifecycle management system including creation, tracking, movement logs, and disposal. Features robust data import/export from Excel/CSV.
-   **User & Role Administration**: Granular, role-based access control (RBAC), user impersonation for admins, and full user lifecycle management.
-   **Productivity Tools**: Company-wide announcements and a simple, effective task management system.
-   **Light & Dark Modes**: Fully themed for user preference.

## 🛠️ Technology Stack

-   **Frontend**:
    -   **Framework**: React 19
    -   **Language**: TypeScript
    -   **Styling**: Tailwind CSS
    -   **Charts**: Recharts
    -   **Excel Parsing**: SheetJS (xlsx)
-   **Backend & Database**:
    -   Backend-agnostic. Designed to connect to any RESTful or GraphQL backend service.

## 📂 Project Structure

The project follows a standard React application structure:

```
/
├── components/         # React components, organized by feature/module
│   ├── assets/
│   ├── auth/
│   ├── common/
│   └── ...
├── contexts/           # React Context for global state (Auth, Theme)
├── data/               # Mock data for development
├── hooks/              # Custom React hooks (e.g., useApi for API abstraction)
├── services/           # Third-party service integrations
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── types.ts            # TypeScript type definitions
```

---

## 🚀 Getting Started

### 1. Local Development Setup

This project includes a built-in mock API (`hooks/useApi.ts`) that allows you to run and test the full application locally without needing a backend.

**Prerequisites**:
-   An environment that supports modern JavaScript (like a local machine with Node.js or an online development platform).

**Installation & Running**:

The application is ready to run. No installation is required in this environment.

### 2. Connecting to a Backend

The application is architected to be backend-agnostic. All data fetching logic is centralized in the **`hooks/useApi.ts`** file. To connect to your own backend, you only need to modify the functions within this file to make real network requests to your API endpoints.

**Example: Connecting the `getUsers` function**

*Before (`hooks/useApi.ts` - using mock data)*:
```typescript
import { MOCK_DATA } from '../data/mockData';
// ...
const api = {
    // ...
    getUsers: (): Promise<User[]> => Promise.resolve(MOCK_DATA.users),
    // ...
}
```

*After (connecting to a real REST API)*:
```typescript
const BASE_URL = 'https://your-backend-api.com/api';

const api = {
    // ...
    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        return data; // Assuming the API returns data in the correct format
    },
    // ...
}
```
You would continue this pattern for all other functions in `useApi.ts` (`updateUser`, `getProjects`, `addMessage`, etc.), replacing the mock logic with `fetch` calls or calls from your preferred data-fetching library (like Axios).

## 🚀 Deployment

This frontend application is a standard static build and can be deployed to any modern web hosting provider that supports Single Page Applications (SPAs).

For most providers, the deployment process involves pointing to the application's build directory and setting up a rewrite rule to serve `index.html` for all routes. This is a standard configuration for SPAs and ensures client-side routing works correctly.