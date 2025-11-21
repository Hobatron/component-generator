import {setGlobalOptions} from "firebase-functions/v2";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import sgMail from "@sendgrid/mail";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({maxInstances: 10});

// Define SendGrid API key secret
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

/**
 * Look up a user by their email address
 * Returns the user's UID if found
 */
export const getUserByEmail = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const {email} = request.data;

  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "Email is required");
  }

  try {
    // Look up user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    logger.info(`User lookup successful for email: ${email}`);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || null,
    };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new HttpsError("not-found", "No user found with that email");
    }
    logger.error("Error looking up user:", error);
    throw new HttpsError("internal", "Failed to look up user");
  }
});

/**
 * Send an email invitation to collaborate on a project
 */
// eslint-disable-next-line max-len
export const sendProjectInvite = onCall({secrets: [sendgridApiKey]}, async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const {email, projectName, projectId} = request.data;

  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "Email is required");
  }

  if (!projectName || typeof projectName !== "string") {
    throw new HttpsError("invalid-argument", "Project name is required");
  }

  if (!projectId || typeof projectId !== "string") {
    throw new HttpsError("invalid-argument", "Project ID is required");
  }

  try {
    // Get the inviter's info
    const inviter = await admin.auth().getUser(request.auth.uid);
    const inviterName = inviter.displayName || inviter.email || "Someone";

    // Initialize SendGrid
    sgMail.setApiKey(sendgridApiKey.value());

    // Create the email
    const msg = {
      to: email,
      from: "masonashlock@gmail.com",
      subject: `You've been invited to ${projectName}`,
      text: `${inviterName} invited you to "${projectName}".

Visit https://bgcrafter.com?invite=${projectId} to access it.

Sign up with Google if you don't have an account yet.`,
      html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Project Invitation</h2>
            <p><strong>${inviterName}</strong> invited you to 
            <strong>"${projectName}"</strong>.</p>
            <p>
              <a href="https://bgcrafter.com?invite=${projectId}" 
                 style="padding: 12px 24px; background: #4285f4; 
                 color: white; text-decoration: none; 
                 border-radius: 4px;">
                Access Project
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Sign up with Google if you don't have an account yet.
            </p>
          </div>
        `,
    };

    // Send the email
    await sgMail.send(msg);

    logger.info(`Invitation sent to ${email} for project ${projectId}`);

    return {
      success: true,
      message: "Invitation sent successfully",
    };
  } catch (error: any) {
    logger.error("Error sending invitation:", error);
    const msg = "Failed to send invitation: " + error.message;
    throw new HttpsError("internal", msg);
  }
});
