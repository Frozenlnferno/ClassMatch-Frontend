import { useEffect, useRef, useState } from "react";

export default function CreateModal({ onClose }) {
    const ANIMATION_MS = 200;
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [isJoinable, setIsJoinable] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const closeTimeoutRef = useRef(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const handleClose = () => {
        if (closeTimeoutRef.current) return;
        setIsVisible(false);
        closeTimeoutRef.current = setTimeout(() => {
            onClose();
        }, ANIMATION_MS);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Creating group:", { groupName, description, isJoinable });
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-50">
        {/* Overlay */}
			<div
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
                    isVisible ? "opacity-100" : "opacity-0"
                }`}
				aria-hidden="true"
			/>

            {/* Centered panel wrapper */}
            <div
                className="absolute inset-0 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                {/* Panel */}
                <div
                    className={`w-full max-w-lg rounded-lg bg-white shadow-xl transition-all duration-200 ease-out ${
                        isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-group-title"
                >
                    <div className="px-4 pt-5 pb-4 sm:p-6">
                        <h3
                            id="create-group-title"
                            className="mb-4 text-lg font-medium text-gray-900"
                        >
                            Create New Group
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="group-name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    id="group-name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter group name"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="group-description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="group-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none"
                                    placeholder="Describe your group"
                                />
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    id="joinable-toggle"
                                    type="checkbox"
                                    checked={isJoinable}
                                    onChange={(e) => setIsJoinable(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Allow others to join with invite code
                                </span>
                            </label>

                            {/* Footer buttons inside the form so submit works naturally */}
                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
