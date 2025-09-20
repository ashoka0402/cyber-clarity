import { Shield, AlertTriangle, Activity, Database } from 'lucide-react';
import { SecurityMetrics } from '@/types/security';

interface MetricsPanelProps {
  metrics: SecurityMetrics;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'primary';
}

const MetricCard = ({ title, value, icon, variant }: MetricCardProps) => {
  const variantStyles = {
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    danger: 'border-destructive/30 bg-destructive/10 text-destructive',
    primary: 'border-primary/30 bg-primary/10 text-cyber'
  };

  return (
    <div className={`cyber-card ${variantStyles[variant]} transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold font-mono">{value.toLocaleString()}</p>
        </div>
        <div className="text-2xl opacity-60">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <MetricCard
        title="Total Events"
        value={metrics.totalEvents}
        icon={<Activity />}
        variant="primary"
      />
      <MetricCard
        title="Total Anomalies"
        value={metrics.totalAnomalies}
        icon={<AlertTriangle />}
        variant="danger"
      />
      <MetricCard
        title="Login Alerts"
        value={metrics.loginAnomalies}
        icon={<Shield />}
        variant="warning"
      />
      <MetricCard
        title="Network Alerts"
        value={metrics.networkAnomalies}
        icon={<Activity />}
        variant="warning"
      />
      <MetricCard
        title="Data Theft Alerts"
        value={metrics.dataAnomalies}
        icon={<Database />}
        variant="danger"
      />
    </div>
  );
}