import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { fileToText } from '../utils/fileUtils';
import { LoadingSpinner, UploadIcon, TrashIcon, BrainIcon } from './icons/Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface KnowledgeFile {
  file: File;
  content: string;
}

const ALLOWED_FILE_TYPES = ['text/plain', 'text/markdown', 'application/x-makeself', 'application/x-sh', 'text/javascript', 'application/javascript', 'text/typescript', 'application/typescript', 'text/x-python-script'];

export const KnowledgeStore: React.FC = () => {
    const [files, setFiles] = useState<KnowledgeFile[]>([]);
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (generatedContent) {
            // Re-run highlight.js after content is generated
            if ((window as any).hljs) {
                document.querySelectorAll('pre code').forEach((block) => {
                    (window as any).hljs.highlightElement(block);
                });
            }
        }
    }, [generatedContent]);

    const handleFileChange = async (uploadedFiles: FileList | null) => {
        if (!uploadedFiles) return;
        setError('');
        const newFiles: KnowledgeFile[] = [];
        const errors = [];

        for (const file of Array.from(uploadedFiles)) {
             if (!ALLOWED_FILE_TYPES.some(type => file.type.startsWith(type)) && !file.name.endsWith('.md') && !file.name.endsWith('.sh') && !file.name.endsWith('.py')) {
                errors.push(`File type for '${file.name}' is not supported. Please upload text-based files.`);
                continue;
            }
            try {
                const content = await fileToText(file);
                newFiles.push({ file, content });
            } catch (err) {
                errors.push(`Could not read file '${file.name}'.`);
            }
        }

        setFiles(prev => [...prev, ...newFiles]);
        if (errors.length > 0) {
            setError(errors.join('\n'));
        }
    };
    
    const handleRemoveFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.file.name !== fileName));
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        if (files.length === 0) {
            setError('Please upload at least one file to the knowledge store.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            const context = files.map(f => `--- Document: ${f.file.name} ---\n\n${f.content}`).join('\n\n');
            const result = await geminiService.generateModuleFromContext(prompt, context);
            setGeneratedContent(result);
        } catch (err) {
            console.error('Content generation error:', err);
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-rh-medium-gray p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-rh-accent mb-4">Knowledge Store & Content Generator</h2>
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Side: File Management */}
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1. Upload Documents</h3>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-rh-light-gray border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadIcon />
                            <div className="flex text-sm text-gray-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-rh-dark-gray rounded-md font-medium text-rh-accent hover:text-rh-red focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-rh-medium-gray focus-within:ring-rh-accent p-1">
                                    <span>Upload files</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => handleFileChange(e.target.files)} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">MD, TXT, JS, TS, PY, SH files</p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Uploaded Files:</h4>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {files.map((f, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-rh-dark-gray rounded-md">
                                        <span className="text-sm text-rh-text truncate pr-2">{f.file.name}</span>
                                        <button onClick={() => handleRemoveFile(f.file.name)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                                            <TrashIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Side: AI Interaction */}
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">2. Generate Curriculum Module</h3>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                    <textarea
                        id="prompt"
                        rows={4}
                        className="w-full p-2 bg-rh-dark-gray border border-rh-light-gray rounded-md focus:ring-rh-accent focus:border-rh-accent"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Based on the uploaded files, create a lab exercise for setting up a basic Node.js server.'"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rh-accent hover:bg-rh-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rh-accent disabled:bg-rh-light-gray"
                    >
                        {isLoading ? <LoadingSpinner /> : <><BrainIcon /> <span className="ml-2">Generate</span></>}
                    </button>
                </div>
            </div>

            {error && <p className="mt-6 text-red-400 whitespace-pre-wrap">{error}</p>}
            
            {(isLoading || generatedContent) && (
                 <div className="mt-8 pt-6 border-t border-rh-light-gray">
                    <h3 className="text-xl font-bold text-gray-200 mb-4">Generated Content</h3>
                    {isLoading && !generatedContent && <div className="flex justify-center"><LoadingSpinner/></div>}
                    {generatedContent && (
                        <div className="p-4 bg-rh-dark-gray rounded-md">
                           <MarkdownRenderer content={generatedContent} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};