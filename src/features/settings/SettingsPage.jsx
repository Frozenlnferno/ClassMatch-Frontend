import { useEffect, useState } from "react";
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
  Modal,
  PageHeader,
  TextArea,
} from "../../components/ui.jsx";
import { formatDate } from "../../utils/classMatch.js";

function EditProfileModal({ isOpen, onClose, profile, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: "", bio: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: profile?.name || "",
      bio: profile?.bio || "",
    });
    setError("");
  }, [isOpen, profile]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Display name is required.");
      return;
    }

    try {
      setError("");
      await onSubmit({
        name: form.name.trim(),
        bio: form.bio.trim(),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update profile");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit profile"
      description="Update how classmates see your name and bio throughout ClassMatch."
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </>
      )}
    >
      <form id="edit-profile-form" className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <Banner title="Profile issue" tone="danger">
            {error}
          </Banner>
        ) : null}

        <Field label="Display name">
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="How classmates should know you"
          />
        </Field>

        <Field label="Bio">
          <TextArea
            value={form.bio}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            placeholder="Tell classmates a little about yourself, your focus, or what you're working on."
          />
        </Field>
      </form>
    </Modal>
  );
}

function DeleteAccountModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const [confirmationText, setConfirmationText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmationText("");
    }
  }, [isOpen]);

  const canDelete = confirmationText === "DELETE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete account"
      description="This permanently deletes your ClassMatch account, schedules, and group memberships."
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={!canDelete || isDeleting}>
            {isDeleting ? "Deleting..." : "Delete account"}
          </Button>
        </>
      )}
    >
      <div className="space-y-5">
        <Banner title="This action cannot be undone" tone="danger">
          Type DELETE below to confirm that you want to remove your account and all associated data.
        </Banner>

        <Field label='Type "DELETE" to confirm'>
          <Input value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

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
    <div className="space-y-6">
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
          <Card className="space-y-6">
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
            <Card className="space-y-5">
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

            <Card className="space-y-4 border-rose-100">
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
