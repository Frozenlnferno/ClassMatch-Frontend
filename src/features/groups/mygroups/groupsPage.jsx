import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase';
import CreateGroupForm from './CreateGroupForm';
import JoinGroupForm from './JoinGroupForm';
import GroupsList from './GroupsList';

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
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError('No active session');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/groups/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch groups: ${response.status}`);
            }

            const result = await response.json();
            setGroups(result);
        } catch (err) {
            setError(err.message);
            console.error('Request failed:', err);
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

    if (loading) return <div className="p-5">Loading groups...</div>;

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