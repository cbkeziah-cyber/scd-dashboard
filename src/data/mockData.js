// Mock data simulating Wix Analytics + SEO metrics

export const overviewStats = {
  organicSessions: { value: 12840, change: +14.2, label: 'Organic Sessions' },
  totalSessions: { value: 28350, change: +8.7, label: 'Total Sessions' },
  avgCTR: { value: 4.8, change: +0.6, label: 'Avg. CTR', unit: '%' },
  avgPosition: { value: 14.3, change: -2.1, label: 'Avg. Position', lowerIsBetter: true },
  revenue: { value: 18420, change: +22.5, label: 'Revenue', unit: '$' },
  conversions: { value: 342, change: +18.3, label: 'Conversions' },
  bounceRate: { value: 38.2, change: -3.1, label: 'Bounce Rate', unit: '%', lowerIsBetter: true },
  pageViews: { value: 71200, change: +11.4, label: 'Page Views' },
}

export const trafficOverTime = [
  { date: 'Oct 1', organic: 380, direct: 210, referral: 90, social: 60 },
  { date: 'Oct 8', organic: 420, direct: 195, referral: 105, social: 75 },
  { date: 'Oct 15', organic: 395, direct: 230, referral: 88, social: 82 },
  { date: 'Oct 22', organic: 460, direct: 245, referral: 112, social: 95 },
  { date: 'Oct 29', organic: 510, direct: 260, referral: 120, social: 88 },
  { date: 'Nov 5', organic: 490, direct: 275, referral: 98, social: 110 },
  { date: 'Nov 12', organic: 540, direct: 290, referral: 130, social: 102 },
  { date: 'Nov 19', organic: 580, direct: 310, referral: 145, social: 120 },
  { date: 'Nov 26', organic: 620, direct: 280, referral: 138, social: 135 },
  { date: 'Dec 3', organic: 670, direct: 320, referral: 160, social: 118 },
  { date: 'Dec 10', organic: 710, direct: 345, referral: 172, social: 142 },
  { date: 'Dec 17', organic: 760, direct: 365, referral: 185, social: 155 },
  { date: 'Dec 24', organic: 680, direct: 290, referral: 148, social: 110 },
  { date: 'Dec 31', organic: 720, direct: 310, referral: 162, social: 125 },
  { date: 'Jan 7', organic: 810, direct: 380, referral: 190, social: 168 },
  { date: 'Jan 14', organic: 870, direct: 400, referral: 205, social: 180 },
]

export const ctrOverTime = [
  { date: 'Oct 1', ctr: 3.8, impressions: 9800, clicks: 372 },
  { date: 'Oct 15', ctr: 4.0, impressions: 10200, clicks: 408 },
  { date: 'Nov 1', ctr: 4.2, impressions: 11500, clicks: 483 },
  { date: 'Nov 15', ctr: 4.5, impressions: 12100, clicks: 545 },
  { date: 'Dec 1', ctr: 4.6, impressions: 13400, clicks: 616 },
  { date: 'Dec 15', ctr: 4.9, impressions: 14200, clicks: 696 },
  { date: 'Jan 1', ctr: 5.1, impressions: 15600, clicks: 796 },
  { date: 'Jan 14', ctr: 5.3, impressions: 16800, clicks: 890 },
]

export const revenueOverTime = [
  { date: 'Oct', revenue: 8200, orders: 154, aov: 53.2 },
  { date: 'Nov', revenue: 11400, orders: 198, aov: 57.6 },
  { date: 'Dec', revenue: 18900, orders: 312, aov: 60.6 },
  { date: 'Jan', revenue: 18420, orders: 342, aov: 53.8 },
]

export const topKeywords = [
  { keyword: 'handmade ceramic mugs', position: 3, prevPosition: 7, impressions: 8400, clicks: 672, ctr: 8.0, volume: 12000, url: '/shop/mugs' },
  { keyword: 'artisan pottery shop', position: 5, prevPosition: 5, impressions: 6200, clicks: 434, ctr: 7.0, volume: 8800, url: '/shop' },
  { keyword: 'ceramic bowl set', position: 8, prevPosition: 12, impressions: 4900, clicks: 294, ctr: 6.0, volume: 6500, url: '/shop/bowls' },
  { keyword: 'unique coffee mugs', position: 11, prevPosition: 9, impressions: 7100, clicks: 284, ctr: 4.0, volume: 22000, url: '/shop/mugs' },
  { keyword: 'handcrafted dinnerware', position: 14, prevPosition: 18, impressions: 3800, clicks: 190, ctr: 5.0, volume: 5200, url: '/shop/dinnerware' },
  { keyword: 'pottery gifts for her', position: 17, prevPosition: 24, impressions: 5600, clicks: 224, ctr: 4.0, volume: 9400, url: '/shop/gifts' },
  { keyword: 'stoneware plates', position: 19, prevPosition: 15, impressions: 3200, clicks: 96, ctr: 3.0, volume: 7800, url: '/shop/plates' },
  { keyword: 'buy handmade mugs online', position: 22, prevPosition: 28, impressions: 2900, clicks: 87, ctr: 3.0, volume: 4100, url: '/shop/mugs' },
  { keyword: 'ceramic plant pots', position: 25, prevPosition: 22, impressions: 4100, clicks: 82, ctr: 2.0, volume: 18000, url: '/shop/pots' },
  { keyword: 'artisan gifts online', position: 31, prevPosition: 38, impressions: 6800, clicks: 136, ctr: 2.0, volume: 31000, url: '/shop/gifts' },
  { keyword: 'hand thrown pottery', position: 35, prevPosition: 35, impressions: 2400, clicks: 48, ctr: 2.0, volume: 5600, url: '/about' },
  { keyword: 'small batch ceramics', position: 42, prevPosition: 55, impressions: 1800, clicks: 36, ctr: 2.0, volume: 2900, url: '/shop' },
]

