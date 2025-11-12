import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { teamService } from "@/services/api/teamService";
import { taskService } from "@/services/api/taskService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import MemberCard from "@/components/molecules/MemberCard";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ConfirmModal from "@/components/organisms/ConfirmModal";
import CreateMemberModal from "@/components/organisms/CreateMemberModal";
import Button from "@/components/atoms/Button";

const Team = () => {
  const { searchTerm } = useOutletContext() || {};
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState([]);

  useEffect(() => {
    loadTeamData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, tasks, searchTerm, roleFilter]);

  const loadTeamData = async () => {
    setLoading(true);
    setError("");

    try {
      const [membersData, tasksData] = await Promise.all([
        teamService.getAll(),
        taskService.getAll()
      ]);

      setTeamMembers(membersData);
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to load team data:", err);
      setError("Failed to load team data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    // Search filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter.length > 0) {
      filtered = filtered.filter(member => 
        roleFilter.includes(member.role)
      );
    }

    setFilteredMembers(filtered);
  };

  const handleCreateMember = () => {
    setShowCreateMember(false);
    setMemberToEdit(null);
    loadTeamData();
  };

  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setShowCreateMember(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      // Check if member has assigned tasks
      const assignedTasks = tasks.filter(t => t.assignedTo === memberToDelete.id);
      if (assignedTasks.length > 0) {
        toast.warning(`Cannot delete member. They have ${assignedTasks.length} assigned task(s). Please reassign their tasks first.`);
        setMemberToDelete(null);
        return;
      }

      await teamService.delete(memberToDelete.id);
      toast.success("Team member removed successfully");
      setMemberToDelete(null);
      loadTeamData();
    } catch (error) {
      console.error("Failed to delete team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const getMemberTaskCount = (memberId) => {
    return tasks.filter(t => t.assignedTo === memberId && t.status !== "Completed").length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorView error={error} onRetry={loadTeamData} />
      </div>
    );
  }

  // Get unique roles for filter
  const roleOptions = [...new Set(teamMembers.map(m => m.role))]
    .map(role => ({ value: role, label: role }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Team</h1>
          <p className="text-secondary-600 mt-1">
            Manage your team members and their assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateMember(true)} icon="UserPlus">
          Add Member
        </Button>
      </div>

{/* Team Stats */}
      {teamMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="Users" className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-primary-600 font-medium">Total Members</p>
                <p className="text-2xl font-bold text-primary-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-success-50 to-success-100 p-4 rounded-lg border border-success-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="CheckSquare" className="w-8 h-8 text-success-600" />
              <div>
                <p className="text-sm text-success-600 font-medium">Active Tasks</p>
                <p className="text-2xl font-bold text-success-900">
                  {tasks.filter(t => t.status !== "Completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-warning-50 to-warning-100 p-4 rounded-lg border border-warning-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="Clock" className="w-8 h-8 text-warning-600" />
              <div>
                <p className="text-sm text-warning-600 font-medium">Avg. Tasks per Member</p>
                <p className="text-2xl font-bold text-warning-900">
                  {teamMembers.length > 0 
                    ? Math.round(tasks.filter(t => t.status !== "Completed").length / teamMembers.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 p-4 rounded-lg border border-secondary-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="Award" className="w-8 h-8 text-secondary-600" />
              <div>
                <p className="text-sm text-secondary-600 font-medium">Unique Roles</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {new Set(teamMembers.map(m => m.role)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Filters */}
      {teamMembers.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-secondary-200">
          <div className="flex items-center gap-2">
            <ApperIcon name="Filter" className="w-5 h-5 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700">Filters:</span>
          </div>
          
          <FilterDropdown
            label="Role"
            options={roleOptions}
            selectedValues={roleFilter}
            onSelectionChange={setRoleFilter}
          />

        {roleFilter.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRoleFilter([])}
          >
            Clear Filters
          </Button>
        )}

<div className="ml-auto text-sm text-secondary-600">
            {filteredMembers.length} of {teamMembers.length} members
          </div>
</div>
      )}

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <Empty
          title={teamMembers.length === 0 ? "No team members yet" : "No members found"}
          description={
            teamMembers.length === 0
              ? "Add your first team member to start collaborating on projects and assigning tasks"
              : searchTerm
              ? "No team members match your search criteria. Try adjusting your search or filters."
              : "No team members match your current filters. Try adjusting your filter criteria."
          }
          actionLabel="Add Member"
          onAction={() => setShowCreateMember(true)}
          icon="UserPlus"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              taskCount={getMemberTaskCount(member.id)}
              onEdit={handleEditMember}
              onDelete={setMemberToDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateMember && (
        <CreateMemberModal
          member={memberToEdit}
          onClose={() => {
            setShowCreateMember(false);
            setMemberToEdit(null);
          }}
          onSuccess={handleCreateMember}
        />
      )}

      {memberToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setMemberToDelete(null)}
          onConfirm={handleDeleteMember}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${memberToDelete.name} from the team? This action cannot be undone.`}
          confirmLabel="Remove"
          variant="danger"
        />
      )}
    </div>
  );
};

export default Team;