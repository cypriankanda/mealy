# Mealy Catering Platform API Integration Guide

## Overview
This document provides a comprehensive guide for frontend developers integrating with the Mealy Catering Platform backend API. It outlines available endpoints, expected request/response structures, and important integration notes to ensure a smooth and robust frontend-backend interaction.

---

## API Structure
- **Base URL (Production):** `https://mealy-production.up.railway.app/api`
- **Base URL (Development):** `/api` (proxied to production or local backend)

The API is organized into the following main areas:
- **Authentication:** `/auth/*`
- **Customer:** `/meals`, `/orders`, `/profile`, etc.
- **Admin:** `/admin/*`

---

## Authentication Endpoints

- **Login**
  - `POST /auth/login`
  - Request: `{ "email": string, "password": string }`
  - Response: `{ "access_token": string, "user": { ... } }`

- **Register**
  - `POST /auth/register`
  - Request: `{ "email": string, "password": string, "role": string, "caterer_id": int (optional) }`
  - Response: `{ "access_token": string, "user": { ... } }`

- **Get Profile**
  - `GET /profile`
  - Response: `{ "id": int, "email": string, "role": string, ... }`

- **Update Profile**
  - `PUT /profile`
  - Request: `{ "email": string (optional), "current_password": string (required for password change), "new_password": string (optional), ... }`
  - Response: `{ "message": string, "user": { ... } }`

---

## Customer Endpoints

### Meals
- **Get Today's Menu**
  - `GET /menu/today`
  - Response: `{ "date": string, "meals": [ ... ] }`

- **Get Menu by Date**
  - `GET /menu/<date>`
  - Response: `{ "date": string, "meals": [ ... ] }`

### Orders
- **Place Order**
  - `POST /orders`
  - Request: `{ "meal_id": int, "special_instructions": string (optional) }`
  - Response: `{ "order_id": int, "user_id": int, "meal_id": int, "menu_date": string, "status": string }`

- **Get Current Order**
  - `GET /orders/current`
  - Response:
    ```json
    {
      "order_id": int,
      "meal_id": int,
      "meal_name": string,
      "status": string,
      "menu_date": string,
      "price": float,
      "created_at": string
    }
    ```

- **Get Order History**
  - `GET /orders/history?page=1&per_page=10`
  - Response:
    ```json
    {
      "data": [
        {
          "order_id": int,
          "meal_name": string,
          "price": float,
          "menu_date": string,
          "status": string,
          "created_at": string
        }
      ],
      "pagination": { ... }
    }
    ```

- **Cancel Order**
  - `DELETE /orders/<order_id>`
  - Response: `{ "message": string }`

---

## Admin Endpoints

- **Dashboard Stats**
  - `GET /admin/dashboard`
- **Manage Meals**
  - `GET /admin/meals`, `POST /admin/meals`, `PUT /admin/meals/<meal_id>`, `DELETE /admin/meals/<meal_id>`
- **Manage Orders**
  - `GET /admin/orders`, `PUT /admin/orders/<order_id>/status`
- **Manage Users**
  - `GET /admin/users`

Refer to backend code or API docs for detailed admin payloads and responses.

---

## Integration Expectations

### What the Frontend Can Expect
- All endpoints return JSON responses.
- For orders, the following fields will be present where relevant:
  - `order_id`, `meal_id`, `meal_name`, `status`, `menu_date`, `price`, `created_at`
- All date fields are ISO 8601 strings.
- Price is always in KSh (float).
- Only one active order per customer per day is allowed (enforced by backend).

### What the Frontend Cannot Expect
- `GET /orders` (without `/current` or `/history`) is **not implemented** and will return 405.
- Any missing fields (e.g., `created_at`, `price`) in the backend response will result in "Invalid Date" or blank price in the UI.
- Endpoints not listed above may not be available or may require admin privileges.

---

## Best Practices for Integration
- Always check for the presence of required fields before rendering UI.
- Use `/orders/current` for the current day's order, `/orders/history` for all past orders.
- Handle 401/403 errors by redirecting to login or showing an appropriate message.
- If you see "Invalid Date" or blank price, the backend is not returning the expected fields—contact the backend team.
- For new features or changes, coordinate with the backend team to ensure endpoint support.

---

**Contact:**
For any issues with missing or unexpected fields, or if you need a new endpoint, please contact the backend team or refer to the backend API documentation at `/api/docs` on the deployed backend. 