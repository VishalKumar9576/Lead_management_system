import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../api/authApi";
import Button from "../../components/common/ui/Button";
import Card from "../../components/common/ui/Card";
import Input from "../../components/common/ui/Input";
import AuthLayout from "../../layouts/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [role, setRole] = useState("executive");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.password !== form.confirm_password) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        role,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Register</h1>
          <p className="mt-1 text-sm text-gray-500">Create an account</p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Register As</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="executive">Executive</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <Input
            label="Email (optional)"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Confirm password"
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
            {loading ? "Registering..." : "Register"}
          </Button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600"
            >
              Login
            </button>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
