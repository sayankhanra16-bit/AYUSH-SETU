import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SkillGapChart({ data, haveKey = 'have', needKey = 'need' }) {
  // data example: [{ skill: 'Docker', have: 0, need: 1 }, { skill: 'React', have: 1, need: 1 }]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="skill" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey={needKey} fill="#ED7D31" name="Required" />
        <Bar dataKey={haveKey} fill="#0070C0" name="You have" />
      </BarChart>
    </ResponsiveContainer>
  );
}
