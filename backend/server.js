require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Placeholder for storing chats in memory (replace with database)
const chats = [];

// Ensure the API key is present
if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is not set in environment variables.');
  process.exit(1);
}

// POST endpoint for sending messages to ChatGPT with extra context
app.post('/api/chatbot/send', async (req, res) => {
  const { message, context } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with AI' });
  }
});

// Endpoint to store chat messages
app.post('/api/chat/store', (req, res) => {
  const { chatId, messages } = req.body;

  // Store the chat in the "database" (in-memory for now)
  chats.push({ chatId, messages });

  res.status(200).send({ message: 'Chat saved successfully!' });
});

// Endpoint to fetch active chats
app.get('/api/chat/active', (req, res) => {
  res.status(200).send(chats); // Return all stored chats
});

// Endpoint to fetch chat messages by chatId
app.get('/api/chat/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  const chat = chats.find(c => c.chatId === chatId);

  if (chat) {
    res.status(200).send(chat.messages);
  } else {
    res.status(404).send({ message: 'Chat not found' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
