import { Router } from 'express';
import { getCache, setCache } from '../services/redis';
import { publishMessage } from '../services/rabbitmq';
import { CampaignRepository } from '../repositories/campaign.repository';

const router = Router();
const campaignRepository = new CampaignRepository();

// Mock data
const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'active',
    budget: 1000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    metrics: {
      impressions: 15000,
      clicks: 750,
      conversions: 50
    }
  },
  {
    id: '2',
    name: 'Holiday Special',
    status: 'draft',
    budget: 2000,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0
    }
  }
];

// Get all campaigns
router.get('/', async (req, res) => {
    try {
        const cachedCampaigns = await getCache('all_campaigns');
        if (cachedCampaigns) {
            return res.json(cachedCampaigns);
        }

        const campaigns = await campaignRepository.findAll();
        await setCache('all_campaigns', campaigns);
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const cachedCampaign = await getCache(`campaign_${req.params.id}`);
        if (cachedCampaign) {
            return res.json(cachedCampaign);
        }

        const campaign = await campaignRepository.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await setCache(`campaign_${req.params.id}`, campaign);
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});

// Create new campaign
router.post('/', async (req, res) => {
    try {
        const newCampaign = await campaignRepository.create(req.body);
        
        await setCache('all_campaigns', await campaignRepository.findAll());
        await setCache(`campaign_${newCampaign.id}`, newCampaign);

        // Publish campaign creation event
        await publishMessage('campaign_updates', {
            type: 'campaign_created',
            campaignId: newCampaign.id,
            campaign: newCampaign
        });

        res.status(201).json(newCampaign);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// Update campaign
router.put('/:id', async (req, res) => {
    try {
        const updatedCampaign = await campaignRepository.update(req.params.id, req.body);
        if (!updatedCampaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await setCache('all_campaigns', await campaignRepository.findAll());
        await setCache(`campaign_${req.params.id}`, updatedCampaign);

        // Publish campaign update event
        await publishMessage('campaign_updates', {
            type: 'campaign_updated',
            campaignId: req.params.id,
            campaign: updatedCampaign
        });

        res.json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

export const campaignRoutes = router; 