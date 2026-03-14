import { useState, useRef } from 'react';
import CreateModal from './components/CreateModal';
import JoinGroup from './components/JoinGroup';
import GroupList from './components/GroupList';

export default function MyGroupsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const listRef = useRef(null);

    const refreshGroups = () => {
        // GroupList re-fetches on mount; we force re-mount by changing key
        listRef.current = Date.now();
        setListKey(listRef.current);
    };

    const [listKey, setListKey] = useState(0);

    return (
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8">
                {/* Page Header */}
                <section>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">My Groups</h2>
                            <p className="mt-1 text-gray-600">Manage your groups</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Group
                        </button>
                    </div>
                </section>

                <section aria-label="Join a group">
                    <JoinGroup onGroupJoined={refreshGroups} />
                </section>

                <section aria-label="Your groups">
                    <GroupList key={listKey} />
                </section>
            </div>

            {isCreateModalOpen && (
                <CreateModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onGroupCreated={refreshGroups}
                />
            )}
        </main>
    );
}