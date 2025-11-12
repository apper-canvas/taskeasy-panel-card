import React, { useState, useEffect } from "react";
import Modal from "@/components/organisms/Modal";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";

const CreateMemberModal = ({ member = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contact: "",
    photoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        role: member.role || "",
        contact: member.contact || "",
        photoUrl: member.photoUrl || ""
      });
    }
  }, [member]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const memberData = {
        ...formData,
        contact: formData.contact || undefined,
        photoUrl: formData.photoUrl || undefined
      };

      if (member) {
        await teamService.update(member.id, memberData);
        toast.success("Team member updated successfully!");
      } else {
        await teamService.create(memberData);
        toast.success("Team member added successfully!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const roleOptions = [
    "Project Manager",
    "Developer",
    "Designer",
    "QA Engineer",
    "Business Analyst",
    "DevOps Engineer",
    "Product Owner",
    "Scrum Master"
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={member ? "Edit Team Member" : "Add Team Member"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Preview */}
        <div className="flex justify-center">
          <Avatar
            name={formData.name}
            src={formData.photoUrl}
            size="xl"
          />
        </div>

        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          required
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value)}
          error={errors.role}
          required
        >
          <option value="">Select a role</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>

        <Input
          label="Contact Number (Optional)"
          type="tel"
          value={formData.contact}
          onChange={(e) => handleChange("contact", e.target.value)}
          placeholder="Enter contact number"
        />

        <Input
          label="Photo URL (Optional)"
          type="url"
          value={formData.photoUrl}
          onChange={(e) => handleChange("photoUrl", e.target.value)}
          placeholder="Enter photo URL"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {member ? "Update Member" : "Add Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMemberModal;