const express = require('express');
const router = express.Router();
const expressWs = require('express-ws');
const WebSocket = require('ws');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { handleWebSocket, twilioStreamWebhook } = require('../twilioService');

// Call initiation endpoint
router.post('/', async (req, res) => {
  try {
    const { name, number } = req.body;
    
    if (!number) {
      console.error('Missing required parameter:', { number });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: phone number is required' 
      });
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      console.error('Missing Twilio phone number configuration');
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio phone number not configured' 
      });
    }

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const call = await client.calls.create({
      url: `https://api.onboardingai.org/call-leads/twilio-stream?phoneNumber=${encodeURIComponent(number)}`,
      to: number,
      from: fromNumber,
      statusCallback: 'https://api.onboardingai.org/call-leads/call-status',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });

    console.log('Call initiated with SID:', call.sid);
    res.json({ success: true, callSid: call.sid });

  } catch (error) {
    console.error('Error initiating call:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.code || 'Unknown error code'
      });
    }
  }
});

router.post('/call-status', (req, res) => {
  const callStatus = req.body.CallStatus;
  const callSid = req.body.CallSid;
  const callDuration = req.body.CallDuration;
  const from = req.body.From;
  const to = req.body.To;
  
  console.log('Raw Call Status Update:', {
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  /* console.log('Processed Call Status:', {
    callStatus,
    callSid,
    callDuration,
    from,
    to
  }); */

  res.sendStatus(200);
});

// Twilio webhook endpoint
router.post('/twilio-stream', twilioStreamWebhook);

module.exports = router;