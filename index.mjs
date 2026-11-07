import express from 'express';
import { ReplitConnectors } from '@replit/connectors-sdk';
import { createAiService, ProviderError, UserInputError } from './ai-service.mjs';

const app = express();
app.use(express.json({ limit: '24mb' }));

const port = Number(process.env.PORT || 8787);
const ai = createAiService({
  connectors: new ReplitConnectors(),
  apiKey: process.env.XAI_API_KEY || '',
  model: process.env.XAI_MODEL || '',
});

app.get('/api/health', async (_request, response) => {
  try {
    const provider = await ai.health();
    response.json({
      ok: true,
      providerConfigured: true,
      provider: provider.provider,
      model: provider.model,
      credentialSource: process.env.XAI_API_KEY ? 'XAI_API_KEY Replit Secret' : 'connected xAI integration',
    });
  } catch (error) {
    const message = error instanceof ProviderError
      ? error.message
      : 'Could not check the xAI connection. Please retry.';
    response.json({
      ok: true,
      providerConfigured: false,
      provider: 'xAI',
      model: null,
      error: error instanceof ProviderError ? error.code : 'xai_connection_error',
      message,
      credentialSource: process.env.XAI_API_KEY ? 'XAI_API_KEY Replit Secret' : 'connected xAI integration',
    });
  }
});

app.post('/api/chat', async (request, response) => {
  const { message = '', subjectId, mode = 'study', language = 'ar', history = [], attachment } = request.body ?? {};
  if (typeof message !== 'string' || message.length > 12_000) {
    return response.status(400).json({ error: 'invalid_message', message: 'Enter a question of 12,000 characters or fewer.' });
  }
  if (!message.trim() && !attachment) {
    return response.status(400).json({ error: 'message_required', message: 'Enter a question or attach a supported file.' });
  }
  if (typeof subjectId !== 'string' || !['ar', 'en'].includes(language)) {
    return response.status(400).json({ error: 'invalid_request', message: 'Select a valid subject and response language.' });
  }
  if (!Array.isArray(history) || history.length > 50) {
    return response.status(400).json({ error: 'invalid_history', message: 'The conversation is too long. Start a new chat or clear saved history.' });
  }

  try {
    const result = await ai.reply({ message, subjectId, mode, language, history, attachment });
    response.json(result);
  } catch (error) {
    if (error instanceof UserInputError) {
      return response.status(error.status).json({ error: error.code, message: error.message });
    }
    if (error instanceof ProviderError) {
      console.error('xAI request failed:', error.code);
      return response.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Unexpected chat request failure:', error);
    return response.status(500).json({ error: 'chat_internal_error', message: 'The chat service encountered an unexpected error. Please retry.' });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`UNI GENIUS API listening on ${port}`));
