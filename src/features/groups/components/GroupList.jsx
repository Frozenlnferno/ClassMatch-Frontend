import { useEffect, useState } from "react";
import GroupCard from "./GroupCard";
import { getUserGroups } from "../service";
import logger from "../../../utils/logger";

export default function GroupList() {
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
      const data = await getUserGroups();
      setGroups(data);
    } catch (err) {
      logger.error("Failed to fetch groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Groups ({groups.length})</h3>
      {groups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven&apos;t joined any groups yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create a group or join one with an invite code.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}