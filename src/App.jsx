// src/App.jsx
import React, { useState, useEffect } from 'react';
import OnboardingChatbot from './components/OnboardingChatbot';

export default function App() {
  const [answers, setAnswers] = useState(() => {
    const stored = localStorage.getItem('onboarding_answers');
    return stored ? JSON.parse(stored) : null;
  });

  const handleOnboardingComplete = (data) => {
    console.log('✅ Onboarding complete:', data);
    localStorage.setItem('onboarding_answers', JSON.stringify(data));
    setAnswers(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!answers ? (
        <OnboardingChatbot onComplete={handleOnboardingComplete} />
      ) : (
        <div className="max-w-xl mx-auto p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Welcome to EasyAthlete 👋</h2>
          <p className="mb-2">Thanks for completing the onboarding.</p>
          <pre className="bg-gray-100 p-4 rounded text-left text-sm overflow-auto">
            {JSON.stringify(answers, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
