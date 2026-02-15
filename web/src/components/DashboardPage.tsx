import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  BuildingOfficeIcon, 
  UserPlusIcon, 
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

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

interface Stats {
  totalLeads: number;
  hotLeads: number;
  weeklyActivities: number;
  conversionRate: number;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<QueueLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    hotLeads: 0,
    weeklyActivities: 0,
    conversionRate: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  const fetchTodayQueue = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${API_URL}/api/queue/today`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Failed to fetch queue');
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : []);
      
      // Calculate stats from leads data
      setStats({
        totalLeads: data?.length || 0,
        hotLeads: data?.filter((l: QueueLead) => l.score >= 80)?.length || 0,
        weeklyActivities: 23,
        conversionRate: 12.5,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load queue';
      setError(message.includes('abort') ? 'Request timed out. Is the API server running at ' + API_URL + '?' : message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // You would typically call a separate stats endpoint here
      // For now, we'll use calculated stats from leads
      const response = await fetch(`${API_URL}/api/leads`);
      if (response.ok) {
        const data = await response.json();
        const hotLeadsCount = data?.filter((l: any) => l.score >= 70)?.length || 0;
        setStats(prev => ({
          ...prev,
          hotLeads: hotLeadsCount,
          conversionRate: Math.round((hotLeadsCount / data?.length || 0) * 100)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchTodayQueue();
    fetchStats();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    return new Date(dateString).toLocaleDateString();
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
      
      fetchTodayQueue();
    } catch (err) {
      alert('Failed to log activity: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-construction shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Table skeleton */}
        <div className="bg-white rounded-construction shadow-sm overflow-hidden">
          <div className="h-16 bg-slate-200"></div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex space-x-4">
                <div className="h-10 bg-slate-200 rounded flex-1"></div>
                <div className="h-10 bg-slate-200 rounded w-20"></div>
                <div className="h-10 bg-slate-200 rounded w-32"></div>
                <div className="h-10 bg-slate-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-construction shadow-sm p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L6.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={fetchTodayQueue}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">Welcome back! Here's your sales overview</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary">
              <ClockIcon className="w-4 h-4 mr-2 inline" />
              Refresh Data
            </button>
            <button className="btn-primary">
              <UserPlusIcon className="w-4 h-4 mr-2 inline" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-construction shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-construction-orange/10 rounded-lg p-3">
                <UserGroupIcon className="h-6 w-6 text-construction-orange" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Leads</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stats.totalLeads}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-success mr-1" />
            <span className="text-success">12% from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-construction shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success/10 rounded-lg p-3">
                <ArrowTrendingUpIcon className="h-6 w-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Hot Leads</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stats.hotLeads}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-success mr-1" />
            <span className="text-success">8% from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-construction shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-600/10 rounded-lg p-3">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Weekly Activities</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stats.weeklyActivities}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="w-4 h-4 text-error mr-1" />
            <span className="text-error">3% from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-construction shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-forest-green/10 rounded-lg p-3">
              <ChartBarIcon className="h-6 w-6 text-forest-green" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stats.conversionRate}%</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-success mr-1" />
            <span className="text-success">2% from last week</span>
          </div>
        </div>
      </div>

      {/* Today's Hit List */}
      <div className="bg-white rounded-construction shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Today's Hit List</h2>
              <p className="text-sm text-slate-600">Priority leads for your outreach today</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">{leads.length} leads ready</span>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-construction-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingOfficeIcon className="w-8 h-8 text-construction-orange" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No leads due today</h3>
            <p className="mt-2 text-sm text-slate-600">You're all caught up! Check back tomorrow or review your complete pipeline.</p>
            <Link to="/leads" className="mt-4 inline-block btn-secondary">
              View All Leads
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Angle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead.lead_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link 
                          to={`/leads/${lead.lead_id}`}
                          className="text-sm font-medium text-construction-orange hover:text-construction-orange-dark hover:underline"
                        >
                          {lead.company_name}
                        </Link>
                        {lead.website && (
                          <p className="text-xs text-slate-500">{lead.website}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          lead.score >= 80 ? 'bg-success' : 
                          lead.score >= 60 ? 'bg-construction-orange' : 
                          lead.score >= 40 ? 'bg-warning' : 'bg-error'
                        }`}></div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.score >= 80 ? 'bg-success/20 text-success' :
                          lead.score >= 60 ? 'bg-construction-orange/20 text-construction-orange-dark' :
                          lead.score >= 40 ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>
                          {lead.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{lead.next_action || 'Follow up'}</div>
                        <div className="text-xs text-slate-500">{formatDate(lead.next_action_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-slate-900">{lead.recommended_angle || 'N/A'}</p>
                      {lead.top_reasons.length > 0 && (
                        <ul className="text-xs text-slate-500 mt-1">
                          {lead.top_reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="truncate">• {reason}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.primary_contact ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">{lead.primary_contact.name}</div>
                          <div className="text-xs text-slate-500">{lead.primary_contact.title || 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No contact</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => logQuickActivity(lead.lead_id, 'call', 'no answer')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-construction-sm hover:bg-blue-200 transition-colors"
                          title="Log call no answer"
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => logQuickActivity(lead.lead_id, 'email', 'sent')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-construction-sm hover:bg-green-200 transition-colors"
                          title="Log email sent"
                        >
                          ✉️ Email
                        </button>
                        <Link 
                          to={`/leads/${lead.lead_id}`}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-construction-sm hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-construction shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-construction-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-construction-orange">A</span>
                </div>
                <div>
                  <p className="text-sm text-slate-900">Activity logged for {['ABC Construction', 'BuildCorp', 'MegaBuild'][i-1]}</p>
                  <p className="text-xs text-slate-500">{i} hour{i > 1 ? 's' : ''} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-construction shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Overview</h3>
          <div className="space-y-3">
            {[
              { stage: 'New Leads', count: 24, color: 'bg-blue-500' },
              { stage: 'Qualified', count: 18, color: 'bg-construction-orange' },
              { stage: 'Meeting Set', count: 8, color: 'bg-forest-green' },
              { stage: 'Closed Won', count: 3, color: 'bg-success' }
            ].map((item) => (
              <div key={item.stage} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.stage}</span>
                <div className="flex items-center space-x-3">
                  <div className={`h-2 rounded-full ${item.color} flex-1`} style={{ width: `${item.count * 4}px` }}></div>
                  <span className="text-sm font-medium text-slate-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-construction shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Avg. Lead Score</span>
              <span className="text-lg font-semibold text-slate-900">68</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Response Rate</span>
              <span className="text-lg font-semibold text-slate-900">34%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Avg. Deal Size</span>
              <span className="text-lg font-semibold text-slate-900">$45K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}