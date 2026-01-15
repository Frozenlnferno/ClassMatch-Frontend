import { useState } from 'react';
import { supabase } from '../../../../supabase';

export default function JoinGroupForm({ onJoinSuccess, onError }) {
    const [joinCode, setJoinCode] = useState('');
    const [joiningCode, setJoiningCode] = useState('');

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                onError('No active session');
                return;
            }

            setJoiningCode(joinCode);
            const response = await fetch(`http://localhost:5000/api/groups/join?join_code=${encodeURIComponent(joinCode)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to join group: ${response.status}`);
            }

            setJoinCode('');
            setJoiningCode('');
            onJoinSuccess();
        } catch (err) {
            onError(err.message);
            setJoiningCode('');
            console.error('Join failed:', err);
        }
    };

    return (
        <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Join a Group</h3>
            <form onSubmit={handleJoinGroup} className="flex gap-3">
                <input
                    type="text"
                    placeholder="Enter join code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="flex-1 p-2 rounded border border-gray-300"
                />
                <button
                    type="submit"
                    disabled={!joinCode.trim() || joiningCode === joinCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {joiningCode === joinCode ? 'Joining...' : 'Join'}
                </button>
            </form>
        </div>
    );
}
