import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lead, CreateLeadRequest } from '../types/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLeadName, setNewLeadName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScoringAll, setIsScoringAll] = useState(false);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/leads`);
      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // Create new lead
  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    try {
      setIsAdding(true);
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: newLeadName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lead');
      }

      const newLead = await response.json();
      setLeads([newLead, ...leads]);
      setNewLeadName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setIsAdding(false);
    }
  };

  // Score single lead
  const scoreLead = async (leadId: string) => {
    try {
      setScoringLeadId(leadId);
      const response = await fetch(`${API_URL}/api/leads/${leadId}/score`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to score lead');
      }

      const updatedLead = await response.json();
      setLeads(leads.map(lead => 
        lead.id === leadId ? updatedLead : lead
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score lead');
    } finally {
      setScoringLeadId(null);
    }
  };

  // Score all leads
  const scoreAllLeads = async () => {
    try {
      setIsScoringAll(true);
      const response = await fetch(`${API_URL}/api/leads/score/batch`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to score all leads');
      }

      const result = await response.json();
      setLeads(result.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score all leads');
    } finally {
      setIsScoringAll(false);
    }
  };

  // Get truncated reasons
  const getTruncatedReasons = (reasonsStr?: string) => {
    if (!reasonsStr) return [];
    try {
      const reasons = JSON.parse(reasonsStr);
      return reasons.slice(0, 2).map((reason: string) => {
        return reason.length > 50 ? reason.substring(0, 47) + '...' : reason;
      });
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lumber SDR CRM</h1>
              <p className="text-gray-600 mt-1">Manage your construction leads</p>
            </div>
            <button
              onClick={scoreAllLeads}
              disabled={isScoringAll}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isScoringAll ? 'Scoring...' : 'Score All'}
            </button>
          </div>
        </div>

        {/* Add Lead Form */}
        <div className="px-6 py-4 border-b border-gray-200">
          <form onSubmit={createLead} className="flex gap-3">
            <input
              type="text"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
              placeholder="Enter company name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newLeadName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add Lead'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 bg-red-50">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommendations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Action/Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">No leads found</p>
                      <p className="text-sm">Add your first construction lead to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/leads/${lead.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {lead.companyName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          lead.score >= 70 ? 'text-green-600' : 
                          lead.score >= 40 ? 'text-yellow-600' : 
                          'text-gray-600'
                        }`}>
                          {lead.score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {lead.recommendedAngle && (
                        <div className="text-sm text-gray-900 mb-1">
                          <strong className="font-medium">{lead.recommendedAngle}</strong>
                        </div>
                      )}
                      {getTruncatedReasons(lead.scoreReasons).length > 0 && (
                        <div className="text-xs text-gray-500">
                          {getTruncatedReasons(lead.scoreReasons).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{lead.nextAction || '-'}</div>
                      <div className="text-xs text-gray-500">{formatDate(lead.nextActionDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => scoreLead(lead.id)}
                        disabled={scoringLeadId === lead.id}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed text-xs font-medium"
                      >
                        {scoringLeadId === lead.id ? 'Scoring...' : 'Score'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}