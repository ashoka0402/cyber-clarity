import { useState } from 'react';
import { Anomaly } from '@/types/security';
import { AlertTriangle, Shield, Globe, Database, Clock, Filter } from 'lucide-react';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
}

const AnomalyCard = ({ anomaly }: { anomaly: Anomaly }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-destructive bg-destructive/10 neon-glow-danger';
      case 'medium':
        return 'border-warning bg-warning/10 neon-glow-warning';
      default:
        return 'border-primary bg-primary/10 neon-glow';
    }
  };

  const getSeverityText = (severity: string) => {
    return severity.toUpperCase();
  };

  const getTypeIcon = () => {
    switch (anomaly.type) {
      case 'login': return <Shield className="w-5 h-5" />;
      case 'network': return <Globe className="w-5 h-5" />;
      case 'data_theft': return <Database className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (anomaly.type) {
      case 'login': return 'text-warning';
      case 'network': return 'text-accent';
      case 'data_theft': return 'text-destructive';
    }
  };

  return (
    <div className={`cyber-card animate-slide-in ${getSeverityStyles(anomaly.severity)} mb-3 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={getTypeColor()}>
            {getTypeIcon()}
          </div>
          <span className={`font-semibold ${getTypeColor()}`}>
            {anomaly.type.replace('_', ' ').toUpperCase()} ANOMALY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-bold rounded border ${
            anomaly.severity === 'high' ? 'bg-destructive/20 text-destructive border-destructive/30' :
            anomaly.severity === 'medium' ? 'bg-warning/20 text-warning border-warning/30' :
            'bg-primary/20 text-primary border-primary/30'
          }`}>
            {getSeverityText(anomaly.severity)}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-foreground leading-relaxed">
          {anomaly.description}
        </p>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1 mb-3">
        <div className="flex gap-4 text-xs">
          <span>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</span>
          <span>Risk Score: {anomaly.riskScore}/100</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span className="font-mono">
          {new Date(anomaly.timestamp).toLocaleString()}
        </span>
        <span className="mx-1">•</span>
        <span className="font-mono">
          ID: {anomaly.id.slice(-8)}
        </span>
      </div>
    </div>
  );
};

export default function AnomalyAlerts({ anomalies }: AnomalyAlertsProps) {
  const [filter, setFilter] = useState<'all' | 'login' | 'network' | 'data_theft'>('all');

  const filteredAnomalies = anomalies.filter(anomaly => 
    filter === 'all' || anomaly.type === filter
  );

  const getFilterColor = (type: string) => {
    if (filter === type) {
      switch (type) {
        case 'login': return 'bg-warning text-warning-foreground';
        case 'network': return 'bg-accent text-accent-foreground';
        case 'data_theft': return 'bg-destructive text-destructive-foreground';
        default: return 'bg-primary text-primary-foreground';
      }
    }
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
  };

  return (
    <div className="cyber-card h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive animate-pulse-glow" />
          <h3 className="text-lg font-semibold text-destructive">Anomaly Alerts</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAnomalies.length} alerts
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${getFilterColor('all')}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('login')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${getFilterColor('login')}`}
        >
          Login
        </button>
        <button
          onClick={() => setFilter('network')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${getFilterColor('network')}`}
        >
          Network
        </button>
        <button
          onClick={() => setFilter('data_theft')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${getFilterColor('data_theft')}`}
        >
          Data Theft
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        {filteredAnomalies.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No {filter === 'all' ? '' : filter} anomalies detected</p>
              <p className="text-xs mt-1">System monitoring in progress...</p>
            </div>
          </div>
        ) : (
          filteredAnomalies.map(anomaly => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))
        )}
      </div>
    </div>
  );
}