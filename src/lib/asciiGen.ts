// On-demand ASCII art generation via the user's Gemini text model (BYOK).
// The AI characters can embed <<ASCII: subject>> tags in their replies; after
// the chat stream completes we resolve each tag by asking Gemini to render
// dense typewriter-art for that subject (portrait, walkie-talkie, Eggo, etc).
import { GoogleGenAI } from '@google/genai';
import { getApiKey, getModel } from './apiKeyStorage';

export class AsciiGenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AsciiGenError';
    }
}

const buildPrompt = (subject: string) => `
Generate a HIGHLY DETAILED ASCII art rendering of: ${subject}

STRICT OUTPUT RULES:
- Output ONLY the ASCII art. No prose, no commentary, no markdown fences, no backticks.
- Use ONLY printable ASCII characters from this density ramp (light -> dark):
   .,:;i1rsXA25HGB#@
  Plus spaces for background. Brighter areas = lighter character. Shadow/dense areas = denser character.
- Vary character density to render shading, contours, hair, fabric, and texture — the same technique image-to-ASCII converters like jp2a use.
- Dimensions: EXACTLY 60 columns wide, 40 rows tall. Pad each line with spaces to exactly 60 characters.
- Centered on a blank background. Recognizable subject.
- Do NOT use Unicode, box-drawing characters, emoji, or any non-ASCII glyph.
`.trim();

export const generateAsciiArt = async (subject: string): Promise<string> => {
    const key = getApiKey();
    if (!key) throw new AsciiGenError('Missing Gemini API key');

    const ai = new GoogleGenAI({ apiKey: key });
    const res = await ai.models.generateContent({
        model: getModel(),
        contents: buildPrompt(subject),
        config: { temperature: 0.4 },
    });
    const text = (res?.text ?? '').trim();
    if (!text) throw new AsciiGenError('No ASCII art returned');
    return text
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/\n?```\s*$/, '')
        .replace(/^\s*\n/, '');
};

const ASCII_TAG_RE = /<<ASCII:\s*([^>]+?)>>/g;

export interface ExtractedAscii {
    subject: string;
    placeholder: string;
}

export const extractAsciiTags = (text: string): ExtractedAscii[] => {
    const out: ExtractedAscii[] = [];
    let m: RegExpExecArray | null;
    ASCII_TAG_RE.lastIndex = 0;
    while ((m = ASCII_TAG_RE.exec(text)) !== null) {
        out.push({ subject: m[1].trim(), placeholder: m[0] });
    }
    return out;
};

export const stripAsciiTags = (text: string): string =>
    text.replace(ASCII_TAG_RE, '').replace(/\n{3,}/g, '\n\n').trim();
