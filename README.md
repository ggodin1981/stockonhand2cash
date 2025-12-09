# StockOnHand2Cash – AI-Powered Commerce Back-Office for Shopify

StockOnHand2Cash is a full-stack, AI-assisted commerce back-office system for cosmetics e-commerce brands using **Shopify**.
 
It provides:

- Real-time **inventory management**
- **Sales analytics** (best sellers, recent transactions, KPIs)
- **AI Stock Analyst & Daily Briefing**
- A modern **React + TypeScript frontend ** dashboard backed by a **Laravel API**

---

## 👨‍💻 Author

**Software Developer: Gregorio Godin Jr**

Full-stack developer specializing in:

- Laravel · PHP · MySQL  
- React · TypeScript  
- AI Integrations · Shopify API  

Creator of **StockOnHand2Cash – AI-Powered Commerce Back-Office System**

---

## 🚀 Features Overview

### Commerce Back-Office

- Dashboard KPIs:
  - Total products
  - Total orders
  - Total revenue (all-time)
  - Today’s sales (AUD)
  - Today’s orders
- Inventory analytics:
  - Top best-selling items (bar chart)
  - Low stock alerts (near out of stock)
  - Near-expiry products (next 30 days)
  - On-sale items with discount percentage
- Recent transactions:
  - Latest orders (financial/fulfillment status, totals, timestamps)

### Shopify Integration

- Pull products & orders from Shopify Admin API
- Persist data in local MySQL:
  - `products`
  - `orders`
  - `order_items`
- Sync endpoints:
  - `POST /api/shopify/sync/products`
  - `POST /api/shopify/sync/orders`
- Dashboard and analytics use **local DB**, not live Shopify calls, for performance.

### AI Stock Analyst & Assistant

- AI-powered **Stock Analyst & Assistant** using your live data:
  - Reads: best sellers, low stock, near expiry, discounts, KPIs
  - Answers questions about stock risks, re-order priorities, promotions
- **AI Daily Briefing** for the dashboard:
  - Today’s sales & orders
  - Notable best sellers
  - Urgent stock/expiry risks
  - Recommended actions
- REST endpoints:
  - `POST /api/ai/stock-analyst`
  - `GET /api/ai/stock-analyst/daily-summary`

### Tech Stack

- **Backend**
  - PHP 8.x
  - Laravel 10/11
  - MySQL
  - Laravel HTTP Client
- **Frontend**
  - React 18
  - TypeScript
  - Vite
  - React Router
  - Recharts (charts)
  - Axios (API client)

---

## 📁 Project Structure

```text
stockonhand2cash/
├── backend/                 # Laravel API (Shopify, AI, analytics)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── composer.json
│   └── ...
└── frontend/                # React + TypeScript SPA
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```
## 🧠 High-Level Architecture
```
flowchart LR
    subgraph Shopify["Shopify Store"]
        P[Products]
        O[Orders]
    end

    subgraph Backend["Laravel API (backend/)"]
        SvcShopify[ShopifyClient & ShopifySyncService]
        DB[(MySQL DB)]
        APIShopify[/REST: /api/shopify/.../]
        APIAI[/REST: /api/ai/.../]
        AiClient[AiClient]
        AiAnalyst[AiStockAnalystService]
    end

    subgraph Frontend["React + TypeScript SPA (frontend/)"]
        Dashboard[Dashboard Page]
        ProductsPage[Products Page]
        OrdersPage[Orders Page]
        AiAssistantPage[AI Assistant Page]
    end

    Shopify <-- Admin API --> SvcShopify
    SvcShopify --> DB

    Dashboard --> APIShopify
    ProductsPage --> APIShopify
    OrdersPage --> APIShopify

    Dashboard --> APIAI
    AiAssistantPage --> APIAI

    APIShopify --> DB
    APIAI --> AiClient --> "External AI Provider"
```


## ✅  Prerequisites

Make sure you have:

PHP 8.1+

- Composer (latest)

- MySQL 5.7+ / MariaDB (any modern version)

- Node.js 18+ and npm

- Git (optional but recommended)

