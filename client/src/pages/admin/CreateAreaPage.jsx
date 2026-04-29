import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAreaApi } from "../../api/areaApi";
import AreaForm from "../../components/admin/areas/AreaForm";
import AdminLayout from "../../layouts/AdminLayout";

export default function CreateAreaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateArea = async (form) => {
    try {
      setLoading(true);
      await createAreaApi(form);
      navigate("/admin/areas");
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create area");
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
                Create New Area
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new business coverage area for executive assignment and
                sales tracking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/areas")}
              className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Areas
            </button>
          </div>
        </div>

        <AreaForm onCreate={handleCreateArea} loading={loading} />
      </div>
    </AdminLayout>
  );
}