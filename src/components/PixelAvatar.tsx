// Animated ASCII / block-graphic portraits for Eleven and Dustin.
// Rendered as plain monospace green text so they sit inside the H-89 CRT
// instead of looking like an imported sprite. Two frames per character
// swap in place via the existing pixel-wave-a / pixel-wave-b keyframes
// in src/styles.css (steps(1) — true 8-bit cadence, no blending).
import React from 'react';

type CharacterId = 'eleven' | 'dustin';

interface Props {
    character: CharacterId;
    /** Approximate avatar height in pixels. Used to pick a font size. */
    size?: number;
}

// ---------- DUSTIN -----------------------------------------------------------
// 14 rows × 33 cols. Both frames are EXACTLY the same width per line so the
// swap doesn't jitter. Frame A: arms down at sides. Frame B: arms up waving.
// Reads as: red-bill trucker cap, "HFC" cap front, curls bursting out the
// sides, big toothy grin, Hellfire Club tee.
const DUSTIN_FRAME_A = String.raw`
        ______________
       /=:=:=:=:=:=:=:\
      /  WHITE  ||BLU  \
     /====[ HFC ]=======\
     '~~~~~~~~~~~~~~~~~~'
    (((  o      o  )))
   (((    \____/     )))
    (((   \____/    )))
      ((( '------' )))
        '~~~~~~~~~~'
        | HELLFIRE |
        | / \  / \ |
        |  V    V  |
        |__________|
`;

const DUSTIN_FRAME_B = String.raw`
   \o    ______________    o/
    \   /=:=:=:=:=:=:=:\   /
     \ /  WHITE  ||BLU  \ /
      /====[ HFC ]=======\
     '~~~~~~~~~~~~~~~~~~'
    (((  ^      ^  )))
   (((    \____/     )))
    (((   \____/    )))
      ((( '------' )))
        '~~~~~~~~~~'
        | HELLFIRE |
        | / \  / \ |
        |  V    V  |
        |__________|
`;

// ---------- ELEVEN (placeholder — refresh when refs arrive) ------------------
// Same grid as Dustin so the layout doesn't shift between characters.
const ELEVEN_FRAME_A = String.raw`
         __________
        /::::::::::\
       / shaved cut \
      /==============\
       (  o    o  )
       (    /\    )
       (   '--'   )
       (   \__/   )
        \________/
        /        \
       /  PINK    \
      |   DRESS    |
       \__________/
        ||      ||
`;

const ELEVEN_FRAME_B = String.raw`
   \o    __________    o/
    \   /::::::::::\   /
     \ / shaved cut \ /
      /==============\
       (  o    o  )
       (    /\    )
       (   '--'   )
       (   \__/   )
        \________/
        /        \
       /  PINK    \
      |   DRESS    |
       \__________/
        ||      ||
`;

const FRAMES: Record<CharacterId, [string, string]> = {
    dustin: [DUSTIN_FRAME_A.trim(), DUSTIN_FRAME_B.trim()],
    eleven: [ELEVEN_FRAME_A.trim(), ELEVEN_FRAME_B.trim()],
};

const PixelAvatar: React.FC<Props> = ({ character, size = 200 }) => {
    const [frameA, frameB] = FRAMES[character];
    const label =
        character === 'eleven' ? 'Eleven waving (ASCII)' : 'Dustin waving (ASCII)';

    // Pick a font size that roughly fits the requested visual height.
    // 14 rows of monospace text → ~size/15 per row works on most terminals.
    const fontSize = Math.max(8, Math.round(size / 16));

    const preBase: React.CSSProperties = {
        fontFamily:
            "'VT323', 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        margin: 0,
        whiteSpace: 'pre',
        color: '#33ff66',
        textShadow:
            '0 0 4px rgba(51,255,102,0.85), 0 0 10px rgba(51,255,102,0.45)',
        letterSpacing: '0.02em',
    };

    return (
        <div
            className="relative inline-block align-top select-none"
            aria-label={label}
            role="img"
            style={{ minHeight: `${fontSize * 14}px` }}
        >
            <pre className="pixel-wave-a" style={{ ...preBase }}>
                {frameA}
            </pre>
            <pre
                className="pixel-wave-b absolute top-0 left-0"
                style={{ ...preBase }}
            >
                {frameB}
            </pre>
        </div>
    );
};

export default PixelAvatar;
