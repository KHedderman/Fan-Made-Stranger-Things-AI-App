import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { Chat, GenerateContentResponse } from '@google/genai';
import type { AppState, Mode, Message, Season } from '../types';
import { useGeminiChat, MissingApiKeyError } from '../hooks/useGeminiChat';
import BootSequence from '../components/BootSequence';
import ChatInterface from '../components/ChatInterface';
import SettingsModal from '../components/SettingsModal';

export const Route = createFileRoute('/')({
    head: () => ({
        meta: [
            { title: 'Fan-Made Stranger Things AI App' },
            {
                name: 'description',
                content:
                    'A fan-made Stranger Things AI app styled as a retro Heathkit H-89 terminal. Chat as Eleven (kid-safe) or Dustin (full lore), pick your season for spoiler-safe answers, and bring your own Google Gemini key — stored only in your browser.',
            },
            { property: 'og:title', content: 'Fan-Made Stranger Things AI App' },
            {
                property: 'og:description',
                content:
                    'Fan-made Stranger Things AI app: retro Heathkit H-89 terminal, kid-safe Eleven mode, deep-lore Dustin mode, per-season spoiler firewall. BYOK Google Gemini.',
            },
            { property: 'og:url', content: 'https://fanstrangerthings.app' },
        ],
        links: [{ rel: 'canonical', href: 'https://fanstrangerthings.app' }],
    }),
    component: Index,
});

const ALL_SEASONS: readonly Season[] = ['1', '2', '3', '4', '5', 'First Shadow'];
const TYPING_SPEED_MS = 30;

const parseSeason = (input: string): Season | null => {
    const lowerInput = input.toLowerCase().trim();
    if (lowerInput.includes('first shadow') || lowerInput.includes('play')) {
        return 'First Shadow';
    }
    const match = lowerInput.match(/\d+/);
    if (match) {
        const num = match[0];
        if (ALL_SEASONS.includes(num as Season)) {
            return num as Season;
        }
    }
    return null;
};

