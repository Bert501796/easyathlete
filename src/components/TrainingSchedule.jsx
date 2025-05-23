import React, { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';

const sportIcons = {
  Running: '🏃‍♂️',
  Cycling: '🚴‍♀️',
  Swimming: '🏊‍♂️',
  Walking: '🚶‍♂️',
  'Power Lifting': '🏋️‍♂️',
};

const generateSchedule = (goal, experience, frequency, sports) => {
  const schedule = [];
  const today = new Date();
  let daysUsed = 0;

  const intensityBlocks = {
    Beginner: ['Zone 1', 'Zone 2'],
    Intermediate: ['Zone 2', 'Tempo'],
    Advanced: ['Tempo', 'Intervals', 'Long'],
  }[experience] || ['Zone 1'];

  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    if (daysUsed % Math.floor(7 / frequency) === 0) {
      const sport = sports[daysUsed % sports.length];
      const intensity = intensityBlocks[daysUsed % intensityBlocks.length];
      const type = `${intensity} ${sport}`;
      schedule.push({ date: format(date, 'yyyy-MM-dd'), sport, type });
    }
    daysUsed++;
  }

  return schedule;
};

export default function TrainingSchedule({ onboarding, activities }) {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    console.log('📥 Received onboarding:', onboarding);

    if (!onboarding || !onboarding.goal || !onboarding.level || !onboarding.daysPerWeek || !onboarding.sports) {
      console.warn("⚠️ Incomplete onboarding data:", onboarding);
      return;
    }

    const frequency = parseInt(onboarding.daysPerWeek) || 3;
    const plan = generateSchedule(
      onboarding.goal,
      onboarding.level,
      frequency,
      onboarding.sports
    );

    setSchedule(plan);
  }, [onboarding]);

  if (!onboarding || !onboarding.sports || onboarding.sports.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">⚠️ Missing onboarding data. Please restart the onboarding process.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📅 Your Monthly Training Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((session, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-semibold text-lg">{session.date}</h3>
            <p className="text-sm">{sportIcons[session.sport] || '🏋️‍♂️'} {session.sport}</p>
            <p className="italic text-gray-600">{session.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
