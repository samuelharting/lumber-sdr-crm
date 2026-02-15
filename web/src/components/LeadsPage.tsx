import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Lead } from '../types/api';
import { formatDate, getScoreColor, getScoreBg, truncateText } from '../utils/formatters';
import { 
  PlusIcon, 
  SparklesIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'createdAt' | 'companyName'>('score');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [newLeadName, setNewLeadName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isScoringAll, setIsScoringAll] = useState(false);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3030';

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${API_URL}/api/leads`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leads';
      setError(message.includes('abort') ? 'Request timed out. Is the API server running at ' + API_URL + '?' : message);
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

  // Filter and sort leads
  const filteredAndSortedLeads = leads
    .filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industryTrade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.locations?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = filterStage === 'all' || lead.stage === filterStage;
      
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'companyName':
          return a.companyName.localeCompare(b.companyName);
        default:
          return b.score - a.score;
      }
    });

  const getTruncatedReasons = (reasonsStr?: string): string[] => {
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

  const getStageColor = (stage: string): string => {
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

  useEffect(() => {
    fetchLeads();
  }, []);

  const stages = [
    'NEW', 'RESEARCHED', 'QUEUED', 'ATTEMPTING', 'WORKING', 
    'ENGAGED', 'MEETING_SET', 'NURTURE', 'CLOSED_LOST'
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-construction shadow-sm p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Leads</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={fetchLeads}
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Construction Leads</h1>
            <p className="mt-2 text-slate-600">Manage your construction company prospects</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={scoreAllLeads}
              disabled={isScoringAll}
              className="inline-flex items-center btn-primary"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              {isScoringAll ? 'Scoring...' : 'Score All'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center btn-secondary"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Add Lead Section */}
      <div className="bg-white rounded-construction shadow-sm border border-slate-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add New Lead */}
            <div>
              <form onSubmit={createLead} className="space-y-3">
                <h3 className="text-sm font-medium text-slate-900">Add New Lead</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="Enter company name..."
                    className="flex-1 form-input"
                    disabled={isAdding}
                  />
                  <button
                    type="submit"
                    disabled={isAdding || !newLeadName.trim()}
                    className="btn-primary"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Search Leads</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, industry, location..."
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Sort & Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Sort & Filter</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="form-input"
                >
                  <option value="score">Score</option>
                  <option value="createdAt">Created</option>
                  <option value="companyName">Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats for filtered results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-construction shadow-sm p-4">
          <div className="flex items-center">
            <UsersIcon className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-sm text-slate-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{filteredAndSortedLeads.length}</p>
        </div>
        <div className="bg-white rounded-construction shadow-sm p-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 text-success mr-2" />
            <span className="text-sm text-slate-600">Qualified</span>
          </div>
          <p className="text-2xl font-bold text-success mt-1">
            {filteredAndSortedLeads.filter(l => l.score >= 70).length}
          </p>
        </div>
        <div className="bg-white rounded-construction shadow-sm p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-construction-orange mr-2" />
            <span className="text-sm text-slate-600">Avg Deal</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">$45K</p>
        </div>
        <div className="bg-white rounded-construction shadow-sm p-4">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-sm text-slate-600">This Week</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
        </div>
      </div>

      {/* Leads grid */}
      {filteredAndSortedLeads.length === 0 ? (
        <div className="bg-white rounded-construction shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-construction-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-construction-orange" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No leads found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try adjusting your search or add a new construction company to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-construction shadow-sm hover:shadow-construction transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      <Link 
                        to={`/leads/${lead.id}`}
                        className="hover:text-construction-orange transition-colors"
                      >
                        {lead.companyName}
                      </Link>
                    </h3>
                    {lead.industryTrade && (
                      <p className="text-sm text-slate-600">{lead.industryTrade}</p>
                    )}
                  </div>
                  <div className={`${getScoreBg(lead.score)} rounded-lg p-2 flex flex-col items-center min-w-[50px]`}>
                    <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score || 0}
                    </span>
                    <span className="text-xs text-slate-500">score</span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4">
                  {lead.website && (
                    <div className="flex items-center text-sm text-slate-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-slate-400" />
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-construction-orange">
                        {lead.website}
                      </a>
                    </div>
                  )}
                  {lead.locations && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{truncateText(lead.locations, 30)}</span>
                    </div>
                  )}
                </div>

                {/* Score reasons */}
                {lead.scoreReasons && (
                  <div className="mb-4">
                    <div className="flex items-center text-xs text-slate-500 mb-2">
                      <InformationCircleIcon className="w-3 h-3 mr-1" />
                      <span>Key factors</span>
                    </div>
                    <div className="space-y-1">
                      {getTruncatedReasons(lead.scoreReasons).map((reason, index) => (
                        <div key={index} className="text-sm bg-slate-50 rounded px-2 py-1">
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage and actions */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`status-badge ${getStageColor(lead.stage)}`}>
                      {lead.stage.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Added {formatDate(lead.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/leads/${lead.id}`}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      View Details
                    </Link>
                    {lead.score === 0 && (
                      <button
                        onClick={() => scoreLead(lead.id)}
                        disabled={scoringLeadId === lead.id}
                        className="flex-1 btn-secondary text-center text-sm py-2"
                      >
                        {scoringLeadId === lead.id ? 'Scoring...' : 'Score'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {filteredAndSortedLeads.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center btn-secondary">
            Load More Leads
          </button>
        </div>
      )}
    </div>
  );
}