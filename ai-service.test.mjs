import assert from 'node:assert/strict';
import test from 'node:test';
import { createAiService, extractAttachment, ProviderError, UserInputError } from './ai-service.mjs';

function textFile(name, text) {
  return {
    name,
    mimeType: 'text/plain',
    dataBase64: Buffer.from(text).toString('base64'),
  };
}

test('extracts text attachments and rejects unsupported file types', async () => {
  const extracted = await extractAttachment(textFile('question.txt', 'Calculate Mach number for V=250 m/s.'));
  assert.equal(extracted.kind, 'text');
  assert.match(extracted.text, /Mach number/);

  await assert.rejects(
    extractAttachment({ ...textFile('scan.doc', 'not a Word document'), mimeType: 'application/msword' }),
    (error) => error instanceof UserInputError && error.code === 'unsupported_attachment',
  );
});

test('discovers an image-capable model and sends multimodal chat with engineering context', async () => {
  const calls = [];
  const connectors = {
    async proxy(_connector, path, init) {
      calls.push({ path, init });
      if (path === '/v1/language-models') {
        return Response.json({
          models: [
            { id: 'text-only', input_modalities: ['text'] },
            { id: 'vision-model', input_modalities: ['text', 'image'] },
          ],
        });
      }
      return Response.json({
        choices: [{ message: { content: '**Ma = V/a = 250/340 = 0.735**' } }],
      });
    },
  };
  const service = createAiService({ connectors });
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
  const result = await service.reply({
    message: 'Find the Mach number shown.',
    subjectId: 'gasdyn',
    mode: 'study',
    language: 'en',
    history: [{ role: 'user', text: 'We are studying compressible flow.' }],
    attachment: { name: 'question.png', mimeType: 'image/png', dataBase64: pngBase64 },
  });

  assert.equal(result.model, 'vision-model');
  assert.match(result.answer, /Ma = V\/a/);
  const requestBody = JSON.parse(calls.find((call) => call.path === '/v1/chat/completions').init.body);
  assert.match(requestBody.messages[0].content, /Gas Dynamics/);
  assert.match(requestBody.messages[1].content, /compressible flow/);
  assert.equal(requestBody.messages.at(-1).content[1].type, 'image_url');
  assert.match(requestBody.messages.at(-1).content[1].image_url.url, /^data:image\/png;base64,/);
});

test('reports invalid xAI credentials instead of generating a local answer', async () => {
  const connectors = {
    async proxy() {
      return Response.json({ error: 'Incorrect API key provided' }, { status: 400 });
    },
  };
  const service = createAiService({ connectors });
  await assert.rejects(service.health(), (error) => (
    error instanceof ProviderError
    && error.code === 'xai_invalid_credentials'
    && error.status === 503
    && /XAI_API_KEY/.test(error.message)
  ));
});

test('rejects oversized attachments before sending them to the provider', async () => {
  const service = createAiService({
    connectors: { proxy: async () => { throw new Error('provider should not be called'); } },
  });
  await assert.rejects(
    service.reply({
      message: '',
      attachment: {
        name: 'large.txt',
        mimeType: 'text/plain',
        dataBase64: 'A'.repeat(21 * 1024 * 1024),
      },
    }),
    (error) => error instanceof UserInputError && error.code === 'attachment_too_large',
  );
});
