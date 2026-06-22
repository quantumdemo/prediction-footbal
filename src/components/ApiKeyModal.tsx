'use client';

import { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: (key: string) => void;
  hasEnvKey: boolean;
}

export default function ApiKeyModal({ onKeySubmit, hasEnvKey }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hasEnvKey) {
      setIsOpen(false);
      onKeySubmit('ENV_KEY'); // Signal that we have a key
      return;
    }

    const savedKey = localStorage.getItem('rapidapi_key');
    if (!savedKey) {
      setIsOpen(true);
    } else {
      onKeySubmit(savedKey);
    }
  }, [hasEnvKey, onKeySubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      localStorage.setItem('rapidapi_key', key.trim());
      onKeySubmit(key.trim());
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card-bg border border-border-custom rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Welcome to PredictIQ</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          To provide real-time football data, this app requires an API key from SofaScore.
        </p>

        <ol className="text-sm text-gray-300 space-y-3 mb-8 list-decimal ml-4">
          <li>Sign up at <a href="https://rapidapi.com/apidojo/api/sofascore" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">RapidAPI</a></li>
          <li>Click the <strong>"Subscribe to Test"</strong> button and select the <strong>Free</strong> tier (500 requests/day).</li>
          <li>Go to the <strong>"Endpoints"</strong> tab.</li>
          <li>In the "Header Parameters" section on the right, copy the value of <strong>"X-RapidAPI-Key"</strong>.</li>
          <li>Paste it below to start predicting.</li>
        </ol>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              SofaScore API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your key here..."
              className="w-full bg-background border border-border-custom rounded-lg px-4 py-3 text-white focus:border-accent transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-background font-bold py-3 rounded-lg hover:bg-white transition-colors"
          >
            Save & Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
