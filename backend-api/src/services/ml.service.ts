import axios from 'axios';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MentorAlert {
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  batch_id: string | null;
  batch_name: string | null;
  priority_score: number;
  urgency_tier: 'CRITICAL' | 'HIGH' | 'MODERATE';
  trigger_reason: string;
  risk_score: number;
  risk_velocity: number;
  recommended_intervention: string;
  recommendation_confidence: number;
  recommendation_reasoning: string;
  contributing_factors: Array<{ factor: string; value: number | string; impact: number; detail: string }>;
  created_at: string;
}

export interface GenerateAlertsResponse {
  total_students_analyzed: number;
  alerts_generated: number;
  alerts_filtered: number;
  alerts: MentorAlert[];
}

export interface AlertStats {
  total_alerts: number;
  critical_count: number;
  high_count: number;
  moderate_count: number;
  avg_response_time_hours: number | null;
  acted_rate: number;
  recommendation_follow_rate: number;
}

export async function generateMentorAlerts(batchId?: string): Promise<GenerateAlertsResponse> {
  try {
    const response = await axios.post<GenerateAlertsResponse>(
      `${ML_SERVICE_URL}/api/ml/mentor-alerts/generate`, { batch_id: batchId || null });
    return response.data;
  } catch (error) {
    logger.error('Failed to generate mentor alerts from ML service', error);
    throw new Error('ML service unavailable');
  }
}

export async function getMentorAlerts(mentorId: string): Promise<MentorAlert[]> {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/mentor-alerts/mentor/${mentorId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Failed to fetch mentor alerts', error);
    throw new Error('ML service unavailable');
  }
}

export async function getStudentAlerts(studentId: string): Promise<MentorAlert[]> {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/mentor-alerts/student/${studentId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Failed to fetch student alerts', error);
    throw new Error('ML service unavailable');
  }
}

export async function updateAlertStatus(alertId: number, status: string): Promise<unknown> {
  try {
    const response = await axios.put(`${ML_SERVICE_URL}/api/ml/mentor-alerts/${alertId}/status`, null, { params: { status } });
    return response.data.data;
  } catch (error) {
    logger.error('Failed to update alert status', error);
    throw new Error('ML service unavailable');
  }
}

export async function recordAlertOutcome(alertId: number, data: {
  mentor_response: string; response_time_hours?: number; intervention_id?: string;
  was_recommendation_followed: boolean; outcome_notes?: string;
}): Promise<unknown> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/mentor-alerts/${alertId}/outcome`, null, { params: data });
    return response.data.data;
  } catch (error) {
    logger.error('Failed to record alert outcome', error);
    throw new Error('ML service unavailable');
  }
}

export async function getAlertStats(): Promise<AlertStats> {
  try {
    const response = await axios.get<AlertStats>(`${ML_SERVICE_URL}/api/ml/mentor-alerts/stats`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch alert stats', error);
    throw new Error('ML service unavailable');
  }
}
