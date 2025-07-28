# 🍽️ Mealy – Catering Platform

**Mealy** is a modern catering management system designed to streamline how customers place meal orders and how caterers manage menus, meals, and orders. The platform provides a full-stack solution combining a Flask backend and a React frontend.

This platform is ideal for small to mid-sized catering businesses that want to digitize their order process and track performance in real time.

---

## 🎯 Key Features

* ✅ User registration and login (JWT)
* ✅ Role-based access: Customer, Caterer (Admin)
* ✅ Caterers can manage meals and set daily menus
* ✅ Customers can view menus and place orders
* ✅ Caterers can track all orders and revenue
* ✅ PostgreSQL database with SQLAlchemy ORM
* ✅ RESTful API with Flask Blueprints
* ✅ Frontend built with React & Vite
* ✅ Railway-ready deployment (Procfile, Railway config)

---

## 🧰 Tech Stack

| Layer     | Technology                |
| --------- | ------------------------- |
| Frontend  | React, Vite, Axios        |
| Backend   | Python, Flask, SQLAlchemy |
| Database  | PostgreSQL                |
| Auth      | Flask-JWT-Extended        |
| Dev Tools | Railway, Docker-ready     |

---

## 📁 Project Structure (Simplified)

```bash
mealy/
├── app/                  # Backend Flask app
├── frontend/             # React frontend
├── migrations/           # DB migrations
├── run.py                # Entry point for Flask
├── config.py             # Flask app configuration
├── requirements.txt      # Python dependencies
├── Procfile              # Deployment config
├── README.md             # Project overview
└── .env.example          # Environment variable template
```

---

## 🚀 Getting Started (Full Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/cypriankanda/mealy.git
cd mealy
```

### 2. Backend Setup

#### 🔹 Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # (use venv\Scripts\activate on Windows)
```

#### 🔹 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 🔹 Create `.env` file (Example below)

```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=super-secret
DATABASE_URL=postgresql://mealy_user:password@localhost:5432/mealy_db
JWT_SECRET_KEY=jwt-secret-key
```

#### 🔹 Run Migrations

```bash
flask db upgrade
```

#### 🔹 Run Backend

```bash
flask run
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker (Optional)

To run the project with Docker:

```bash
docker build -t mealy-backend .
docker run -p 5000:5000 --env-file .env mealy-backend
```

---

## ☁️ Deployment Notes

This project is pre-configured for [Railway](https://railway.app/):

* Add your `.env` variables in the Railway dashboard
* Use the \`Procfile
