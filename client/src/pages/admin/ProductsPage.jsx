import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2, AlertTriangle, PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import { deleteProductApi, getAdminProductsApi } from "../../api/productApi";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
const [brandFilter, setBrandFilter] = useState("");
const [stockFilter, setStockFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProductsApi();
      setProducts(res?.data || []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

const categories = useMemo(() => {
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
}, [products]);

const brands = useMemo(() => {
  return [...new Set(products.map((p) => p.brand).filter(Boolean))];
}, [products]);

  const filteredProducts = useMemo(() => {
  const q = search.toLowerCase().trim();

  return products.filter((item) => {
    const matchesSearch =
      !q ||
      [
        item.product_code,
        item.product_name,
        item.brand,
        item.category,
        item.unit_label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

    const matchesCategory =
      !categoryFilter || item.category === categoryFilter;

    const matchesBrand =
      !brandFilter || item.brand === brandFilter;

    const stockQty = Number(item.stock_qty);

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && stockQty > 0 && stockQty <= 10) ||
      (stockFilter === "out" && stockQty === 0) ||
      (stockFilter === "available" && stockQty > 10);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && Boolean(item.is_active)) ||
      (statusFilter === "inactive" && !Boolean(item.is_active));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesStock &&
      matchesStatus
    );
  });
}, [products, search, categoryFilter, brandFilter, stockFilter, statusFilter]);

  const lowStockCount = products.filter(
    (p) => Number(p.stock_qty) > 0 && Number(p.stock_qty) <= 10
  ).length;

  const outOfStockCount = products.filter((p) => Number(p.stock_qty) === 0).length;

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      await deleteProductApi(id);
      alert("Product deleted successfully");
      loadProducts();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Product & Stock Management"
        // subtitle="Add products, update pricing, manage stock, and track low stock items."
        action={
          <Button onClick={() => navigate("/admin/products/create")}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{products.length}</p>
        </div>

        <button
  type="button"
  onClick={() => setStockFilter("low")}
  className={`rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md ${
    stockFilter === "low"
      ? "border-yellow-500 bg-yellow-100"
      : "border-yellow-200 bg-yellow-50"
  }`}
>
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle size={17} />
            <p className="text-sm font-medium">Low Stock</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-800">{lowStockCount}</p>
       </button>

        <button
  type="button"
  onClick={() => setStockFilter("out")}
  className={`rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md ${
    stockFilter === "out"
      ? "border-red-500 bg-red-100"
      : "border-red-200 bg-red-50"
  }`}
>
          <div className="flex items-center gap-2 text-red-700">
            <PackageX size={17} />
            <p className="text-sm font-medium">Out of Stock</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-800">{outOfStockCount}</p>
       </button>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
  <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search product, code, brand..."
        className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
      />
    </div>

    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>

    <select
      value={brandFilter}
      onChange={(e) => setBrandFilter(e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      <option value="">All Brands</option>
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>

    <select
      value={stockFilter}
      onChange={(e) => setStockFilter(e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      <option value="all">All Stock</option>
      <option value="available">Available</option>
      <option value="low">Low Stock</option>
      <option value="out">Out of Stock</option>
    </select>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

    <button
      type="button"
      onClick={() => {
        setSearch("");
        setCategoryFilter("");
        setBrandFilter("");
        setStockFilter("all");
        setStatusFilter("all");
      }}
      className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Reset
    </button>
  </div>
</div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          No products found.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Selling</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {product.product_name}
                      </p>
                      {Array.isArray(product.extra_fields) && product.extra_fields.length > 0 && (
  <p className="mt-1 text-xs text-gray-500">
    {product.extra_fields
      .slice(0, 2)
      .map((f) => `${f.label}: ${f.value}`)
      .join(" • ")}
  </p>
)}
                    </td>

                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">₹{product.mrp}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      ₹{product.selling_price}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          Number(product.stock_qty) === 0
                            ? "bg-red-100 text-red-700"
                            : Number(product.stock_qty) <= 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock_qty}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{product.product_name}</p>
                    {Array.isArray(product.extra_fields) && product.extra_fields.length > 0 && (
  <p className="mt-1 text-xs text-gray-500">
    {product.extra_fields
      .slice(0, 2)
      .map((f) => `${f.label}: ${f.value}`)
      .join(" • ")}
  </p>
)}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">Category: {product.category}</p>
                  <p className="text-gray-500">Unit: {product.unit_label}</p>
                  <p className="font-medium text-gray-900">MRP: ₹{product.mrp}</p>
                  <p className="font-semibold text-blue-600">
                    Selling: ₹{product.selling_price}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      Number(product.stock_qty) === 0
                        ? "bg-red-100 text-red-700"
                        : Number(product.stock_qty) <= 10
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Stock {product.stock_qty}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      className="rounded-lg border border-gray-200 p-2 text-blue-600"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}