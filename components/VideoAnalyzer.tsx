
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { LoadingSpinner } from './icons/Icons';

export const VideoAnalyzer: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            setError('');
            setAnalysis('');
        }
    };

    const handleAnalyze = async () => {
        if (!videoFile || !prompt.trim()) {
            setError('Please upload a video and enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysis('');

        try {
            const base64Data = await fileToBase64(videoFile);
            const result = await geminiService.analyzeVideo(base64Data, videoFile.type, prompt);
            setAnalysis(result);
        } catch (err) {
            console.error('Video analysis error:', err);
            setError('Failed to analyze video. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-rh-medium-gray p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-rh-accent mb-4">Gemini Video Lab</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Video</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-rh-light-gray border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-400">
                                <label htmlFor="video-upload" className="relative cursor-pointer bg-rh-dark-gray rounded-md font-medium text-rh-accent hover:text-rh-red focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-rh-medium-gray focus-within:ring-rh-accent p-1">
                                    <span>Upload a file</span>
                                    <input id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">Video files up to 10MB</p>
                        </div>
                    </div>

                    {videoPreview && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Video Preview</h3>
                        <video controls src={videoPreview} className="w-full rounded-lg" />
                        <p className="text-sm text-gray-400 mt-1">{videoFile?.name}</p>
                      </div>
                    )}
                </div>

                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Question</label>
                    <textarea
                        id="prompt"
                        rows={4}
                        className="w-full p-2 bg-rh-dark-gray border border-rh-light-gray rounded-md focus:ring-rh-accent focus:border-rh-accent"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Summarize what happens in this terminal session.' or 'What is the key command being used?'"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rh-red hover:bg-rh-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rh-red disabled:bg-rh-light-gray"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Analyze Video'}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}

            {analysis && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">Analysis Result</h3>
                    <div className="p-4 bg-rh-dark-gray rounded-md prose prose-invert max-w-none">
                        <p>{analysis}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
