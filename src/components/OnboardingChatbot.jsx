import React, { useState } from 'react';

const messagesFlow = [
  {
    role: 'bot',
    text: "Hi there! I'm PacePilot, your personal training assistant. Let's get you set up! 🚀",
  },
  {
    role: 'bot',
    text: "What’s your main fitness goal right now?",
    options: ["Run a 10K", "Cycle 100km", "Stay active", "Other"],
  },
  {
    role: 'bot',
    text: "How would you describe your current experience level?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    role: 'bot',
    text: "How many days a week can you train?",
    options: ["1-2", "3-4", "5+"],
  },
  {
    role: 'bot',
    text: "Which sports should be included in your schedule?",
    sportSelect: true,
  },
  {
    role: 'bot',
    text: "Great! Let’s connect your Strava account to personalize your plan.",
    stravaConnect: true,
  },
];

export default function OnboardingChatbot({ onComplete, onboardingData }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: messagesFlow[0].text },
    {
      role: 'bot',
      text: messagesFlow[1].text,
      options: messagesFlow[1].options,
    },
  ]);

  const [step, setStep] = useState(2);
  const [sports, setSports] = useState([]);
  const sportOptions = ['walking', 'running', 'cycling', 'swimming', 'power lifting'];

  const handleUserChoice = (choice) => {
    const newMessages = [...messages, { role: 'user', text: choice }];
  
    // Determine the key to update
    let currentKey = '';
    if (step === 2) currentKey = 'goal';
    if (step === 3) currentKey = 'level';
    if (step === 4) currentKey = 'daysPerWeek';
  
    // Get previous data or start fresh
    const existingData = JSON.parse(localStorage.getItem('onboarding_data')) || {};
    const updatedData = { ...existingData, [currentKey]: choice };
    localStorage.setItem('onboarding_data', JSON.stringify(updatedData));
  
    // Continue onboarding
    const nextBotMessage = messagesFlow[step];
    if (!nextBotMessage) return;
  
    newMessages.push({
      role: 'bot',
      text: nextBotMessage.text,
      options: nextBotMessage.options,
      stravaConnect: nextBotMessage.stravaConnect,
      sportSelect: nextBotMessage.sportSelect,
    });
  
    setMessages(newMessages);
    setStep(step + 1);
  };
  

  const handleCustomGoal = (text) => {
    const updatedData = { ...(onboardingData || {}), goal: text };
    localStorage.setItem('onboarding_data', JSON.stringify(updatedData));

    const newMessages = [
      ...messages,
      { role: 'user', text },
      {
        role: 'bot',
        text: messagesFlow[2].text,
        options: messagesFlow[2].options,
      },
    ];
    setMessages(newMessages);
    setStep(3);
  };

  const toggleSport = (sport) => {
    setSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleSportSubmit = () => {
    const existingData = JSON.parse(localStorage.getItem('onboarding_data')) || {};
    const updatedData = { ...existingData, sports };
    localStorage.setItem('onboarding_data', JSON.stringify(updatedData));
  
    const newMessages = [
      ...messages,
      { role: 'user', text: `Selected sports: ${sports.join(', ')}` },
      {
        role: 'bot',
        text: messagesFlow[5].text,
        stravaConnect: true,
      },
    ];
    setMessages(newMessages);
    setStep(step + 1);
  };
  

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-xl p-4 h-[70vh] overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`text-sm ${msg.role === 'bot' ? 'text-left' : 'text-right'}`}>
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'bot'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {msg.text}
            </div>

            {msg.options && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.options.map((option, i) => (
                  <button
                    key={i}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md"
                    onClick={() => handleUserChoice(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {msg.sportSelect && (
              <div className="mt-2">
                <div className="mb-2">Select the sports you want in your training plan:</div>
                {sportOptions.map((sport) => (
                  <label key={sport} className="block mb-2">
                    <input
                      type="checkbox"
                      checked={sports.includes(sport)}
                      onChange={() => toggleSport(sport)}
                      className="mr-2"
                    />
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </label>
                ))}
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSportSubmit}
                  disabled={sports.length === 0}
                >
                  Confirm sports
                </button>
              </div>
            )}

            {msg.stravaConnect && (
              <div className="mt-4">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                  onClick={() => {
        const clientId = '161074';
        const redirectUri =
          window.location.hostname === 'localhost'
            ? 'http://localhost:5173/strava-redirect'
            : 'https://pacepilot-bert501796-bele-business-projects.vercel.app/strava-redirect';

        const scope = 'read,activity:read_all';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&approval_prompt=auto&scope=${scope}`;
        window.location.href = authUrl;
      }}
    >
      Connect with Strava
    </button>
  </div>
            )}
          </div>
        ))}

        {step === 'customGoal' && (
          <div className="text-left mt-4">
            <input
              type="text"
              placeholder="Please describe your goal"
              className="w-full p-2 border rounded mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleCustomGoal(e.target.value.trim());
                }
              }}
            />
            <small className="text-gray-500">Press Enter to submit</small>
          </div>
        )}
      </div>
    </div>
  );
}
