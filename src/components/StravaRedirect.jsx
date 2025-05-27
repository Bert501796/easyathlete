import React, { useEffect, useState, useRef } from 'react';

const StravaRedirect = ({ onDataLoaded }) => {
  const [error, setError] = useState(null);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0); // scroll to top on mount

    const existing = localStorage.getItem('strava_activities');
    if (existing) {
      console.log('🛑 Using cached Strava data');
      const parsed = JSON.parse(existing);
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

        if (!res.ok || !data.access_token) {
          localStorage.removeItem('strava_activities'); // clear any stale data
          throw new Error(data.message || 'Failed to exchange token');
        }

        window.history.replaceState({}, document.title, '/strava-redirect');

        if (!hasShownPopup.current) {
          alert('✅ Strava connected successfully!');
          hasShownPopup.current = true;
        }

        const fetchActivities = async (accessToken) => {
          try {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            let allActivities = [];
            let page = 1;
            const perPage = 100;

            while (true) {
              const res = await fetch(
                `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );

              const batch = await res.json();
              if (!Array.isArray(batch) || batch.length === 0) break;

              const recent = batch.filter(
                (act) => new Date(act.start_date) > oneYearAgo
              );

              allActivities.push(...recent);
              if (batch.length < perPage) break;
              page++;
            }

            localStorage.setItem('strava_activities', JSON.stringify(allActivities));
            if (!localStorage.getItem('onboarding_data')) {
              localStorage.setItem('onboarding_data', JSON.stringify({ placeholder: true }));
            }
            onDataLoaded(allActivities);
          } catch (err) {
            console.error('Failed to fetch activities:', err);
            setError('Failed to fetch Strava activities.');
          }
        };

        fetchActivities(data.access_token);
      } catch (err) {
        console.error('Token exchange failed:', err);
        setError(err.message || 'Token exchange failed.');
      }
    };

    exchangeToken();
  }, [onDataLoaded]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Strava Authorization</h2>
      {error ? (
        <p className="text-red-500">❌ {error}</p>
      ) : (
        <p>🔄 Connecting to Strava...</p>
      )}
    </div>
  );
};

export default StravaRedirect;
