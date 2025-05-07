export interface CampaignDonations {
  campaign: string;
  end_date: string; 
  monetary_total: number;
  no_monetary_donations: number;
  total_donated_articles: number;
}

export function filterByDateRange(campaigns: CampaignDonations[], start: Date, end: Date): CampaignDonations[] {
  return campaigns.filter(campaign => {
    const date = new Date(campaign.end_date)
    const afterStart = start ? date >= start : true
    const beforeEnd = end ? date >= end : true
    return afterStart && beforeEnd
  })
}

export function filterByAmountRange(campaigns: CampaignDonations[], min: number, max: number): CampaignDonations[] {
  return campaigns.filter(campaign => {
    const aboveMin = min !== null ? campaign.monetary_total >= min : true
    const belowMax = max !== null ? campaign.monetary_total <= max : true
    return aboveMin && belowMax
  })
}
