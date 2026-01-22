import { useEffect, useState } from 'react';
import { getUserGroups } from '../service.js';
import CreateGroupForm from './CreateGroupForm';
import JoinGroupForm from './JoinGroupForm';
import GroupsList from './GroupsList';
import logger from '../../../utils/logger.js';

export default function MyGroupsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getUserGroups();
            setGroups(result);
        } catch (err) {
            setError(err.message);
            logger.error('Failed to fetch groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSuccess = () => {
        fetchGroups();
    };

    const handleError = (errorMsg) => {
        setError(errorMsg);
    };

    if (loading) return <div className="p-5 text-center">Loading groups...</div>;

    return (
        <div className="p-5 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">My Groups</h1>

            <CreateGroupForm onCreateSuccess={handleJoinSuccess} onError={handleError} />
            <JoinGroupForm onJoinSuccess={handleJoinSuccess} onError={handleError} />

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-200">
                    {error}
                </div>
            )}

            <GroupsList groups={groups} />
        </div>
    );
}