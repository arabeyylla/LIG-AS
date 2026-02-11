import DashboardLayout from "../components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <h1 className="text-3xl font-bold mb-6">System Control Panel</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">User Management</div>
        <div className="bg-white p-6 rounded shadow">System Logs</div>
        <div className="bg-white p-6 rounded shadow">Server Status</div>
      </div>
    </DashboardLayout>
  );
}
