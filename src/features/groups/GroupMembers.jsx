import { useState } from 'react';
import { kickMember, changeMemberRole } from './service.js';
import logger from '../../utils/logger.js';

export default function GroupMembers({ members, memberCount, currentUserId, currentUserRole, groupId, onMemberAction }) {
    const [actionInProgress, setActionInProgress] = useState(null);
    const [error, setError] = useState(null);

    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'owner';

    const handleKickMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to kick this member?')) return;

        setActionInProgress(`kick-${memberId}`);
        setError(null);
        try {
            await kickMember(groupId, memberId);
            onMemberAction();
            logger.info('Member kicked successfully');
        } catch (err) {
            setError(err.message);
            logger.error('Kick failed:', err);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleChangeRole = async (memberId, newRole) => {
        setActionInProgress(`role-${memberId}`);
        setError(null);
        try {
            await changeMemberRole(groupId, memberId, newRole);
            onMemberAction();
            logger.info('Role changed successfully');
        } catch (err) {
            setError(err.message);
            logger.error('Role change failed:', err);
        } finally {
            setActionInProgress(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold">Members ({memberCount})</h2>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">
                    {error}
                </div>
            )}
            {members.length === 0 ? (
                <p className="text-gray-600">No members found.</p>
            ) : (
                <div className="flex flex-col gap-3 mt-3">
                    {members.map((member) => (
                        <div
                            key={member[0]}
                            className={`p-3 border rounded ${member[0] === currentUserId ? 'bg-blue-50' : 'bg-gray-50'} flex justify-between items-center`}
                        >
                            <div className="flex-1">
                                <p className="m-0 font-medium">
                                    {member[1]}
                                    {member[0] === currentUserId && <span className="ml-2 text-blue-700 font-bold">(you)</span>}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-700">{member[2]}</div>
                                {isAdmin && member[0] !== currentUserId && member[2] !== 'owner' && (
                                    <>
                                        {member[2] === 'member' ? (
                                            <button
                                                onClick={() => handleChangeRole(member[0], 'admin')}
                                                disabled={actionInProgress === `role-${member[0]}`}
                                                className={`px-2 py-1 rounded text-xs text-white ${actionInProgress === `role-${member[0]}` ? 'bg-green-300 cursor-not-allowed opacity-60' : 'bg-green-600'}`}
                                            >
                                                {actionInProgress === `role-${member[0]}` ? 'Promoting...' : 'Promote'}
                                            </button>
                                        ) : member[2] === 'admin' ? (
                                            <button
                                                onClick={() => handleChangeRole(member[0], 'member')}
                                                disabled={actionInProgress === `role-${member[0]}`}
                                                className={`px-2 py-1 rounded text-xs ${actionInProgress === `role-${member[0]}` ? 'bg-yellow-200 cursor-not-allowed opacity-60 text-gray-700' : 'bg-yellow-400 text-gray-800'}`}
                                            >
                                                {actionInProgress === `role-${member[0]}` ? 'Demoting...' : 'Demote'}
                                            </button>
                                        ) : null}
                                        <button
                                            onClick={() => handleKickMember(member[0])}
                                            disabled={actionInProgress === `kick-${member[0]}`}
                                            className={`px-2 py-1 rounded text-xs text-white ${actionInProgress === `kick-${member[0]}` ? 'bg-red-300 cursor-not-allowed opacity-60' : 'bg-red-600'}`}
                                        >
                                            {actionInProgress === `kick-${member[0]}` ? 'Kicking...' : 'Kick'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
