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
            { title: 'Hawkins Frequency — Stranger Things Lore Companion' },
            {
                name: 'description',
                content:
                    'A fan-made retro terminal that chats Stranger Things lore. Bring your own Google Gemini API key — stored only in your browser.',
            },
            { property: 'og:title', content: 'Hawkins Frequency' },
            {
                property: 'og:description',
                content: 'Fan-made Stranger Things lore companion. BYOK Gemini.',
            },
        ],
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
        <div className="relative w-full h-screen bg-black text-2xl md:text-3xl p-4 overflow-hidden crt-glow">
            <div className="scanline" />
            <button
                onClick={() => setSettingsOpen(true)}
                className="absolute top-3 right-3 z-[150] border-2 border-current px-3 py-1 text-base md:text-lg hover:bg-green-900/50"
                aria-label="Open settings"
            >
                [ ⚙ SETTINGS{hasApiKey ? '' : ' • KEY NEEDED'} ]
            </button>
            <main className="w-full h-full max-w-4xl mx-auto flex flex-col">{renderContent()}</main>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
