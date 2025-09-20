import { usePathwayStreams } from '@/hooks/usePathwayStreams';
import MetricsPanel from '@/components/MetricsPanel';
import EventStream from '@/components/EventStream';
import AnomalyAlerts from '@/components/AnomalyAlerts';
import SimulationControls from '@/components/SimulationControls';
import { Shield, Eye } from 'lucide-react';

const Index = () => {
  const { events, anomalies, metrics, simulateAnomaly } = usePathwayStreams();

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-cyber animate-pulse-glow" />
          <h1 className="text-3xl font-bold text-cyber">
            CyberGuard SOC Dashboard
          </h1>
          <Eye className="w-6 h-6 text-accent animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          Real-time cybersecurity anomaly detection and monitoring system
        </p>
      </header>

      {/* Metrics Overview */}
      <MetricsPanel metrics={metrics} />

      {/* Simulation Controls */}
      <div className="mb-6">
        <SimulationControls onSimulateAnomaly={simulateAnomaly} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Event Stream */}
        <div>
          <EventStream events={events} />
        </div>

        {/* Anomaly Alerts */}
        <div>
          <AnomalyAlerts anomalies={anomalies} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-4">
        <p>CyberGuard v1.0 | Real-time Security Monitoring | {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
