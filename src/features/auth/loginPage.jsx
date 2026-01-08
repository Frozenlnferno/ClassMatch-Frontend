import { supabase } from "../../../supabase.js";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { normalizeEmail } from "../../utils/normalize.js";
import logger from "../../utils/logger.js";
import { loginWithEmail } from "./auth.js";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            logger.error("Email and password are required.");
            setError("Email and password are required.");
            return;
        }
        const normalizedEmail = normalizeEmail(email);
        
        try {
            const data = await loginWithEmail(normalizedEmail, password);
            logger.info("User logged in successfully:", data);
            setError(null);
            navigate("/mygroups");
        } catch (err) {
            logger.error("Error logging in:", err);
            setError(err.message || "Login failed");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Sign in to ClassMatch</h1>
                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md shadow"
                        >
                            Sign In
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <Link to="/signup" className="text-blue-600 hover:underline">Don't have an account?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}