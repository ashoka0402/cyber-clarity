import { useEffect, useState } from 'react';
import { SecurityEvent, Anomaly, SecurityMetrics } from '@/types/security';
import { pathwayEngine } from '@/lib/pathway';

export const usePathwayStreams = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    totalAnomalies: 0,
    loginAnomalies: 0,
    networkAnomalies: 0,
    dataAnomalies: 0,
  });

  useEffect(() => {
    // Subscribe to Pathway streams
    const eventSub = pathwayEngine.events$.subscribe(event => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
    });

    const anomalySub = pathwayEngine.anomalies$.subscribe(anomaly => {
      setAnomalies(prev => [anomaly, ...prev].slice(0, 50)); // Keep last 50 anomalies
    });

    const metricsSub = pathwayEngine.metrics$.subscribe(setMetrics);

    return () => {
      eventSub.unsubscribe();
      anomalySub.unsubscribe();
      metricsSub.unsubscribe();
    };
  }, []);

  // Data generation with Pathway ingestion
  useEffect(() => {
    const generateEvents = () => {
      const eventTypes = ['login', 'network', 'file_transfer'] as const;
      const geoLocations = ['USA', 'UK', 'Germany', 'France', 'Canada', 'Australia'];
      const users = Array.from({ length: 100 }, (_, i) => `user_${i}`);
      
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const timestamp = Date.now();
      
      let event: SecurityEvent;
      
      switch (type) {
        case 'login':
          event = {
            id: `event_${timestamp}`,
            type: 'login',
            user_id: users[Math.floor(Math.random() * users.length)],
            geo: geoLocations[Math.floor(Math.random() * geoLocations.length)],
            time: timestamp,
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            device: Math.random() > 0.5 ? 'Mobile' : 'Desktop',
          };
          break;
          
        case 'network':
          event = {
            id: `event_${timestamp}`,
            type: 'network',
            requests_per_minute: Math.floor(Math.random() * 100) + 20,
            time: timestamp,
            ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          };
          break;
          
        case 'file_transfer':
          event = {
            id: `event_${timestamp}`,
            type: 'file_transfer',
            user_id: users[Math.floor(Math.random() * users.length)],
            file_name: `document_${Math.floor(Math.random() * 1000)}.pdf`,
            file_size: Math.floor(Math.random() * 50) + 1, // 1-50MB
            time: timestamp,
            destination: Math.random() > 0.8 ? 'external_cloud.com' : 'internal_server',
          };
          break;
      }
      
      // Ingest into Pathway engine
      pathwayEngine.ingest(event);
    };

    // Generate events at varying intervals (real-time simulation)
    const intervals = [
      setInterval(generateEvents, 500),   // Every 500ms
      setInterval(generateEvents, 1200),  // Every 1.2s
      setInterval(generateEvents, 800),   // Every 800ms
    ];

    return () => {
      intervals.forEach(clearInterval);
    };
  }, []);

  const simulateAnomaly = (type: 'russia_login' | 'ddos_attack' | 'data_theft') => {
    pathwayEngine.simulateAnomaly(type);
  };

  return {
    events,
    anomalies,
    metrics,
    simulateAnomaly,
  };
};