import { useState, useEffect, useCallback } from 'react';
import { SecurityEvent, Anomaly, DashboardMetrics, LoginEvent, NetworkEvent, FileTransferEvent } from '@/types/security';

const COUNTRIES = ['USA', 'UK', 'Germany', 'France', 'Japan', 'Russia', 'China', 'Brazil', 'India'];
const USERS = ['user001', 'user002', 'user003', 'admin01', 'service_account', 'analyst_jane'];
const DEVICES = ['Windows-Chrome', 'MacOS-Safari', 'Linux-Firefox', 'Mobile-iOS', 'Mobile-Android'];

// Baseline values for anomaly detection
const NORMAL_REQUESTS_PER_MIN = 50;
const NORMAL_DAILY_TRANSFER_MB = 20;
const SUSPICIOUS_COUNTRIES = ['Russia', 'China'];

class SecurityDataGenerator {
  private eventCounter = 0;
  private userLocationHistory: Map<string, string[]> = new Map();
  private dailyTransfers: Map<string, number> = new Map();

  generateEvent(): SecurityEvent {
    const eventType = Math.random() < 0.6 ? 'login' : Math.random() < 0.8 ? 'network' : 'file_transfer';
    const event: SecurityEvent = {
      id: `event_${++this.eventCounter}`,
      timestamp: new Date(),
      type: eventType,
      severity: 'low',
      isAnomaly: false,
      details: this.generateEventDetails(eventType)
    };

    // Check for anomalies
    this.detectAnomalies(event);

    return event;
  }

  private generateEventDetails(type: SecurityEvent['type']) {
    switch (type) {
      case 'login':
        return this.generateLoginEvent();
      case 'network':
        return this.generateNetworkEvent();
      case 'file_transfer':
        return this.generateFileTransferEvent();
    }
  }

  private generateLoginEvent(): LoginEvent {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const geo = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    
    return {
      user_id: user,
      geo,
      ip: this.generateIP(),
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      success: Math.random() > 0.1 // 90% success rate
    };
  }

  private generateNetworkEvent(): NetworkEvent {
    // Occasionally generate spikes
    const isSpike = Math.random() < 0.05; // 5% chance of spike
    const requests = isSpike ? 
      NORMAL_REQUESTS_PER_MIN * (10 + Math.random() * 90) : // 10-100x normal
      NORMAL_REQUESTS_PER_MIN * (0.5 + Math.random());     // 0.5-1.5x normal

    return {
      requests_per_minute: Math.floor(requests),
      source_ip: this.generateIP(),
      target: `server-${Math.floor(Math.random() * 10) + 1}.internal`
    };
  }

  private generateFileTransferEvent(): FileTransferEvent {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    // Occasionally generate large transfers
    const isLarge = Math.random() < 0.03; // 3% chance of large transfer
    const size = isLarge ?
      NORMAL_DAILY_TRANSFER_MB * (50 + Math.random() * 200) : // 50-250x normal
      NORMAL_DAILY_TRANSFER_MB * (0.1 + Math.random() * 2);   // 0.1-2x normal

    return {
      user_id: user,
      file_size: Math.floor(size * 100) / 100, // Round to 2 decimals
      direction: Math.random() > 0.5 ? 'upload' : 'download',
      destination: Math.random() > 0.7 ? 'external' : 'internal'
    };
  }

  private generateIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  private detectAnomalies(event: SecurityEvent): void {
    switch (event.type) {
      case 'login':
        this.detectLoginAnomaly(event);
        break;
      case 'network':
        this.detectNetworkAnomaly(event);
        break;
      case 'file_transfer':
        this.detectFileTransferAnomaly(event);
        break;
    }
  }

  private detectLoginAnomaly(event: SecurityEvent): void {
    const loginDetails = event.details as LoginEvent;
    const { user_id, geo } = loginDetails;
    
    // Track user's location history
    if (!this.userLocationHistory.has(user_id)) {
      this.userLocationHistory.set(user_id, []);
    }
    const history = this.userLocationHistory.get(user_id)!;

    // Check for suspicious country or new location
    const isSuspiciousCountry = SUSPICIOUS_COUNTRIES.includes(geo);
    const isNewLocation = !history.includes(geo);
    const isOddHours = new Date().getHours() < 6 || new Date().getHours() > 22;

    if ((isSuspiciousCountry && isNewLocation) || (isNewLocation && isOddHours)) {
      event.isAnomaly = true;
      event.severity = isSuspiciousCountry ? 'high' : 'medium';
    }

    // Update history
    if (isNewLocation && history.length < 5) {
      history.push(geo);
    }
  }

  private detectNetworkAnomaly(event: SecurityEvent): void {
    const networkDetails = event.details as NetworkEvent;
    const { requests_per_minute } = networkDetails;

    if (requests_per_minute > NORMAL_REQUESTS_PER_MIN * 10) {
      event.isAnomaly = true;
      event.severity = requests_per_minute > NORMAL_REQUESTS_PER_MIN * 50 ? 'high' : 'medium';
    }
  }

  private detectFileTransferAnomaly(event: SecurityEvent): void {
    const fileDetails = event.details as FileTransferEvent;
    const { user_id, file_size } = fileDetails;

    // Track daily transfers
    const today = new Date().toDateString();
    const key = `${user_id}_${today}`;
    const currentTotal = this.dailyTransfers.get(key) || 0;
    this.dailyTransfers.set(key, currentTotal + file_size);

    if (file_size > NORMAL_DAILY_TRANSFER_MB * 100) {
      event.isAnomaly = true;
      event.severity = file_size > NORMAL_DAILY_TRANSFER_MB * 200 ? 'high' : 'medium';
    }
  }

