export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-card rounded-xl border border-dashed border-gray-300">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-blue-50 text-brand flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <p className="font-semibold text-navy">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}