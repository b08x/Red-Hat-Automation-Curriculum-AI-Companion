import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGenerativeAi } from '@google-ai/react';
import { GenerativeChat, Messages, ChatInput, Message, type Chat as GenerativeChatType } from '@google-ai/generative-chat';
import { LiveServerMessage, Blob, StartChatParams } from '@google/genai';
import type { ChatMessage } from '../types';
import type { Curriculum } from '../data/curriculumData';
import { geminiService } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { BrainIcon, SearchIcon, MicIcon, ChatIcon, CloseIcon, LoadingSpinner, StopIcon, CodeIcon, BugIcon } from './icons/Icons';

// Fix for SpeechRecognition type not found.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ChatWidgetProps {
  curriculum: Curriculum[];
}

type ChatMode = 'chat' | 'thinking' | 'grounded' | 'live' | 'code' | 'debug';

const UserMessage = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-end">
        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-rh-accent text-white">
            {children}
        </div>
    </div>
);

const ModelMessage = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-start">
        <div className="prose prose-invert max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-rh-light-gray text-rh-text prose-pre:bg-rh-dark-gray">
            {children}
        </div>
    </div>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ curriculum }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [chatInput, setChatInput] = useState('');
  
  // State for live tutor
  const [isLive, setIsLive] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const liveSession = useRef<any>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const nextStartTime = useRef(0);
  const audioSources = useRef(new Set<AudioBufferSourceNode>());
  const liveTranscription = useRef<{input: string, output: string}>({input: '', output: ''});

  // State for speech recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const { startChat } = useGenerativeAi();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);
  
  const chat = useMemo(() => {
    if (!isOpen || mode === 'live') {
      return null;
    }

    let params: StartChatParams = { model: 'gemini-2.5-flash' };
    switch (mode) {
      case 'chat':
        const curriculumContext = curriculum.map(p => `Part: ${p.title}. ${p.description}`).join('\n');
        params.config = { systemInstruction: `You are an expert AI tutor specializing in the Red Hat Enterprise Linux Automation Mastery curriculum. Your goal is to help users understand the concepts. Be helpful, encouraging, and provide clear explanations. The curriculum context is: ${curriculumContext}` };
        break;
      case 'thinking':
        params.model = 'gemini-2.5-pro';
        params.config = { systemInstruction: `You are a powerful AI assistant designed for complex problem-solving. Think step-by-step to provide a detailed, accurate response.`, thinkingConfig: { thinkingBudget: 32768 } };
        break;
      case 'grounded':
        params.config = { tools: [{ googleSearch: {} }] };
        break;
      case 'code':
        params.model = 'gemini-2.5-pro';
        params.config = { systemInstruction: `You are an expert code generation assistant. Your primary goal is to provide clean, efficient, and well-commented code based on the user's request. Always wrap code in appropriate Markdown code blocks with the language specified (e.g., \`\`\`python). Provide a brief explanation of how the code works.` };
        break;
      case 'debug':
        params.model = 'gemini-2.5-pro';
        params.config = { systemInstruction: `You are an expert debugging assistant. A user will provide you with a code snippet and a description of a problem. Your task is to identify the bug or error, explain the root cause, provide a corrected version of the code, and suggest best practices.` };
        break;
    }
    return startChat(params);
  }, [isOpen, mode, startChat, curriculum]);
  
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => (prev ? prev + ' ' : '') + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const startLiveTutor = useCallback(async () => {
    if (isLive) return;
    setIsLive(true);
    setLiveMessages([{sender: 'bot', text: 'Live Tutor activated. I am listening...'}]);

    inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = geminiService.connectLive({
        onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContext.current) {
                nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext.current, 24000, 1);
                const source = outputAudioContext.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.current.destination);
                source.addEventListener('ended', () => audioSources.current.delete(source));
                source.start(nextStartTime.current);
                nextStartTime.current += audioBuffer.duration;
                audioSources.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                for (const source of audioSources.current.values()) { source.stop(); audioSources.current.delete(source); }
                nextStartTime.current = 0;
            }

            if (message.serverContent?.inputTranscription) liveTranscription.current.input += message.serverContent.inputTranscription.text;
            if (message.serverContent?.outputTranscription) liveTranscription.current.output += message.serverContent.outputTranscription.text;
            
            if(message.serverContent?.turnComplete) {
              const fullInput = liveTranscription.current.input;
              const fullOutput = liveTranscription.current.output;
              setLiveMessages(prev => {
                const newMessages: ChatMessage[] = [...prev];
                if (fullInput.trim()) newMessages.push({ sender: 'user', text: `(Audio) ${fullInput}` });
                if (fullOutput.trim()) newMessages.push({ sender: 'bot', text: `(Audio) ${fullOutput}` });
                return newMessages;
              });
              liveTranscription.current = {input: '', output: ''};
            }
        },
        onerror: (e: ErrorEvent) => {
            console.error("Live session error:", e);
            setLiveMessages(prev => [...prev, { sender: 'bot', text: "Live session error. Please try again." }]);
            stopLiveTutor();
        },
        onclose: () => console.log("Live session closed."),
    });

    liveSession.current = await sessionPromise;

    const source = inputAudioContext.current.createMediaStreamSource(mediaStream.current);
    scriptProcessor.current = inputAudioContext.current.createScriptProcessor(4096, 1, 1);
    scriptProcessor.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const pcmBlob: Blob = { data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
    };
    source.connect(scriptProcessor.current);
    scriptProcessor.current.connect(inputAudioContext.current.destination);
  }, [isLive]);
  
  const stopLiveTutor = useCallback(() => {
    if (!isLive) return;
    setIsLive(false);
    liveSession.current?.close();
    liveSession.current = null;
    scriptProcessor.current?.disconnect();
    scriptProcessor.current = null;
    mediaStream.current?.getTracks().forEach(track => track.stop());
    mediaStream.current = null;
    inputAudioContext.current?.close();
    outputAudioContext.current?.close();
    setLiveMessages(prev => [...prev, {sender: 'bot', text: 'Live Tutor deactivated.'}]);
  }, [isLive]);
  
  const handleModeChange = (newMode: ChatMode) => {
    if (newMode === 'live') {
      if (isLive) stopLiveTutor(); else startLiveTutor();
    } else {
      if (isLive) stopLiveTutor();
    }
    setMode(newMode);
  }

  const handleSubmit = (value: string) => {
    if (chat) {
      chat.sendMessage(value);
      setChatInput('');
    }
  };

  const modeInfo = {
    chat: { text: "Standard chat with curriculum context.", icon: <ChatIcon />},
    thinking: { text: "Complex problem solving with Gemini 2.5 Pro.", icon: <BrainIcon />},
    grounded: { text: "Answers grounded in Google Search for current events.", icon: <SearchIcon />},
    live: { text: "Live voice conversation with an AI tutor.", icon: <MicIcon /> },
    code: { text: "Generate code snippets based on your requirements.", icon: <CodeIcon /> },
    debug: { text: "Get help debugging your code.", icon: <BugIcon /> },
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-rh-red p-4 rounded-full shadow-lg hover:bg-rh-red/80 transition-transform hover:scale-110">
        <ChatIcon />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-[440px] h-[600px] bg-rh-medium-gray rounded-lg shadow-2xl flex flex-col z-50">
      <header className="bg-rh-light-gray p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="text-lg font-bold text-white">AI Companion</h3>
        <button onClick={() => { setIsOpen(false); if(isLive) stopLiveTutor(); }} className="p-1 rounded-full hover:bg-rh-dark-gray/50">
          <CloseIcon />
        </button>
      </header>
      
      <div className="p-2 border-b border-rh-light-gray text-center bg-rh-medium-gray">
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {(['chat', 'thinking', 'grounded', 'live', 'code', 'debug'] as ChatMode[]).map(m => (
                <button key={m} onClick={() => handleModeChange(m)} className={`p-2 rounded-full transition-colors ${ (mode === m && m !== 'live') || (m === 'live' && isLive) ? 'bg-rh-red' : 'bg-rh-light-gray hover:bg-rh-red/70'}`} title={modeInfo[m].text}>
                    { (m === 'live' && isLive) ? <StopIcon /> : modeInfo[m].icon }
                </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{modeInfo[mode].text}</p>
      </div>

      {mode === 'live' ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {liveMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-rh-accent text-white' : 'bg-rh-light-gray text-rh-text'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
      ) : chat ? (
        <GenerativeChat chat={chat} className="flex-1 flex flex-col" onSubmit={handleSubmit}>
            <Messages className="flex-1 p-4 overflow-y-auto space-y-4">
                <Message sender="user" as={UserMessage} />
                <Message sender="model" as={ModelMessage} />
            </Messages>
            <div className="p-4 border-t border-rh-light-gray">
                <div className="flex items-center bg-rh-light-gray rounded-lg">
                    <ChatInput 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        placeholder={isRecording ? "Listening..." : "Ask a question..."}
                        className="flex-1 bg-transparent p-3 text-rh-text focus:outline-none"
                    />
                    <button 
                        onClick={handleToggleVoiceInput} 
                        disabled={isLive || !recognitionRef.current}
                        className="p-3 text-white disabled:text-gray-500 hover:text-rh-accent transition-colors"
                        title={isRecording ? "Stop recording" : "Record voice message"}
                    >
                        {isRecording ? <StopIcon className="text-rh-red" /> : <MicIcon />}
                    </button>
                </div>
            </div>
        </GenerativeChat>
      ) : (
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      )}
    </div>
  );
};