import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";

// Core Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import EducatorDashboard from "./pages/EducatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Account Management Pages
import EditProfile from "./pages/EditProfile";
import AccountSecurity from "./pages/AccountSecurity";
import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Dashboard UI */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student Routes */}
        <Route path="/student" element={
          <DashboardLayout userRole="Learner">
            <StudentDashboard />
          </DashboardLayout>
        } />

        {/* Educator Routes */}
        <Route path="/educator" element={
          <DashboardLayout userRole="Educator">
            <EducatorDashboard />
          </DashboardLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <DashboardLayout userRole="Admin">
            <AdminDashboard />
          </DashboardLayout>
        } />

        <Route path="/edit-profile" element={
          <DashboardLayout userRole="Learner">
            <EditProfile />
          </DashboardLayout>
        } />

        {/* Common Account Management Routes */}
        {/* These also use DashboardLayout to keep the Navbar/Sidebar visible */}
        <Route path="/edit-profile" element={
        <DashboardLayout userRole="Admin"> {/* Change this to "Admin" to test Admin sidebar */}
            <EditProfile />
          </DashboardLayout>
        } />

        <Route path="/security" element={
          <DashboardLayout userRole="Admin"> 
            <AccountSecurity />
          </DashboardLayout>
        } />
        <Route path="/change-password" element={
          <DashboardLayout>
            <ChangePassword />
          </DashboardLayout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;