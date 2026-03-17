import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSession from "../../utils/useSession.js";
import {
  changeMemberRole,
  getGroupDetails,
  getGroupMembers,
  getMatchingClassmates,
  getPastClassmates,
  kickMember,
  leaveGroup,
  updateGroupInfo,
  uploadGroupIcon,
} from "./groupService.js";
import { getScheduleClasses, getScheduleList } from "../schedules/scheduleService.js";
import { getPublicProfile } from "../settings/settingsService.js";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  TextArea,
  Toggle,
  buttonStyles,
} from "../../components/ui.jsx";
import { CopyIcon } from "../../components/icons.jsx";
import {
  buildInviteLink,
  canManageMember,
  copyText,
  formatCourseCode,
  formatDate,
  formatScheduleLabel,
  formatTimeRange,
  getScheduleKey,
  groupSchedulesByYear,
  normalizeCourse,
  parseScheduleKey,
} from "../../utils/classMatch.js";

function SchedulePicker({ schedules, selectedKey, onChange }) {
  const groups = groupSchedulesByYear(schedules);

  return (
    <Field label="Schedule">
      <Select value={selectedKey} onChange={(event) => onChange(event.target.value)}>
        {groups.map((group) => (
          <optgroup key={group.year} label={String(group.year)}>
            {group.items.map((schedule) => (
              <option key={getScheduleKey(schedule)} value={getScheduleKey(schedule)}>
                {formatScheduleLabel(schedule)} - {schedule.class_count} classes
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </Field>
  );
}

function MemberProfileModal({ member, isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !member?.user_id) return;

    let isActive = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPublicProfile(member.user_id);
        if (isActive) {
          setProfile(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load member profile");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [isOpen, member]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member?.name || "Member details"}
      description="Profile details for this group member."
      actions={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      {isLoading ? (
        <LoadingState title="Loading member" compact />
      ) : error ? (
        <Banner title="Member issue" tone="danger">
          {error}
        </Banner>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url || member?.avatar_url} name={profile?.name || member?.name} size="xl" />
            <div>
              <div className="text-2xl font-semibold text-slate-900">{profile?.name || member?.name}</div>
              <div className="mt-1 text-sm text-slate-500">{member?.role}</div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Joined ClassMatch</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{formatDate(profile?.created_at)}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Joined group</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{formatDate(member?.joined_at)}</div>
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Bio</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {profile?.bio || "This member hasn't added a bio yet."}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ClassDetailsModal({ course, isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={course ? `${formatCourseCode(course)} - ${course.title}` : "Class details"}
      description="Expanded course details and overlap with your group."
      actions={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      {course ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Section</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{course.section || "TBA"}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">CRN</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{course.crn}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Type</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{course.courseType || "Not listed"}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Meeting</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{formatTimeRange(course.startTime, course.endTime)}</div>
              <div className="text-xs text-slate-400">{course.daysOfWeek || "Days arranged"}</div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-[28px] bg-slate-50/80 p-5 shadow-none">
              <div className="text-lg font-semibold text-slate-900">Groupmates in this class now</div>
              <div className="mt-4 space-y-3">
                {course.currentClassmates.length ? course.currentClassmates.map((match) => (
                  <div key={match.member_id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <Avatar src={match.avatar_url} name={match.member_name} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{match.member_name}</div>
                      <div className="text-xs text-slate-500">{match.role || "Member"}</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No current overlap in this class yet.</p>
                )}
              </div>
            </Card>

            <Card className="rounded-[28px] bg-slate-50/80 p-5 shadow-none">
              <div className="text-lg font-semibold text-slate-900">People who took it before</div>
              <div className="mt-4 space-y-3">
                {course.pastClassmates.length ? course.pastClassmates.map((match) => (
                  <div key={`${match.member_id}-${match.past_section_id}`} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <Avatar src={match.member_avatar_url} name={match.member_name} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{match.member_name}</div>
                      <div className="text-xs text-slate-500">
                        {formatScheduleLabel({ term: match.past_term, year: match.past_year })} - Section {match.past_section || "TBA"} - CRN {match.past_crn}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No past overlap found for this class.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function EditGroupModal({ group, isOpen, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: "", description: "", joinable: true, iconFile: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !group) return;
    setForm({
      name: group.name || "",
      description: group.description || "",
      joinable: Boolean(group.joinable),
      iconFile: null,
    });
    setError("");
  }, [isOpen, group?.description, group?.joinable, group?.name]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setError("");
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update group");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit group"
      description="Update your group details, joinability, and icon."
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-group-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save group"}
          </Button>
        </>
      )}
    >
      <form id="edit-group-form" className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <Banner title="Group issue" tone="danger">
            {error}
          </Banner>
        ) : null}

        <Field label="Group name">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </Field>

        <Field label="Group bio">
          <TextArea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </Field>

        <Field label="Joinability">
          <Toggle
            checked={form.joinable}
            onChange={(joinable) => setForm((current) => ({ ...current, joinable }))}
            onLabel="Open"
            offLabel="Closed"
          />
        </Field>

        <Field label="Group icon">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setForm((current) => ({ ...current, iconFile: event.target.files?.[0] || null }))}
            className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </Field>
      </form>
    </Modal>
  );
}

export default function GroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { session } = useSession();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentMatches, setCurrentMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSchedule = selectedKey ? parseScheduleKey(selectedKey) : null;
  const currentUserId = session?.user?.id;
  const normalizedClasses = classes.map((course) => normalizeCourse(course)).map((course) => ({
    ...course,
    currentClassmates: currentMatches
      .filter((match) => String(match.section_id) === String(course.sectionId))
      .map((match) => {
        const member = members.find((entry) => entry.user_id === match.member_id);
        return { ...match, avatar_url: member?.avatar_url, role: member?.role };
      }),
    pastClassmates: pastMatches.filter((match) => String(match.section_id) === String(course.sectionId)),
  }));

  useEffect(() => {
    refreshWorkspace();
  }, [groupId]);

  useEffect(() => {
    if (!selectedSchedule) {
      setClasses([]);
      setCurrentMatches([]);
      setPastMatches([]);
      return;
    }

    let isActive = true;

    async function loadScheduleOverlap() {
      try {
        setIsLoadingSchedule(true);
        setError("");
        const [classResponse, currentResponse, pastResponse] = await Promise.all([
          getScheduleClasses(selectedSchedule.term, selectedSchedule.year),
          getMatchingClassmates(groupId, String(selectedSchedule.year), selectedSchedule.term),
          getPastClassmates(groupId, String(selectedSchedule.year), selectedSchedule.term),
        ]);

        if (!isActive) return;
        setClasses(classResponse);
        setCurrentMatches(currentResponse);
        setPastMatches(pastResponse);
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load overlap");
      } finally {
        if (isActive) {
          setIsLoadingSchedule(false);
        }
      }
    }

    loadScheduleOverlap();

    return () => {
      isActive = false;
    };
  }, [selectedKey, groupId]);

  async function refreshWorkspace(nextSelectedKey = "") {
    try {
      setIsLoadingWorkspace(true);
      setError("");

      const [groupResponse, membersResponse, schedulesResponse] = await Promise.all([
        getGroupDetails(groupId),
        getGroupMembers(groupId),
        getScheduleList(),
      ]);

      setGroup(groupResponse);
      setMembers(membersResponse);
      setSchedules(schedulesResponse);

      const desiredKey = nextSelectedKey && schedulesResponse.some((schedule) => getScheduleKey(schedule) === nextSelectedKey)
        ? nextSelectedKey
        : selectedKey && schedulesResponse.some((schedule) => getScheduleKey(schedule) === selectedKey)
          ? selectedKey
          : schedulesResponse[0]
            ? getScheduleKey(schedulesResponse[0])
            : "";
      setSelectedKey(desiredKey);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load group");
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  async function handleCopyInvite() {
    if (!group?.join_code) return;
    try {
      await copyText(buildInviteLink(group.join_code));
      setSuccess("Invite link copied.");
      setError("");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy invite link");
    }
  }

  async function handleLeaveGroup() {
    if (!window.confirm("Leave this group?")) return;

    try {
      setError("");
      await leaveGroup(groupId);
      navigate("/mygroups", { replace: true });
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave group");
    }
  }

  async function handleRoleChange(member, newRole) {
    try {
      setBusyMemberId(member.user_id);
      setError("");
      setSuccess("");
      await changeMemberRole(groupId, member.user_id, newRole);
      await refreshWorkspace(selectedKey);
      setSuccess(`${member.name} is now ${newRole}.`);
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Unable to change role");
    } finally {
      setBusyMemberId("");
    }
  }

  async function handleKick(member) {
    if (!window.confirm(`Remove ${member.name} from this group?`)) return;

    try {
      setBusyMemberId(member.user_id);
      setError("");
      setSuccess("");
      await kickMember(groupId, member.user_id);
      await refreshWorkspace(selectedKey);
      setSuccess(`${member.name} was removed from the group.`);
    } catch (kickError) {
      setError(kickError instanceof Error ? kickError.message : "Unable to remove member");
    } finally {
      setBusyMemberId("");
    }
  }

  async function handleUpdateGroup(form) {
    try {
      setIsSavingGroup(true);
      setError("");
      setSuccess("");

      if (form.iconFile) {
        await uploadGroupIcon(groupId, form.iconFile);
      }

      await updateGroupInfo(groupId, {
        name: form.name.trim(),
        description: form.description.trim(),
        joinable: form.joinable,
      });

      await refreshWorkspace(selectedKey);
      setIsEditOpen(false);
      setSuccess("Group updated.");
    } finally {
      setIsSavingGroup(false);
    }
  }

  if (isLoadingWorkspace && !group) {
    return <LoadingState title="Loading group" description="Gathering members, schedules, and overlap data." />;
  }

  if (!group) {
    return (
      <EmptyState
        title="Group not found"
        description="This group might have been removed, or you may no longer have access."
        action={<Link to="/mygroups" className={buttonStyles({ variant: "primary", size: "md" })}>Back to groups</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Group details"
        title={group.name}
        description={group.description || "This group hasn't added a bio yet."}
        actions={(
          <>
            {group.my_role === "owner" ? <Button variant="secondary" onClick={() => setIsEditOpen(true)}>Edit group</Button> : null}
            <Button variant="ghost" onClick={handleCopyInvite}>
              <CopyIcon className="size-4" />
              Copy invite link
            </Button>
            <Button variant="danger" onClick={handleLeaveGroup}>
              Leave group
            </Button>
          </>
        )}
      />

      {error ? (
        <Banner title="Group issue" tone="danger">
          {error}
        </Banner>
      ) : null}
      {success ? (
        <Banner title="Saved" tone="success">
          {success}
        </Banner>
      ) : null}

      <Card className="space-y-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={group.group_icon_url} name={group.name} size="xl" />
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{group.my_role}</Badge>
                <Badge tone={group.joinable ? "emerald" : "amber"}>{group.joinable ? "Open" : "Closed"}</Badge>
              </div>
              <div className="text-sm text-slate-500">
                {group.member_count} members - Join code {group.join_code}
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Member count</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{group.member_count}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Invite code</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{group.join_code}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Members</div>
              <div className="mt-1 text-sm text-slate-500">See who is in the group and manage roles where your permissions allow it.</div>
            </div>
            <Badge tone="blue">{members.length} members</Badge>
          </div>

          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Group bio</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{group.description || "This group hasn't added a bio yet."}</p>
          </div>

          <div className="space-y-3">
            {members.map((member) => {
              const canManage = canManageMember(group.my_role, member.role, member.user_id === currentUserId);
              const canPromote = canManage && member.role === "member";
              const canDemote = group.my_role === "owner" && member.role === "admin" && member.user_id !== currentUserId;

              return (
                <button
                  key={member.user_id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="w-full rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar src={member.avatar_url} name={member.name} size="md" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {member.role} - Joined {formatDate(member.joined_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canPromote ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRoleChange(member, "admin");
                          }}
                          disabled={busyMemberId === member.user_id}
                          className="rounded-2xl bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 disabled:opacity-60"
                        >
                          Promote
                        </button>
                      ) : null}
                      {canDemote ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRoleChange(member, "member");
                          }}
                          disabled={busyMemberId === member.user_id}
                          className="rounded-2xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-60"
                        >
                          Demote
                        </button>
                      ) : null}
                      {canManage ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleKick(member);
                          }}
                          disabled={busyMemberId === member.user_id}
                          className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-60"
                        >
                          Kick
                        </button>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Schedule overlap</div>
              <div className="mt-1 text-sm text-slate-500">
                Compare one of your schedules with this group's members to see current and past class overlap.
              </div>
            </div>
            {selectedSchedule ? <Badge tone="blue">{formatScheduleLabel(selectedSchedule)}</Badge> : null}
          </div>

          {schedules.length ? (
            <SchedulePicker schedules={schedules} selectedKey={selectedKey} onChange={setSelectedKey} />
          ) : (
            <EmptyState
              title="No schedules to compare"
              description="Add a schedule first so ClassMatch can show overlap between your courses and this group."
              action={<Link to="/schedule" className={buttonStyles({ variant: "primary", size: "md" })}>Go to schedules</Link>}
              className="shadow-none"
            />
          )}

          {schedules.length ? (
            isLoadingSchedule ? (
              <LoadingState title="Loading overlap" description="Checking which groupmates match your current schedule." />
            ) : normalizedClasses.length ? (
              <div className="grid gap-4">
                {normalizedClasses.map((course) => (
                  <button
                    key={`${course.sectionId}-${course.crn}`}
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{course.title}</div>
                        <div className="mt-1 text-sm font-medium text-slate-500">{formatCourseCode(course)} - Section {course.section || "TBA"} - CRN {course.crn}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="blue">{course.currentClassmates.length} current</Badge>
                        <Badge tone="neutral">{course.pastClassmates.length} past</Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Meeting</div>
                        <div className="mt-1 font-medium text-slate-700">{formatTimeRange(course.startTime, course.endTime)}</div>
                        <div className="text-xs text-slate-400">{course.daysOfWeek || "Days arranged"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Instructor</div>
                        <div className="mt-1 font-medium text-slate-700">{course.instructor || "Not listed"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current classmates</div>
                        <div className="mt-1 font-medium text-slate-700">
                          {course.currentClassmates.length
                            ? course.currentClassmates.map((match) => match.member_name).join(", ")
                            : "No current overlap"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No classes in this schedule"
                description="Choose another schedule or add classes before comparing against this group."
                className="shadow-none"
              />
            )
          ) : null}
        </Card>
      </div>

      <MemberProfileModal member={selectedMember} isOpen={Boolean(selectedMember)} onClose={() => setSelectedMember(null)} />
      <ClassDetailsModal course={selectedCourse} isOpen={Boolean(selectedCourse)} onClose={() => setSelectedCourse(null)} />
      <EditGroupModal
        group={group}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateGroup}
        isSubmitting={isSavingGroup}
      />
    </div>
  );
}
