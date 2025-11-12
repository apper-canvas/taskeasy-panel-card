import apper from "https://cdn.apper.io/actions/apper-actions.js";

export default apper.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const { taskName, taskDescription, assigneeName, assigneeEmail, assignerName, dueDate, priority, projectName } = await req.json();

    // Validate required fields
    if (!taskName || !assigneeName || !assigneeEmail || !assignerName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: taskName, assigneeName, assigneeEmail, assignerName' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Get Resend API key from secrets
    const resendApiKey = await apper.getSecret('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured' 
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Format due date for display
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'No due date';

    // Priority color mapping
    const priorityColors = {
      'Low': '#3b82f6',
      'Medium': '#f59e0b', 
      'High': '#ef4444'
    };

    // Create HTML email template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Task Assignment</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 32px; text-align: center;">
                                <h1 style="color: white; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                                    📋 New Task Assignment
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 32px;">
                                <p style="font-size: 18px; color: #1e293b; margin: 0 0 24px 0; line-height: 1.6;">
                                    Hi <strong>${assigneeName}</strong>,
                                </p>
                                
                                <p style="font-size: 16px; color: #475569; margin: 0 0 32px 0; line-height: 1.6;">
                                    You have been assigned a new task by <strong>${assignerName}</strong>. Here are the details:
                                </p>
                                
                                <!-- Task Card -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border-left: 4px solid ${priorityColors[priority] || '#64748b'}; margin-bottom: 32px;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">
                                                            ${taskName}
                                                        </h2>
                                                        
                                                        ${taskDescription ? `
                                                        <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">
                                                            ${taskDescription}
                                                        </p>
                                                        ` : ''}
                                                        
                                                        <!-- Task Details -->
                                                        <table cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                                                            ${projectName ? `
                                                            <tr>
                                                                <td style="padding: 4px 0; font-size: 14px; color: #64748b; width: 100px;">Project:</td>
                                                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; font-weight: 500;">${projectName}</td>
                                                            </tr>
                                                            ` : ''}
                                                            <tr>
                                                                <td style="padding: 4px 0; font-size: 14px; color: #64748b; width: 100px;">Priority:</td>
                                                                <td style="padding: 4px 0;">
                                                                    <span style="background-color: ${priorityColors[priority] || '#64748b'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                                                        ${priority || 'Medium'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding: 4px 0; font-size: 14px; color: #64748b; width: 100px;">Due Date:</td>
                                                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; font-weight: 500;">${formattedDueDate}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.6; text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                                    This is an automated notification from your task management system.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TaskEasy <noreply@taskeasy.app>',
        to: [assigneeEmail],
        subject: `New Task Assignment: ${taskName}`,
        html: htmlContent
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email service error: ${errorData.message || 'Unknown error'}` 
      }), { 
        status: 422, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const emailResult = await emailResponse.json();

    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        emailId: emailResult.id,
        message: 'Task assignment email sent successfully'
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Failed to send email: ${error.message}` 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});