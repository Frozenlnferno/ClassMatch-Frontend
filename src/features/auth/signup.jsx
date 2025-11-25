import { supabase } from "../../../supabase.js";
import { useState } from "react";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log(name, email, password);
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800"> Sign Up Page </h1>
            <form className="flex flex-col">
                <input type="text" placeholder="Name" 
                    className="border border-gray-300 rounded px-4 py-2 mt-4" 
                    onChange={(e) => setName(e.target.value)}
                />
                <input type="email" placeholder="Email" 
                    className="border border-gray-300 rounded px-4 py-2 mt-4" 
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input type="password" placeholder="Password" 
                    className="border border-gray-300 rounded px-4 py-2 mt-4"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit"
                    className="bg-blue-500 text-white rounded px-4 py-2 mt-4 hover:bg-blue-600"
                    onClick={handleSignUp}
                    >
                        Sign Up
                </button>
            </form>
        </div>
    );
}