
import { AppState } from "../types";

// Using a public, no-auth KV store for demonstration. 
// In a production app, this would be a secure backend (Firebase/Supabase).
const KV_BASE_URL = "https://kvdb.io/N9r8pP9v9H6e8r6u2j3m4/"; // Unique bucket for PitchTime

export const pushToCloud = async (syncId: string, state: AppState): Promise<boolean> => {
  try {
    const response = await fetch(`${KV_BASE_URL}${syncId}`, {
      method: 'POST',
      body: JSON.stringify({
        ...state,
        updatedAt: Date.now()
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Cloud Push Error:", error);
    return false;
  }
};

export const pullFromCloud = async (syncId: string): Promise<AppState | null> => {
  try {
    const response = await fetch(`${KV_BASE_URL}${syncId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data as AppState;
  } catch (error) {
    console.error("Cloud Pull Error:", error);
    return null;
  }
};

export const generateSyncId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
