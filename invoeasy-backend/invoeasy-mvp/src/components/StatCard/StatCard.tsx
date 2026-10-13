import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'neutral' | 'warning' | 'success';
  sub?: string;
}

export default function StatCard({
  label,
  value,
  variant = 'neutral',
  sub,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}
