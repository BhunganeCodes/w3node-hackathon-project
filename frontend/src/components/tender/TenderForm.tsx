import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Upload, FileText, Shield, Bot, ExternalLink } from 'lucide-react';
import { apiService } from '../../services/api';
import { blockchainService } from '../../services/blockchain';
import { toast } from 'sonner';

interface TenderFormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  document?: File;
}

export const TenderForm: React.FC = () => {
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'construction',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [scoringExplanation, setScoringExplanation] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
      
      // Preview PDF or image
      if (file.type === 'application/pdf') {
        setDocumentPreview('PDF Document');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. First, get AI scoring
      toast.info('Sending to AI for evaluation...');
      
      const scoringResponse = await apiService.scoreTender({
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        category: formData.category,
        // In production, you'd upload the document to IPFS first
        documentHash: 'pending', // Replace with actual IPFS hash
      });

      setAiScore(scoringResponse.score);
      setScoringExplanation(scoringResponse.explanation);
      
      toast.success(`AI Score: ${scoringResponse.score}/100`);
      
      // 2. Get detailed explanation
      const explanation = await apiService.getScoringExplanation(scoringResponse.bidId);
      setScoringExplanation(explanation.explanation);

      // 3. Submit to blockchain with AI score
      toast.info('Submitting to blockchain...');
      
      const tx = await blockchainService.submitTender({
        ...formData,
        aiScore: scoringResponse.score,
        riskFlags: scoringResponse.riskFlags,
      });

      toast.success('Tender submitted successfully!', {
        action: {
          label: 'View Transaction',
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank'),
        },
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: 'construction',
      });
      setDocumentPreview('');

    } catch (error) {
      toast.error('Submission failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit Tender Proposal
          </h1>
          <p className="text-gray-600">
            Our AI will evaluate your submission, then it will be securely recorded on the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Tender Details
                </CardTitle>
                <CardDescription>
                  Fill in all required information about your tender proposal
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tender Title *
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Road Construction Project"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="construction">Construction</option>
                        <option value="it">IT Services</option>
                        <option value="consulting">Consulting</option>
                        <option value="supplies">Supplies</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your proposal in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (USD) *
                      </label>
                      <Input
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="50000"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline *
                      </label>
                      <Input
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag & drop or click to upload
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" type="button">
                          Choose File
                        </Button>
                      </label>
                      {formData.document && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ {formData.document.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline" type="button">
                    Save Draft
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    Submit for AI Evaluation
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: AI Scoring & Preview */}
          <div className="space-y-6">
            {/* AI Scoring Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Evaluation
                </CardTitle>
                <CardDescription>
                  Real-time scoring and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiScore ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                        <span className="text-3xl font-bold text-white">{aiScore}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">AI Score /100</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Analysis:</h4>
                      <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                        {scoringExplanation || 'No analysis available yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Submit your tender to get an AI-powered evaluation score
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Process Steps Card */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Submission Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Evaluation</h4>
                    <p className="text-sm text-gray-600">
                      Our AI analyzes your submission objectively
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Blockchain Recording</h4>
                    <p className="text-sm text-gray-600">
                      Securely stored on the blockchain
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Transparent Results</h4>
                    <p className="text-sm text-gray-600">
                      View audit trail and scoring details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};