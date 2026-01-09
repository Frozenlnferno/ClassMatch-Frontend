import { NavLink } from "react-router-dom";
import { logout } from "../features/auth/auth";

export default function MenuButton({ isDesktop=true, session, onClose }) {
  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded-md text-sm font-medium " +
    (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100");

  const mobileLinkClass = ({ isActive }) =>
    "block px-4 py-2 rounded-md text-sm font-medium " +
    (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50");

  return (
    <>
      {isDesktop ? (
        <div className="hidden sm:flex items-center space-x-2">
          
          {!session ? (
            <>
              <NavLink to="/login" className={linkClass}> Login </NavLink>
              <NavLink to="/signup" className={linkClass}> Sign Up </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/mygroups" className={linkClass}> My Groups </NavLink>
              <button 
                  className="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50"
                  onClick={()=> {
                    logout();
                    onClose();
                  }}
              > 
                  Log out 
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          {!session ? (
            <>
              <NavLink
                to="/login"
                className={mobileLinkClass}
                onClick={onClose}
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={mobileLinkClass}
                onClick={onClose}
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/mygroups"
                className={mobileLinkClass}
                onClick={onClose}
              >
                My Groups
              </NavLink>
              <button 
                  className="block px-4 py-2 text-left rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50"
                  onClick={()=> {
                    logout();
                    onClose();
                  }}
              > 
                Log Out 
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}