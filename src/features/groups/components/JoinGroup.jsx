import { useState } from 'react';

export default function JoinGroup() {
    const [inviteCode, setInviteCode] = useState('');

    const handleJoin = () => {
        if (inviteCode.trim()) {
            // Handle join group logic here
            console.log('Joining group with code:', inviteCode);
            setInviteCode('');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-8 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Join a Group</h3>
            <p className="text-gray-600 mb-4">
                Enter an invite code to join an existing group.
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                    aria-label="Invite code"
                />
                <button
                    onClick={handleJoin}
                    disabled={!inviteCode.trim()}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Join group"
                >
                    Join
                </button>
            </div>
        </div>
    );
}