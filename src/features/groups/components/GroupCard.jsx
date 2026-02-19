import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

export default function GroupCard({ group }) {
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate(`/groups/1`);
    }
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-500 hover:border-l-5 hover:translate-x-1"
            onClick={handleSubmit}
        >
            <section className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-foreground"> {group.name} </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span className="text-gray-600">
                                    {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 ">
                    <ChevronRight className="h-6 w-6 text-muted-foreground " />
                </div>
            </section>
        </div>
    );
}