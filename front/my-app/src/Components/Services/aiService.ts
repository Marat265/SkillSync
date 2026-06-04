import { API_URL } from '../../config';

export const AiService = {
  async askStudentAssistant(message: string) {
    const response = await fetch(`${API_URL}/api/Ai/student-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to ask AI assistant');
    }

    return response.json();
  },

  async getMentorAnalytics() {
    const response = await fetch(`${API_URL}/api/Ai/mentor-analytics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to load mentor analytics');
    }

    return response.json();
  },

  async getMentorMatches(goal: string) {
    const response = await fetch(`${API_URL}/api/Ai/mentor-matches?goal=${encodeURIComponent(goal)}&limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to match mentors');
    }

    return response.json();
  },
};
