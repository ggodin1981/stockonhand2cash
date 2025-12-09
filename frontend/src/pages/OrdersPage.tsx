import { useEffect, useState } from "react";
import api from "../api/client";

type Order = {
  id: number;
  name: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  total_price: number | string;
  currency: string;
  ordered_at: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<any>("/shopify/dashboard");
        setOrders(res.data.recent_transactions || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Orders (recent)</h2>
      <div className="bg-white p-4 shadow rounded">
        {orders.length === 0 ? (
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
                {orders.map((o) => (
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
    </div>
  );
}
