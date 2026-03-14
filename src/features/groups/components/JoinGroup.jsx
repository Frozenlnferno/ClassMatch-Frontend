import { useState } from 'react';
import { joinGroup } from '../service';
import logger from '../../../utils/logger';

export default function JoinGroup({ onGroupJoined }) {
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const result = await joinGroup(inviteCode.trim());
            setSuccess(result.status || "Joined successfully!");
            setInviteCode('');
            onGroupJoined?.();
        } catch (err) {
            logger.error("Failed to join group:", err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-8 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Join a Group</h3>
            <p className="text-gray-600 mb-4">
                Enter an invite code to join an existing group.
            </p>
            {error && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-3 rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-green-700 text-sm">{success}</p>
                </div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="Enter invite code"
                    className="flex-1 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                    aria-label="Invite code"
                />
                <button
                    onClick={handleJoin}
                    disabled={!inviteCode.trim() || submitting}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Join group"
                >
                    {submitting ? "Joining..." : "Join"}
                </button>
            </div>
        </div>
    );
}