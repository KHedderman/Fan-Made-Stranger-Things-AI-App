// Static, character-text ("ASCII") portraits of Stranger Things characters,
// generated on demand by the user's Gemini model (BYOK) and cached in the
// browser so we only spend one request per character per browser. No motion.
// Style target: dense typewriter-art portraits like jp2a output (the dog
// reference the user shared), rendered as glowing green phosphor text on
// the H-89 CRT.
import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { getApiKey, getModel } from '../lib/apiKeyStorage';

type CharacterId = 'eleven' | 'dustin';

interface Props {
    character: CharacterId;
    /** Approximate avatar height in pixels (used only to pick a font size). */
    size?: number;
}

const CACHE_VERSION = 'v2';
const cacheKey = (c: CharacterId) => `hawkins_ascii_portrait_${CACHE_VERSION}_${c}`;

const SUBJECT: Record<CharacterId, string> = {
    eleven:
        'Eleven from Stranger Things — a young girl with a shaved buzzcut, big serious eyes, wearing the iconic pink dress with a navy blue collared jacket. Bust-up portrait, front-facing.',
    dustin:
        'Dustin Henderson from Stranger Things — a teen boy with a wide gap-toothed grin, curly hair bursting out from under a red-and-blue trucker cap (Hellfire Club / "HFC" front), wearing a Hellfire Club t-shirt. Bust-up portrait, front-facing.',
};

const buildPrompt = (character: CharacterId) => `
Generate a HIGHLY DETAILED ASCII art portrait of ${SUBJECT[character]}

STRICT RULES:
- Output ONLY the ASCII art. No prose, no commentary, no markdown fences, no backticks.
- Use ONLY printable ASCII characters from this density ramp (light -> dark):
   .,:;i1rsXA25HGB#@
  Plus spaces for the background. Brighter = lighter character. Darker = denser character.
- Use varied character density to render shading, hair, fabric, and facial features (like jp2a / image-to-ASCII converters).
- Image dimensions: EXACTLY 60 columns wide, 45 rows tall. Every row must be 60 characters (pad with spaces if needed).
- Centered on a blank background. Recognizable face. Looks like a photo converted to ASCII.
- Do NOT use box-drawing, Unicode, emoji, or any non-ASCII glyph.
`.trim();

const fetchAsciiPortrait = async (character: CharacterId): Promise<string> => {
    const key = getApiKey();
    if (!key) throw new Error('Missing API key');
    const ai = new GoogleGenAI({ apiKey: key });
    const res = await ai.models.generateContent({
        model: getModel(),
        contents: buildPrompt(character),
        config: { temperature: 0.4 },
    });
    const text = (res?.text ?? '').trim();
    // Strip any accidental code fences.
    return text
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/\n?```\s*$/, '')
        .replace(/^\s*\n/, '');
};

const loadCached = (character: CharacterId): string | null => {
    try {
        return window.localStorage.getItem(cacheKey(character));
    } catch {
        return null;
    }
};

const saveCached = (character: CharacterId, art: string) => {
    try {
        window.localStorage.setItem(cacheKey(character), art);
    } catch {
        /* ignore */
    }
};

const PixelAvatar: React.FC<Props> = ({ character, size = 200 }) => {
    const [art, setArt] = useState<string | null>(() => loadCached(character));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (art) return;
        let cancelled = false;
        fetchAsciiPortrait(character)
            .then((result) => {
                if (cancelled) return;
                saveCached(character, result);
                setArt(result);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('ASCII portrait failed:', err);
                setError(err instanceof Error ? err.message : 'render failed');
            });
        return () => {
            cancelled = true;
        };
    }, [character, art]);

    // Tighter line-height + smaller cells so the 60x45 grid actually reads
    // as a portrait rather than a stretched billboard.
    const fontSize = Math.max(6, Math.round(size / 22));

    const preStyle: React.CSSProperties = {
        fontFamily: "'VT323', 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        margin: 0,
        whiteSpace: 'pre',
        color: '#33ff66',
        textShadow: '0 0 3px rgba(51,255,102,0.85), 0 0 8px rgba(51,255,102,0.45)',
        letterSpacing: '0.05em',
    };

    return (
        <div
            className="inline-block align-top select-none"
            role="img"
            aria-label={`${character === 'eleven' ? 'Eleven' : 'Dustin'} ASCII portrait`}
        >
            {art ? (
                <pre style={preStyle}>{art}</pre>
            ) : error ? (
                <pre style={{ ...preStyle, opacity: 0.7 }}>
                    {`/// PORTRAIT FEED LOST ///\n${error}`}
                </pre>
            ) : (
                <pre style={{ ...preStyle, opacity: 0.7 }} className="animate-pulse">
                    {`░▒▓ RENDERING ${character.toUpperCase()} ▓▒░\n   (ASCII portrait, one-time)`}
                </pre>
            )}
        </div>
    );
};

export default PixelAvatar;
