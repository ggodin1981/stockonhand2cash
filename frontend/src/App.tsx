/**
 * StockOnHand2Cash – AI Commerce Dashboard
 * Author: Software Developer – Gregorio Godin Jr
 */

import { Link, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">
          StockOnHand2Cash – Cosmetics Sync Hub
        </h1>
        <nav className="space-x-4 text-sm">
          <Link to="/" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/products" className="hover:underline">
            Products
          </Link>
          <Link to="/orders" className="hover:underline">
            Orders
          </Link>
          <Link to="/assistant" className="hover:underline">
            AI Assistant
          </Link>
          <Link to="/settings" className="hover:underline">
            Settings
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/assistant" element={<AiAssistantPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-white text-xs text-center py-2 mt-6">
        Software Developer: Gregorio Godin Jr — StockOnHand2Cash © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