- A Shopify store with:

- Admin API access token

- Store domain (e.g. your-shop.myshopify.com)

- An AI provider (e.g. OpenAI) with:

- API key

- Chat Completions endpoint URL

- Model name (e.g. gpt-4.1-mini)

# 🛠 Step-by-Step Setup – Backend (Laravel API)

## 1. Clone the Repository
```
git clone https://github.com/<your-username>/stockonhand2cash.git
cd stockonhand2cash/backend
```
If you haven’t pushed to GitHub yet, just navigate to your backend folder directly.

## 2. Install PHP Dependencies
```
composer install
```

## 3. Create and Configure .env
Copy the example env:

```
cp .env.example .env
```


Edit .env and configure:
APP_NAME="StockOnHand2Cash"
APP_ENV=local
APP_KEY=base64:GENERATED_KEY
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

## Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stockonhand2cash
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

## Shopify
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-shopify-admin-api-access-token
SHOPIFY_API_VERSION=2025-01

## AI
AI_PROVIDER=openai
AI_API_KEY=sk-REPLACE_ME
AI_MODEL=gpt-4.1-mini
AI_BASE_URL=https://api.openai.com/v1/chat/completions

## 4. Create the Database

Log in to MySQL and create the DB:
```
CREATE DATABASE stockonhand2cash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Run Migrations 
Run all migrations:
```
php artisan migrate
```

This will create tables such as:
- products
- orders
- order_items
- ai_queries
- (plus Laravel’s default tables)

## 6. (Optional) Seed Some Sample Data
If you create seeders later, you can run:
```
php artisan db:seed
```
For now, data will mostly come from Shopify sync.
## 7. Run the Laravel API
Start the backend server:

```
php artisan serve --host=0.0.0.0 --port=8000
```
API base URL:
```
http://localhost:8000/api
```
## 8. Test Core Endpoints (Manual Check)

You can test via Postman / Insomnia / curl.

## 8.1 Dashboard Data
```
GET http://localhost:8000/api/shopify/dashboard
```
## Response fields (partial):

- total_products
- total_orders
- total_revenue
- today_sales_total
- today_orders_count
- best_sellers[]
- low_stock_alerts[]
- near_expiry_alerts[]
- on_sale_items[]
- recent_transactions[]

## 8.2 Sync Products
```
POST http://localhost:8000/api/shopify/sync/products
```
## 8.3 Sync Orders
```
POST http://localhost:8000/api/shopify/sync/orders
```
## 8.4 AI Daily Summary
```
GET http://localhost:8000/api/ai/stock-analyst/daily-summary
```

## 8.5 AI Stock Analyst (Custom Question)
```
POST http://localhost:8000/api/ai/stock-analyst
Content-Type: application/json

