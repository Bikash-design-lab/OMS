# OMS-Backend

# 🛒 Order Management System (OMS) – Backend API

A TypeScript-based backend for managing users, products, and orders with role-based access control using Node.js, Express, and MongoDB.

---

## 🌍 Base URL
```
http://localhost:3000
```
## Overview
The OMS-Backend is designed to handle order processing, product inventory, and user authentication with role-based access control (RBAC). It provides RESTful APIs to manage the lifecycle of orders (e.g., placed, paid, picked, shipped, cancelled) and integrates with a MongoDB database for persistent storage.

## Features
- Role-based access control (Admin, Staff, Customer).
- Order management with status tracking (Placed, Paid, Picked, Shipped, Cancelled).
- Product inventory management with stock updates.
- User authentication and authorization via middleware.
- Type-safe code using TypeScript.
- Logging for debugging and monitoring.
- Modular and scalable architecture.

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (v5.x or later)
- [Git](https://git-scm.com/) (for cloning the repository)

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-username/OMS-backend.git
   cd OMS-backend
    
    ```
2. Install dependencies:
   ```
   npm install

   ```  
3. Create a `.env` file in the root directory and configure your environment variables (see [Configuration](#configuration) section).

MONGODB_URI=mongodb://localhost:27017/oms  // Adjust as per your MongoDB setup
PORT=3000   // Adjust as per your preference
SECURED_KEY="_Kolkata_is_the_city_of_joy_"  // Replace with your secure key

CLIENT_BASE_URL="http://localhost:5173" // Adjust as per your frontend URL

4. Start the MongoDB server (if not running):   

usage 

```
npm run dev

```
API Endpoints


---

---

## 🔐 Environment Variables

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `MONGODB_URI`       | MongoDB connection URI              |
| `PORT`              | Port to run the server (default: 3000) |
| `SECURED_KEY`       | JWT Secret Key                      |
| `CLIENT_BASE_URL`   | Frontend URL                        |

---

## 👥 Roles and Permissions

| Role      | Description                               | Permissions                                             |
|-----------|-------------------------------------------|----------------------------------------------------------|
| `admin`   | Full access to manage users, products, and orders |
| `staff`   | Can list/update/delete products and update order status |
| `customer`| Can place and cancel orders                |

---

## 🔐 Authentication API

| Method | Endpoint        | Description              | Public | Request Body                            |
|--------|------------------|--------------------------|--------|-----------------------------------------|
| POST   | `/user/signup`   | Register a new user      | ✅     | `name`, `email`, `password`, `role`     |
| POST   | `/user/signin`   | Login to get JWT token   | ✅     | `email`, `password`                     |
| GET    | `/user/test`     | Test user route          | ✅     | –                                       |

---

## 🛍️ Product API

| Method | Endpoint                                 | Description                     | Roles            | Body / Params                        |
|--------|-------------------------------------------|----------------------------------|------------------|--------------------------------------|
| GET    | `/product/test`                          | Test product route              | Public           | –                                    |
| POST   | `/product/list-product`                  | Add new product                 | `admin`, `staff` | `{ name, price, stock }`             |
| GET    | `/product/all-products`                  | View all products               | `admin`, `staff` | –                                    |
| PATCH  | `/product/update_details/:product_id`    | Update product details          | `admin`, `staff` | `{ name?, price?, stock? }`          |
| DELETE | `/product/remove_product/:product_id`    | Delete a product                | `admin`, `staff` | –                                    |

---

## 📦 Order API

### 📌 Order Lifecycle Steps

| Step | Method | Endpoint                                                    | Description                                          | Roles              |
|------|--------|-------------------------------------------------------------|------------------------------------------------------|--------------------|
| 1    | POST   | `/order/product-placed-payment-pending/:product_id`         | Place order, payment pending                         | `admin`, `customer`|
| 2    | PATCH  | `/order/product-placed-payment-paid/:order_id`              | Update payment to `PAID`                             | `admin`, `customer`|
| 3    | PATCH  | `/order/product-picked-payment-fulfilled/:order_id`         | Update status to `picked` and `FULFILLED`           | `admin`, `staff`   |
| 4    | PATCH  | `/order/product-shipped-payment-fulfilled/:order_id`        | Update status to `shipped`, payment remains `FULFILLED` | `admin`, `staff`   |
| ❌    | PATCH  | `/order/cancel-order/:order_id/:product_id`                 | Cancel order and restore stock                       | `admin`, `customer`|
| 🧪   | GET    | `/order/test`                                               | Test order route                                     | Public             |

---

## 🔄 Order Status Transitions

| Product Status | Payment Status | Endpoint                                             | Triggered By        |
|----------------|----------------|------------------------------------------------------|---------------------|
| `placed`       | `PENDING`      | `/product-placed-payment-pending/:product_id`       | `admin`, `customer` |
| `placed`       | `PAID`         | `/product-placed-payment-paid/:order_id`            | `admin`, `customer` |
| `picked`       | `FULFILLED`    | `/product-picked-payment-fulfilled/:order_id`       | `admin`, `staff`    |
| `shipped`      | `FULFILLED`    | `/product-shipped-payment-fulfilled/:order_id`      | `admin`, `staff`    |
| `cancelled`    | `cancelled`    | `/cancel-order/:order_id/:product_id`               | `admin`, `customer` |

---

## 🧪 Health Check

| Endpoint     | Method | Description              |
|--------------|--------|--------------------------|
| `/healthyz`  | GET    | Check if server is alive |

---

## 🧰 Technologies Used

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT Authentication**
- **Role-Based Access Control**
- **Morgan Logging**
- **Environment Config with dotenv**

---

## 🗂 Sample .env File

```
MONGODB_URI="your_mongodb_uri"
PORT=3000
SECURED_KEY="Order_Management_System_SECURED_KEY"
CLIENT_BASE_URL="http://localhost:5173"

```

## Project Structure 
```
OMS-backend/
├── Config/
│   ├── db.ts
│   └── env.ts
│   
├── Controllers/
│   ├── order.controller.ts
│   ├── product.controller.ts
│   └── user.controller.ts
│   
├── Middlewares/
│   └── auth.middleware.ts
│  
├── Models/
│   ├── order.model.ts   
│   ├── product.model.ts 
│   └── user.model.ts    
│   
├── Routes/
│   ├── order.routes.ts
│   ├── product.routes.ts
│   └── user.routes.ts
│   
├── Types/
│   └── express/
│      └── index.d.ts
├──── Logs/
│       └── server.log   # Log file for server activity
├── .env
├── .gitignore          
├── nodemon.json
├── note.txt
├── package-lock.json
├── package.json
├── README(oms-backend).md
├── Server.ts
├── tsconfig.json
```

Contact
Author: [Bikash prasad barnwal](https://www.linkedin.com/in/bikash-prasad-barnwal/)


## POSTMAN : (LINK):[https://.postman.co/workspace/Dish-Booking-System-RBAC~e55c5808-55f9-4b2b-9ea9-80deeda13dbd/collection/39573479-7c549ee9-6d1b-4dff-9b1f-38d1a5616a4a?action=share&creator=39573479]