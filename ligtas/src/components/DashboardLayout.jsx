import { Link } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-6">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        <ul className="space-y-3">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Logout</Link></li>
        </ul>
      </aside>

      <main className="flex-1 p-10 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
