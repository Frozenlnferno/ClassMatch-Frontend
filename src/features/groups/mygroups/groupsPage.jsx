import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase';

export default function MyGroupsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        testBackendRequest();
    }, []);

    const testBackendRequest = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get the current session and JWT token
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError('No active session');
                setLoading(false);
                return;
            }

            const token = session.access_token;

            // Make the request to the backend
            const response = await fetch('http://localhost:5000/api/schedule', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
            console.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Backend Connection</h1>
            <button onClick={testBackendRequest} disabled={loading}>
                {loading ? 'Loading...' : 'Test Request'}
            </button>
            
            {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}
            
            {data && (
                <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                    <h2>Response Data:</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}