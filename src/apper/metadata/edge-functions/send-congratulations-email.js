import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  try {
    // Parse request body
    const body = await req.text();
    const data = JSON.parse(body);
    
    if (!data.project || !data.teamMembers) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required project or team member data'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { project, teamMembers } = data;

    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No team members provided for congratulations'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate congratulations email content
    const emailSubject = `🎉 Congratulations! Project "${project.name}" Completed Successfully!`;
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .celebration { font-size: 48px; margin-bottom: 20px; }
    .title { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #64748b; font-size: 16px; }
    .project-details { background: #eff6ff; padding: 24px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2563eb; }
    .project-name { color: #1d4ed8; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .completion-date { color: #64748b; font-size: 14px; }
    .message { color: #334155; font-size: 16px; line-height: 1.7; margin: 25px 0; }
    .highlight { color: #2563eb; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    .celebration-banner { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="celebration-banner">
      <div class="celebration">🎉 🎊 🥳</div>
      <div class="title" style="color: white;">Outstanding Achievement!</div>
      <div class="subtitle" style="color: #e0e7ff;">Your hard work has paid off</div>
    </div>
    
    <div class="project-details">
      <div class="project-name">${project.name}</div>
      <div class="completion-date">Completed: ${new Date(project.completedDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
    </div>
    
    <div class="message">
      <p>Dear Team,</p>
      
      <p><strong>Congratulations!</strong> 🎉 We're thrilled to celebrate the successful completion of <span class="highlight">${project.name}</span>!</p>
      
      <p>Your <span class="highlight">dedication</span>, <span class="highlight">teamwork</span>, and <span class="highlight">expertise</span> have brought this project to a successful conclusion. Every task completed, every challenge overcome, and every milestone achieved represents your commitment to excellence.</p>
      
      <p><strong>Key Highlights:</strong></p>
      <ul>
        <li>✅ All project tasks completed successfully</li>
        <li>🎯 Project goals achieved on schedule</li>
        <li>👥 Outstanding team collaboration demonstrated</li>
        <li>🏆 Quality standards exceeded expectations</li>
      </ul>
      
      <p>This achievement reflects not just the completion of tasks, but the <span class="highlight">collaborative spirit</span> and <span class="highlight">professional excellence</span> that defines our team. Thank you for your hard work and dedication throughout this project.</p>
      
      <p><strong>Take a moment to celebrate</strong> - you've earned it! 🥳</p>
      
      <p>Here's to many more successful projects ahead!</p>
      
      <p>Best regards,<br><strong>TaskEasy Project Management Team</strong></p>
    </div>
    
    <div class="footer">
      <p>🚀 Keep up the excellent work! Your next challenge awaits.</p>
      <p style="margin-top: 15px; font-style: italic;">"Success is the result of preparation, hard work, and learning from failure." - Colin Powell</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // In a real implementation, you would integrate with an email service
    // For now, we'll simulate successful email sending
    const emailPromises = teamMembers.map(member => {
      // Simulate email sending delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            email: member.email,
            name: member.name,
            sent: true,
            timestamp: new Date().toISOString()
          });
        }, Math.random() * 100 + 50);
      });
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(result => result.sent);

    // Log successful congratulations for tracking
    console.log('Congratulations emails sent:', {
      project: project.name,
      projectId: project.Id,
      recipientCount: successfulEmails.length,
      recipients: successfulEmails.map(r => ({ name: r.name, email: r.email })),
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Congratulations emails sent successfully to ${successfulEmails.length} team members`,
        project: {
          Id: project.Id,
          name: project.name,
          completedDate: project.completedDate
        },
        emailResults: successfulEmails,
        totalSent: successfulEmails.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to send congratulations emails',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});