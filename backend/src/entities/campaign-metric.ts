import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Campaign } from './campaign';

@Entity()
export class CampaignMetric {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    impressions: number;

    @Column('int')
    clicks: number;

    @Column('int')
    conversions: number;

    @Column('date')
    date: Date;

    @ManyToOne(() => Campaign, campaign => campaign.metrics)
    campaign: Campaign;

    @CreateDateColumn()
    createdAt: Date;
} 