// n8n API Service - RSW Workout App
import {
  InitResponse,
  OnboardResponse,
  LogWeightResponse,
  GetLogsResponse,
  User,
  WorkoutLog
} from '../types';

// n8n webhook URLs - configured in .env.local
const INIT_URL = import.meta.env.VITE_N8N_INIT_URL;
const ONBOARD_URL = import.meta.env.VITE_N8N_ONBOARD_URL;
const LOG_WEIGHT_URL = import.meta.env.VITE_N8N_LOG_WEIGHT_URL;
const GET_LOGS_URL = import.meta.env.VITE_N8N_GET_LOGS_URL;

/**
 * POST to n8n init webhook
 * Check if user exists by email
 */
export async function initUser(email: string): Promise<InitResponse> {
  try {
    const response = await fetch(INIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Init user error:', error);
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
    console.log('[ONBOARD] Sending request to:', ONBOARD_URL);
    console.log('[ONBOARD] Request data:', userData);

    const response = await fetch(ONBOARD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('[ONBOARD] Response status:', response.status);
    console.log('[ONBOARD] Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to get the response body regardless of status
    const responseText = await response.text();
    console.log('[ONBOARD] Response body (raw):', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[ONBOARD] Response body (parsed):', responseData);
    } catch (parseError) {
      console.error('[ONBOARD] Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    // Check if response is ok (200-299 status)
    if (!response.ok) {
      console.error('[ONBOARD] Non-OK status received:', response.status);
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }

    return responseData;
  } catch (error) {
    console.error('[ONBOARD] Error during onboarding:', error);
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
    console.error('Log weight error:', error);
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
    console.error('Get logs error:', error);
    throw error;
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
