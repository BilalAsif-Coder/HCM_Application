import { Routes, Route, Navigate } from "react-router-dom";
import Setup from "./pages/Setup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/employees"
        element={token ? <Employees /> : <Navigate to="/login" replace />}
      />
      <Route
  path="/attendance"
  element={token ? <Attendance /> : <Navigate to="/login" replace />}
  
/>
<Route
  path="/payroll"
  element={token ? <Payroll /> : <Navigate to="/login" replace />}
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}