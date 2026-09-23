export type ComplianceStatus = 'clean' | 'warning' | 'critical';
export type RemoteRank = 'high' | 'medium' | 'low';

export interface InspectionRecord {
  date: string;
  type: string;
  findings: string;
  severity: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  status: ComplianceStatus;
  citationCount: number;
  deficiencyTypes: string[];
  staffingRatio: string;
  cnaPattern: string;
  weekendCoverage: string;
  fallRate: number;
  rehospitalizationRate: number;
  pressureInjuryRate: number;
  monthlyFee: number;
  operator: string;
  ownershipChain: string;
  revenuePerBed: number;
  remoteMonitorRank: RemoteRank;
  inspectionHistory: InspectionRecord[];
  valueScore: number;
  qualityScore: number;
}

/**
 * SAMPLE DATA - NOT REAL FACILITY RECORDS.
 *
 * Every entry below is fictional and exists only to demonstrate the interface
 * while the live CMS dataset is being connected. Facility names, towns,
 * operators, scores and inspection findings are invented.
 *
 * Rules for anything added to this file:
 *  - Facility names must carry the "(Sample)" suffix so every UI surface that
 *    renders a name shows it is not a real record.
 *  - Towns must be fictional. Never pair a real town with a compliance verdict.
 *  - Never invent abuse, neglect or criminal allegations, and never use a name
 *    that resembles a real operator or chain.
 *
 * This file is replaced wholesale once DATABASE_URL points at real CMS data.
 */
