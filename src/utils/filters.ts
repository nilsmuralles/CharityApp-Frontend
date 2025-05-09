export interface CampaignDonations {
  campaign: string;
  end_date: string; 
  monetary_total: number;
  no_monetary_donations: number;
  total_donated_articles: number;
}

export function getMinAndMaxDate(campaigns: CampaignDonations[]) {
  const dates = campaigns.map(c => new Date(c.end_date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  return [minDate, maxDate]
}

export function filterByDateRange(campaigns: CampaignDonations[], start: Date, end: Date): CampaignDonations[] {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return campaigns.filter(campaign => {
    const date = new Date(campaign.end_date)
    const afterStart = startDate ? date >= startDate : true
    const beforeEnd = endDate ? date <= endDate : true
    return afterStart && beforeEnd
  })
}

export function getMinAndMaxAmount(campaigns: CampaignDonations[]) {
  const amounts = campaigns.map(c => c.monetary_total)
  const minAmount = Math.min(...amounts)
  const maxAmount = Math.max(...amounts)
  return [minAmount, maxAmount]
}

export function filterByAmountRange(campaigns: CampaignDonations[], min: number, max: number): CampaignDonations[] {
  return campaigns.filter(campaign => {
    const aboveMin = min !== null ? campaign.monetary_total >= min : true
    const belowMax = max !== null ? campaign.monetary_total <= max : true
    return aboveMin && belowMax
  })
}
