export interface IAnalytics {
    type: string;
    title: string;
    chart_type: string;
    domain?: string;
    data: any[];
    metadata: {
        total_jobs?: number;
        total_cities?: number;
        total_mentions?: number;
        last_updated: Date;
        [key: string]: any;
    };
}