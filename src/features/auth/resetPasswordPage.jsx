import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeEmail } from "../../utils/normalize.js";
import logger from "../../utils/logger.js";
import { requestPasswordReset, updatePassword } from "./auth.js";

function hasRecoveryTokensInHash() {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    return type === "recovery" && !!accessToken;
}

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isRecoveryMode = useMemo(() => hasRecoveryTokensInHash(), []);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) {
            setError("Email is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await requestPasswordReset(normalizeEmail(email));
            setSuccess("Password reset email sent. Please check your inbox.");
        } catch (err) {
            logger.error("Error sending password reset email:", err);
            setError(err.message || "Failed to send password reset email");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!newPassword) {
            setError("New password is required.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updatePassword(newPassword);
            setSuccess("Password updated successfully. You can now sign in.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            logger.error("Error updating password:", err);
            setError(err.message || "Failed to update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Reset Password</h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    {isRecoveryMode
                        ? "Enter your new password to complete account recovery"
                        : "Enter your email and we will send a reset link"}
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                        <p className="text-green-700 text-sm text-center">{success}</p>
                    </div>
                )}

                {!isRecoveryMode ? (
                    <form className="space-y-4" onSubmit={handleRequestReset}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg shadow-sm transition text-sm"
                        >
                            {isSubmitting ? "Sending..." : "Send Reset Email"}
                        </button>
                    </form>
                ) : (
                    <form className="space-y-4" onSubmit={handleUpdatePassword}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter a new password"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg shadow-sm transition text-sm"
                        >
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-gray-500">
                    Back to{" "}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
