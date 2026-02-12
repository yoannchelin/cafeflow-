import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CustomerOrderPage } from "./pages/CustomerOrder";
import { StaffPage } from "./pages/Staff";
import { AdminMenuPage } from "./pages/AdminMenu";
import { LoginPage } from "./pages/Login";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/order" replace />} />
        <Route path="/order" element={<CustomerOrderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="*" element={<div className="card">Not found</div>} />
      </Routes>
    </Layout>
  );
}
