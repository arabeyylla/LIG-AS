import DashboardLayout from "../components/DashboardLayout";

export default function StudentDashboard() {
  return (
    <DashboardLayout title="Student Dashboard">
      <h1 className="text-3xl font-bold mb-6">Welcome Student</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">Active Modules</div>
        <div className="bg-white p-6 rounded shadow">Leaderboard</div>
        <div className="bg-white p-6 rounded shadow">Badges</div>
      </div>
    </DashboardLayout>
  );
}
