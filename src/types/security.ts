export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login' | 'network' | 'file_transfer';
  severity: 'low' | 'medium' | 'high';
  isAnomaly: boolean;
  details: LoginEvent | NetworkEvent | FileTransferEvent;
}

export interface LoginEvent {
  user_id: string;
  geo: string;
  ip: string;
  device: string;
  success: boolean;
}

export interface NetworkEvent {
  requests_per_minute: number;
  source_ip: string;
  target: string;
}

export interface FileTransferEvent {
  user_id: string;
  file_size: number; // in MB
  direction: 'upload' | 'download';
  destination: string;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  type: 'login' | 'network' | 'data_theft';
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  event: SecurityEvent;
}

export interface DashboardMetrics {
  totalEvents: number;
  totalAnomalies: number;
  loginAnomalies: number;
  networkAnomalies: number;
  dataTheftAnomalies: number;
}