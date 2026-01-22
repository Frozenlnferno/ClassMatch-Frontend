import { useState } from 'react';
import { joinGroup } from '../service.js';
import logger from '../../../utils/logger.js';

export default function JoinGroupForm({ onJoinSuccess, onError }) {
    const [joinCode, setJoinCode] = useState('');
    const [joiningCode, setJoiningCode] = useState('');

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        try {
            setJoiningCode(joinCode);
            await joinGroup(joinCode);
            setJoinCode('');
            setJoiningCode('');
            onJoinSuccess();
            logger.info('Joined group successfully');
        } catch (err) {
            onError(err.message);
            setJoiningCode('');
            logger.error('Join failed:', err);
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
