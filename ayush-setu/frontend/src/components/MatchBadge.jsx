export default function MatchBadge({ score }) {
  const color = score >= 80 ? 'bg-green-100 text-success'
    : score >= 50 ? 'bg-orange-100 text-accent'
    : 'bg-gray-100 text-gray-500';
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {score}% Match
    </span>
  );
}
