import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAreasApi } from "../../api/areaApi";
import {
  assignExecutiveAreaApi,
  getAllExecutivesApi,
} from "../../api/executiveApi";
import AssignAreaForm from "../../components/admin/executives/AssignAreaForm";
import AdminLayout from "../../layouts/AdminLayout";

export default function AssignExecutiveAreaPage() {
  const navigate = useNavigate();

  const [executives, setExecutives] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [executiveRes, areaRes] = await Promise.all([
        getAllExecutivesApi(),
        getAllAreasApi(),
      ]);

      setExecutives(executiveRes?.data || []);
      setAreas(areaRes?.data || []);
    } catch (error) {
      console.error("Failed to load assign area data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignArea = async (form) => {
    try {
      setLoading(true);
      await assignExecutiveAreaApi(form);
      navigate("/admin/executives");
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to assign area");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assign Executive Area
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Assign an executive to a business coverage area.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/executives")}
              className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Executives
            </button>
          </div>
        </div>

        <AssignAreaForm
          executives={executives}
          areas={areas}
          onAssign={handleAssignArea}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}