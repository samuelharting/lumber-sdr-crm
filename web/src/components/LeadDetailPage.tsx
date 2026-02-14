import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead } from '../types/api';
import { ActivityResponse, ActivityType, ActivityResult, LeadStage } from '../types/api';

interface ExtendedLead extends Lead {
  contacts: Array<{
    id: string;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    isPrimary: boolean;
  }>;
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<ExtendedLead | null>(null);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: ActivityType.CALL as ActivityType,
    result: '' as ActivityResult | '',
    notes: '',
    contactId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doNotContactLoading, setDoNotContactLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  const fetchLeadAndActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch lead with contacts
      const leadResponse = await fetch(`${API_URL}/api/leads/${id}`);
      if (!leadResponse.ok) throw new Error('Lead not found');
      const leadData = await leadResponse.json();
      
      // Fetch contacts
      const contactsResponse = await fetch(`${API_URL}/api/leads/${id}/contacts`);
      const contactsData = contactsResponse.ok ? await contactsResponse.json() : [];
      
      setLead({ ...leadData, contacts: contactsData });

      // Fetch activities
      const activitiesResponse = await fetch(`${API_URL}/api/leads/${id}/activities`);
      if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTruncatedReasons = (reasonsStr?: string) => {
    if (!reasonsStr) return [];
    try {
      const reasons = JSON.parse(reasonsStr);
      return Array.isArray(reasons) ? reasons : [];
    } catch {
      return [];
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchLeadAndActivities();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.result) {
      setError('Please select an activity result');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: id,
          type: formData.type,
          result: formData.result as ActivityResult,
          notes: formData.notes,
          contactId: formData.contactId || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create activity');

      const data = await response.json();
      
      // Refresh lead and activities
      fetchLeadAndActivities();
      
      // Reset form
      setFormData({
        type: ActivityType.CALL,
        result: '' as ActivityResult,
        notes: '',
        contactId: ''
      });

    } catch (err) {
      set error(err instanceof Error ? err.message : 'Failed to create activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoNotContact = async () => {
    try {
      setDoNotContactLoading(true);
      const response = await fetch(`${API_URL}/api/leads/${id}/do-not-contact`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to mark as do-not-contact');
      
      await fetchLeadAndActivities();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setDoNotContactLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Loading lead details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => navigate('/leads')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Leads
        </button>
      </div>
    </div>
  );

  if (!lead) return null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/leads')}
          className="text-blue-600 hover:text-blue-800 text-sm mb-2"
        >
          ← Back to Leads
        </button>
      </div>

      {/* Lead Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.companyName}</h1>
            <div className="mt-2 space-y-1">
              <p className="text-gray-600"><strong>Stage:</strong> {lead.stage}</p>
              <p className="text-gray-600"><strong>Status:</strong> {lead.status}</p>
              <p className="text-gray-600"><strong>Score:</strong> <span className={`font-bold ${
                lead.score >= 70 ? 'text-green-600' : 
                lead.score >= 40 ? 'text-yellow-600' : 
                'text-gray-600'
              }}`>{lead.score}</span></p>
              {lead.recommendedAngle && (
                <p className="text-gray-600"><strong>Recommended Angle:</strong> {lead.recommendedAngle}</p>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={handleDoNotContact}
              disabled={lead.doNotContact || doNotContactLoading}
              className={`px-3 py-1 text-sm rounded ${
                lead.doNotContact 
                  ? 'bg-red-100 text-red-600 cursor-not-allowed' 
                  : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300'
              }`}
            >
              {doNotContactLoading ? 'Updating...' : 
               lead.doNotContact ? 'Do Not Contact' : 'Mark Do Not Contact'}
            </button>
          </div>
        </div>

        {/* Company Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {lead.website && <p><strong>Website:</strong> <a href={lead.website} className="text-blue-600" target="_blank" rel="noopener noreferrer">{lead.website}</a></p>}
          {lead.industryTrade && <p><strong>Industry:</strong> {lead.industryTrade}</p>}
          {lead.locations && <p><strong>Locations:</strong> {lead.locations}</p>}
          {lead.employeeEstimate && <p><strong>Employees:</strong> {lead.employeeEstimate}</p>}
          {lead.nextAction && <p className="col-span-2"><strong>Next Action:</strong> {lead.nextAction} on {formatDate(lead.nextActionDate)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Contacts</h2>
          {lead.contacts.length === 0 ? (
            <p className="text-gray-500">No contacts</p>
          ) : (
            <div className="space-y-3">
              {lead.contacts.map(contact => (
                <div key={contact.id} className="border-b pb-2">
                  <h3 className="font-medium">
                    {contact.name} {contact.isPrimary && <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded">Primary</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{contact.title || 'No title'}</p>
                  {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                  {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Log Activity</h2>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {Object.values(ActivityType).map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
              <select 
                value={formData.result}
                onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value as ActivityResult }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select result...</option>
                {Object.values(ActivityResult).map(result => (
                  <option key={result} value={result}>{result.charAt(0).toUpperCase() + result.slice(1)}</option>
                ))}
              </select>
            </div>

            {lead.contacts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Optional)</label>
                <select 
                  value={formData.contactId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select contact...</option>
                  {lead.contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} {contact.isPrimary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Additional notes..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? 'Logging...' : 'Log Activity'}
            </button>
          </form>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
          {activities.length === 0 ? (
            <p className="text-gray-500">No activities yet</p>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium capitalize">
                      {activity.type}{activity.result && ` - ${activity.result}`}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.contact && (
                    <p className="text-sm text-gray-600">Contact: {activity.contact.name}</p>
                  )}
                  {activity.notes && (
                    <p className="text-sm text-gray-700 mt-1">{activity.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}