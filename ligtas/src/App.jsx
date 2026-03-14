import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import GameplayOverview from "./pages/GameplayOverview";

// Core Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import EducatorDashboard from "./pages/EducatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Educator utility pages
import EducatorModules from "./pages/EducatorModules";
import EducatorAssignments from "./pages/EducatorAssignments";

// Support & Device Settings Pages
import SupportHelpDesk from "./pages/SupportHelpDesk";
import SupportSimulationGuide from "./pages/SupportSimulationGuide";
import DeviceGlobalAlerts from "./pages/DeviceGlobalAlerts";
import DeviceLogs from "./pages/DeviceLogs";

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

        <Route path="/gameplay" element={<GameplayOverview />} />

        {/* Learner Routes - protected */}
        <Route path="/learner" element={
          <ProtectedRoute allowedRole="Learner">
            <DashboardLayout><StudentDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Educator Routes - protected */}
        <Route path="/educator" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><EducatorDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/modules" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><EducatorModules /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/assignments" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><EducatorAssignments /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes - protected */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Account management - any authenticated role */}
        <Route path="/edit-profile" element={
          <ProtectedRoute allowedRoles={["Learner", "Educator", "Admin"]}>
            <DashboardLayout><EditProfile /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><AccountSecurity /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={["Learner", "Educator", "Admin"]}>
            <DashboardLayout><ChangePassword /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Support Briefing - per role */}
        <Route path="/learner/support/help-desk" element={
          <ProtectedRoute allowedRole="Learner">
            <DashboardLayout><SupportHelpDesk /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/learner/support/simulation-guide" element={
          <ProtectedRoute allowedRole="Learner">
            <DashboardLayout><SupportSimulationGuide /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/support/help-desk" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><SupportHelpDesk /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/support/simulation-guide" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><SupportSimulationGuide /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/support/help-desk" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><SupportHelpDesk /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/support/simulation-guide" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><SupportSimulationGuide /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Device Settings - per role */}
        <Route path="/learner/device/global-alerts" element={
          <ProtectedRoute allowedRole="Learner">
            <DashboardLayout><DeviceGlobalAlerts /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/learner/device/logs" element={
          <ProtectedRoute allowedRole="Learner">
            <DashboardLayout><DeviceLogs /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/device/global-alerts" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><DeviceGlobalAlerts /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/educator/device/logs" element={
          <ProtectedRoute allowedRole="Educator">
            <DashboardLayout><DeviceLogs /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/device/global-alerts" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><DeviceGlobalAlerts /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/device/logs" element={
          <ProtectedRoute allowedRole="Admin">
            <DashboardLayout><DeviceLogs /></DashboardLayout>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;