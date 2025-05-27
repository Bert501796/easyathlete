// backend/api/strava-auth.js
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/exchange', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to exchange token with Strava' });
  }
});

export default router;
