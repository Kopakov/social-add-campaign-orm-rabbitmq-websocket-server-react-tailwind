import React, { useEffect, useState } from 'react';
import api from './services/api';
import { io } from 'socket.io-client';
import { PlusIcon, ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

const socket = io('http://localhost:4000');

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    status: 'draft',
    budget: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Fetch campaigns
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/api/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();

    // WebSocket listeners
    socket.on('campaign_update', (data) => {
      if (data.type === 'campaign_created') {
        setCampaigns(prev => [...prev, data.campaign]);
      } else if (data.type === 'campaign_updated') {
        setCampaigns(prev => prev.map(c => 
          c.id === data.campaignId ? data.campaign : c
        ));
      }
    });

    return () => {
      socket.off('campaign_update');
    };
  }, []);

  // Add Escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
        }
        if (selectedCampaign) {
          setSelectedCampaign(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen, selectedCampaign]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/campaigns', newCampaign);
      setCampaigns(prev => [...prev, response.data]);
      setNewCampaign({
        name: '',
        status: 'draft',
        budget: 0,
        startDate: '',
        endDate: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleUpdateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const response = await api.put(`/api/campaigns/${id}`, updates);
      setCampaigns(prev => prev.map(c => c.id === id ? response.data : c));
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Campaign
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                )}>
                  {campaign.status}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">Budget: ${campaign.budget}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Metrics</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Impressions</p>
                    <p className="font-medium">{campaign.metrics.impressions}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Clicks</p>
                    <p className="font-medium">{campaign.metrics.clicks}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Conversions</p>
                    <p className="font-medium">{campaign.metrics.conversions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Campaign Modal */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out",
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsModalOpen(false)}
      >
        <div 
          className={clsx(
            "bg-white rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ease-out",
            isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Campaign</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
              <input
                type="text"
                className="input mt-1"
                value={newCampaign.name}
                onChange={e => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget</label>
              <input
                type="number"
                className="input mt-1"
                value={newCampaign.budget}
                onChange={e => setNewCampaign(prev => ({ ...prev, budget: Number(e.target.value) }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={newCampaign.startDate}
                  onChange={e => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={newCampaign.endDate}
                  onChange={e => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Campaign Details Modal */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out",
          selectedCampaign ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSelectedCampaign(null)}
      >
        <div 
          className={clsx(
            "bg-white rounded-lg max-w-2xl w-full p-6 transform transition-all duration-300 ease-out",
            selectedCampaign ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{selectedCampaign?.name}</h2>
            <button
              onClick={() => setSelectedCampaign(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Campaign Details</h3>
              <div className="space-y-2">
                <p><span className="text-gray-500">Status:</span> {selectedCampaign?.status}</p>
                <p><span className="text-gray-500">Budget:</span> ${selectedCampaign?.budget}</p>
                <p><span className="text-gray-500">Start Date:</span> {selectedCampaign?.startDate}</p>
                <p><span className="text-gray-500">End Date:</span> {selectedCampaign?.endDate}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedCampaign?.metrics.impressions}</p>
                  <p className="text-sm text-gray-500">Impressions</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedCampaign?.metrics.clicks}</p>
                  <p className="text-sm text-gray-500">Clicks</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedCampaign?.metrics.conversions}</p>
                  <p className="text-sm text-gray-500">Conversions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 