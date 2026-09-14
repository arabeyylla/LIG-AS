import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "./pages/Landing";
import About from "./pages/About";
import HowToPlay from "./pages/HowToPlay";
import Team from "./pages/Team";
import FAQ from "./pages/FAQ";
import Download from "./pages/Download";
import Assessment from "./pages/Assessment";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Announcements from "./pages/admin/Announcements";
import Feedback from "./pages/admin/Feedback";
import Gallery from "./pages/admin/Gallery";
import Assessments from "./pages/admin/Assessments";
import Analytics from "./pages/admin/Analytics";
import SystemLogs from "./pages/admin/SystemLogs";
import AdminRoute from "./components/AdminRoute";
import AdminPageError from './components/AdminPageError';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/team" element={<Team />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/download" element={<Download />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/announcements" element={
          <AdminRoute><Announcements /></AdminRoute>
        } />
        <Route path="/admin/feedback" element={
          <AdminRoute><Feedback /></AdminRoute>
        } />
        <Route path="/admin/gallery" element={
          <AdminRoute><Gallery /></AdminRoute>
        } />
        <Route path="/admin/assessments" element={
          <AdminRoute><AdminPageError><Assessments /></AdminPageError></AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute><Analytics /></AdminRoute>
        } />
        <Route path="/admin/system-logs" element={
          <AdminRoute><SystemLogs /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
