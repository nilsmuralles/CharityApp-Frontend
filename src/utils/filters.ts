export function getMinAndMaxDate(campaigns: any[], dateFieldName: string) {
  const dates = campaigns.map(c => new Date(c[dateFieldName]))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  return [minDate, maxDate]
}

export function filterByDateRange(campaigns: any[], dateFieldName: string, start: Date, end: Date): any[] {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return campaigns.filter(campaign => {
    const date = new Date(campaign[dateFieldName])
    const afterStart = startDate ? date >= startDate : true
    const beforeEnd = endDate ? date <= endDate : true
    return afterStart && beforeEnd
  })
}

export function getMinAndMaxAmount(campaigns: any[], amountName: string) {
  const amounts = campaigns.map(c => c[amountName])
  const minAmount = Math.min(...amounts)
  const maxAmount = Math.max(...amounts)
  return [minAmount, maxAmount]
}

export function filterByAmountRange(campaigns: any[], amountName: string, min: number, max: number): any[] {
  return campaigns.filter(campaign => {
    const aboveMin = min !== null ? campaign[amountName] >= min : true
    const belowMax = max !== null ? campaign[amountName] <= max : true
    return aboveMin && belowMax
  })
}

export function filterAlphabetically(campaigns: any[], reverse: boolean) {
  if (reverse) {
    return campaigns.sort((a, b) => b.campaign.localeCompare(a.campaign))
  } else {
    return campaigns.sort((a, b) => a.campaign.localeCompare(b.campaign))
  }
}

export function filterByType(campaigns: any[], field: string, type: string) {
  return campaigns.filter(campaign => 
    campaign[field].toLowerCase() === type.toLowerCase()
  );
}

export function sortAmount(campaigns: any[], field: string) {
  return [...campaigns].sort((a, b) => a[field] - b[field]);
}
