import { Navigate, Route, Routes } from "react-router-dom";
import AdminProtectWrapper from "./components/AdminProtectWrapper";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentTable from "./components/StudentTable";
import CreateStudent from "./components/CreateStudent";
import AdminTable from "./components/AdminTable";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <AdminProtectWrapper>
            <Dashboard />
          </AdminProtectWrapper>
        }
      />
      <Route path="/" element={<Home/>} />
      <Route path="/test" element={<AdminTable/>} />
    </Routes>
  );
}

export default App;
