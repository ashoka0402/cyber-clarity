import { Shield, Globe, Database, Zap } from 'lucide-react';

interface SimulationControlsProps {
  onSimulateAnomaly: (type: 'login' | 'network' | 'data_theft') => void;
}

export default function SimulationControls({ onSimulateAnomaly }: SimulationControlsProps) {
  return (
    <div className="cyber-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-warning animate-pulse-glow" />
        <h3 className="text-lg font-semibold text-warning">Anomaly Simulation</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => onSimulateAnomaly('login')}
          className="flex items-center gap-3 p-3 bg-warning/10 hover:bg-warning/20 border border-warning/30 rounded-lg transition-all duration-200 hover:scale-105 group"
        >
          <Shield className="w-5 h-5 text-warning group-hover:animate-pulse" />
          <div className="text-left">
            <div className="font-semibold text-warning text-sm">Suspicious Login</div>
            <div className="text-xs text-muted-foreground">Russia login attempt</div>
          </div>
        </button>

        <button
          onClick={() => onSimulateAnomaly('network')}
          className="flex items-center gap-3 p-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all duration-200 hover:scale-105 group"
        >
          <Globe className="w-5 h-5 text-accent group-hover:animate-pulse" />
          <div className="text-left">
            <div className="font-semibold text-accent text-sm">DDoS Attack</div>
            <div className="text-xs text-muted-foreground">5000 req/min spike</div>
          </div>
        </button>

        <button
          onClick={() => onSimulateAnomaly('data_theft')}
          className="flex items-center gap-3 p-3 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg transition-all duration-200 hover:scale-105 group"
        >
          <Database className="w-5 h-5 text-destructive group-hover:animate-pulse" />
          <div className="text-left">
            <div className="font-semibold text-destructive text-sm">Data Exfiltration</div>
            <div className="text-xs text-muted-foreground">2GB transfer</div>
          </div>
        </button>
      </div>
    </div>
  );
}