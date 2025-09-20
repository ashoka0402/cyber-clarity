import { useState, useEffect, useRef } from 'react';
import { SecurityEvent, LoginEvent, NetworkEvent, FileTransferEvent } from '@/types/security';
import { User, Globe, HardDrive, Clock, MapPin, Activity } from 'lucide-react';

interface EventStreamProps {
  events: SecurityEvent[];
}

const EventItem = ({ event }: { event: SecurityEvent }) => {
  const timestamp = event.timestamp.toLocaleTimeString();
  
  const getSeverityColor = (severity: string, isAnomaly: boolean) => {
    if (!isAnomaly) return 'text-success';
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-primary';
    }
  };

  const getEventIcon = () => {
    switch (event.type) {
      case 'login': return <User className="w-4 h-4" />;
      case 'network': return <Globe className="w-4 h-4" />;
      case 'file_transfer': return <HardDrive className="w-4 h-4" />;
    }
  };

  const getEventDetails = () => {
    switch (event.type) {
      case 'login': {
        const details = event.details as LoginEvent;
        return `${details.user_id} from ${details.geo} (${details.ip})`;
      }
      case 'network': {
        const details = event.details as NetworkEvent;
        return `${details.requests_per_minute}/min from ${details.source_ip}`;
      }
      case 'file_transfer': {
        const details = event.details as FileTransferEvent;
        return `${details.user_id}: ${details.file_size}MB ${details.direction}`;
      }
    }
  };

  return (
    <div className={`animate-slide-in cyber-card mb-2 text-sm ${event.isAnomaly ? 'neon-glow-danger' : ''} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={getSeverityColor(event.severity, event.isAnomaly)}>
            {getEventIcon()}
          </div>
          <span className={`font-mono ${getSeverityColor(event.severity, event.isAnomaly)}`}>
            {event.type.replace('_', ' ').toUpperCase()}
          </span>
          {event.isAnomaly && (
            <span className="px-2 py-1 text-xs bg-destructive/20 text-destructive rounded border border-destructive/30">
              ANOMALY
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono text-xs">{timestamp}</span>
        </div>
      </div>
      <div className="mt-2 text-muted-foreground">
        {getEventDetails()}
      </div>
    </div>
  );
};

export default function EventStream({ events }: EventStreamProps) {
  const streamRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && streamRef.current) {
      streamRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const handleScroll = () => {
    if (streamRef.current) {
      const { scrollTop } = streamRef.current;
      setAutoScroll(scrollTop < 50);
    }
  };

  return (
    <div className="cyber-card h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyber animate-pulse-glow" />
          <h3 className="text-lg font-semibold text-cyber">Live Event Stream</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {events.length} events
        </div>
      </div>
      
      <div 
        ref={streamRef}
        className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pr-2"
        onScroll={handleScroll}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for security events...</p>
            </div>
          </div>
        ) : (
          events.map(event => (
            <EventItem key={event.id} event={event} />
          ))
        )}
      </div>
      
      {!autoScroll && (
        <div className="mt-2 text-center">
          <button 
            onClick={() => {
              setAutoScroll(true);
              streamRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs text-primary hover:text-accent transition-colors"
          >
            ↑ Auto-scroll paused - Click to resume
          </button>
        </div>
      )}
    </div>
  );
}