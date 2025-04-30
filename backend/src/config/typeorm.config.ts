import { DataSource } from 'typeorm';
import { Campaign } from '../entities/campaign';
import { CampaignMetric } from '../entities/campaign-metric';

export const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:', // This creates an in-memory database
    synchronize: true, // This will automatically create tables based on entities
    logging: true,
    entities: [Campaign, CampaignMetric],
    migrations: [],
    subscribers: [],
}); 