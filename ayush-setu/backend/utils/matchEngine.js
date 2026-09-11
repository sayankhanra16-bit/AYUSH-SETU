// Compares a student's skills against an opportunity's required skills
// and returns a percentage score plus matched/missing lists.
// Deterministic and explainable on purpose — see the build guide, Section 8.
function calculateMatch(studentSkills, requiredSkills) {
  const studentNames = studentSkills.map((s) => s.name.toLowerCase());

  let totalWeight = 0;
  let matchedWeight = 0;
  const matched = [];
  const missing = [];

  requiredSkills.forEach((req) => {
    const weight = req.weight || 1;
    totalWeight += weight;
    if (studentNames.includes(req.name.toLowerCase())) {
      matchedWeight += weight;
      matched.push(req.name);
    } else {
      missing.push(req.name);
    }
  });

  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
  return { score, matched, missing };
}

module.exports = { calculateMatch };