const mockProperties: Property[] = [
  {
    id: 'p1',
    name: 'Willow Creek Care Center (Sample)',
    address: '1204 Sample Ave',
    city: 'Willow Creek',
    state: 'CO',
    lat: 39.7392,
    lng: -104.9903,
    status: 'critical',
    citationCount: 14,
    deficiencyTypes: ['Staffing Ratio Violations', 'Medication Errors', 'Documentation Gaps'],
    staffingRatio: '1:9',
    cnaPattern: 'Irregular - rotating 12-hr shifts',
    weekendCoverage: 'Severely reduced (42% baseline)',
    fallRate: 4.8,
    rehospitalizationRate: 31,
    pressureInjuryRate: 12,
    monthlyFee: 7400,
    operator: 'Sample Operator A',
    ownershipChain: 'Sample Operator A > Sample Parent Group',
    revenuePerBed: 6800,
    remoteMonitorRank: 'low',
    valueScore: 18,
    qualityScore: 22,
    inspectionHistory: [
      { date: '2025-11-03', type: 'Annual Survey', findings: 'Illustrative example - medication administration records incomplete', severity: 'G' },
      { date: '2025-06-15', type: 'Complaint Investigation', findings: 'Illustrative example - night shift staffing below posted ratio', severity: 'F' },
      { date: '2024-12-01', type: 'Annual Survey', findings: 'Illustrative example - skin integrity monitoring not documented', severity: 'E' },
    ],
  },
  {
    id: 'p2',
    name: 'Cedar Hollow Assisted Living (Sample)',
    address: '850 Sample Blvd',
    city: 'Cedar Hollow',
    state: 'TX',
    lat: 30.2672,
    lng: -97.7431,
    status: 'warning',
    citationCount: 5,
    deficiencyTypes: ['Call-Light Latency', 'Incomplete Charting'],
    staffingRatio: '1:6',
    cnaPattern: 'Consistent - 8-hr shifts',
    weekendCoverage: 'Moderate (78% baseline)',
    fallRate: 2.1,
    rehospitalizationRate: 18,
    pressureInjuryRate: 4,
    monthlyFee: 5200,
    operator: 'Sample Operator B',
    ownershipChain: 'Sample Operator B > Sample Regional Trust',
    revenuePerBed: 4900,
    remoteMonitorRank: 'medium',
    valueScore: 54,
    qualityScore: 61,
    inspectionHistory: [
      { date: '2025-09-22', type: 'Complaint Investigation', findings: 'Illustrative example - call-light response exceeded target window', severity: 'D' },
      { date: '2025-03-10', type: 'Annual Survey', findings: 'Illustrative example - charting incomplete on sampled records', severity: 'C' },
    ],
  },
  {
    id: 'p3',
    name: 'Sunfield Memory Care (Sample)',
    address: '3300 Sample Dr',
    city: 'Sunfield Mesa',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.074,
    status: 'clean',
    citationCount: 1,
    deficiencyTypes: ['Minor Documentation Gap'],
    staffingRatio: '1:4',
    cnaPattern: 'Structured - 8-hr overlap shifts',
    weekendCoverage: 'Full (96% baseline)',
    fallRate: 0.9,
    rehospitalizationRate: 9,
    pressureInjuryRate: 1,
    monthlyFee: 6100,
    operator: 'Sample Operator C',
    ownershipChain: 'Sample Operator C - family-owned',
    revenuePerBed: 5600,
    remoteMonitorRank: 'high',
    valueScore: 87,
    qualityScore: 91,
    inspectionHistory: [
      { date: '2025-08-14', type: 'Annual Survey', findings: 'Illustrative example - minor documentation gap, corrected same day', severity: 'B' },
    ],
  },
  {
    id: 'p4',
    name: 'Larkspur Bend Senior Estates (Sample)',
    address: '120 Sample Pkwy',
    city: 'Larkspur Bend',
    state: 'IL',
    lat: 41.8781,
    lng: -87.6298,
    status: 'critical',
    citationCount: 19,
    deficiencyTypes: ['Repeat Staffing Violations', 'Care Plan Failures', 'Medication Management'],
    staffingRatio: '1:11',
    cnaPattern: 'Unstable - high turnover',
    weekendCoverage: 'Critical shortage (31% baseline)',
    fallRate: 6.2,
    rehospitalizationRate: 38,
    pressureInjuryRate: 17,
    monthlyFee: 8900,
    operator: 'Sample Operator D',
    ownershipChain: 'Sample Operator D > Sample Capital Partners',
    revenuePerBed: 8100,
    remoteMonitorRank: 'low',
    valueScore: 9,
    qualityScore: 11,
    inspectionHistory: [
      { date: '2026-01-18', type: 'Complaint Investigation', findings: 'Illustrative example - care plans not revised after change in condition', severity: 'J' },
      { date: '2025-10-05', type: 'Focused Survey', findings: 'Illustrative example - medication order documentation incomplete', severity: 'H' },
      { date: '2025-04-20', type: 'Annual Survey', findings: 'Illustrative example - staffing below posted minimum across survey window', severity: 'G' },
    ],
  },
  {
    id: 'p5',
    name: 'Brightwater Care Home (Sample)',
    address: '2200 Sample Rd',
    city: 'Brightwater',
    state: 'GA',
    lat: 33.749,
    lng: -84.388,
    status: 'warning',
    citationCount: 7,
    deficiencyTypes: ['Nutrition Monitoring', 'Infection Control Gaps'],
    staffingRatio: '1:7',
    cnaPattern: 'Mixed - 8 and 12-hr shifts',
    weekendCoverage: 'Reduced (65% baseline)',
    fallRate: 2.8,
    rehospitalizationRate: 22,
    pressureInjuryRate: 6,
    monthlyFee: 4800,
    operator: 'Sample Operator E',
    ownershipChain: 'Sample Operator E > Sample Regional REIT',
    revenuePerBed: 4400,
    remoteMonitorRank: 'medium',
    valueScore: 46,
    qualityScore: 53,
    inspectionHistory: [
      { date: '2025-12-01', type: 'Annual Survey', findings: 'Illustrative example - nutritional assessments not completed on schedule', severity: 'D' },
      { date: '2025-07-30', type: 'Complaint Investigation', findings: 'Illustrative example - infection control protocol deviation', severity: 'C' },
    ],
  },
  {
    id: 'p6',
    name: 'Pine Hollow Rehabilitation (Sample)',
    address: '500 Sample Blvd',
    city: 'Pine Hollow',
    state: 'WA',
    lat: 47.6062,
    lng: -122.3321,
    status: 'clean',
    citationCount: 2,
    deficiencyTypes: ['Minor Scheduling Note'],
    staffingRatio: '1:4',
    cnaPattern: 'Structured - consistent assignments',
    weekendCoverage: 'Full (98% baseline)',
    fallRate: 0.7,
    rehospitalizationRate: 8,
    pressureInjuryRate: 0.8,
    monthlyFee: 7200,
    operator: 'Sample Operator F',
    ownershipChain: 'Sample Operator F - non-profit',
    revenuePerBed: 6800,
    remoteMonitorRank: 'high',
    valueScore: 92,
    qualityScore: 94,
    inspectionHistory: [
      { date: '2025-10-12', type: 'Annual Survey', findings: 'Illustrative example - minor scheduling documentation notes, corrected', severity: 'B' },
    ],
  },
  {
    id: 'p7',
    name: 'Tidewater Nursing & Rehab (Sample)',
    address: '770 Sample Coast Rd',
    city: 'Tidewater Cove',
    state: 'FL',
    lat: 27.9506,
    lng: -82.4572,
    status: 'critical',
    citationCount: 11,
    deficiencyTypes: ['Fall Prevention Failures', 'Staffing Violations', 'Medication Management'],
    staffingRatio: '1:10',
    cnaPattern: 'High float staff use',
    weekendCoverage: 'Severe reduction (39% baseline)',
    fallRate: 5.4,
    rehospitalizationRate: 34,
    pressureInjuryRate: 14,
    monthlyFee: 6700,
    operator: 'Sample Operator G',
    ownershipChain: 'Sample Operator G > Sample Capital Ventures',
    revenuePerBed: 6200,
    remoteMonitorRank: 'low',
    valueScore: 14,
    qualityScore: 19,
    inspectionHistory: [
      { date: '2026-02-14', type: 'Complaint Investigation', findings: 'Illustrative example - fall care plans not revised after repeat incidents', severity: 'G' },
      { date: '2025-09-01', type: 'Annual Survey', findings: 'Illustrative example - PRN assessment documentation missing', severity: 'F' },
    ],
  },
  {
    id: 'p8',
    name: 'Mistral Ridge Senior Living (Sample)',
    address: '1100 Sample View Ln',
    city: 'Mistral Ridge',
    state: 'NC',
    lat: 35.5951,
    lng: -82.5515,
    status: 'clean',
    citationCount: 0,
    deficiencyTypes: [],
    staffingRatio: '1:4',
    cnaPattern: 'Consistent - permanent assignment model',
    weekendCoverage: 'Full (100% baseline)',
    fallRate: 0.6,
    rehospitalizationRate: 7,
    pressureInjuryRate: 0.5,
    monthlyFee: 5500,
    operator: 'Sample Operator H',
    ownershipChain: 'Sample Operator H - local non-profit',
    revenuePerBed: 5100,
    remoteMonitorRank: 'high',
    valueScore: 96,
    qualityScore: 97,
    inspectionHistory: [
      { date: '2025-11-20', type: 'Annual Survey', findings: 'Illustrative example - zero deficiencies cited', severity: 'A' },
    ],
  },
  {
    id: 'p9',
    name: 'Auburn Mills Assisted Living (Sample)',
    address: '3400 Sample St',
    city: 'Auburn Mills',
    state: 'MO',
    lat: 38.627,
    lng: -90.1994,
    status: 'warning',
    citationCount: 4,
    deficiencyTypes: ['Activity Program Gaps', 'Incomplete Assessments'],
    staffingRatio: '1:6',
    cnaPattern: 'Mixed shift patterns',
    weekendCoverage: 'Moderate (71% baseline)',
    fallRate: 1.9,
    rehospitalizationRate: 16,
    pressureInjuryRate: 3,
    monthlyFee: 4400,
    operator: 'Sample Operator I',
    ownershipChain: 'Sample Operator I > Sample Healthcare REIT',
    revenuePerBed: 4100,
    remoteMonitorRank: 'medium',
    valueScore: 59,
    qualityScore: 66,
    inspectionHistory: [
      { date: '2025-08-08', type: 'Annual Survey', findings: 'Illustrative example - activity assessments incomplete on sampled records', severity: 'C' },
    ],
  },
  {
    id: 'p10',
    name: 'Rosewood Flats Care Center (Sample)',
    address: '600 Sample Tree Rd',
    city: 'Rosewood Flats',
    state: 'TN',
    lat: 36.1627,
    lng: -86.7816,
    status: 'warning',
    citationCount: 6,
    deficiencyTypes: ['Hydration Monitoring', 'Call System Failures'],
    staffingRatio: '1:7',
    cnaPattern: 'Rotating - agency supplemented',
    weekendCoverage: 'Reduced (67% baseline)',
    fallRate: 2.4,
    rehospitalizationRate: 20,
    pressureInjuryRate: 5,
    monthlyFee: 5100,
    operator: 'Sample Operator J',
    ownershipChain: 'Sample Operator J > Sample National Portfolio',
    revenuePerBed: 4700,
    remoteMonitorRank: 'medium',
    valueScore: 48,
    qualityScore: 55,
    inspectionHistory: [
      { date: '2025-11-15', type: 'Complaint Investigation', findings: 'Illustrative example - hydration monitoring logs not maintained', severity: 'E' },
      { date: '2025-05-22', type: 'Annual Survey', findings: 'Illustrative example - call system outage without documented protocol', severity: 'D' },
    ],
  },
];

export default mockProperties;
