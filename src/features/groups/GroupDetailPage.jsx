import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase';
import GroupMembers from './GroupMembers';

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaving, setLeaving] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [currentJoinable, setCurrentJoinable] = useState(null);
    const [togglingJoinable, setTogglingJoinable] = useState(false);
    const [userSchedule, setUserSchedule] = useState([]);
    const [matchingClassmates, setMatchingClassmates] = useState([]);
    const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear());
    const [scheduleTerm, setScheduleTerm] = useState('fall');
    const [scheduleLoading, setScheduleLoading] = useState(false);

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchScheduleAndMatches = async () => {
        if (!sessionToken || !groupId) return;
        
        setScheduleLoading(true);
        try {
            // Fetch user's schedule
            const scheduleResponse = await fetch(`http://localhost:5000/api/schedules/?year=${scheduleYear}&term=${scheduleTerm}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (scheduleResponse.ok) {
                const scheduleData = await scheduleResponse.json();
                setUserSchedule(scheduleData);
            }

            // Fetch matching classmates
            const matchesResponse = await fetch(`http://localhost:5000/api/schedules/matching-classmates?year=${scheduleYear}&term=${scheduleTerm}&group_id=${groupId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();
                setMatchingClassmates(matchesData);
                console.log(matchesData);
            }
        } catch (err) {
            console.error('Failed to fetch schedule data:', err);
        } finally {
            setScheduleLoading(false);
        }
    };

    useEffect(() => {
        if (groupId && sessionToken) {
            fetchScheduleAndMatches();
        }
    }, [groupId, sessionToken, scheduleYear, scheduleTerm]);

    const fetchGroupDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError('No active session');
                setLoading(false);
                return;
            }

            setCurrentUserId(session.user.id);
            setSessionToken(session.access_token);

            // Fetch group members
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}/members`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch group details: ${response.status}`);
            }

            const result = await response.json();
            setMembers(result);
            
            // Find current user's role
            const currentMember = result.find(member => member[0] === session.user.id);
            if (currentMember) {
                setCurrentUserRole(currentMember[2]);
            }
            
            setGroup({
                id: groupId,
                memberCount: result.length,
            });
            // fetch joinable status for this group
            try {
                const groupsResp = await fetch('http://localhost:5000/api/groups/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (groupsResp.ok) {
                    const groupsList = await groupsResp.json();
                    const found = groupsList.find(g => String(g[0]) === String(groupId));
                    if (found) setCurrentJoinable(!!found[5]);
                }
            } catch (err) {
                console.warn('Could not fetch joinable status', err);
            }
        } catch (err) {
            setError(err.message);
            console.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleJoinable = async () => {
        if (!window.confirm('Toggle group joinable status?')) return;
        setTogglingJoinable(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/groups/change-joinable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ group_id: groupId, joinable: !currentJoinable }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to change joinable: ${response.status}`);
            }

            setCurrentJoinable(!currentJoinable);
        } catch (err) {
            setError(err.message);
            console.error('Toggle joinable failed:', err);
        } finally {
            setTogglingJoinable(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return;

        setLeaving(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError('No active session');
                setLeaving(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/groups/leave', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ group_id: groupId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to leave group: ${response.status}`);
            }

            navigate('/mygroups');
        } catch (err) {
            setError(err.message);
            console.error('Leave failed:', err);
            setLeaving(false);
        }
    };

    if (loading) return <div className="p-5">Loading group details...</div>;

    return (
        <div className="p-5 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-5">
                <h1 className="m-0 text-2xl font-semibold">Group Details</h1>
                <button
                    onClick={() => navigate('/mygroups')}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="mb-5 p-3 bg-red-100 text-red-800 rounded border border-red-200">
                    {error}
                </div>
            )}

            {group && (
                <>
                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <h2 className="m-0 mb-3 text-lg font-medium">Group Info</h2>
                        <p className="my-2 text-gray-600">ID: <strong>{group.id}</strong></p>
                        <p className="my-2 text-gray-600">Total Members: <strong>{group.memberCount}</strong></p>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleLeaveGroup}
                                disabled={leaving}
                                className={`px-4 py-2 rounded text-white ${leaving ? 'bg-red-300 cursor-not-allowed opacity-60' : 'bg-red-600'}`}
                            >
                                {leaving ? 'Leaving...' : 'Leave Group'}
                            </button>
                            {(currentUserRole === 'admin' || currentUserRole === 'owner') && currentJoinable !== null && (
                                <button
                                    onClick={handleToggleJoinable}
                                    disabled={togglingJoinable}
                                    className={`px-4 py-2 rounded text-white ${togglingJoinable ? 'cursor-not-allowed opacity-60' : (currentJoinable ? 'bg-green-600' : 'bg-gray-600')}`}
                                >
                                    {togglingJoinable ? (currentJoinable ? 'Closing...' : 'Opening...') : (currentJoinable ? 'Open to Join' : 'Closed')}
                                </button>
                            )}
                        </div>
                    </div>

                    <GroupMembers 
                        members={members} 
                        memberCount={group.memberCount} 
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        groupId={groupId}
                        sessionToken={sessionToken}
                        onMemberAction={fetchGroupDetails}
                    />

                    {/* Class Matching Section */}
                    <div className="mt-8 p-4 border rounded bg-blue-50">
                        <h2 className="text-xl font-semibold mb-4">Class Matching</h2>
                        
                        {/* Year/Term Controls */}
                        <div className="flex gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select
                                    value={scheduleYear}
                                    onChange={(e) => setScheduleYear(parseInt(e.target.value))}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                                <select
                                    value={scheduleTerm}
                                    onChange={(e) => setScheduleTerm(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="fall">Fall</option>
                                    <option value="winter">Winter</option>
                                    <option value="spring">Spring</option>
                                    <option value="summer">Summer</option>
                                </select>
                            </div>
                        </div>

                        {scheduleLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Loading class matches...</p>
                            </div>
                        ) : userSchedule.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-gray-600">No schedule found for {scheduleTerm} {scheduleYear}. Upload your schedule on the Schedule page.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userSchedule.map((course) => {
                                    // Find matching classmates for this class
                                    const matchesForClass = matchingClassmates.filter(match => match[0] === course[0]);
                                    
                                    return (
                                        <div key={course[0]} className="border rounded-lg p-4 bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {course[4]} {course[5]} - {course[6]}
                                                    </h3>
                                                    <p className="text-gray-700 font-medium">{course[7]}</p>
                                                    <p className="text-gray-600 text-sm">CRN: {course[3]}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-600">
                                                    <p>{course[2]} {course[1]}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t pt-3">
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    Classmates ({matchesForClass.length})
                                                </h4>
                                                {matchesForClass.length === 0 ? (
                                                    <p className="text-gray-600 text-sm italic">No group members share this class</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {matchesForClass.map((match, index) => (
                                                            <span 
                                                                key={index}
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                                            >
                                                                {match[2]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
