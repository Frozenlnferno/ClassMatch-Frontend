import { useEffect, useState } from "react"
import { getUserProfile, updateUserProfile } from "./service.js"
import { logout, updatePassword } from "../auth/auth.js"
import useSession from "../auth/useSession"
import logger from "../../utils/logger.js"

export default function SettingsPage() {
    const { session } = useSession()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [editing, setEditing] = useState({ name: false, bio: false })
    const [editValues, setEditValues] = useState({ name: "", bio: "" })

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [changingPassword, setChangingPassword] = useState(false)
    const [deleteConfirmValue, setDeleteConfirmValue] = useState("")

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getUserProfile()
            setProfile(data)
            setEditValues({ name: data.name || "", bio: data.bio || "" })
        } catch (err) {
            setError(err.message)
            logger.error("Failed to fetch profile:", err)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = () => {
        const name = profile?.name || session?.user?.user_metadata?.name || ""
        if (!name.trim()) return "CM"
        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleEdit = (field) => {
        setEditing((prev) => ({ ...prev, [field]: true }))
        setSuccess(null)
    }

    const handleCancel = (field) => {
        setEditing((prev) => ({ ...prev, [field]: false }))
        setEditValues((prev) => ({ ...prev, [field]: profile?.[field] || "" }))
    }

    const handleSave = async (field) => {
        try {
            setError(null)
            setSuccess(null)
            const updates = { [field]: editValues[field] }
            await updateUserProfile(updates)
            setProfile((prev) => ({ ...prev, [field]: editValues[field] }))
            setEditing((prev) => ({ ...prev, [field]: false }))
            setSuccess(`Updated ${field} successfully.`)
        } catch (err) {
            setError(err.message)
            logger.error(`Failed to update ${field}:`, err)
        }
    }

    const handleInputChange = (field, value) => {
        setEditValues((prev) => ({ ...prev, [field]: value }))
    }

    const handleChangePassword = async () => {
        setError(null)
        setSuccess(null)

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        try {
            setChangingPassword(true)
            await updatePassword(newPassword)
            setNewPassword("")
            setConfirmPassword("")
            setSuccess("Password updated successfully.")
        } catch (err) {
            setError(err.message)
            logger.error("Failed to update password:", err)
        } finally {
            setChangingPassword(false)
        }
    }

    const handleDeleteRequest = async () => {
        setError(null)
        setSuccess(null)

        if (deleteConfirmValue !== "DELETE") {
            setError('Type DELETE exactly to confirm.')
            return
        }

        // No delete-account API currently exists in backend or auth wrapper.
        setError("Account deletion is not available yet. Please contact support to remove your account.")
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-40" />
                    <div className="h-56 bg-gray-200 rounded-xl" />
                    <div className="h-56 bg-gray-200 rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
                    {success}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                            {getInitials()}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{profile?.name || "Unnamed User"}</h2>
                        <p className="mt-1 text-sm text-gray-500">{profile?.email || session?.user?.email || "No email"}</p>
                        <p className="mt-3 text-xs text-gray-500">
                            Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                        </p>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        {editing.name ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={editValues.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => handleSave("name")}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => handleCancel("name")}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-gray-900 text-sm">{profile?.name || "Not set"}</p>
                                <button
                                    onClick={() => handleEdit("name")}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900 text-sm">{profile?.email || session?.user?.email || "No email"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        {editing.bio ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    rows={4}
                                    value={editValues.bio}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell your classmates a little about yourself"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSave("bio")}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleCancel("bio")}
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-gray-900 text-sm">{profile?.bio || "No bio yet."}</p>
                                <button
                                    onClick={() => handleEdit("bio")}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {changingPassword ? "Updating..." : "Update Password"}
                </button>
            </section>

            <section className="mt-6 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-3">
                    Type <span className="font-semibold">DELETE</span> to confirm account deletion.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={deleteConfirmValue}
                        onChange={(e) => setDeleteConfirmValue(e.target.value)}
                        placeholder="Type DELETE"
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                        onClick={handleDeleteRequest}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={async () => {
                            await logout()
                            window.location.href = "/"
                        }}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                        Logout Instead
                    </button>
                </div>
            </section>
        </div>
    )
}