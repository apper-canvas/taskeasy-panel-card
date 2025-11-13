import { toast } from 'react-toastify';

class CongratulationsService {
  constructor() {
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendProjectCompletionCongratulations(project, teamMembers) {
    try {
      await this.delay(200);

      // Filter team members assigned to this project
      const projectTeamMembers = teamMembers.filter(member => 
        member.projects && member.projects.includes(project.Id)
      );

      if (projectTeamMembers.length === 0) {
        console.warn(`No team members found for project: ${project.name}`);
        return { success: false, message: 'No team members to notify' };
      }

      // Prepare congratulations data
      const congratulationsData = {
        project: {
          Id: project.Id,
          name: project.name,
          description: project.description,
          completedDate: new Date().toISOString()
        },
        teamMembers: projectTeamMembers.map(member => ({
          Id: member.Id,
          name: member.name,
          email: member.email
        }))
      };

      // Send congratulations via edge function
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const result = await apperClient.functions.invoke(
        import.meta.env.VITE_SEND_CONGRATULATIONS_EMAIL,
        {
          body: JSON.stringify(congratulationsData),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (result.success) {
        toast.success(`🎉 Congratulations sent to ${projectTeamMembers.length} team members!`);
        return { 
          success: true, 
          message: `Congratulations sent successfully to ${projectTeamMembers.length} team members`,
          count: projectTeamMembers.length
        };
      } else {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_CONGRATULATIONS_EMAIL}. The response body is: ${JSON.stringify(result)}.`);
        toast.error('Failed to send congratulations emails');
        return { success: false, message: result.message || 'Failed to send congratulations' };
      }

    } catch (error) {
      console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_SEND_CONGRATULATIONS_EMAIL}. The error is: ${error.message}`);
      toast.error('Error sending congratulations');
      return { success: false, message: 'Error sending congratulations', error: error.message };
    }
  }

  async checkProjectCompletion(project, tasks) {
    const projectTasks = tasks.filter(task => task.projectId === project.Id);
    const completedTasks = projectTasks.filter(task => task.status === 'Completed');
    
    const isCompleted = projectTasks.length > 0 && completedTasks.length === projectTasks.length;
    const completionPercentage = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
    
    return {
      isCompleted,
      completionPercentage,
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length
    };
  }
}

const congratulationsService = new CongratulationsService();
export default congratulationsService;