'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, FileJson } from 'lucide-react';

export default function NewWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const [method, setMethod] = useState<'upload' | 'create'>('upload');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tags: '',
  });
  const [jsonContent, setJsonContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonContent(content);
        
        // Try to extract name from JSON
        try {
          const json = JSON.parse(content);
          if (json.name && !formData.name) {
            setFormData({ ...formData, name: json.name });
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate JSON
      let workflowJson;
      try {
        workflowJson = JSON.parse(jsonContent);
      } catch (err) {
        throw new Error('Invalid JSON format. Please check your workflow file.');
      }

      // Import workflow
      const response = await apiClient.post('/api/workflows/import', {
        workspaceId,
        name: formData.name || workflowJson.name || 'Untitled Workflow',
        json: workflowJson,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      });

      // Redirect to workflow detail page
      const workflowId = response.data?.id;
      if (workflowId) {
        router.push(`/w/${workspaceId}/workflows/${workflowId}`);
      } else {
        router.push(`/w/${workspaceId}/workflows`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/w/${workspaceId}/workflows`}
          className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Create Workflow</h1>
        <p className="text-white/70">
          Upload an N8N workflow or create one from scratch
        </p>
      </div>

      {/* Method Selection */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setMethod('upload')}
          className={`flex-1 p-6 rounded-xl border-2 transition ${
            method === 'upload'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${
            method === 'upload' ? 'text-purple-400' : 'text-white/50'
          }`} />
          <div className={`font-semibold ${
            method === 'upload' ? 'text-white' : 'text-white/70'
          }`}>
            Upload JSON
          </div>
          <div className="text-white/50 text-sm mt-1">
            Import from N8N export
          </div>
        </button>

        <button
          onClick={() => setMethod('create')}
          className={`flex-1 p-6 rounded-xl border-2 transition ${
            method === 'create'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
          disabled
        >
          <Plus className={`w-8 h-8 mx-auto mb-2 ${
            method === 'create' ? 'text-purple-400' : 'text-white/50'
          }`} />
          <div className={`font-semibold ${
            method === 'create' ? 'text-white' : 'text-white/70'
          }`}>
            Create New
          </div>
          <div className="text-white/50 text-sm mt-1">
            Coming soon
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Upload Form */}
      {method === 'upload' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <label className="block text-white font-semibold mb-4">
              Upload Workflow JSON
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition">
              <FileJson className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition"
              >
                Choose File
              </label>
              {file && (
                <p className="text-white mt-4">
                  Selected: <span className="text-purple-400">{file.name}</span>
                </p>
              )}
              <p className="text-white/50 text-sm mt-2">
                Supports N8N workflow JSON files
              </p>
            </div>
          </div>

          {/* Workflow Details */}
          {jsonContent && (
            <>
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                <label className="block text-white font-semibold mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="My Automation Workflow"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                  <label className="block text-white font-semibold mb-2">
                    Category
                    <span className="text-white/50 ml-2 font-normal text-sm">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Communication, Data, Marketing"
                  />
                </div>

                <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                  <label className="block text-white font-semibold mb-2">
                    Tags
                    <span className="text-white/50 ml-2 font-normal text-sm">(optional, comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="automation, slack, notification"
                  />
                </div>
              </div>

              {/* JSON Preview */}
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-4">JSON Preview</h3>
                <div className="bg-black/50 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    {jsonContent}
                  </pre>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/50"
                >
                  {loading ? 'Importing...' : 'Import Workflow'}
                </button>
                <Link
                  href={`/w/${workspaceId}/workflows`}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

