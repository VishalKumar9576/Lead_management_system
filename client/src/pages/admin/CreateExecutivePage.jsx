import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExecutiveApi } from "../../api/executiveApi";
import ExecutiveForm from "../../components/admin/executives/ExecutiveForm";
import AdminLayout from "../../layouts/AdminLayout";

export default function CreateExecutivePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateExecutive = async (form) => {
    try {
      setLoading(true);
      await createExecutiveApi(form);
      navigate("/admin/executives");
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create executive");
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
                Create Executive
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add executive credentials, commission, bank details and joining
                details.
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

        <ExecutiveForm onCreate={handleCreateExecutive} loading={loading} />
      </div>
    </AdminLayout>
  );
}