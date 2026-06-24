// Hand-drawn pixel-art avatars for Eleven and Dustin, animated with a
// classic 2-frame "wave" loop (think 8-bit NES sprite). Pure SVG + CSS — no
// network calls, no model latency, perfectly on-theme for the H-89 CRT.
import React from 'react';

type CharacterId = 'eleven' | 'dustin';

interface Props {
    character: CharacterId;
    /** Pixel size (width=height). Defaults to 96. */
    size?: number;
}

/**
 * Each frame is a 16x16 grid of single-character codes that map to a palette
 * entry. Two frames per character form the wave loop (arm down → arm up).
 * Keeping the grid this small keeps the silhouette readable on a CRT.
 *
 * Palette codes:
 *   . = transparent
 *   o = outline (deep green)
 *   s = skin
 *   h = hair / cap
 *   c = clothes (Eleven pink dress / Dustin yellow tee)
 *   m = mouth
 *   e = eye
 *   x = accent (Eleven's nosebleed dab / Dustin's cap front)
 */
const SPRITES: Record<CharacterId, { frames: [string[], string[]]; palette: Record<string, string> }> = {
    eleven: {
        palette: {
            o: '#1a0a0a',
            s: '#f0c8a0',
            h: '#5a3a1a',
            c: '#e8a0b8',
            m: '#7a2030',
            e: '#1a0a0a',
            x: '#c83030',
        },
        frames: [
            // Frame A — arms relaxed
            [
                '................',
                '......oooooo....',
                '.....ohhhhhho...',
                '....ohhhhhhhho..',
                '....ohhhhhhhho..',
                '....osssssssso..',
                '....os.e.e.so...',
                '....osssssss.o..',
                '....os.mmm.so...',
                '....osssssss....',
                '...occcccccco...',
                '..occcccccccco..',
                '..ocxccccccco...',
                '..occcccccccoo..',
                '..occc....ccc...',
                '..ooo......ooo..',
            ],
            // Frame B — right arm up waving
            [
                '................',
                '......oooooo..o.',
                '.....ohhhhhhooco',
                '....ohhhhhhhhco.',
                '....ohhhhhhhho..',
                '....ossssssssoo.',
                '....os.e.e.so...',
                '....osssssss.o..',
                '....os.mmm.so...',
                '....osssssss....',
                '...occcccccco...',
                '..occcccccccco..',
                '..ocxcccccccc...',
                '..occcccccccoo..',
                '..occc....ccc...',
                '..ooo......ooo..',
            ],
        ],
    },
    dustin: {
        palette: {
            o: '#0a0a0a',
            s: '#e8c094',
            h: '#3a2010',      // curly hair peeking under cap
            c: '#d8b840',      // mustard tee
            m: '#5a2020',
            e: '#0a0a0a',
            x: '#b83030',      // red cap front
        },
        frames: [
            // Frame A — arms relaxed, classic ball cap
            [
                '................',
                '....xxxxxxxxx...',
                '...xxxxxxxxxxx..',
                '..oxxxxxxxxxxo..',
                '..ohhhhhhhhhho..',
                '..osssssssssoh..',
                '..os.e.e.....so.',
                '..ossssssssss.o.',
                '..os.mmmmm..so..',
                '..ossssssssss...',
                '..occccccccco...',
                '.occcccccccccs..',
                '.occcccccccccs..',
                '.osccccccccccs..',
                '..occc....ccc...',
                '..ooo......ooo..',
            ],
            // Frame B — right arm up waving above cap
            [
                '...............s',
                '....xxxxxxxxx.so',
                '...xxxxxxxxxxso.',
                '..oxxxxxxxxxxs..',
                '..ohhhhhhhhhho..',
                '..osssssssssoh..',
                '..os.e.e.....so.',
                '..ossssssssss.o.',
                '..os.mmmmm..so..',
                '..ossssssssss...',
                '..occcccccccc...',
                '.occcccccccccc..',
                '.occccccccccc...',
                '.osccccccccccs..',
                '..occc....ccc...',
                '..ooo......ooo..',
            ],
        ],
    },
};

const renderFrame = (grid: string[], palette: Record<string, string>): React.ReactElement[] => {
    const cells: React.ReactElement[] = [];
    for (let y = 0; y < grid.length; y++) {
        const row = grid[y];
        for (let x = 0; x < row.length; x++) {
            const ch = row[x];
            const fill = palette[ch];
            if (!fill) continue;
            cells.push(
                <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={fill}
                    shapeRendering="crispEdges"
                />,
            );
        }
    }
    return cells;
};

const PixelAvatar: React.FC<Props> = ({ character, size = 96 }) => {
    const sprite = SPRITES[character];
    const label = character === 'eleven' ? 'Eleven waves hello' : 'Dustin waves hello';
    return (
        <div
            className="inline-block relative shrink-0"
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
            aria-label={label}
            role="img"
        >
            {/* Frame A */}
            <svg
                viewBox="0 0 16 16"
                width={size}
                height={size}
                className="absolute inset-0 pixel-wave-a"
                style={{
                    filter: 'drop-shadow(0 0 4px rgba(51,255,102,0.35))',
                    imageRendering: 'pixelated',
                }}
            >
                {renderFrame(sprite.frames[0], sprite.palette)}
            </svg>
            {/* Frame B */}
            <svg
                viewBox="0 0 16 16"
                width={size}
                height={size}
                className="absolute inset-0 pixel-wave-b"
                style={{
                    filter: 'drop-shadow(0 0 4px rgba(51,255,102,0.35))',
                    imageRendering: 'pixelated',
                }}
            >
                {renderFrame(sprite.frames[1], sprite.palette)}
            </svg>
        </div>
    );
};

export default PixelAvatar;
