import DashboardLayout from "../components/layout/DashboardLayout";

export default function EducatorDashboard() {
  return (
    <DashboardLayout title="Educator Dashboard">
      <h1 className="text-3xl font-bold mb-6">Manage Classes</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">Create Module</div>
        <div className="bg-white p-6 rounded shadow">Student Progress</div>
      </div>
    </DashboardLayout>
  );
}
