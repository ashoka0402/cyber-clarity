export interface SecurityEvent {
  id: string;
  type: 'login' | 'network' | 'file_transfer';
  time?: number;
  
  // Login event properties
  user_id?: string;
  geo?: string;
  ip?: string;
  device?: string;
  
  // Network event properties  
  requests_per_minute?: number;
  
  // File transfer event properties
  file_name?: string;
  file_size?: number; // in MB
  destination?: string;
}

export interface Anomaly {
  id: string;
  timestamp: number;
  eventId: string;
  type: 'login' | 'network' | 'data_theft';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
  riskScore: number;
}

export interface SecurityMetrics {
  totalEvents: number;
  totalAnomalies: number;
  loginAnomalies: number;
  networkAnomalies: number;
  dataAnomalies: number;
}