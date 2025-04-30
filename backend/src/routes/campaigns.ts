import { Router } from 'express';
import { getCache, setCache } from '../services/redis';
import { publishMessage } from '../services/rabbitmq';
import { Campaign } from '../entities/campaign';

const router = Router();

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
  const cachedCampaigns = await getCache('all_campaigns');
  if (cachedCampaigns) {
    return res.json(cachedCampaigns);
  }

  await setCache('all_campaigns', campaigns);
  res.json(campaigns);
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  const campaign = await Campaign.findOne({ where: { id: req.params.id }});
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const cachedCampaign = await getCache(`campaign_${req.params.id}`);
  if (cachedCampaign) {
    return res.json(cachedCampaign);
  }

  await setCache(`campaign_${req.params.id}`, campaign);
  res.json(campaign);
});

// Create new campaign
router.post('/', async (req, res) => {
  const newCampaign = {
    id: (campaigns.length + 1).toString(),
    ...req.body,
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0
    }
  };

  campaigns.push(newCampaign);
  await setCache('all_campaigns', campaigns);
  await setCache(`campaign_${newCampaign.id}`, newCampaign);

  // Publish campaign creation event
  await publishMessage('campaign_updates', {
    type: 'campaign_created',
    campaignId: newCampaign.id,
    campaign: newCampaign
  });

  res.status(201).json(newCampaign);
});

// Update campaign
router.put('/:id', async (req, res) => {
  const index = campaigns.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const updatedCampaign = {
    ...campaigns[index],
    ...req.body
  };

  campaigns[index] = updatedCampaign;
  await setCache('all_campaigns', campaigns);
  await setCache(`campaign_${req.params.id}`, updatedCampaign);

  // Publish campaign update event
  await publishMessage('campaign_updates', {
    type: 'campaign_updated',
    campaignId: req.params.id,
    campaign: updatedCampaign
  });

  res.json(updatedCampaign);
});

export const campaignRoutes = router; 