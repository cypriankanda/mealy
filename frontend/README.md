# 📦 Mealy – Frontend (React + Vite)

This document provides a comprehensive guide for setting up and running the **frontend** of the Mealy Catering Platform. It is built using **React**, powered by **Vite**, and styled with modern UI libraries. The frontend interacts seamlessly with the Flask-based Mealy backend via RESTful APIs.

---

## 🔧 Tech Stack

| Area         | Technology            |
| ------------ | --------------------- |
| Framework    | React                 |
| Bundler      | Vite                  |
| Package Mgmt | npm                   |
| HTTP Client  | Axios                 |
| Linting      | ESLint                |
| Styling      | Tailwind CSS / Custom |

---

## 📁 Folder Structure

```bash
frontend/
├── public/                 # Static public assets
├── src/                    # Application source code
│   ├── assets/             # Images, logos, styles
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page-level components (views)
│   ├── services/           # Axios API services (menu, auth, orders, etc.)
│   ├── context/            # Auth context and global state management
│   ├── utils/              # Utility functions (formatting, helpers)
│   └── main.jsx            # React application entry point
├── index.html              # Root HTML file
├── package.json            # Project metadata and scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # Linting rules
├── README.md               # Frontend documentation (this file)
└── README_API_INTEGRATION.md # Backend API usage for frontend
```

---

## 🚀 Getting Started

### 1. Navigate to the Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables (Optional)

If your project relies on environment variables, add them in a `.env` file at the root of the frontend folder:

```env
VITE_API_URL=https://mealy-production.up.railway.app/api
```

This allows switching between local or production backend APIs.

### 4. Start the Development Server

```bash
npm run dev
```

Local frontend will be accessible at:

```bash
http://localhost:5173/
```

---

## 🌐 API Integration

The frontend communicates with the Mealy backend through REST APIs. All services are defined in `src/services/`.

* **Axios** handles API requests.
* **JWT tokens** are stored in `localStorage` and attached via interceptors.
* Refer to `README_API_INTEGRATION.md` for complete endpoint reference.

---

## ✏️ Linting & Formatting

To check code quality using ESLint:

```bash
npx eslint .
```

Rules are defined in `eslint.config.js`. Customize them to match your coding style.

---

## 🧪 Testing (Optional)

Testing tools are not pre-configured, but we recommend:

* **Jest** for unit testing
* **React Testing Library** for component testing

You can install them and configure as needed.

---

## 🔄 Production Build & Deployment

### To build for production:

```bash
npm run build
```

A `dist/` folder will be generated with production-ready static files.

### For Deployment (e.g. Railway or Netlify):

* Ensure correct API URL via `VITE_API_URL`
* Serve the `dist/` folder
* Configure build settings in your hosting provider

---

## 🤝 Contributing

* Stick to the current file/folder conventions
* Keep code modular and reusable
* Create new features inside `components/`, `pages/`, and `services/`
* Commit changes to feature branches

---

## 📫 Contact & Support

For any issues or questions related to the frontend:

* Refer to `README_API_INTEGRATION.md`
* Contact the frontend team on your collaboration platform

---

**Project:** Mealy Catering Platform
**Team:**
 Cyprian Kanda
 Njeri Lydia
 Virginia Manegene
 Abel Lukwaro
