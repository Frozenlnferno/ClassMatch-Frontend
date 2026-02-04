import GroupCard from './GroupCard';

// Mock data - replace with actual data fetching
const mockGroups = [
    {
        id: 1,
        name: 'CS 101 Study Group',
        description: 'Group for Computer Science 101 students',
        memberCount: 5,
        createdAt: '2024-01-15'
    },
    {
        id: 2,
        name: 'Math Club',
        description: 'Mathematics enthusiasts sharing schedules',
        memberCount: 12,
        createdAt: '2024-01-10'
    },
    {
        id: 3,
        name: 'Project Team Alpha',
        description: 'Collaborative project work group',
        memberCount: 8,
        createdAt: '2024-01-20'
    }
];

export default function GroupList() {
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Groups ({mockGroups.length}) </h3>
            {mockGroups.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">You haven't joined any groups yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Create a group or join one with an invite code.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {mockGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}
        </div>
    );
}