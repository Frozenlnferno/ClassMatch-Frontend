import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import useSession from "../features/auth/useSession";
import MenuButton from "./menuButtons";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, accessToken } = useSession();
  
  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center no-underline">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">CM</div>
              <div className="text-xl font-bold text-blue-600">ClassMatch</div>
            </Link>
          </div>
          
          {/* Desktop links */}
          <div className="hidden sm:flex items-center space-x-2">
            <MenuButton session={session} isDesktop={true} onClose={() => setOpen(false)}/>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className={`h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="sm:hidden mt-2 pb-4">
            <MenuButton session={session} isDesktop={false} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
      <div className="text-sm"> {accessToken} </div> {/* THIS IS TEMPORARY!!! */}
    </nav>
  );
}
