import { Navigate } from "react-router-dom";
import useSession from "../features/auth/useSession.js";

/**
 * ProtectedRoute: Redirects to /login if no session
 * @param {JSX.Element} element - Component to render
 * @returns {JSX.Element} Component or redirect
 */
export function ProtectedRoute({ element }) {
  const { session, isSessionLoading } = useSession();

  if (isSessionLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  return session ? element : <Navigate to="/login" replace />;
}

/**
 * PublicRoute: Redirects to /mygroups if session exists
 * Used for login/signup pages to prevent logged-in users from accessing them
 * @param {JSX.Element} element - Component to render
 * @returns {JSX.Element} Component or redirect
 */
export function PublicRoute({ element }) {
  const { session, isSessionLoading } = useSession();

  if (isSessionLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  return !session ? element : <Navigate to="/mygroups" replace />;
}
