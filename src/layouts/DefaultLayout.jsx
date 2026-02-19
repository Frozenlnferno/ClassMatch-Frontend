import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
