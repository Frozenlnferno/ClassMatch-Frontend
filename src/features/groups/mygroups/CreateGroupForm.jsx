import { useState } from 'react';
import { createGroup } from '../service.js';
import logger from '../../../utils/logger.js';

export default function CreateGroupForm({ onCreateSuccess, onError }) {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [joinable, setJoinable] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return onError && onError('Group name is required');

        setSubmitting(true);
        onError && onError(null);
        try {
            await createGroup({ groupName, description, joinable });
            setGroupName('');
            setDescription('');
            setJoinable(true);
            onCreateSuccess && onCreateSuccess();
            logger.info('Group created successfully');
        } catch (err) {
            logger.error('Create failed:', err);
            onError && onError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mb-5 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Create Group</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="p-2 rounded border border-gray-300"
                />
                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 rounded border border-gray-300 min-h-[60px]"
                />
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={joinable} onChange={(e) => setJoinable(e.target.checked)} />
                    <span>Allow joining via code</span>
                </label>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}
