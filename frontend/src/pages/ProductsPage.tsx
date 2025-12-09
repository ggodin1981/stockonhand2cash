import { useEffect, useState } from "react";
import api from "../api/client";

type Product = {
  id: number;
  title: string;
  status: string;
  total_inventory: number;
  expiry_date?: string;
  is_on_sale?: boolean;
  discount_percent?: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // simple fetch via dashboard low_stock and on_sale as placeholder
    const load = async () => {
      try {
        const res = await api.get<any>("/shopify/dashboard");
        const low = res.data.low_stock_alerts || [];
        const sale = res.data.on_sale_items || [];
        const combined: Product[] = [...low, ...sale];
        const map = new Map<number, Product>();
        combined.forEach((p) => map.set(p.id, p));
        setProducts(Array.from(map.values()));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Products (sample view)</h2>
      <p className="text-sm text-gray-600 mb-4">
        This view uses low stock and on-sale lists from the dashboard API as a
        simple example. In a full implementation, you would add a dedicated
        /products API with pagination and filters.
      </p>
      <div className="bg-white p-4 shadow rounded">
        {products.length === 0 ? (
          <p className="text-xs text-gray-500">No products to display.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Inventory</th>
                  <th className="px-3 py-2">Expiry</th>
                  <th className="px-3 py-2">On Sale</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{p.title}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.total_inventory}</td>
                    <td className="px-3 py-2">
                      {p.expiry_date
                        ? new Date(p.expiry_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {p.is_on_sale
                        ? `${(p.discount_percent || 0).toFixed(1)}%`
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
