export default function RiskCard({ risk }: { risk: { title: string; description?: string; severity: string } }) {
  return (
    <div className="risk-card">
      <h3>{risk.title}</h3>
      <p>{risk.description}</p>
      <span>Severity: {risk.severity}</span>
    </div>
  )
}