export const topPages = [
  { page: '/shop', title: 'Shop All', sessions: 4820, organicSessions: 2190, ctr: 5.2, avgPosition: 8.4, revenue: 6840 },
  { page: '/shop/mugs', title: 'Ceramic Mugs', sessions: 3610, organicSessions: 1980, ctr: 7.1, avgPosition: 5.6, revenue: 5120 },
  { page: '/', title: 'Home', sessions: 6200, organicSessions: 1420, ctr: 3.8, avgPosition: 12.1, revenue: 1240 },
  { page: '/shop/bowls', title: 'Ceramic Bowls', sessions: 2140, organicSessions: 1250, ctr: 5.9, avgPosition: 9.2, revenue: 3210 },
  { page: '/shop/gifts', title: 'Gift Collections', sessions: 1890, organicSessions: 980, ctr: 4.5, avgPosition: 18.3, revenue: 2890 },
  { page: '/shop/dinnerware', title: 'Dinnerware Sets', sessions: 1650, organicSessions: 870, ctr: 4.1, avgPosition: 16.7, revenue: 4180 },
  { page: '/shop/plates', title: 'Plates', sessions: 1240, organicSessions: 620, ctr: 3.2, avgPosition: 21.4, revenue: 1940 },
  { page: '/about', title: 'Our Story', sessions: 2100, organicSessions: 540, ctr: 2.9, avgPosition: 28.6, revenue: 0 },
]

export const ecommerceMetrics = {
  conversionRate: { value: 2.8, change: +0.4, unit: '%' },
  avgOrderValue: { value: 53.8, change: +3.2, unit: '$' },
  cartAbandonmentRate: { value: 61.4, change: -4.2, unit: '%', lowerIsBetter: true },
  returningCustomers: { value: 34.2, change: +5.8, unit: '%' },
}

export const topProducts = [
  { name: 'Classic Ceramic Mug – Slate', orders: 98, revenue: 4312, views: 2840, convRate: 3.45 },
  { name: 'Handmade Bowl Set (4pc)', orders: 64, revenue: 5760, views: 1920, convRate: 3.33 },
  { name: 'Speckled Coffee Mug – Cream', orders: 82, revenue: 3198, views: 3100, convRate: 2.65 },
  { name: 'Stoneware Dinner Plate Set', orders: 41, revenue: 4510, views: 1480, convRate: 2.77 },
  { name: 'Gift Box – Mug + Small Bowl', orders: 55, revenue: 3850, views: 2210, convRate: 2.49 },
  { name: 'Ceramic Plant Pot – Terracotta', orders: 48, revenue: 2400, views: 2680, convRate: 1.79 },
]

export const seoIssues = [
  { type: 'warning', page: '/shop/pots', issue: 'Meta description missing', impact: 'Medium' },
  { type: 'error', page: '/shop/plates', issue: 'Title tag too short (< 30 chars)', impact: 'High' },
  { type: 'warning', page: '/about', issue: 'H1 tag missing', impact: 'High' },
  { type: 'info', page: '/shop/gifts', issue: 'Images missing alt text (3 images)', impact: 'Medium' },
  { type: 'warning', page: '/', issue: 'Page speed score: 61/100 (mobile)', impact: 'High' },
  { type: 'info', page: '/shop/mugs', issue: 'Canonical tag not set', impact: 'Low' },
  { type: 'error', page: '/shop/dinnerware', issue: 'Duplicate meta description with /shop', impact: 'High' },
]

export const trafficSources = [
  { name: 'Organic Search', value: 45.3, color: '#4361ee' },
  { name: 'Direct', value: 28.6, color: '#7209b7' },
  { name: 'Social', value: 14.2, color: '#f72585' },
  { name: 'Referral', value: 8.9, color: '#4cc9f0' },
  { name: 'Email', value: 3.0, color: '#06d6a0' },
]

export const deviceBreakdown = [
  { name: 'Mobile', sessions: 14820, pct: 52.3 },
  { name: 'Desktop', sessions: 10940, pct: 38.6 },
  { name: 'Tablet', sessions: 2590, pct: 9.1 },
]
