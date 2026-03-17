import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../contexts/ProfileContext.jsx";
import { deleteUserAccount, updateUserProfile, uploadUserAvatar } from "./settingsService.js";
import { updatePassword, logout } from "../auth/auth.js";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
} from "../../components/ui.jsx";
import { formatDate } from "../../utils/classMatch.js";
import EditProfileModal from "./components/EditProfileModal.jsx";
import DeleteAccountModal from "./components/DeleteAccountModal.jsx";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, isLoading, error: profileError, refreshProfile } = useProfile();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function handleProfileUpdate(updates) {
    try {
      setIsSavingProfile(true);
      setError("");
      setSuccess("");
      await updateUserProfile(updates);
      await refreshProfile();
      setIsEditOpen(false);
      setSuccess("Profile updated.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError("");
      setSuccess("");
      await uploadUserAvatar(file);
      await refreshProfile();
      setSuccess("Profile photo updated.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setError("");
      setSuccess("");
      await updatePassword(passwordForm.password);
      setPasswordForm({ password: "", confirmPassword: "" });
      setSuccess("Password updated.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Unable to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setIsDeletingAccount(true);
      setError("");
      await deleteUserAccount();
      await logout();
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete account");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteOpen(false);
    }
  }

  return (
    <div className="motion-fade-up space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Profile & settings"
        description="Keep your profile current, update your password, and manage account-level settings from one place."
        actions={<Button onClick={() => setIsEditOpen(true)}>Edit profile</Button>}
      />

      {error || profileError ? (
        <Banner title="Settings issue" tone="danger">
          {error || profileError}
        </Banner>
      ) : null}
      {success ? (
        <Banner title="Saved" tone="success">
          {success}
        </Banner>
      ) : null}

      {isLoading ? (
        <LoadingState title="Loading profile" description="Pulling in your account information." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="motion-fade-up motion-delay-1 space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar src={profile?.avatar_url} name={profile?.name} size="xl" />
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-semibold tracking-tight text-slate-900">{profile?.name}</div>
                  <div className="text-sm text-slate-500">{profile?.email}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="blue">Joined {formatDate(profile?.created_at)}</Badge>
                  <label className="inline-flex cursor-pointer items-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                    {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Display name</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{profile?.name}</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Date joined</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{formatDate(profile?.created_at)}</div>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Bio</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {profile?.bio || "Add a short bio so classmates know what you're studying or what you're interested in."}
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="motion-fade-up motion-delay-1 space-y-5">
              <div>
                <div className="text-lg font-semibold text-slate-900">Change password</div>
                <div className="mt-1 text-sm text-slate-500">Choose a new password for your account.</div>
              </div>

              <form className="space-y-4" onSubmit={handlePasswordUpdate}>
                <Field label="New password">
                  <Input
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field label="Confirm password">
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Button type="submit" disabled={isUpdatingPassword} className="w-full">
                  {isUpdatingPassword ? "Updating..." : "Change password"}
                </Button>
              </form>
            </Card>

            <Card className="motion-fade-up motion-delay-2 space-y-4 border-rose-100">
              <div>
                <div className="text-lg font-semibold text-slate-900">Delete account</div>
                <div className="mt-1 text-sm text-slate-500">
                  This removes your schedules, memberships, and account record permanently.
                </div>
              </div>
              <Button variant="danger" onClick={() => setIsDeleteOpen(true)} className="w-full">
                Delete account
              </Button>
            </Card>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSubmit={handleProfileUpdate}
        isSubmitting={isSavingProfile}
      />

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
}
