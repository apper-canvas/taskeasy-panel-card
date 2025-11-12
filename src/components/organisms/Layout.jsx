import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import CreateProjectModal from "@/components/organisms/CreateProjectModal";
import CreateMemberModal from "@/components/organisms/CreateMemberModal";
import CreateTaskModal from "@/components/organisms/CreateTaskModal";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const handleAddClick = () => {
    switch (location.pathname) {
      case "/projects":
        setShowCreateProject(true);
        break;
      case "/team":
        setShowCreateMember(true);
        break;
      default:
        setShowCreateTask(true);
        break;
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Pass search term to child components via context or props if needed
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header onSearch={handleSearch} onAddClick={handleAddClick} />
      
      <main className="flex-1">
        <Outlet context={{ searchTerm }} />
      </main>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSuccess={() => setShowCreateProject(false)}
        />
      )}

      {showCreateMember && (
        <CreateMemberModal
          onClose={() => setShowCreateMember(false)}
          onSuccess={() => setShowCreateMember(false)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};

export default Layout;