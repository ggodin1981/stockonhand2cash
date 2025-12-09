import { useEffect, useState } from "react";
import api from "../api/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BestSeller = {
  product_id: number;
  title: string;
  total_quantity_sold: number;
  total_revenue: number;
};

type AlertProduct = {
  id: number;
  title: string;
  total_inventory?: number;
  status?: string;
  expiry_date?: string;
  discount_percent?: number;
};

type RecentTransaction = {
  id: number;
  name: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  total_price: number | string;
  currency: string;
  ordered_at: string | null;
};

type DashboardStats = {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  today_sales_total: number;
  today_orders_count: number;
  best_sellers: BestSeller[];
  low_stock_alerts: AlertProduct[];
  near_expiry_alerts: AlertProduct[];
  on_sale_items: AlertProduct[];
  recent_transactions: RecentTransaction[];
  author: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardStats>("/shopify/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.get<{ summary: string }>(
        "/ai/stock-analyst/daily-summary"
      );
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadAiSummary();
  }, []);

  const handleFullSync = async () => {
    setSyncLoading(true);
    try {
      await Promise.all([
        api.post("/shopify/sync/products"),
        api.post("/shopify/sync/orders"),
      ]);
      await loadStats();
      await loadAiSummary();
      alert("Sync completed");
    } catch (err) {
      console.error(err);
      alert("Failed to sync. Check console/logs.");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

      {loading && <p>Loading stats...</p>}

      {stats && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
            <div className="bg-white p-4 shadow rounded">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-2xl font-bold">{stats.total_products}</div>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <div className="text-sm text-gray-500">Total Orders</div>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <div className="text-sm text-gray-500">Today&apos;s Sales (AUD)</div>
              <div className="text-2xl font-bold">
                ${stats.today_sales_total.toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <div className="text-sm text-gray-500">Today&apos;s Orders</div>
              <div className="text-2xl font-bold">
                {stats.today_orders_count}
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-6">
            <div className="bg-white p-4 shadow rounded lg:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">
                  Top Best Selling Items (by quantity)
                </h3>
              </div>
              {stats.best_sellers.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Not enough order data yet to compute best sellers.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.best_sellers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="total_quantity_sold"
                        name="Quantity Sold"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-4 shadow rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">AI Daily Briefing</h3>
                <button
                  type="button"
                  onClick={loadAiSummary}
                  disabled={aiLoading}
                  className="text-[11px] border border-slate-300 rounded px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                >
                  {aiLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {aiLoading && !aiSummary && (
                <p className="text-xs text-gray-500">
                  Generating daily summary…
                </p>
              )}
              {aiSummary && (
                <div className="text-xs text-gray-700 whitespace-pre-wrap">
                  {aiSummary}
                </div>
              )}
              {!aiLoading && !aiSummary && (
                <p className="text-xs text-gray-500">
                  No AI summary available yet.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-sm mb-2">
                Stock Alert – Near Out of Stock
              </h3>
              {stats.low_stock_alerts.length === 0 ? (
                <p className="text-xs text-gray-500">No low-stock alerts.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {stats.low_stock_alerts.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between border-b border-slate-100 py-1"
                    >
                      <span className="mr-2">{p.title}</span>
                      <span className="font-semibold text-red-600">
                        {p.total_inventory}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-sm mb-2">
                Near Expiry (next 30 days)
              </h3>
              {stats.near_expiry_alerts.length === 0 ? (
                <p className="text-xs text-gray-500">No expiry alerts.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {stats.near_expiry_alerts.map((p) => (
                    <li
                      key={p.id}
                      className="border-b border-slate-100 py-1 flex flex-col"
                    >
                      <span className="font-medium">{p.title}</span>
                      <span className="text-[11px] text-gray-500">
                        Expiry:{" "}
                        {p.expiry_date
                          ? new Date(p.expiry_date).toLocaleDateString()
                          : "N/A"}{" "}
                        | Stock: {p.total_inventory ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-sm mb-2">
                On-Sale Items & Discounts
              </h3>
              {stats.on_sale_items.length === 0 ? (
                <p className="text-xs text-gray-500">No discounted items.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {stats.on_sale_items.map((p) => (
                    <li
                      key={p.id}
                      className="border-b border-slate-100 py-1 flex flex-col"
                    >
                      <span className="font-medium">{p.title}</span>
                      <span className="text-[11px] text-gray-500">
                        Discount: {p.discount_percent?.toFixed(1)}% | Stock:{" "}
                        {p.total_inventory ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white p-4 shadow rounded mb-6">
            <h3 className="font-semibold text-sm mb-2">
              Recent Transactions (latest orders)
            </h3>
            {stats.recent_transactions.length === 0 ? (
              <p className="text-xs text-gray-500">No recent orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">Financial</th>
                      <th className="px-3 py-2">Fulfillment</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_transactions.map((o) => (
                      <tr key={o.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{o.name}</td>
                        <td className="px-3 py-2">
                          {o.financial_status ?? "-"}
                        </td>
                        <td className="px-3 py-2">
                          {o.fulfillment_status ?? "-"}
                        </td>
                        <td className="px-3 py-2">
                          {o.total_price} {o.currency}
                        </td>
                        <td className="px-3 py-2">
                          {o.ordered_at
                            ? new Date(o.ordered_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <button
        onClick={handleFullSync}
        disabled={syncLoading}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {syncLoading ? "Syncing..." : "Sync Products & Orders from Shopify"}
      </button>

      {stats?.author && (
        <div className="text-[11px] text-gray-500 mt-4">
          {stats.author}
        </div>
      )}
    </div>
  );
}
