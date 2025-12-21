import { supabase } from "../../../supabase.js";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { normalizeEmail, normalizeName } from "../../utils/normalize.js";
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
            return;
        }
        const normalizedEmail = normalizeEmail(email);
        
        try {
            const data = await loginWithEmail(normalizedEmail, password);
            logger.info("User logged in successfully:", data); //data.user.email
            setError(null);
            navigate("/mygroups");
        } catch (err) {
            logger.error("Error logging in:", err);
            setError(err.message);
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center gap-y-3">
            <h1 className="text-2xl font-bold text-gray-800"> Login Page </h1>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <form className="flex flex-col gap-y-4 ">
                <input type="email" 
                    placeholder="example@gmail.com" 
                    className="border border-gray-300 rounded px-4 py-2" 
                    onChange={(e) => setEmail(e.target.value)}
                    
                />
                <input type="password" 
                    placeholder="••••••••••" 
                    className="border border-gray-300 rounded px-4 py-2"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit"
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                    onClick={handleLogin}
                    >
                        Login
                </button>
                <Link to="/signup" className="underline text-center hover:text-blue-600"> 
                    Don't have an account? 
                </Link>
            </form>
        </div>
    );
}