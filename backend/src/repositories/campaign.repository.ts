import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign';
import { AppDataSource } from '../config/typeorm.config';

export class CampaignRepository {
    private repository: Repository<Campaign>;

    constructor() {
        this.repository = AppDataSource.getRepository(Campaign);
    }

    // Create a new campaign
    async create(campaignData: Partial<Campaign>): Promise<Campaign> {
        const campaign = this.repository.create(campaignData);
        return await this.repository.save(campaign);
    }

    // Find all campaigns with their metrics
    async findAll(): Promise<Campaign[]> {
        return await this.repository.find({
            relations: ['metrics']
        });
    }

    // Find a campaign by ID with its metrics
    async findById(id: string): Promise<Campaign | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['metrics']
        });
    }

    // Update a campaign
    async update(id: string, campaignData: Partial<Campaign>): Promise<Campaign | null> {
        await this.repository.update(id, campaignData);
        return await this.findById(id);
    }

    // Delete a campaign
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    // Find campaigns by status
    async findByStatus(status: string): Promise<Campaign[]> {
        return await this.repository.find({
            where: { status },
            relations: ['metrics']
        });
    }

    // Find campaigns within a date range
    async findByDateRange(startDate: Date, endDate: Date): Promise<Campaign[]> {
        return await this.repository
            .createQueryBuilder('campaign')
            .where('campaign.startDate >= :startDate', { startDate })
            .andWhere('campaign.endDate <= :endDate', { endDate })
            .leftJoinAndSelect('campaign.metrics', 'metrics')
            .getMany();
    }
} 