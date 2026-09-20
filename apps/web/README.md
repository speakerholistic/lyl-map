# CareGuard Compliance Map

A free, open-access interactive compliance map that pulls from federal (CMS) and state regulatory databases to show every care home's public compliance record — color-coded and readable at a glance.

## Features

### Interactive Map
- **WCAG 2.1 AA Compliant Pins**: Distinct shapes (●▲⬡) AND colors for accessibility
  - ● Circle (Green) = Clean compliance baseline
  - ▲ Triangle (Yellow) = Active citations or unresolved complaints
  - ⬡ Octagon (Red) = Systemic violations, restraint misuse, repeat CMS deficiencies

### 5-Tab Sidebar Tools
1. **💰 Fund Care** - Asset & Equity Calculator
2. **🏠 Care at Home** - Private Caregiver Wage Benchmark
3. **👁 Remote Monitor** - Remote Sentinel Toggle
4. **🚨 Emergency Exit** - Hospital Discharge Emergency Escape Route
5. **📊 Early Signs** - Proactive Risk Gauge Checklist

### Property Profile Panel
Slides in when clicking any pin, showing:
- Compliance history & CMS inspection records
- Staffing ratios & CNA assignment patterns
- Quality measures (fall rates, rehospitalization, pressure injuries)
- Financial & ownership structure
- Dynamic CTAs based on compliance status

### Direct Comparison Grid
Compare up to 4 properties side-by-side:
- Value Score vs. Monthly Fee
- Staffing Ratio data
- Citation history
- Quality measure scores
- Remote-Friendly flag

### Email Alerts
Free compliance alerts via Kajabi integration — users are redirected to Kajabi landing page for signup.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Maps**: Google Maps JavaScript API via @vis.gl/react-google-maps
- **Icons**: Lucide React
- **Deployment**: Netlify (with Next.js Runtime plugin)

## Environment Variables

Create a `.env.local` file (see `.env.example`):

```bash
# Required
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_KAJABI_ALERTS_URL=https://your-kajabi-site.com/compliance-alerts

# Optional (if using database/auth)
DATABASE_URL=your_database_url
AUTH_SECRET=your_auth_secret
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

## Local Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Open http://localhost:3000
```

## Deployment to Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

**Quick steps:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy (automatic)

## Project Structure

```
/apps/web/src/
├── app/
│   ├── page.tsx              # Main map page
│   └── api/                  # Backend API routes (if needed)
├── components/
│   └── compliance/
│       ├── ComplianceMapCanvas.tsx
│       ├── PropertyProfilePanel.tsx
│       ├── ComparisonGrid.tsx
│       ├── TabSidebar.tsx
│       ├── UrgencyBanner.tsx
│       ├── EmailOptIn.tsx
│       └── tabs/
│           ├── FundCareTab.tsx
│           ├── CareAtHomeTab.tsx
│           ├── RemoteMonitorTab.tsx
│           ├── EmergencyExitTab.tsx
│           └── EarlySignsTab.tsx
└── data/
    └── mockProperties.ts     # Mock compliance data (replace with real API)
```

## Data Sources

Currently using mock data. Production version should pull from:
- **CMS (Centers for Medicare & Medicaid Services)** - Federal inspection records
- **State regulatory databases** - State-level licensing & complaints
- **Quality Measures data** - Falls, rehospitalization, pressure injury rates
- **Financial/ownership records** - Public corporate operator data

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation throughout
- Screen reader optimized
- High contrast ratios (4.5:1 minimum)
- Distinct shapes + colors for pins (not color alone)
- Alt-text on all interactive elements

## Privacy Policy

Privacy policy link: https://stacybraiuca.com/policy-6780-3944

## License

Proprietary - All rights reserved

## Support

For technical issues or questions, contact the development team.
