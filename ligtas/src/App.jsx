import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
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

        {/* Student Routes */}
        <Route path="/learner" element={
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
        <Route path="/educator/modules" element={
          <DashboardLayout userRole="Educator">
            <EducatorModules />
          </DashboardLayout>
        } />
        <Route path="/educator/assignments" element={
          <DashboardLayout userRole="Educator">
            <EducatorAssignments />
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

        {/* Support Briefing - per role */}
        <Route path="/learner/support/help-desk" element={
          <DashboardLayout userRole="Learner">
            <SupportHelpDesk />
          </DashboardLayout>
        } />
        <Route path="/learner/support/simulation-guide" element={
          <DashboardLayout userRole="Learner">
            <SupportSimulationGuide />
          </DashboardLayout>
        } />

        <Route path="/educator/support/help-desk" element={
          <DashboardLayout userRole="Educator">
            <SupportHelpDesk />
          </DashboardLayout>
        } />
        <Route path="/educator/support/simulation-guide" element={
          <DashboardLayout userRole="Educator">
            <SupportSimulationGuide />
          </DashboardLayout>
        } />

        <Route path="/admin/support/help-desk" element={
          <DashboardLayout userRole="Admin">
            <SupportHelpDesk />
          </DashboardLayout>
        } />
        <Route path="/admin/support/simulation-guide" element={
          <DashboardLayout userRole="Admin">
            <SupportSimulationGuide />
          </DashboardLayout>
        } />

        {/* Device Settings - per role */}
        <Route path="/learner/device/global-alerts" element={
          <DashboardLayout userRole="Learner">
            <DeviceGlobalAlerts />
          </DashboardLayout>
        } />
        <Route path="/learner/device/logs" element={
          <DashboardLayout userRole="Learner">
            <DeviceLogs />
          </DashboardLayout>
        } />

        <Route path="/educator/device/global-alerts" element={
          <DashboardLayout userRole="Educator">
            <DeviceGlobalAlerts />
          </DashboardLayout>
        } />
        <Route path="/educator/device/logs" element={
          <DashboardLayout userRole="Educator">
            <DeviceLogs />
          </DashboardLayout>
        } />

        <Route path="/admin/device/global-alerts" element={
          <DashboardLayout userRole="Admin">
            <DeviceGlobalAlerts />
          </DashboardLayout>
        } />
        <Route path="/admin/device/logs" element={
          <DashboardLayout userRole="Admin">
            <DeviceLogs />
          </DashboardLayout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;