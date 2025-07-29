# 🛠️ Mealy – Backend (Flask + PostgreSQL)

This document provides comprehensive guidance for setting up, running, and understanding the **backend** of the Mealy Catering Platform. The backend is built using **Flask**, integrated with **PostgreSQL**, and structured to support both customer and admin roles via RESTful APIs.

---

## ⚙️ Technology Stack

| Component      | Technology      |
| -------------- | --------------- |
| Language       | Python          |
| Framework      | Flask           |
| Database       | PostgreSQL      |
| ORM            | SQLAlchemy      |
| Auth           | JWT (Flask-JWT) |
| Migration Tool | Flask-Migrate   |
| Deployment     | Railway         |

---

## 📁 Folder Structure

```bash
app/
├── __init__.py            # App factory
├── models/                # SQLAlchemy models
├── routes/                # Route blueprints
├── schemas/               # Marshmallow schemas
├── utils/                 # Utility functions/helpers
```

---

## 🚀 Getting Started

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Requirements

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/mealy_db
SECRET_KEY=your_secret_key
```

### 4. Database Migrations

```bash
flask db init       # Only once
flask db migrate -m "Initial migration"
flask db upgrade
```

### 5. Run the Backend

```bash
flask run
```

App runs at: `http://localhost:5000`

---

## 🔐 Authentication

| Action         | Endpoint         | Method |
| -------------- | ---------------- | ------ |
| Register       | `/auth/register` | POST   |
| Login          | `/auth/login`    | POST   |
| Get Profile    | `/profile`       | GET    |
| Update Profile | `/profile`       | PUT    |

> All protected endpoints require `Authorization: Bearer <JWT>` header.

---

## 📦 Core Features

* ✅ JWT-based authentication
* ✅ Role-based access control (customer, caterer/admin)
* ✅ Meal management (create/update/delete meals)
* ✅ Daily menus (menu by date)
* ✅ Order placement and history
* ✅ Admin dashboard statistics and user overview

---

## 🔁 API Endpoints Summary

### 🍽️ Menu

| Endpoint       | Method | Description                   |
| -------------- | ------ | ----------------------------- |
| `/menu/today`  | GET    | Get meals for today           |
| `/menu/<date>` | GET    | Get meals for a specific date |

### 📦 Orders

| Endpoint             | Method | Description                |
| -------------------- | ------ | -------------------------- |
| `/orders`            | POST   | Place a meal order         |
| `/orders/current`    | GET    | Get today’s active order   |
| `/orders/history`    | GET    | Paginated order history    |
| `/orders/<order_id>` | DELETE | Cancel order (soft delete) |

### 👩‍🍳 Caterer/Admin

| Endpoint                 | Method | Description                |
| ------------------------ | ------ | -------------------------- |
| `/admin/meals`           | GET    | View all meals             |
| `/admin/meals`           | POST   | Add new meal               |
| `/admin/meals/<meal_id>` | PUT    | Update a meal              |
| `/admin/meals/<meal_id>` | DELETE | Soft delete a meal         |
| `/admin/dashboard`       | GET    | View admin dashboard stats |
| `/admin/users`           | GET    | View all users             |

---

## 🧪 Example Models

Models are defined under `app/models/`:

* `User`
* `Meal`
* `DailyMenu`
* `Order`
* `DailyMenuMeal` (association table)

---

## 🧹 Code Quality

Format your code using `black`, and check style with `flake8`:

```bash
pip install black flake8
black .
flake8 .
```

---

## 🧪 Testing

* Use Postman or Insomnia for manual API testing
* You can write unit tests under a `/tests` directory with `pytest` or `unittest`

---

## 🚀 Deployment Notes

Backend is deployed to [Railway](https://mealy-production.up.railway.app/):

* Push changes to GitHub
* Connect your Railway project to GitHub repo
* Set up environment variables in Railway dashboard

---

## 📫 Contact

For bugs, feature requests, or API access issues, please contact the backend team or refer to `/api/docs` on the de
