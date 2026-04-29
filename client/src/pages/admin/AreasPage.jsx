import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAreaCoverageStatsApi } from "../../api/areaApi";
import AreasTable from "../../components/admin/areas/AreasTable";
import AdminLayout from "../../layouts/AdminLayout";

export default function AreasPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);

  const fetchAreas = async () => {
    try {
      const res = await getAreaCoverageStatsApi();
      setAreas(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch area coverage stats", error);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Areas Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track area-wise executives, vendors, orders, sales and dues.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/areas/create")}
              className="border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Area
            </button>
          </div>
        </div>

        <AreasTable areas={areas} />
      </div>
    </AdminLayout>
  );
}