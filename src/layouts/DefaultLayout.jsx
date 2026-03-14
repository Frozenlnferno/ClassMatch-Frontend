import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
