import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 60_000;
const MAX_HISTORY_MESSAGES = 16;
const MAX_HISTORY_CHARS = 8_000;

export class UserInputError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'UserInputError';
    this.code = code;
    this.status = 400;
  }
}

export class ProviderError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
  }
}

function normalizeBase64File(attachment) {
  if (!attachment || typeof attachment !== 'object') {
    throw new UserInputError('invalid_attachment', 'The attached file could not be read. Please select it again.');
  }

  const { name, mimeType, dataBase64 } = attachment;
  if (typeof name !== 'string' || typeof mimeType !== 'string' || typeof dataBase64 !== 'string') {
    throw new UserInputError('invalid_attachment', 'The attached file is missing required data. Please select it again.');
  }
  if (dataBase64.length > Math.ceil(MAX_UPLOAD_BYTES * 4 / 3) + 8) {
    throw new UserInputError('attachment_too_large', 'Files must be 15 MB or smaller.');
  }

  const bytes = Buffer.from(dataBase64, 'base64');
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) {
    throw new UserInputError('attachment_too_large', 'The file is empty or larger than the 15 MB limit.');
  }

  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  const mime = mimeType.toLowerCase().split(';')[0].trim();
  return { name: name.slice(0, 180), extension, mime, bytes, dataBase64 };
}

export async function extractAttachment(attachment) {
  const { name, extension, mime, bytes, dataBase64 } = normalizeBase64File(attachment);

  if (['png', 'jpg', 'jpeg'].includes(extension) || ['image/png', 'image/jpeg'].includes(mime)) {
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if ((mime === 'image/png' || extension === 'png') && !isPng) {
      throw new UserInputError('invalid_image', 'That file is not a valid PNG image.');
    }
    if ((mime === 'image/jpeg' || ['jpg', 'jpeg'].includes(extension)) && !isJpeg) {
      throw new UserInputError('invalid_image', 'That file is not a valid JPEG image.');
    }
    const resolvedMime = isPng ? 'image/png' : 'image/jpeg';
    return {
      name,
      kind: 'image',
      dataUrl: `data:${resolvedMime};base64,${dataBase64}`,
      text: '',
    };
  }

  if (extension === 'txt' || extension === 'md' || ['text/plain', 'text/markdown'].includes(mime)) {
    const text = bytes.toString('utf8').replace(/\u0000/g, '').trim();
    if (!text) throw new UserInputError('empty_document', 'The text document is empty.');
    return { name, kind: 'text', text: text.slice(0, MAX_EXTRACTED_CHARS) };
  }

  if (extension === 'docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer: bytes });
      const text = result.value.trim();
      if (!text) throw new UserInputError('empty_document', 'No readable text was found in this Word document.');
      return { name, kind: 'text', text: text.slice(0, MAX_EXTRACTED_CHARS) };
    } catch (error) {
      if (error instanceof UserInputError) throw error;
      throw new UserInputError('document_extraction_failed', 'Could not read this Word document. Please try a valid .docx file.');
    }
  }

  if (extension === 'pdf' || mime === 'application/pdf') {
    try {
      const document = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .filter(Boolean)
          .join(' ')
          .trim();
        if (pageText) pages.push(`[Page ${pageNumber}]\n${pageText}`);
      }
      await document.destroy();
      const text = pages.join('\n\n').slice(0, MAX_EXTRACTED_CHARS);
      if (!text) {
        throw new UserInputError('pdf_contains_no_text', 'No selectable text was found in this PDF. For scanned pages, upload a clear PNG or JPEG image instead.');
      }
      return { name, kind: 'text', text };
    } catch (error) {
      if (error instanceof UserInputError) throw error;
      throw new UserInputError('pdf_extraction_failed', 'Could not extract text from this PDF. Try another PDF or upload a page as a PNG/JPEG image.');
    }
  }

  throw new UserInputError('unsupported_attachment', 'Supported files are PNG/JPEG images, text or Markdown, text-based PDFs, and .docx documents.');
}

export function buildEngineeringPrompt({ subjectId, mode, language }) {
  const subjects = {
    manufacturing: 'Manufacturing Processes',
    ice: 'Internal Combustion Engines',
    analysis: 'Mathematical Analysis',
    gasdyn: 'Gas Dynamics',
    manufacturing_lab: 'Manufacturing Lab',
    ice_lab: 'Engines Lab',
    gasdyn_lab: 'Gas Dynamics Lab',
  };
  const subject = subjects[subjectId] ?? 'Mechanical Engineering';
  const responseLanguage = language === 'ar' ? 'Arabic (clear, natural Iraqi-friendly Arabic)' : 'English';
  const teachingMode = mode === 'quick'
    ? 'Keep the answer concise while retaining essential assumptions and units.'
    : mode === 'professor'
      ? 'Give a thorough derivation, explain why each step is valid, and discuss relevant limitations.'
      : 'Teach step by step, defining the symbols and explaining each substitution.';

  return `You are UNI GENIUS, an engineering assistant for a third-year mechanical engineering student.
Current subject: ${subject}.
Answer in ${responseLanguage}. ${teachingMode}
For engineering problems, identify knowns and unknowns, state assumptions, define symbols, show the governing equation, substitute values with units, calculate carefully, and check dimensions and physical plausibility. Use SI units unless the user requests otherwise.
Read uploaded images as engineering questions: transcribe visible text and equations as needed, state any uncertain symbols, then solve only when the givens are sufficient.
For extracted documents, use page labels supplied in the text when referring to them. Never invent measurements, course-note content, citations, or page references. Do not claim you inspected a file unless its contents are present in this request. If information is missing or an image is unclear, say exactly what is needed. Use Markdown and LaTeX for readable equations.`;
}

