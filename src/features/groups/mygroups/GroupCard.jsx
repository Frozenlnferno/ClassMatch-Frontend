import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase';

export default function GroupCard({ group, onToggle }) {
    const navigate = useNavigate();
    const groupId = group[0];
    const groupName = group[1];
    const joinCode = group[2];
    const role = group[3];
    const memberCount = group[4];


    return (
        <div
            onClick={() => navigate(`/groups/${groupId}`)}
            className="p-4 border rounded bg-white cursor-pointer text-left w-full transition-colors flex justify-between items-center hover:bg-gray-100"
        >
            <div className="flex-1">
                <h3 className="mb-2 text-base font-semibold">{groupName}</h3>
                <p className="text-sm text-gray-600">Join Code: <strong>{joinCode}</strong></p>
                <p className="text-sm text-gray-600">Members: <strong>{memberCount}</strong></p>
            </div>
            <div className="flex gap-2 items-center">
                <div className="bg-blue-100 px-3 py-1 rounded text-sm font-bold text-blue-700">{role}</div>
            </div>
        </div>
    );
}
