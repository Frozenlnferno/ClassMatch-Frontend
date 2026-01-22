import { supabase } from "../../../supabase.js";

/**
 * Get all groups the user is a member of
 * @returns {Promise<Array>} List of user's groups
 */
export async function getUserGroups() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch('http://localhost:5000/api/groups/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
    }

    return await response.json();
}

/**
 * Create a new group
 * @param {object} groupData - Group creation data
 * @param {string} groupData.groupName - Name of the group
 * @param {string} groupData.description - Description of the group
 * @param {boolean} groupData.joinable - Whether the group is joinable
 * @returns {Promise<object>} Success response
 */
export async function createGroup(groupData) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch('http://localhost:5000/api/groups/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create group: ${response.status}`);
    }

    return await response.json();
}

/**
 * Join a group using join code
 * @param {string} joinCode - The join code for the group
 * @returns {Promise<object>} Success response
 */
export async function joinGroup(joinCode) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/join?join_code=${encodeURIComponent(joinCode)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to join group: ${response.status}`);
    }

    return await response.json();
}

/**
 * Leave a group
 * @param {string} groupId - ID of the group to leave
 * @returns {Promise<object>} Success response
 */
export async function leaveGroup(groupId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch('http://localhost:5000/api/groups/leave', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_id: groupId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to leave group: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get group members
 * @param {string} groupId - ID of the group
 * @returns {Promise<Array>} List of group members
 */
export async function getGroupMembers(groupId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/${groupId}/members`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
    }

    return await response.json();
}

/**
 * Kick a member from group (admin/owner only)
 * @param {string} groupId - ID of the group
 * @param {string} memberId - ID of the member to kick
 * @returns {Promise<object>} Success response
 */
export async function kickMember(groupId, memberId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/${groupId}/kick`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member_id: memberId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to kick member: ${response.status}`);
    }

    return await response.json();
}

/**
 * Change a member's role (admin/owner only)
 * @param {string} groupId - ID of the group
 * @param {string} memberId - ID of the member
 * @param {string} newRole - New role ('admin', 'member')
 * @returns {Promise<object>} Success response
 */
export async function changeMemberRole(groupId, memberId, newRole) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/${groupId}/change-role`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member_id: memberId, new_role: newRole }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to change role: ${response.status}`);
    }

    return await response.json();
}

/**
 * Update group info (admin/owner only)
 * @param {string} groupId - ID of the group
 * @param {object} updates - Updates to apply
 * @param {string} updates.name - New name
 * @param {string} updates.description - New description
 * @param {boolean} updates.joinable - New joinable status
 * @returns {Promise<object>} Success response
 */
export async function updateGroupInfo(groupId, updates) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update group: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get matching classmates for a group and schedule
 * @param {string} groupId - ID of the group
 * @param {string} year - Year of the schedule
 * @param {string} term - Term of the schedule
 * @returns {Promise<Array>} List of matching classmates
 */
export async function getMatchingClassmates(groupId, year, term) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const params = new URLSearchParams({ group_id: groupId, year, term });
    const response = await fetch(`http://localhost:5000/api/schedules/matching-classmates?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch matching classmates: ${response.status}`);
    }

    return await response.json();
}

export async function joinGroupByInviteCodeURL(inviteCode) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`http://localhost:5000/api/groups/join/${encodeURIComponent(inviteCode)}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to join group: ${response.status}`);
    }

    return await response.json();
}
