import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CampaignMetric } from './campaign-metric';

@Entity()
export class Campaign {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ['draft', 'active', 'paused', 'completed'],
        default: 'draft'
    })
    status: string;

    @Column('decimal', { precision: 10, scale: 2 })
    budget: number;

    @Column('date')
    startDate: Date;

    @Column('date')
    endDate: Date;

    @OneToMany(() => CampaignMetric, metric => metric.campaign)
    metrics: CampaignMetric[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 