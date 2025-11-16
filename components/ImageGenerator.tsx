import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKeyUsed, setLastKeyUsed] = useState<string | null>(null);
  const [curlCommand, setCurlCommand] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [curlCopied, setCurlCopied] = useState<boolean>(false);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setImageUrl(null);
    setError(null);
    setLastKeyUsed(null);
    setCurlCommand(null);

    try {
      const { imageUrl, apiKeyUsed, curlCommand } = await generateImage(prompt, apiKey);
      setImageUrl(imageUrl);
      setLastKeyUsed(apiKeyUsed);
      setCurlCommand(curlCommand);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [prompt, apiKey]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateImage();
    }
  };

  const handleKeyCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
    });
  };

  const handleCurlCopy = () => {
    if (!curlCommand) return;
    navigator.clipboard.writeText(curlCommand).then(() => {
        setCurlCopied(true);
        setTimeout(() => setCurlCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-3xl bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl shadow-indigo-500/10">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="api-key" className="text-lg font-semibold text-gray-300">
              API Key <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              disabled={loading}
              aria-describedby="api-key-description"
            />
            <p id="api-key-description" className="text-xs text-gray-400">
              Leave blank to use the default key provided by the application.
            </p>
          </div>
          
          <div className="border-t border-gray-700 !my-5"></div>

          <label htmlFor="prompt" className="text-lg font-semibold text-gray-300">
            Describe the image you want to create
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., A majestic lion wearing a crown, cinematic lighting, hyperrealistic"
            className="w-full h-28 p-4 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
            disabled={loading}
          />
          <button
            onClick={handleGenerateImage}
            disabled={loading || !prompt}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
                <>
                    <Spinner />
                    Generating...
                </>
            ) : 'Generate Image'}
          </button>
        </div>
      </div>

      <div className="mt-10 w-full max-w-3xl">
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        <div className="mt-6 aspect-square w-full bg-gray-800/50 rounded-2xl border border-gray-700 flex items-center justify-center overflow-hidden">
            {loading ? (
                <div className="flex flex-col items-center text-gray-400">
                    <Spinner />
                    <p className="mt-2 text-lg">Conjuring your vision...</p>
                </div>
            ) : imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={prompt} 
                    className="w-full h-full object-contain transition-opacity duration-500 opacity-0 animate-fade-in"
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                />
            ) : (
                <div className="text-center text-gray-500 p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold">Your generated image will appear here</h3>
                    <p className="mt-1 text-sm">Let your creativity flow! Describe anything you can imagine.</p>
                </div>
            )}
        </div>
        {imageUrl && (
          <div className="mt-4 w-full flex flex-col space-y-4">
            <div className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-left">
                {lastKeyUsed ? (
                    <div className="flex items-center justify-between">
                        <div className="overflow-hidden">
                            <p className="text-sm text-gray-400 mb-1">API Key used for generation:</p>
                            <code className="text-gray-300 text-xs break-all">{lastKeyUsed}</code>
                        </div>
                        <button
                            onClick={() => handleKeyCopy(lastKeyUsed)}
                            className="p-2 ml-4 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
                            aria-label="Copy API Key"
                            title="Copy API Key"
                        >
                            {keyCopied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-400 mb-1">API Key used for generation:</p>
                        <p className="text-gray-300 text-sm font-medium">Default Application Key</p>
                    </div>
                )}
            </div>

            {curlCommand && (
                <div className="w-full bg-gray-900/70 rounded-lg border border-gray-700 text-left relative">
                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
                        <p className="text-sm font-semibold text-gray-300">cURL Command</p>
                        <button
                            onClick={handleCurlCopy}
                            className="p-2 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
                            aria-label="Copy cURL Command"
                            title="Copy cURL Command"
                        >
                            {curlCopied ? (
                                <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-xs text-green-400">Copied!</span>
                                </div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <pre className="p-4 text-xs text-gray-300 overflow-x-auto">
                        <code className="whitespace-pre-wrap break-all">{curlCommand}</code>
                    </pre>
                </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;