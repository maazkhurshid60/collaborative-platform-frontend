# Kolabme Collaborative Workspace — Frontend

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-Ready-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC.svg?style=flat&logo=redux)](https://redux-toolkit.js.org)

Kolabme is a premium, secure, real-time client-provider collaboration workspace designed to simplify document management, secure electronic signatures, client onboarding, billing, and team communications. This repository contains the React + TypeScript frontend application powered by Vite.

---

## 🚀 Key Features

*   **Interactive Form Builder:** Drag-and-drop builder for custom form creation, supporting structural client/provider sections, text fields, radio/checkbox groups, and digital signature boxes.
*   **Secure Document Sharing & Signature:** Real-time form assignment, secure link expiration, and verified e-signature tracking.
*   **Automated PDF Processing:** Dynamic PDF compilation and client-side downloads using `@react-pdf/renderer` and `jsPDF`.
*   **Real-time Collaboration:** Live chat rooms and instant provider activity notifications driven by Socket.io.
*   **Subscription Billing & Invoices:** Seamless customer portals, pricing tables, and invoice tracking powered by Stripe.
*   **Premium Glassmorphic UI:** Modern dashboard aesthetic featuring deep dark modes, responsive data grids, smooth micro-animations, and styled layouts.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Core Framework** | React 19, TypeScript 5, Vite |
| **State Management** | Redux Toolkit, React Redux, Redux Persist |
| **Data Fetching** | TanStack React Query v5, Axios |
| **Styling** | Tailwind CSS v4, Vanilla CSS (Custom Design System) |
| **Forms & Validation** | React Hook Form, Zod, @hookform/resolvers |
| **PDF Generation** | @react-pdf/renderer, jsPDF, html2canvas, pdf-lib |
| **Icons & Media** | Lucide React, React Icons |
| **Rich Text Editor** | React Quill (react-quill-new) |

---

## 📦 Directory Structure

```bash
src/
├── apiServices/       # Axios API client calls grouped by resource (Auth, Form, Client)
├── assets/           # Static asset assets (logos, fallback images)
├── components/       # Reusable components (Buttons, Tables, Modals, Loaders)
│   ├── icons/        # Custom styled SVG icon wrappers
│   └── modals/       # Form-fill, delete confirm, and document share dialogs
├── hooks/            # Shared React queries (useDocumentData, etc.)
├── layouts/          # Page wrapping structures (OutletLayout, Sidebar)
├── pages/            # View pages (Admin, Provider, Client portals, Public forms)
├── pdf/              # Custom PDF rendering blocks and helpers
├── redux/            # Store configuration and slice reducers (LoginUser, Modals)
├── routing/          # React Router route guard configurations
└── types/            # TypeScript type interface definitions
```

---

## ⚙️ Local Development Setup

Follow these steps to set up and run the frontend application locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/maazkhurshid60/collaborative-platform-frontend.git
cd collaborative-platform-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory (you can copy the structure from `example.env`):
```bash
cp example.env .env
```
Configure the variables as follows:
```env
# Server Environment Status
VITE_ENV="LOCALHOST"

# Backend Server Base API Endpoint
VITE_LOCAL_BASE_URL="http://localhost:8000/api/v1"

# Frontend Application URL
VITE_FRONT_BASE_URL="http://localhost:5173"

# Stripe Integration Public Key
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

### 5. Launch the Development Server
Run the local dev command. The server will start hot-reloading on `http://localhost:5173`.
```bash
npm run dev
```

### 6. Build for Production
To build the application for production, compile the assets into static HTML/JS:
```bash
npm run build
```
You can preview the production bundle locally with:
```bash
npm run preview
```

---

## 🔒 Security & Best Practices

*   **Secure Route Guards:** Subscriptions, Admin rights, and Provider states are protected using React Route wrappers.
*   **Environment Segregation:** Links, keys, and API targets automatically toggle between sandbox development and live server parameters.
*   **E-signature Compliance:** Signatures are stored securely as high-entropy verification payload data alongside user tracking metadata.
