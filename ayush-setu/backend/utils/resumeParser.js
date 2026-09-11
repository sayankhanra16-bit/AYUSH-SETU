const fs = require('fs');
const pdfParse = require('pdf-parse');

// A starter dictionary — expand this list with more skills as needed
const SKILL_DICTIONARY = [
  'javascript', 'react', 'node.js', 'express', 'mongodb', 'python',
  'java', 'html', 'css', 'sql', 'git', 'docker', 'aws', 'flutter',
  'machine learning', 'data analysis', 'communication', 'teamwork',
  'ayurveda', 'panchakarma', 'clinical research', 'pharmacovigilance',
];

async function extractSkillsFromResume(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text.toLowerCase();

  const found = SKILL_DICTIONARY.filter((skill) => text.includes(skill));
  return found.map((name) => ({ name, level: 3, source: 'resume' }));
}

module.exports = { extractSkillsFromResume, SKILL_DICTIONARY };
