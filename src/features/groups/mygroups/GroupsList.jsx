import GroupCard from './GroupCard';

export default function GroupsList({ groups }) {
    return (
        <div>
            <h2 className="text-xl font-semibold">Groups ({groups.length})</h2>
            {groups.length === 0 ? (
                <p className="text-gray-600">No groups yet. Join or create one!</p>
            ) : (
                <div className="flex flex-col gap-3 mt-3">
                    {groups.map((group) => (
                        <GroupCard key={group[0]} group={group} />
                    ))}
                </div>
            )}
        </div>
    );
}