  generateAnomalyExplanation(event: SecurityEvent): string {
    const details = event.details;
    
    switch (event.type) {
      case 'login': {
        const login = details as LoginEvent;
        const isSuspicious = SUSPICIOUS_COUNTRIES.includes(login.geo);
        const isOddHours = new Date().getHours() < 6 || new Date().getHours() > 22;
        
        if (isSuspicious) {
          return `Suspicious login: First-time login from ${login.geo} detected for user ${login.user_id}`;
        }
        if (isOddHours) {
          return `Unusual login: Login from ${login.geo} outside normal hours for user ${login.user_id}`;
        }
        return `Anomalous login pattern detected for user ${login.user_id}`;
      }
      
      case 'network': {
        const network = details as NetworkEvent;
        const multiplier = Math.floor(network.requests_per_minute / NORMAL_REQUESTS_PER_MIN);
        return `Traffic spike: ${multiplier}x higher than baseline (${network.requests_per_minute}/min) - possible DDoS attack`;
      }
      
      case 'file_transfer': {
        const file = details as FileTransferEvent;
        const multiplier = Math.floor(file.file_size / NORMAL_DAILY_TRANSFER_MB);
        return `Data transfer anomaly: ${multiplier}x larger than normal (${file.file_size}MB) - suspicious ${file.direction} activity`;
      }
    }
  }
}

export function useSecurityData() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEvents: 0,
    totalAnomalies: 0,
    loginAnomalies: 0,
    networkAnomalies: 0,
    dataTheftAnomalies: 0
  });

  const generator = new SecurityDataGenerator();

  const generateEvent = useCallback(() => {
    const event = generator.generateEvent();
    
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    if (event.isAnomaly) {
      const anomaly: Anomaly = {
        id: `anomaly_${event.id}`,
        timestamp: event.timestamp,
        type: event.type === 'file_transfer' ? 'data_theft' : event.type,
        severity: event.severity,
        explanation: generator.generateAnomalyExplanation(event),
        event
      };
      
      setAnomalies(prev => [anomaly, ...prev.slice(0, 49)]); // Keep last 50 anomalies
    }

    // Update metrics
    setMetrics(prev => ({
      totalEvents: prev.totalEvents + 1,
      totalAnomalies: event.isAnomaly ? prev.totalAnomalies + 1 : prev.totalAnomalies,
      loginAnomalies: event.isAnomaly && event.type === 'login' ? prev.loginAnomalies + 1 : prev.loginAnomalies,
      networkAnomalies: event.isAnomaly && event.type === 'network' ? prev.networkAnomalies + 1 : prev.networkAnomalies,
      dataTheftAnomalies: event.isAnomaly && event.type === 'file_transfer' ? prev.dataTheftAnomalies + 1 : prev.dataTheftAnomalies
    }));
  }, [generator]);

  const simulateAnomaly = useCallback((type: 'login' | 'network' | 'data_theft') => {
    let event: SecurityEvent;
    
    switch (type) {
      case 'login':
        event = {
          id: `forced_${Date.now()}`,
          timestamp: new Date(),
          type: 'login',
          severity: 'high',
          isAnomaly: true,
          details: {
            user_id: 'admin01',
            geo: 'Russia',
            ip: '185.220.101.1',
            device: 'Linux-Firefox',
            success: true
          }
        };
        break;
      
      case 'network':
        event = {
          id: `forced_${Date.now()}`,
          timestamp: new Date(),
          type: 'network',
          severity: 'high',
          isAnomaly: true,
          details: {
            requests_per_minute: 5000,
            source_ip: '203.0.113.1',
            target: 'server-1.internal'
          }
        };
        break;
      
      case 'data_theft':
        event = {
          id: `forced_${Date.now()}`,
          timestamp: new Date(),
          type: 'file_transfer',
          severity: 'high',
          isAnomaly: true,
          details: {
            user_id: 'user001',
            file_size: 2048,
            direction: 'download',
            destination: 'external'
          }
        };
        break;
    }

    setEvents(prev => [event, ...prev.slice(0, 99)]);
    
    const anomaly: Anomaly = {
      id: `forced_anomaly_${Date.now()}`,
      timestamp: event.timestamp,
      type: event.type === 'file_transfer' ? 'data_theft' : event.type,
      severity: event.severity,
      explanation: generator.generateAnomalyExplanation(event),
      event
    };
    
    setAnomalies(prev => [anomaly, ...prev.slice(0, 49)]);
    
    setMetrics(prev => ({
      totalEvents: prev.totalEvents + 1,
      totalAnomalies: prev.totalAnomalies + 1,
      loginAnomalies: type === 'login' ? prev.loginAnomalies + 1 : prev.loginAnomalies,
      networkAnomalies: type === 'network' ? prev.networkAnomalies + 1 : prev.networkAnomalies,
      dataTheftAnomalies: type === 'data_theft' ? prev.dataTheftAnomalies + 1 : prev.dataTheftAnomalies
    }));
  }, [generator]);

  useEffect(() => {
    const interval = setInterval(generateEvent, 1000 + Math.random() * 2000); // 1-3 seconds
    return () => clearInterval(interval);
  }, [generateEvent]);

  return {
    events,
    anomalies,
    metrics,
    simulateAnomaly
  };
}