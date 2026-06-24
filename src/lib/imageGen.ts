// Nano Banana image generation via Google's Gemini API.
// Uses the SAME user-provided Google API key as chat (BYOK, browser-only).
// Model: gemini-2.5-flash-image-preview ("Nano Banana") — free tier on Google AI Studio keys.
import { GoogleGenAI } from '@google/genai';
import { getApiKey } from './apiKeyStorage';

const NANO_BANANA_MODEL = 'gemini-2.5-flash-image';

// Locked-in style preamble so EVERY generated image looks like it was drawn
// on the H-89's monochrome amber/green CRT in 1982. Keep this short — the
// model follows the lead clause most strongly.
const H89_STYLE_PREAMBLE = [
    'Authentic 1982 Heathkit H-89 computer terminal monochrome CRT screenshot.',
    'Low-resolution 80x50 character cell pixel art rendered in a SINGLE bright phosphor green (#33ff66) on pure black background.',
    'Heavy scanlines, slight CRT bloom, subtle chromatic glow, dithered shading (Bayer / ordered dither), 1-bit feel.',
    'Stranger Things 1980s Hawkins aesthetic — analog, nostalgic, lo-fi. No modern UI, no color, no gradients, no photoreal detail.',
    'Centered subject, generous black border, no text unless requested.',
    'Subject:',
].join(' ');

export interface GeneratedImage {
    dataUrl: string;
    mimeType: string;
}

export class ImageGenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ImageGenError';
    }
}

/**
 * Generate a single H-89-styled image for the given subject prompt.
 * Returns a data URL ready to drop into <img src>.
 */
export const generateH89Image = async (subjectPrompt: string): Promise<GeneratedImage> => {
    const key = getApiKey();
    if (!key) throw new ImageGenError('Missing Gemini API key');

    const ai = new GoogleGenAI({ apiKey: key });
    const fullPrompt = `${H89_STYLE_PREAMBLE} ${subjectPrompt.trim()}`;

    const response = await ai.models.generateContent({
        model: NANO_BANANA_MODEL,
        contents: fullPrompt,
    });

    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
        const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
        if (inline?.data) {
            const mimeType = inline.mimeType ?? 'image/png';
            return {
                dataUrl: `data:${mimeType};base64,${inline.data}`,
                mimeType,
            };
        }
    }
    throw new ImageGenError('No image returned from Nano Banana');
};

// Match <<IMG: anything until close>> on its own (the AI emits these inline).
const IMG_TAG_RE = /<<IMG:\s*([^>]+?)>>/g;

export interface ExtractedImage {
    prompt: string;
    placeholder: string; // the exact tag text to swap out
}

export const extractImageTags = (text: string): ExtractedImage[] => {
    const out: ExtractedImage[] = [];
    let m: RegExpExecArray | null;
    IMG_TAG_RE.lastIndex = 0;
    while ((m = IMG_TAG_RE.exec(text)) !== null) {
        out.push({ prompt: m[1].trim(), placeholder: m[0] });
    }
    return out;
};

export const stripImageTags = (text: string): string =>
    text.replace(IMG_TAG_RE, '').replace(/\n{3,}/g, '\n\n').trim();
