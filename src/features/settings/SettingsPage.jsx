import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from './service.js';
import logger from '../../utils/logger.js';

export default function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState({ name: false, bio: false });
    const [editValues, setEditValues] = useState({ name: '', bio: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUserProfile();
            setProfile(data);
            setEditValues({ name: data.name || '', bio: data.bio || '' });
        } catch (err) {
            setError(err.message);
            logger.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field) => {
        setEditing(prev => ({ ...prev, [field]: true }));
    };

    const handleCancel = (field) => {
        setEditing(prev => ({ ...prev, [field]: false }));
        setEditValues(prev => ({ ...prev, [field]: profile[field] || '' }));
    };

    const handleSave = async (field) => {
        try {
            setError(null);
            const updates = { [field]: editValues[field] };
            await updateUserProfile(updates);
            setProfile(prev => ({ ...prev, [field]: editValues[field] }));
            setEditing(prev => ({ ...prev, [field]: false }));
            logger.info(`Profile ${field} updated successfully`);
        } catch (err) {
            setError(err.message);
            logger.error(`Failed to update ${field}:`, err);
        }
    };

    const handleInputChange = (field, value) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* Profile Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

                    {/* Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        {editing.name ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editValues.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => handleSave('name')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => handleCancel('name')}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-900">{profile?.name || 'Not set'}</span>
                                <button
                                    onClick={() => handleEdit('name')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        {editing.bio ? (
                            <div className="flex gap-2">
                                <textarea
                                    value={editValues.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    rows={3}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us about yourself..."
                                />
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleSave('bio')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleCancel('bio')}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-900">{profile?.bio || 'Not set'}</span>
                                <button
                                    onClick={() => handleEdit('bio')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Join Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                        <span className="text-gray-900">
                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to log out?')) {
                                const { logout } = await import('../auth/auth.js');
                                await logout();
                                window.location.href = '/';
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}