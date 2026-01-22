import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupMembers, updateGroupInfo, leaveGroup, getMatchingClassmates } from './service.js';
import { getSchedule } from '../schedules/service.js';
import GroupMembers from './GroupMembers';
import SkeletonWrapper from '../../components/SkeletonWrapper';
import logger from '../../utils/logger.js';
import useSession from '../auth/useSession.js';

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
    const [userSchedule, setUserSchedule] = useState([]);
    const [matchingClassmates, setMatchingClassmates] = useState([]);
    const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear());
    const [scheduleTerm, setScheduleTerm] = useState('fall');
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const { session, isSessionLoading } = useSession();

    useEffect(() => {
        if (isSessionLoading) return;
        if (!session) return; // if somehow unauthenticated, guard can redirect, or show message
        if (!groupId) return;

        fetchGroupDetails();
    }, [groupId, session, isSessionLoading]);


    const fetchScheduleAndMatches = async () => {
        if (!groupId) return;

        setScheduleLoading(true);
        try {
            // Fetch user's schedule
            const scheduleData = await getSchedule(scheduleYear.toString(), scheduleTerm);
            setUserSchedule(scheduleData);

            // Fetch matching classmates
            const matchesData = await getMatchingClassmates(groupId, scheduleYear.toString(), scheduleTerm);
            setMatchingClassmates(matchesData);
        } catch (err) {
            logger.error('Failed to fetch schedule data:', err);
        } finally {
            setScheduleLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchScheduleAndMatches();
        }
    }, [groupId, scheduleYear, scheduleTerm]);

    const fetchGroupDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Get current user info
            if (!session) {
                setError('No active session');
                setLoading(false);
                return;
            }

            setCurrentUserId(session.user.id);

            // Fetch group members
            const membersData = await getGroupMembers(groupId);
            setMembers(membersData);

            // Find current user's role
            const currentMember = membersData.find(member => member[0] === session.user.id);
            if (currentMember) {
                setCurrentUserRole(currentMember[2]);
            }

            setGroup({
                id: groupId,
                memberCount: membersData.length,
            });
        } catch (err) {
            setError(err.message);
            logger.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return;

        setLeaving(true);
        setError(null);
        try {
            await leaveGroup(groupId);
            navigate('/mygroups');
            logger.info('Left group successfully');
        } catch (err) {
            setError(err.message);
            logger.error('Leave failed:', err);
            setLeaving(false);
        }
    };

    // if (loading) return <div className="p-5">Loading group details...</div>;

    return (
        <div className="p-5 max-w-2xl mx-auto">
            
            <div className="flex justify-between items-center mb-5">
                <SkeletonWrapper loading={loading}>
                    <h1 className="m-0 text-2xl font-semibold">Group Details</h1>
                </SkeletonWrapper>
                <SkeletonWrapper loading={loading}>
                <button
                    onClick={() => navigate('/mygroups')}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Back
                </button>
                </SkeletonWrapper>
            </div>
            

            {error && (
                <div className="mb-5 p-3 bg-red-100 text-red-800 rounded border border-red-200">
                    {error}
                </div>
            )}

            {true && (
                <>
                    <SkeletonWrapper loading={loading}>
                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <h2 className="m-0 mb-3 text-lg font-medium">Group Info</h2>
                        <p className="my-2 text-gray-600">ID: <strong>{group?.id}</strong></p>
                        <p className="my-2 text-gray-600">Total Members: <strong>{group?.memberCount}</strong></p>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleLeaveGroup}
                                disabled={leaving}
                                className={`px-4 py-2 rounded text-white ${leaving ? 'bg-red-300 cursor-not-allowed opacity-60' : 'bg-red-600'}`}
                            >
                                {leaving ? 'Leaving...' : 'Leave Group'}
                            </button>
                        </div>
                    </div>
</SkeletonWrapper>

<SkeletonWrapper loading={loading}>
                    <GroupMembers
                        members={members}
                        memberCount={group?.memberCount}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        groupId={groupId}
                        onMemberAction={fetchGroupDetails}
                    />
                    </SkeletonWrapper>

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
