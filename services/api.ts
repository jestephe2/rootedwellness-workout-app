// n8n API Service - RSW Workout App
import {
  InitResponse,
  OnboardResponse,
  LogWeightResponse,
  GetLogsResponse,
  AdminAuthResponse,
  User,
  WorkoutLog
} from '../types';

// n8n webhook URLs - configured in .env.local
const INIT_URL = import.meta.env.VITE_N8N_INIT_URL;
const ONBOARD_URL = import.meta.env.VITE_N8N_ONBOARD_URL;
const LOG_WEIGHT_URL = import.meta.env.VITE_N8N_LOG_WEIGHT_URL;
const GET_LOGS_URL = import.meta.env.VITE_N8N_GET_LOGS_URL;
const ADMIN_AUTH_URL = import.meta.env.VITE_N8N_ADMIN_AUTH_URL;

// Validate environment variables are configured
function validateEnvVars() {
  const missing = [];
  if (!INIT_URL || INIT_URL.includes('YOUR_N8N')) missing.push('VITE_N8N_INIT_URL');
  if (!ONBOARD_URL || ONBOARD_URL.includes('YOUR_N8N')) missing.push('VITE_N8N_ONBOARD_URL');
  if (!LOG_WEIGHT_URL || LOG_WEIGHT_URL.includes('YOUR_N8N')) missing.push('VITE_N8N_LOG_WEIGHT_URL');
  if (!GET_LOGS_URL || GET_LOGS_URL.includes('YOUR_N8N')) missing.push('VITE_N8N_GET_LOGS_URL');

  if (missing.length > 0) {
    throw new Error(
      `Missing n8n webhook URLs in .env.local:\n${missing.join('\n')}\n\n` +
      `Please update your .env.local file with your actual n8n webhook URLs.\n` +
      `See docs/N8N_SETUP.md for instructions.`
    );
  }
}

/**
 * POST to n8n init webhook
 * Check if user exists by email
 */
export async function initUser(email: string): Promise<InitResponse> {
  try {
    validateEnvVars();

    const response = await fetch(INIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * POST to n8n onboard webhook
 * Create new user with onboarding data
 */
export async function onboardUser(userData: {
  email: string;
  first_name: string;
  primary_goal: string;
  target_days_per_week: string;
  biggest_obstacle?: string;
}): Promise<OnboardResponse> {
  try {
    const response = await fetch(ONBOARD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Try to get the response body regardless of status
    const responseText = await response.text();

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    // Check if response is ok (200-299 status)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

/**
 * POST to n8n log weight webhook
 * Log weight for an exercise
 */
export async function logWeight(logData: {
  email: string;
  week: number;
  day: number;
  exercise_name: string;
  weight: number;
}): Promise<LogWeightResponse> {
  try {
    const response = await fetch(LOG_WEIGHT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * POST to n8n get logs webhook
 * Get recent workout logs for a user
 */
export async function getLogs(email: string, limit: number = 100): Promise<GetLogsResponse> {
  try {
    const response = await fetch(GET_LOGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, limit }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * POST to n8n admin auth webhook
 * Authenticate admin user with password (server-side validation)
 */
export async function adminAuth(password: string): Promise<AdminAuthResponse> {
  try {
    if (!ADMIN_AUTH_URL) {
      throw new Error(
        'Admin authentication not configured. Please set VITE_N8N_ADMIN_AUTH_URL in environment variables.\n' +
        'See docs/N8N_ADMIN_AUTH_SETUP.md for instructions.'
      );
    }

    const response = await fetch(ADMIN_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    // If response is not ok (401, etc.), the server sent an error message
    if (!response.ok) {
      return {
        status: 'error',
        message: data.message || 'Authentication failed'
      };
    }

    return data;
  } catch (error) {
    return {
      status: 'error',
      message: 'Unable to connect to authentication server'
    };
  }
}

// Helper function to get the most recent weight for an exercise
export function getMostRecentWeight(
  logs: WorkoutLog[],
  exerciseName: string,
  week: number,
  day: number
): number | null {
  // Filter logs for this specific exercise
  const exerciseLogs = logs
    .filter(log => log.exercise_name === exerciseName)
    .sort((a, b) => {
      // Sort by timestamp descending (most recent first)
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return 0;
    });

  // Return the most recent weight
  return exerciseLogs.length > 0 ? exerciseLogs[0].weight : null;
}
