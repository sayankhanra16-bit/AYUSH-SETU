export default function StatCard({ label, value, hint, icon: Icon, color = 'brand' }) {
  const bg = {
    brand: 'bg-blue-50 text-brand',
    accent: 'bg-orange-50 text-accent',
    success: 'bg-green-50 text-success',
    navy: 'bg-slate-100 text-navy',
  }[color];

  return (
    <div className="bg-card rounded-xl shadow-sm p-4 flex-1 flex items-start gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-navy">{value}</p>
        {hint && <p className="text-xs text-success mt-1">{hint}</p>}
      </div>
    </div>
  );
}