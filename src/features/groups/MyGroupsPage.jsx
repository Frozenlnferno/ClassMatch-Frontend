import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGroup, getUserGroups, joinGroup } from "./groupService.js";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  TextArea,
  Toggle,
} from "../../components/ui.jsx";
import { ArrowRightIcon, CopyIcon, PlusIcon, UsersIcon } from "../../components/icons.jsx";
import { buildInviteLink, copyText } from "../../utils/classMatch.js";

function CreateGroupModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    groupName: "",
    description: "",
    joinable: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm({ groupName: "", description: "", joinable: true });
    setError("");
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setError("");
      await onSubmit({
        groupName: form.groupName.trim(),
        description: form.description.trim(),
        joinable: form.joinable,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create group");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a group"
      description="Set up a shared space for classmates, friends, or study partners."
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-group-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create group"}
          </Button>
        </>
      )}
    >
      <form id="create-group-form" className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <Banner title="Group issue" tone="danger">
            {error}
          </Banner>
        ) : null}

        <Field label="Group name">
          <Input
            value={form.groupName}
            onChange={(event) => setForm((current) => ({ ...current, groupName: event.target.value }))}
            placeholder="CS 374 Study Group"
            required
          />
        </Field>

        <Field label="Description">
          <TextArea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="What this group is for, who it's for, and how people should use it."
          />
        </Field>

        <Field label="Joinability" hint={form.joinable ? "Anyone with the code can join" : "Only the owner can re-open it"}>
          <Toggle
            checked={form.joinable}
            onChange={(joinable) => setForm((current) => ({ ...current, joinable }))}
            onLabel="Open"
            offLabel="Closed"
          />
        </Field>
      </form>
    </Modal>
  );
}

export default function MyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    refreshGroups();
  }, []);

  async function refreshGroups() {
    try {
      setIsLoading(true);
      setError("");
      const response = await getUserGroups();
      setGroups(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load groups");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateGroup(groupData) {
    try {
      setIsCreating(true);
      setError("");
      setSuccess("");
      await createGroup(groupData);
      await refreshGroups();
      setIsCreateOpen(false);
      setSuccess("Group created. Share the invite link from the group card when you're ready.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinGroup(event) {
    event.preventDefault();

    try {
      setIsJoining(true);
      setError("");
      setSuccess("");
      await joinGroup(joinCode.trim());
      setJoinCode("");
      await refreshGroups();
      setSuccess("Group joined successfully.");
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Unable to join group");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleCopyInvite(group) {
    try {
      await copyText(buildInviteLink(group.join_code));
      setSuccess(`Invite link copied for ${group.name}.`);
      setError("");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy invite link");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Groups"
        title="Your ClassMatch groups"
        description="Create a new group, join by invite code, or jump back into the spaces you already share with classmates."
        actions={(
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Create group
          </Button>
        )}
      />

      {error ? (
        <Banner title="Group issue" tone="danger">
          {error}
        </Banner>
      ) : null}
      {success ? (
        <Banner title="Success" tone="success">
          {success}
        </Banner>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">All groups</div>
              <div className="mt-1 text-sm text-slate-500">Each card includes your role, the member count, and a sharable invite link.</div>
            </div>
            <Badge tone="blue">{groups.length} total</Badge>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-48 rounded-[28px] bg-slate-100" />
              ))}
            </div>
          ) : groups.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <Card key={group.id} className="rounded-[28px] p-5 shadow-none ring-1 ring-slate-100">
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <Avatar src={group.group_icon_url} name={group.name} size="lg" />
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge tone="neutral">{group.role}</Badge>
                          <Badge tone={group.joinable ? "emerald" : "amber"}>
                            {group.joinable ? "Open" : "Closed"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{group.name}</div>
                        <div className="mt-2 text-sm text-slate-500">{group.member_count} members - Code {group.join_code}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyInvite(group)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          <CopyIcon className="size-4" />
                          Copy invite link
                        </button>
                      </div>

                      <Link to={`/groups/${group.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Open group
                        <ArrowRightIcon className="size-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No groups yet"
              description="Create your first group or join one with an invite code to start connecting course overlap with people you know."
              action={(
                <Button onClick={() => setIsCreateOpen(true)}>
                  <PlusIcon className="size-4" />
                  Create a group
                </Button>
              )}
            />
          )}
        </Card>

        <Card className="space-y-5">
          <div className="rounded-[28px] bg-blue-50/70 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <UsersIcon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Join with an invite code</div>
                <div className="text-sm text-slate-500">Paste the code a classmate shared with you.</div>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleJoinGroup}>
            <Field label="Invite code">
              <Input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="XcMiAsad"
                autoCapitalize="characters"
                required
              />
            </Field>
            <Button type="submit" size="lg" disabled={isJoining} className="w-full">
              {isJoining ? "Joining..." : "Join group"}
            </Button>
          </form>
        </Card>
      </div>

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateGroup}
        isSubmitting={isCreating}
      />
    </div>
  );
}
