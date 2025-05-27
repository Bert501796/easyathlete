import React, { useEffect, useState, useRef } from 'react';

const StravaRedirect = ({ onDataLoaded }) => {
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    const existing = localStorage.getItem('strava_activities');
    if (existing) {
      console.log('🛑 Using cached Strava data');
      const parsed = JSON.parse(existing);
      setActivities(parsed);
      onDataLoaded(parsed);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      setError('Authorization code not found in URL.');
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch('/api/strava-auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        console.log('⚠️ Token Exchange Response (via backend):', data);

        if (res.ok && data.access_token) {
          window.history.replaceState({}, document.title, '/strava-redirect');

          if (!hasShownPopup.current) {
            alert('✅ Strava connected successfully!');
            hasShownPopup.current = true;
          }

          const fetchActivities = async (accessToken) => {
            try {
              let allActivities = [];
              let page = 1;
              let moreData = true;
              const perPage = 100;
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

              while (moreData) {
                const res = await fetch(
                  `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
                  {
                    headers: { Authorization: `Bearer ${accessToken}` },
                  }
                );

                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                  moreData = false;
                } else {
                  const filtered = data.filter(
                    (act) => new Date(act.start_date) > oneYearAgo
                  );
                  allActivities = allActivities.concat(filtered);
                  moreData = data.length === perPage;
                  page++;
                }
              }

              setActivities(allActivities);
              localStorage.setItem(
                'strava_activities',
                JSON.stringify(allActivities)
              );
              localStorage.setItem(
                'onboarding_data',
                localStorage.getItem('onboarding_data') ||
                  JSON.stringify({ placeholder: true })
              );
              onDataLoaded(allActivities);
            } catch (err) {
              console.error('Failed to fetch activities:', err);
              setError('Failed to fetch Strava activities.');
            }
          };

          fetchActivities(data.access_token);
        } else {
          setError(`Failed to get access token: ${data.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Token exchange failed:', err);
        setError('Request failed.');
      }
    };

    exchangeToken();
  }, [onDataLoaded]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Strava Authorization</h2>
      {error && <p className="text-red-500">❌ {error}</p>}
      {!error && <p>🔄 Connecting to Strava...</p>}
    </div>
  );
};

console.log("🧩 Local onboarding:", localStorage.getItem('onboarding_data'));

export default StravaRedirect;
