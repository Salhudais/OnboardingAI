const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initializeDeepgram = ({ onOpen, onTranscript, onError, onClose }) => {
  const dgLive = deepgram.listen.live({
    encoding: 'mulaw',
    sample_rate: 8000,
    channels: 1,
    punctuate: true,
    interim_results: true,
    endpointing: 1000,
    vad_events: true,
    utterance_end_ms: 2000,
  });

  dgLive.on(LiveTranscriptionEvents.Open, onOpen);

  dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
    if (transcription.is_final) {
      const transcript = transcription.channel.alternatives[0].transcript;
      await onTranscript(transcript);
    }
  });

  dgLive.on(LiveTranscriptionEvents.Error, onError);
  dgLive.on(LiveTranscriptionEvents.Close, onClose);

  return dgLive;
};

const generateTTS = async (text) => {
  if (!text || text.trim() === '') {
    throw new Error('Text for TTS cannot be null or empty');
  }

  try {
    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak',
      { text },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mulaw',
        },
        params: {
          model:'aura-luna-en',
          encoding: 'mulaw',
          container: 'none',
          sample_rate: 8000,
        },
        responseType: 'arraybuffer',
      }
    );

    if (ttsResponse.status !== 200) {
      throw new Error('TTS generation failed');
    }

    return Buffer.from(ttsResponse.data);
  } catch (error) {
    console.error('Error in generateTTS:', error);
    throw error;
  }
};

const processTranscript = async (transcript, isNameExtraction = false) => {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    if (isNameExtraction) {
      const functions = [{
        name: "extractName",
        description: "Extract a person's name from conversation",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The extracted name from the conversation"
            }
          },
          required: ["name"]
        }
      }];

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI assistant making a phone call. Extract names when mentioned in conversation."
          },
          {
            role: "user", 
            content: transcript
          }
        ],
        functions,
        function_call: "auto"
      });

      const message = response.choices[0].message;
      
      if (message.function_call) {
        const extractedName = JSON.parse(message.function_call.arguments).name;
        return extractedName;
      }
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI assistant making a phone call. Keep responses concise and natural."
          },
          {
            role: "user", 
            content: transcript
          }
        ]
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};