function modalityIncludesImage(model) {
  const modalities = model?.input_modalities ?? model?.inputModalities ?? [];
  return Array.isArray(modalities)
    && modalities.some((modality) => /image|vision/i.test(String(modality)));
}

function readProviderError(status, body) {
  const detail = typeof body?.error === 'string'
    ? body.error
    : typeof body?.error?.message === 'string'
      ? body.error.message
      : typeof body?.message === 'string'
        ? body.message
        : '';
  if (status === 400 && /incorrect api key|invalid api key|credential/i.test(detail)) {
    return new ProviderError(
      'xai_invalid_credentials',
      'The xAI connection rejected its credentials. Reconnect the xAI integration or add a valid XAI_API_KEY in Replit Secrets.',
      503,
    );
  }
  if (status === 401 || status === 403) {
    return new ProviderError(
      'xai_invalid_credentials',
      'xAI rejected the connection. Reconnect the xAI integration or add a valid XAI_API_KEY in Replit Secrets.',
      503,
    );
  }
  if (status === 429) {
    return new ProviderError('xai_rate_limited', 'xAI is rate-limiting requests. Wait a moment and retry.', 429);
  }
  return new ProviderError('xai_provider_error', 'xAI could not complete the request. Please retry shortly.', 502);
}

export function createAiService({ connectors, apiKey = '', model = '', fetchImpl = fetch }) {
  let cachedVisionModel = '';

  async function request(path, init = {}) {
    if (apiKey) {
      return fetchImpl(`https://api.x.ai${path}`, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    }
    if (!connectors?.proxy) {
      throw new ProviderError(
        'xai_not_configured',
        'Connect the xAI integration or add XAI_API_KEY in Replit Secrets to enable cloud AI.',
        503,
      );
    }
    return connectors.proxy('xai', path, init);
  }

  async function requestJson(path, init) {
    let response;
    try {
      response = await request(path, init);
    } catch {
      throw new ProviderError('xai_unreachable', 'Could not reach xAI. Check the connection and retry.', 502);
    }
    const text = await response.text();
    let body = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    if (!response.ok) throw readProviderError(response.status, body);
    return body;
  }

  async function discoverVisionModel() {
    if (model) return model;
    if (cachedVisionModel) return cachedVisionModel;
    const body = await requestJson('/v1/language-models', { method: 'GET' });
    const candidates = (body.models ?? []).filter(modalityIncludesImage);
    const discovered = candidates.find((candidate) => typeof candidate.id === 'string' && candidate.id.trim());
    if (!discovered) {
      throw new ProviderError(
        'xai_vision_model_unavailable',
        'The connected xAI account has no available image-capable chat model. Check its model access or set XAI_MODEL.',
        503,
      );
    }
    cachedVisionModel = discovered.id;
    return cachedVisionModel;
  }

  async function health() {
    const resolvedModel = await discoverVisionModel();
    return { available: true, provider: 'xAI', model: resolvedModel };
  }

  async function reply({ message, subjectId, mode = 'study', language = 'ar', history = [], attachment }) {
    const extracted = attachment ? await extractAttachment(attachment) : null;
    const resolvedModel = await discoverVisionModel();
    const cleanHistory = Array.isArray(history)
      ? history.slice(-MAX_HISTORY_MESSAGES)
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')
        .map((item) => ({
          role: item.role,
          content: item.text.slice(0, MAX_HISTORY_CHARS),
        }))
      : [];

    const prompt = typeof message === 'string' ? message.trim() : '';
    const userPrompt = prompt || (language === 'ar'
      ? 'حل المسألة الهندسية الظاهرة في الملف المرفق، واشرح خطواتك.'
      : 'Solve the engineering question in the attached file and explain your steps.');
    const content = [];
    if (extracted?.kind === 'text') {
      content.push({ type: 'text', text: `${userPrompt}\n\nExtracted content from ${extracted.name}:\n${extracted.text}` });
    } else {
      content.push({ type: 'text', text: userPrompt });
      if (extracted?.kind === 'image') {
        content.push({
          type: 'image_url',
          image_url: { url: extracted.dataUrl, detail: 'high' },
        });
      }
    }

    const body = await requestJson('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolvedModel,
        temperature: 0.2,
        max_completion_tokens: 2500,
        messages: [
          { role: 'system', content: buildEngineeringPrompt({ subjectId, mode, language }) },
          ...cleanHistory,
          { role: 'user', content },
        ],
      }),
    });
    const answer = body.choices?.[0]?.message?.content;
    const text = Array.isArray(answer)
      ? answer.map((part) => part?.text ?? '').join('')
      : answer;
    if (typeof text !== 'string' || !text.trim()) {
      throw new ProviderError('xai_empty_response', 'xAI returned an empty response. Please retry.', 502);
    }
    return { answer: text.trim(), model: resolvedModel };
  }

  return { health, reply };
}
