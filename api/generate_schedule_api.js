import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { onboarding, activities } = req.body;

  if (!onboarding || !onboarding.goal || !onboarding.level || !onboarding.daysPerWeek || !onboarding.sports) {
    return res.status(400).json({ error: 'Missing or invalid onboarding data' });
  }

  const userPrompt = `
You are a professional endurance coach.
Based on:
- Goal: ${onboarding.goal}
- Level: ${onboarding.level}
- Days per week: ${onboarding.daysPerWeek}
- Sports: ${onboarding.sports.join(', ')}

Generate a 7-day training schedule in JSON format like:
[
  { "date": "2024-05-22", "sport": "Running", "type": "Zone 2 endurance run" },
  { "date": "2024-05-23", "sport": "Cycling", "type": "Intervals" }
]
Avoid any extra commentary or explanation.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional endurance coach.' },
        { role: 'user', content: userPrompt }
      ]
    });

    const raw = completion.choices[0].message.content.trim();

    let parsedSchedule;
    try {
      parsedSchedule = JSON.parse(raw);
    } catch (jsonErr) {
      console.error('JSON parsing error:', jsonErr);
      return res.status(500).json({ error: 'Invalid JSON response from AI', raw });
    }

    return res.status(200).json({ schedule: parsedSchedule });
  } catch (err) {
    console.error('AI schedule generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate training schedule' });
  }
  console.log('🔑 OPENAI KEY FOUND:', process.env.OPENAI_API_KEY);

}
