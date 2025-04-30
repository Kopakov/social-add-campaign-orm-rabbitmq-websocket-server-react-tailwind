export interface Campaign {
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