import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllExecutivesApi,
  getExecutivePerformanceListApi,
} from "../../api/executiveApi";
import ExecutivesTable from "../../components/admin/executives/ExecutivesTable";
import AdminLayout from "../../layouts/AdminLayout";

export default function ExecutivesPage() {
  const navigate = useNavigate();
  const [executives, setExecutives] = useState([]);

  const fetchExecutives = async () => {
    try {
      const res = await getExecutivePerformanceListApi();
      setExecutives(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch executives", error);

      try {
        const fallback = await getAllExecutivesApi();
        setExecutives(fallback?.data || []);
      } catch (fallbackError) {
        console.error("Failed to fetch executives fallback", fallbackError);
      }
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Executives Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track executive sales, dues, targets and assigned areas.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/executives/create")}
                className="border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Executive
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/executives/assign-area")}
                className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Assign Area
              </button>
            </div>
          </div>
        </div>

        <ExecutivesTable
          executives={executives}
          onView={(id) => navigate(`/admin/executives/${id}`)}
        />
      </div>
    </AdminLayout>
  );
}