function Index() {
    const [appState, setAppState] = useState<AppState>('BOOTING');
    const [mode, setMode] = useState<Mode | null>(null);
    const [, setSeason] = useState<Season | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const { startChat, hasApiKey } = useGeminiChat();

    const handleReset = useCallback(() => {
        setAppState('BOOTING');
        setMode(null);
        setSeason(null);
        setMessages([]);
        setIsLoading(false);
        chatRef.current = null;
    }, []);

    const typeOutText = async (text: string, messageId: number) => {
        for (const char of text) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, text: msg.text + char } : msg,
                ),
            );
            await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED_MS));
        }
    };

    const pushApiKeyNotice = useCallback(() => {
        const id = Date.now();
        setMessages((prev) => [
            ...prev,
            {
                id,
                sender: 'system',
                text:
                    '/// NO API KEY DETECTED ///\nAdd your Google Gemini API key in the SETTINGS menu (top-right) to begin transmission.\nYour key is stored only in your local browser.',
            },
        ]);
    }, []);

    const handleModeSelect = useCallback(
        async (selectedMode: Mode) => {
            setMode(selectedMode);
            setAppState('CHATTING');

            if (!hasApiKey) {
                pushApiKeyNotice();
                setSettingsOpen(true);
                return;
            }

            setIsLoading(true);
            const initialText =
                selectedMode === 'child'
                    ? "[ 🧇 ELEVEN ]\nHi. I am Eleven. Friends don't lie. What season did you watch? 1? 2? 3? 4? 5? Or First Shadow?"
                    : "[ 🧢 DUSTIN ]\nDustin Henderson here! Gold Leader standing by. Need your clearance level so I don't spoil the campaign. Did you see Season 1, 2, 3, 4, 5, or The First Shadow?";

            const aiResponseId = Date.now();
            setMessages([{ id: aiResponseId, sender: 'ai', text: '' }]);
            await typeOutText(initialText, aiResponseId);
            setIsLoading(false);
        },
        [hasApiKey, pushApiKeyNotice],
    );

    // If the user adds a key after landing on the chat screen with no key, prompt the intro.
    useEffect(() => {
        if (
            appState === 'CHATTING' &&
            hasApiKey &&
            mode &&
            messages.length > 0 &&
            messages.every((m) => m.sender === 'system')
        ) {
            // Re-run intro now that we have a key
            handleModeSelect(mode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasApiKey]);

    const handleSendMessage = useCallback(
        async (userInput: string) => {
            if (userInput.trim().toLowerCase() === 'reset') {
                handleReset();
                return;
            }

            if (!hasApiKey) {
                pushApiKeyNotice();
                setSettingsOpen(true);
                return;
            }

            const userMessage: Message = { id: Date.now(), sender: 'user', text: userInput };
            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            const aiResponseId = Date.now() + 1;

            const typeStream = async (stream: AsyncGenerator<GenerateContentResponse>) => {
                setMessages((prev) => [...prev, { id: aiResponseId, sender: 'ai', text: '' }]);
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        for (const char of chunkText) {
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === aiResponseId
                                        ? { ...msg, text: msg.text + char }
                                        : msg,
                                ),
                            );
                            await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED_MS));
                        }
                    }
                }
            };

            try {
                if (!chatRef.current && mode) {
                    const detectedSeason = parseSeason(userInput);
                    if (detectedSeason) {
                        setSeason(detectedSeason);
                        const newChat = startChat(mode, detectedSeason);
                        chatRef.current = newChat;
                        const stream = await newChat.sendMessageStream({ message: userInput });
                        await typeStream(stream);
                    } else {
                        const clarificationText =
                            mode === 'child'
                                ? '[ 🧇 ELEVEN ]\nI do not understand. Please tell me the number. 1? 2? 3? 4? 5? Or the play?'
                                : "[ 🧢 DUSTIN ]\nWoah, that's not a valid clearance level. Try a number like 1, 2, 3, 4, 5, or just say 'The First Shadow', over.";
                        setMessages((prev) => [...prev, { id: aiResponseId, sender: 'ai', text: '' }]);
                        await typeOutText(clarificationText, aiResponseId);
                    }
                } else if (chatRef.current) {
                    const stream = await chatRef.current.sendMessageStream({ message: userInput });
                    await typeStream(stream);
                }
            } catch (error) {
                console.error('Error during AI communication:', error);
                const errorText =
                    error instanceof MissingApiKeyError
                        ? '/// NO API KEY DETECTED ///\nOpen SETTINGS to add your Gemini API key.'
                        : '/// SIGNAL INTERRUPTED. PLEASE TRY AGAIN. ///';
                setMessages((prev) => [
                    ...prev,
                    { id: aiResponseId, sender: 'system', text: errorText },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [mode, startChat, handleReset, hasApiKey, pushApiKeyNotice],
    );

    const renderContent = () => {
        switch (appState) {
            case 'BOOTING':
                return <BootSequence onModeSelect={handleModeSelect} />;
            case 'CHATTING':
                return (
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                );
            default:
                return <BootSequence onModeSelect={handleModeSelect} />;
        }
    };

    return (
        <div className="crt-case text-xl sm:text-2xl md:text-3xl">
            <div className="crt-shell">
                {/* CRT effects layered above content, scoped to the screen */}
                <div className="scanlines-static" aria-hidden />
                <div className="scanline-roll" aria-hidden />

                <div className="crt-flicker h-full w-full flex flex-col">
                    {/* Top status strip — SETTINGS docked here */}
                    <header className="crt-status grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3 truncate">
                            <span className="rec-dot" aria-hidden />
                            <span className="truncate">
                                HEATHKIT&nbsp;H-89 · ZENITH&nbsp;Z-89 · HDOS&nbsp;2.0 · 9600&nbsp;BAUD · ONLINE
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="hidden sm:inline opacity-70">
                                KEY: {hasApiKey ? 'OK' : 'MISSING'}
                            </span>
                            <button
                                onClick={() => setSettingsOpen(true)}
                                className="border border-current px-2 py-0.5 hover:bg-[rgba(51,255,102,0.15)] transition-colors"
                                aria-label="Open settings"
                            >
                                [ ⚙ SETTINGS{hasApiKey ? '' : ' · KEY NEEDED'} ]
                            </button>
                        </div>
                    </header>

                    <main className="crt-content mx-auto w-full max-w-5xl flex-1 flex flex-col">
                        {renderContent()}
                    </main>

                    <footer className="crt-footer">
                        <p>
                            This is an unofficial, fan-made application and is not affiliated with,
                            endorsed by, or connected to Netflix, Inc. or the Stranger Things
                            production team. All Stranger Things characters, logos, and related
                            marks are the property of their respective owners. This project is
                            provided for educational and non-commercial purposes only.
                        </p>
                    </footer>
                </div>
            </div>

            {/* Heathkit brand badge on bezel */}
            <div className="crt-badge" aria-hidden>
                <span className="crt-badge-power" />
                <span className="crt-badge-brand">Heathkit</span>
                <span className="crt-badge-model">H-89</span>
            </div>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}

