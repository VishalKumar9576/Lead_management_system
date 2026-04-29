import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginApi, executiveLoginApi } from "../../api/authApi";
import Button from "../../components/common/ui/Button";
import Card from "../../components/common/ui/Card";
import Input from "../../components/common/ui/Input";
import AuthLayout from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    role: "admin",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        phone: form.phone,
        password: form.password,
      };

      const response =
        form.role === "admin"
          ? await adminLoginApi(payload)
          : await executiveLoginApi(payload);

      const token = response?.data?.token;
      const user = response?.data?.user;

      login(token, user);

      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/executive");
      }
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Login as admin or executive
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Login Role</span>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="executive">Executive</option>
            </select>
          </label>

          <Input
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          {errorMsg && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}