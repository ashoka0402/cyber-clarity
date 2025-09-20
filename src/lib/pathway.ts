import { BehaviorSubject, Observable, Subject, combineLatest, map, scan, filter, debounceTime, distinctUntilChanged } from 'rxjs';
import { SecurityEvent, Anomaly, SecurityMetrics } from '@/types/security';

// Pathway-inspired stream processing engine
export class PathwayEngine {
  private eventStream = new Subject<SecurityEvent>();
  private anomalyStream = new Subject<Anomaly>();
  private metricsStream = new BehaviorSubject<SecurityMetrics>({
    totalEvents: 0,
    totalAnomalies: 0,
    loginAnomalies: 0,
    networkAnomalies: 0,
    dataAnomalies: 0,
  });

  // Stream transformers (Pathway-style)
  public events$ = this.eventStream.asObservable();
  public anomalies$ = this.anomalyStream.asObservable();
  public metrics$ = this.metricsStream.asObservable();

  // Windowed aggregations for anomaly detection
  private eventWindow: SecurityEvent[] = [];
  private readonly windowSize = 100;
  private readonly timeWindow = 60000; // 1 minute

  // Baseline metrics for anomaly detection
  private baselines = {
    networkRequestsPerMinute: 50,
    dailyTransferVolume: 20, // MB
    userGeoLocations: new Map<string, Set<string>>(),
  };

  constructor() {
    this.setupPipelines();
  }

  private setupPipelines() {
    // Event aggregation pipeline
    this.events$.pipe(
      scan((acc, event) => {
        const window = [...acc, event].slice(-this.windowSize);
        this.eventWindow = window;
        return window;
      }, [] as SecurityEvent[])
    ).subscribe();

    // Real-time metrics pipeline
    combineLatest([this.events$, this.anomalies$]).pipe(
      scan((metrics, [event, anomaly]) => ({
        totalEvents: metrics.totalEvents + 1,
        totalAnomalies: anomaly ? metrics.totalAnomalies + 1 : metrics.totalAnomalies,
        loginAnomalies: anomaly?.type === 'login' ? metrics.loginAnomalies + 1 : metrics.loginAnomalies,
        networkAnomalies: anomaly?.type === 'network' ? metrics.networkAnomalies + 1 : metrics.networkAnomalies,
        dataAnomalies: anomaly?.type === 'data_theft' ? metrics.dataAnomalies + 1 : metrics.dataAnomalies,
      }), this.metricsStream.value)
    ).subscribe(metrics => this.metricsStream.next(metrics));

    // Anomaly detection pipeline
    this.events$.pipe(
      map(event => this.detectAnomalies(event)),
      filter(anomaly => anomaly !== null)
    ).subscribe(anomaly => {
      if (anomaly) {
        this.anomalyStream.next(anomaly);
      }
    });
  }

  // Pathway-style data ingestion
  public ingest(event: SecurityEvent): void {
    this.updateBaselines(event);
    this.eventStream.next(event);
  }

  // Advanced anomaly detection with multiple algorithms
  private detectAnomalies(event: SecurityEvent): Anomaly | null {
    const now = Date.now();

    switch (event.type) {
      case 'login':
        return this.detectLoginAnomaly(event, now);
      case 'network':
        return this.detectNetworkAnomaly(event, now);
      case 'file_transfer':
        return this.detectDataAnomaly(event, now);
      default:
        return null;
    }
  }

  private detectLoginAnomaly(event: SecurityEvent, timestamp: number): Anomaly | null {
    const userGeos = this.baselines.userGeoLocations.get(event.user_id) || new Set();
    
    // New location detection
    if (!userGeos.has(event.geo || '')) {
      return {
        id: `anomaly_${timestamp}`,
        timestamp,
        eventId: event.id,
        type: 'login',
        severity: this.calculateGeoSeverity(event.geo || ''),
        description: `New login location detected for user ${event.user_id} from ${event.geo}. This is the first time this user has logged in from this location.`,
        confidence: 0.85,
        riskScore: this.calculateRiskScore(event.geo || '', event.time || 0),
      };
    }

    // Time-based anomaly (outside normal hours)
    const hour = new Date(event.time || 0).getHours();
    if (hour < 6 || hour > 22) {
      return {
        id: `anomaly_${timestamp}`,
        timestamp,
        eventId: event.id,
        type: 'login',
        severity: 'medium',
        description: `Unusual login time: User ${event.user_id} logged in at ${hour}:00 outside normal business hours (06:00-22:00).`,
        confidence: 0.72,
        riskScore: 65,
      };
    }

    return null;
  }

