
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Fix: Import Curriculum from '../data/curriculumData' instead of '../types'
import type { ChatMessage } from '../types';
import type { Curriculum } from '../data/curriculumData';
import { geminiService } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { BrainIcon, SearchIcon, MicIcon, SendIcon, ChatIcon, CloseIcon, LoadingSpinner, StopIcon, CodeIcon, BugIcon } from './icons/Icons';

interface ChatWidgetProps {
  curriculum: Curriculum[];
}

type ChatMode = 'chat' | 'thinking' | 'grounded' | 'live' | 'code' | 'debug';

export const ChatWidget: React.FC<ChatWidgetProps> = ({ curriculum }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  
  const [isLive, setIsLive] = useState(false);
  const liveSession = useRef<any>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const nextStartTime = useRef(0);
  const audioSources = useRef(new Set<AudioBufferSourceNode>());
  const liveTranscription = useRef<{input: string, output: string}>({input: '', output: ''});

  const chat = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chat.current) {
      const curriculumContext = curriculum.map(p => `Part: ${p.title}. ${p.description}`).join('\n');
      const systemInstruction = `You are an expert AI tutor specializing in the Red Hat Enterprise Linux Automation Mastery curriculum. Your goal is to help users understand the concepts. Be helpful, encouraging, and provide clear explanations. The curriculum context is: ${curriculumContext}`;
      chat.current = geminiService.startChat(systemInstruction);
      setMessages([{ sender: 'bot', text: 'Hello! How can I help you with the Red Hat curriculum today?' }]);
    }
  }, [isOpen, curriculum]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if ((window as any).hljs && chatContainerRef.current) {
        chatContainerRef.current.querySelectorAll('pre code').forEach((block) => {
            (window as any).hljs.highlightElement(block);
        });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      let sources: any[] = [];
      if (mode === 'thinking') {
        responseText = await geminiService.askWithThinking(input);
      } else if (mode === 'grounded') {
        const result = await geminiService.askWithGrounding(input);
        responseText = result.text;
        sources = result.sources;
      } else if (mode === 'code') {
        responseText = await geminiService.generateCode(input);
      } else if (mode === 'debug') {
        responseText = await geminiService.debugCode(input);
      } else {
        if (!chat.current) throw new Error("Chat not initialized");
        responseText = await geminiService.getChatResponse(chat.current, input);
      }
      setMessages(prev => [...prev, { sender: 'bot', text: responseText, sources: sources }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveTutor = useCallback(async () => {
    if (isLive) return;
    setIsLive(true);
    setMessages(prev => [...prev, {sender: 'bot', text: 'Live Tutor activated. I am listening...'}]);

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
                for (const source of audioSources.current.values()) {
                    source.stop();
                    audioSources.current.delete(source);
                }
                nextStartTime.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              liveTranscription.current.input += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              liveTranscription.current.output += message.serverContent.outputTranscription.text;
            }
            if(message.serverContent?.turnComplete) {
              const fullInput = liveTranscription.current.input;
              const fullOutput = liveTranscription.current.output;
              if (fullInput.trim()) setMessages(prev => [...prev, { sender: 'user', text: `(Audio) ${fullInput}` }]);
              if (fullOutput.trim()) setMessages(prev => [...prev, { sender: 'bot', text: `(Audio) ${fullOutput}` }]);
              liveTranscription.current = {input: '', output: ''};
            }
        },
        onerror: (e: ErrorEvent) => {
            console.error("Live session error:", e);
            setMessages(prev => [...prev, { sender: 'bot', text: "Live session error. Please try again." }]);
            stopLiveTutor();
        },
        onclose: () => {
            console.log("Live session closed.");
        },
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
    inputAudioContext.current = null;
    outputAudioContext.current = null;
    setMessages(prev => [...prev, {sender: 'bot', text: 'Live Tutor deactivated.'}]);
  }, [isLive]);
  
  const toggleLiveTutor = () => {
    if(isLive) stopLiveTutor(); else startLiveTutor();
  }

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    if(newMode === 'live') {
      toggleLiveTutor();
    } else if (isLive) {
      stopLiveTutor();
    }
  }

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

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-rh-accent text-white' : 'bg-rh-light-gray text-rh-text'}`}>
              {msg.sender === 'bot' ? (
                 <ReactMarkdown
                    children={msg.text}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-rh-dark-gray p-2 rounded my-2 overflow-x-auto text-sm" {...props} />,
                        code: ({node, inline, className, children, ...props}) => {
                            return <code className={`${className} rounded`} {...props}>{children}</code>
                        },
                        a: ({node, ...props}) => <a className="text-rh-accent hover:underline" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                    }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 border-t border-rh-medium-gray pt-2">
                  <h4 className="text-xs font-bold mb-1">Sources:</h4>
                  <ul className="text-xs space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{source.web.title}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><LoadingSpinner /></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-rh-light-gray">
        <div className="flex items-center bg-rh-light-gray rounded-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isLive ? "Live tutor is active..." : "Ask a question..."}
            className="flex-1 bg-transparent p-3 text-rh-text focus:outline-none"
            disabled={isLoading || isLive}
          />
          <button onClick={sendMessage} disabled={isLoading || isLive} className="p-3 text-white disabled:text-gray-500">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
