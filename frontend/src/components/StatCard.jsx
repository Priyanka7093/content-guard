function StatCard({ label, value, icon, color, sublabel }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 180,
      padding: 18,
      borderRadius: 16,
      background: 'rgba(5, 20, 38, 0.6)',
      backdropFilter: 'blur(18px)',
      border: `1px solid ${color}33`,
      boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
      color: 'white',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        marginBottom: 12,
        boxShadow: `0 0 12px ${color}55`,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, margin: '4px 0' }}>{value}</div>
      {sublabel && (
        <div style={{ fontSize: 12, color: color }}>{sublabel}</div>
      )}
    </div>
  )
}

export default StatCard