  private detectNetworkAnomaly(event: SecurityEvent, timestamp: number): Anomaly | null {
    // Calculate recent network activity
    const recentNetworkEvents = this.eventWindow
      .filter(e => e.type === 'network' && (timestamp - (e.time || 0)) < this.timeWindow);
    
    const requestsPerMinute = recentNetworkEvents.length;
    const threshold = this.baselines.networkRequestsPerMinute * 10;

    if (requestsPerMinute > threshold) {
      const multiplier = Math.floor(requestsPerMinute / this.baselines.networkRequestsPerMinute);
      
      return {
        id: `anomaly_${timestamp}`,
        timestamp,
        eventId: event.id,
        type: 'network',
        severity: multiplier > 50 ? 'high' : 'medium',
        description: `Network traffic spike detected: ${requestsPerMinute} requests/min (${multiplier}x normal baseline of ${this.baselines.networkRequestsPerMinute}). Possible DDoS attack or system compromise.`,
        confidence: 0.91,
        riskScore: Math.min(95, 50 + multiplier),
      };
    }

    return null;
  }

  private detectDataAnomaly(event: SecurityEvent, timestamp: number): Anomaly | null {
    const transferSize = event.file_size || 0;
    const threshold = this.baselines.dailyTransferVolume * 100; // 100x normal

    if (transferSize > threshold) {
      const multiplier = Math.floor(transferSize / this.baselines.dailyTransferVolume);
      
      return {
        id: `anomaly_${timestamp}`,
        timestamp,
        eventId: event.id,
        type: 'data_theft',
        severity: transferSize > threshold * 5 ? 'high' : 'medium',
        description: `Suspicious data transfer: ${transferSize}MB transferred (${multiplier}x normal daily volume of ${this.baselines.dailyTransferVolume}MB). Potential data exfiltration attempt detected.`,
        confidence: 0.88,
        riskScore: Math.min(99, 70 + Math.log10(multiplier) * 10),
      };
    }

    return null;
  }

  private updateBaselines(event: SecurityEvent): void {
    if (event.type === 'login' && event.user_id && event.geo) {
      if (!this.baselines.userGeoLocations.has(event.user_id)) {
        this.baselines.userGeoLocations.set(event.user_id, new Set());
      }
      this.baselines.userGeoLocations.get(event.user_id)?.add(event.geo);
    }
  }

  private calculateGeoSeverity(geo: string): 'low' | 'medium' | 'high' {
    const highRiskCountries = ['Russia', 'China', 'North Korea', 'Iran'];
    const mediumRiskCountries = ['Nigeria', 'Romania', 'Ukraine'];
    
    if (highRiskCountries.includes(geo)) return 'high';
    if (mediumRiskCountries.includes(geo)) return 'medium';
    return 'low';
  }

  private calculateRiskScore(geo: string, time: number): number {
    let score = 30; // Base score
    
    // Geographic risk
    const severity = this.calculateGeoSeverity(geo);
    if (severity === 'high') score += 40;
    else if (severity === 'medium') score += 25;
    else score += 10;
    
    // Time-based risk
    const hour = new Date(time).getHours();
    if (hour < 6 || hour > 22) score += 25;
    
    return Math.min(100, score);
  }

  // Simulation methods for testing
  public simulateAnomaly(type: 'russia_login' | 'ddos_attack' | 'data_theft'): void {
    const timestamp = Date.now();
    
    switch (type) {
      case 'russia_login':
        this.ingest({
          id: `sim_${timestamp}`,
          type: 'login',
          user_id: 'user_' + Math.floor(Math.random() * 100),
          geo: 'Russia',
          time: timestamp,
          ip: '185.220.101.' + Math.floor(Math.random() * 255),
          device: 'Windows Desktop',
        });
        break;
        
      case 'ddos_attack':
        // Simulate burst of network requests
        for (let i = 0; i < 150; i++) {
          setTimeout(() => {
            this.ingest({
              id: `sim_${timestamp}_${i}`,
              type: 'network',
              requests_per_minute: 5000,
              time: Date.now(),
              ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            });
          }, i * 10);
        }
        break;
        
      case 'data_theft':
        this.ingest({
          id: `sim_${timestamp}`,
          type: 'file_transfer',
          user_id: 'user_' + Math.floor(Math.random() * 50),
          file_name: 'sensitive_data_export.zip',
          file_size: 2048, // 2GB
          time: timestamp,
          destination: 'external_server_suspicious.com',
        });
        break;
    }
  }
}

// Global Pathway engine instance
export const pathwayEngine = new PathwayEngine();