{
  "question": "Which products are low on stock and should be reordered first?"
}
```
# 🧩 Step-by-Step Setup – Frontend (React + TypeScript)
## 1. Move to Frontend Folder

From the project root:
```
cd ../frontend
```

(or cd stockonhand2cash/frontend from scratch)

## 2. Install Node Dependencies
```
npm install
```
## 3. Configure API Base URL (if needed)

Check src/api/client.ts:
```
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export default api;
```

If your backend runs on a different host/port, update baseURL.

## 4. Run the Frontend Dev Server
```
npm run dev
```

Vite will show a URL, usually:
```
http://localhost:5173
```

Open it in your browser.

## 5. Available Pages

- / – Dashboard
    - KPIs (products, orders, total revenue, today’s sales & orders)
    - Best sellers chart
    - AI Daily Briefing panel
    - Stock / expiry / discount alerts
    - Recent transactions table
    - “Sync Products & Orders from Shopify” button
  - /products – Products listing with inventory & status
  - /orders – Orders table (financial + fulfillment status)
  - /assistant – AI Stock Analyst chat-style assistant
  - /settings – Placeholder for future Shopify/AI config UI
  - Footer – Shows Software Developer: Gregorio Godin Jr

# 🤖 AI Integration – How It Works
Backend

- AiClient:
  - Wraps the AI provider (e.g. OpenAI Chat Completions)
  - Uses AI_API_KEY, AI_MODEL, AI_BASE_URL from .env
## AiStockAnalystService:
  - Reads:
    - products (inventory, expiry, discounts)
    - orders & order_items (sales, best sellers)
  - Builds a structured commerce back-office context
  - Sends context + user question to AI via AiClient
  - Logs question/answer to ai_queries with meta (products, orders, revenue, author)

## Frontend

- AI Assistant Page (/assistant):
  - Simple chat-style interface with suggested prompts
  - Sends user question to POST /api/ai/stock-analyst
  - Renders AI response as “AI Analyst” messages

- Dashboard AI Daily Briefing:
  - Calls GET /api/ai/stock-analyst/daily-summary
  - Shows a concise, bullet-point daily report
  - “Refresh” button triggers a new summary

# 🔐 Environment Variables Summary
Required

  - DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
  - SHOPIFY_SHOP_DOMAIN
  - SHOPIFY_ACCESS_TOKEN
  - SHOPIFY_API_VERSION
  - AI_API_KEY
  - AI_MODEL
  - AI_BASE_URL

## Optional / Defaults
  - APP_NAME (default: “Laravel”, set to “StockOnHand2Cash”)
  - APP_ENV, APP_DEBUG, APP_URL
  - AI_PROVIDER (default: openai)

# 🔄 Typical Workflow

## 1. Start MySQL and ensure stockonhand2cash DB exists.
## 2. Start Laravel API (php artisan serve on port 8000).
## 3. Start React frontend (npm run dev on port 5173).
## 4. Open the frontend in your browser.
## 5. Click “Sync Products & Orders from Shopify” on the dashboard:
  - Backend pulls Shopify data → stores in MySQL.

## 6.Dashboard updates:
  - KPI cards
  - Best sellers chart
  - Alerts
  - Recent transactions

## 7. AI Daily Briefing loads automatically:

## 8. Uses the same data to generate a back-office summary.

  - Use AI Assistant page to ask questions like:
  - “Which SKUs are at risk of stockout this week?”
  - “What should we re-order first based on sales and current inventory?”
  - Any products that are expiring soon and should be promoted?”

## 🧪 Common Issues & Tips
# CORS Issues Between Frontend & Backend

If you get CORS errors, install and configure Laravel CORS middleware:
```
composer require fruitcake/laravel-cors
```

Then configure allowed origins (e.g. http://localhost:5173).

## AI Errors: “AI_API_KEY is not configured.”
- Ensure AI_API_KEY is present in .env.
- Clear config cache:
```
php artisan config:clear
php artisan cache:clear
```
## Shopify Errors: Unauthorized / 401

- Double-check:
  - SHOPIFY_SHOP_DOMAIN
  - SHOPIFY_ACCESS_TOKEN
  - SHOPIFY_API_VERSION
- Confirm your Shopify private app / custom app has correct scopes:
  - e.g. read_products, read_orders
## No Data in Dashboard

- Run sync endpoints:
- From UI: click “Sync Products & Orders from Shopify”
- Or manually:
  - POST /api/shopify/sync/products
  - POST /api/shopify/sync/orders

# 🧭 Future Improvements (Roadmap Ideas)

- Authentication & Roles:

  - Laravel Sanctum / Passport + protected React routes

- Shopify Webhooks:

  - Real-time updates for product changes & order creation

- Background Jobs:

  - Queued sync processes for large stores

- More AI:
  - Forecast demand per SKU
  - Automatic purchase order suggestions
  - Promotional suggestions based on expiry & sales velocity

# 📜 License

You can attach your preferred license here, for example:

Proprietary – © 2025 Software Developer: Gregorio Godin Jr
All rights reserved.


Or apply an open-source license (MIT, Apache-2.0, etc.) if you decide to share it publicly.


If you want, I can next help you:

- Turn this into a **GitHub repo description** + tags for the project page, and  
- Write **CV / portfolio bullets** that reference “StockOnHand2Cash – AI-Powered Commerce Back-Office for Shopify (Laravel + React + AI)”.

