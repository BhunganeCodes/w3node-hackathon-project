import React, { useState } from 'react';
// import { uploadToIPFS } from '../services/ipfs';
import { scoreTender } from '../services/aiBackend';
import { createTenderWithScore } from '../services/blockchain';

const TenderForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScore(null);

    try {
      // Step 1: Upload document to IPFS (if exists)
      let documentHash = '';
      if (document) {
        documentHash = await uploadToIPFS(document);
      }

      // Step 2: Send to AI backend for scoring
      const aiResponse = await scoreTender({ title, description, documentHash });
      const { score } = aiResponse;

      // Step 3: Call smart contract with the score
      await createTenderWithScore(title, description, documentHash, score);

      // Reset form
      setTitle('');
      setDescription('');
      setDocument(null);
      setScore(score);

      alert('Tender submitted successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to submit tender. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Submit a Tender
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tender Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Tender Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                Tender Document (optional)
              </label>
              <input
                type="file"
                id="document"
                onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Tender'}
              </button>
            </div>
          </form>

          {/* Success / Score Display */}
          {score !== null && (
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <p className="text-green-800">
                Tender scored successfully! AI Score: <span className="font-bold">{score}</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TenderForm;
