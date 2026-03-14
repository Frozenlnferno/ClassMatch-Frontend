import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

export default function GroupCard({ group }) {
    const navigate = useNavigate();
    const memberCount = group.member_count ?? group.memberCount ?? 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-500 hover:border-l-4 hover:translate-x-1"
            onClick={() => navigate(`/groups/${group.id}`)}
        >
            <section className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {memberCount} {memberCount === 1 ? "member" : "members"}
                            </span>
                            {group.role && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                                    {group.role}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
            </section>
        </div>
    );
}