import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export interface QueueLead {
  lead_id: string;
  company_name: string;
  website?: string;
  score: number;
  recommended_angle?: string;
  next_action?: string;
  next_action_date?: string;
  stage: string;
  status?: string;
  top_reasons: string[];
  primary_contact?: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
  } | null;
  last_activity?: {
    type: string;
    result?: string;
    timestamp: string;
  } | null;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<QueueLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  const fetchTodayQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/queue/today`);
      if (!response.ok) throw new Error('Failed to fetch queue');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayQueue();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const logQuickActivity = async (leadId: string, type: string, result: string) => {
    try {
      const response = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          type,
          result,
          notes: `Quick log from dashboard`
        }),
      });

      if (!response.ok) throw new Error('Failed to log activity');
      
      // Refresh the queue after logging
      fetchTodayQueue();
    } catch (err) {
      alert('Failed to log activity: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Loading today's hit list...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchTodayQueue}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Today's Hit List</h1>
          <p className="text-gray-600 mt-1">
            {leads.length} leads ready for action
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No leads due today</p>
              <p className="text-sm">Great job! Check back tomorrow.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.lead_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link 
                          to={`/leads/${lead.lead_id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {lead.company_name}
                        </Link>
                        {lead.website && (
                          <p className="text-xs text-gray-500">{lead.website}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.score >= 70 ? 'bg-green-100 text-green-800' :
                        lead.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.next_action || 'Follow up'}</div>
                        <div className="text-xs text-gray-500">{formatDate(lead.next_action_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-900">{lead.recommended_angle || 'N/A'}</p>
                      {lead.top_reasons.length > 0 && (
                        <ul className="text-xs text-gray-500 mt-1">
                          {lead.top_reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="truncate">• {reason}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.primary_contact ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.primary_contact.name}</div>
                          <div className="text-xs text-gray-500">{lead.primary_contact.title || 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No contact</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2">
                        <button
                          onClick={() => logQuickActivity(lead.lead_id, 'call', 'no answer')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          title="Log call no answer"
                        >
                          📞 Call NA
                        </button>
                        <button
                          onClick={() => logQuickActivity(lead.lead_id, 'email', 'sent')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          title="Log email sent"
                        >
                          ✉️ Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}