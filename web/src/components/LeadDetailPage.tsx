import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Lead, Contact, Activity } from '../types/api';
import { formatDate, getScoreColor, getInitials } from '../utils/formatters';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  StarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const [leadRes, contactsRes, activitiesRes] = await Promise.all([
        fetch(`${API_URL}/api/leads/${id}`),
        fetch(`${API_URL}/api/leads/${id}/contacts`),
        fetch(`${API_URL}/api/leads/${id}/activities`)
      ]);

      if (!leadRes.ok) throw new Error('Lead not found');
      
      const [leadData, contactsData, activitiesData] = await Promise.all([
        leadRes.json(),
        contactsRes.json(),
        activitiesRes.json()
      ]);

      setLead(leadData);
      setContacts(contactsData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-800',
      'RESEARCHED': 'bg-purple-100 text-purple-800',
      'QUEUED': 'bg-yellow-100 text-yellow-800',
      'ENGAGED': 'bg-construction-orange/20 text-construction-orange-dark',
      'MEETING_SET': 'bg-green-100 text-green-800',
      'CLOSED_LOST': 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-slate-100 text-slate-800';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return PhoneIcon;
      case 'email': return EnvelopeIcon;
      case 'linkedin': return UsersIcon;
      case 'note': return DocumentTextIcon;
      default: return ChatBubbleLeftRightIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'linkedin': return 'bg-blue-600/10 text-blue-600';
      case 'note': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-construction shadow-sm p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-construction shadow-sm p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-construction shadow-sm p-8 text-center">
          <div className="text-red-500 mb-4">
            <XCircleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">{error || 'Lead not found'}</h2>
          <Link to="/leads" className="btn-primary">
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/leads" 
          className="inline-flex items-center text-slate-600 hover:text-construction-orange transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Header */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-construction-orange/10 rounded-construction-sm flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-construction-orange" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">{lead.companyName}</h1>
                    {lead.industryTrade && (
                      <p className="text-slate-600">{lead.industryTrade}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="btn-secondary">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button className="btn-secondary">
                  <ArrowLeftIcon className="w-4 h-4 -scale-x-100 mr-2" />
                  Share
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Stage</p>
                <span className={`status-badge ${getStageColor(lead.stage)}`}>
                  {lead.stage.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Score</p>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                    {lead.score || 0}
                  </span>
                  <span className="text-sm text-slate-500 ml-2">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Website</p>
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                     className="text-construction-orange hover:text-construction-orange-dark">
                    {lead.website}
                  </a>
                ) : (
                  <span className="text-slate-500">Not provided</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Industry</p>
                <p className="text-slate-900">{lead.industryTrade || 'Construction'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Location</p>
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 text-slate-400 mr-2" />
                  <p className="text-slate-900">{lead.locations || 'Location not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Employee Estimate</p>
                <p className="text-slate-900">{lead.employeeEstimate || 'Unknown'}</p>
              </div>
            </div>
            
            {/* Qualification indicators */}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h3 className="text-md font-medium text-slate-900 mb-3">Qualification Factors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${
                    lead.doesPublicWorks === 'yes' ? 'text-success' : 'text-slate-400'
                  }`} />
                  <span className={`text-sm ${
                    lead.doesPublicWorks === 'yes' ? 'text-success' : 'text-slate-500'
                  }`}>
                    Public Works
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${
                    lead.unionLikely === 'yes' ? 'text-success' : 'text-slate-400'
                  }`} />
                  <span className={`text-sm ${
                    lead.unionLikely === 'yes' ? 'text-success' : 'text-slate-500'
                  }`}>
                    Union Projects
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${
                    lead.multiJobsite === 'yes' ? 'text-success' : 'text-slate-400'
                  }`} />
                  <span className={`text-sm ${
                    lead.multiJobsite === 'yes' ? 'text-success' : 'text-slate-500'
                  }`}>
                    Multi-Jobsite
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights & Recommendations */}
          {lead.recommendedAngle && (
            <div className="bg-white rounded-construction shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Recommendations</h2>
              <div className="bg-construction-orange/5 border-l-4 border-construction-orange p-4 rounded-construction-sm">
                <div className="flex">
                  <InformationCircleIcon className="w-5 h-5 text-construction-orange mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-2">Recommended Approach</p>
                    <p className="text-sm text-slate-700">{lead.recommendedAngle}</p>
                  </div>
                </div>
              </div>
              
              {lead.scoreReasons && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Key Factors</p>
                  <div className="space-y-1">
                    {JSON.parse(lead.scoreReasons).map((reason: string, index: number) => (
                      <div key={index} className="text-sm text-slate-600 flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
              <button 
                onClick={() => {}}
                className="btn-primary text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Log Activity
              </button>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No activities recorded yet</p>
                <button className="text-construction-orange hover:text-construction-orange-dark text-sm mt-2">
                  Start with your first outreach
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-slate-900 capitalize">{activity.type}</span>
                          {activity.contact && (
                            <span className="text-slate-600"> with {activity.contact.name}</span>
                          )}
                        </div>
                        {activity.notes && (
                          <p className="text-sm text-slate-600 mt-1">{activity.notes}</p>
                        )}
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contacts */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Contacts</h3>
              <button 
                onClick={() => {}}
                className="text-sm text-construction-orange hover:text-construction-orange-dark"
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                Add
              </button>
            </div>
            
            {contacts.length === 0 ? (
              <div className="text-center py-4">
                <UsersIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No contacts added yet</p>
                <button className="text-sm text-construction-orange mt-2">
                  Add first contact
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-construction-orange/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-construction-orange">
                        {getInitials(contact.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                      {contact.title && (
                        <p className="text-xs text-slate-600">{contact.title}</p>
                      )}
                    </div>
                    {contact.isPrimary && (
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary">
                <PhoneIcon className="w-4 h-4 mr-2 inline" />
                Log Call
              </button>
              <button className="w-full btn-secondary">
                <EnvelopeIcon className="w-4 h-4 mr-2 inline" />
                Send Email
              </button>
              <button className="w-full btn-secondary">
                <CalendarIcon className="w-4 h-4 mr-2 inline" />
                Set Meeting
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-construction shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
            <textarea
              className="form-input h-32"
              placeholder="Add important notes about this lead..."
              defaultValue={lead.painSignals || ""}
            />
            <button className="mt-3 btn-primary text-sm w-full">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}