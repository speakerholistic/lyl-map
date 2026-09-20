/**
 * Triage Wizard routing data — Q1 → Q2 → 24 modules → Q3 document variants
 * Q1: what's happening (7 tracks)
 * Q2: which specifics apply (multi-select, track-filtered, maps to module codes)
 * Q3: who are you addressing (7 addressees — changes the letter/script shown)
 */

export type TabDestination = 'emergency-exit' | 'early-signs' | 'fund-care' | 'property-profile';

export interface Q1Track {
  id: string;
  situation: string;
  opensTab: TabDestination;
}

export const Q1_TRACKS: Q1Track[] = [
  {
    id: 'A',
    situation: 'We just got a discharge or eviction notice',
    opensTab: 'emergency-exit',
  },
  {
    id: 'B',
    situation: "There's been a fall, injury, or safety incident",
    opensTab: 'property-profile',
  },
  {
    id: 'C',
    situation: "I'm worried about medication, sedation, or restraints",
    opensTab: 'property-profile',
  },
  {
    id: 'D',
    situation: "I'm worried about neglect in daily care — hygiene, food, water",
    opensTab: 'property-profile',
  },
  {
    id: 'E',
    situation: "There's a billing, contract, or money concern",
    opensTab: 'fund-care',
  },
  {
    id: 'F',
    situation: "I need to document or report a problem that's already happened",
    opensTab: 'property-profile',
  },
  {
    id: 'G',
    situation: "We're not in crisis — just planning ahead",
    opensTab: 'early-signs',
  },
];

export interface Q2Option {
  id: string;
  label: string;
  moduleId: string;
}

export const Q2_OPTIONS: Record<string, Q2Option[]> = {
  A: [
    {
      id: 'A1',
      label: "I'm being told we have to leave and I need to fight it or buy time",
      moduleId: 'MOD-07',
    },
    {
      id: 'A2',
      label: "We're being moved/transferred to a different setting",
      moduleId: 'MOD-24',
    },
  ],
  B: [
    {
      id: 'B1',
      label: 'A fall already happened and I need it investigated',
      moduleId: 'MOD-18',
    },
    {
      id: 'B2',
      label: "I'm worried about falling before it happens",
      moduleId: 'MOD-05',
    },
    {
      id: 'B3',
      label: "There's a bedsore or pressure wound",
      moduleId: 'MOD-04',
    },
    {
      id: 'B4',
      label: "There's a skin tear or bruising from being handled roughly",
      moduleId: 'MOD-17',
    },
    {
      id: 'B5',
      label: "There's a wound that's infected or not healing",
      moduleId: 'MOD-09',
    },
  ],
  C: [
    {
      id: 'C1',
      label: 'They seem over-sedated or drugged without our consent',
      moduleId: 'MOD-03',
    },
    {
      id: 'C2',
      label: 'Wrong dose, missed doses, or medication mix-ups',
      moduleId: 'MOD-06',
    },
    {
      id: 'C3',
      label: 'Physical restraints — bed rails, belts, chair straps',
      moduleId: 'MOD-15',
    },
  ],
  D: [
    {
      id: 'D1',
      label: 'Signs of dehydration',
      moduleId: 'MOD-08',
    },
    {
      id: 'D2',
      label: 'Weight loss or not being fed properly',
      moduleId: 'MOD-11',
    },
    {
      id: 'D3',
      label: 'Incontinence care problems or repeated UTIs',
      moduleId: 'MOD-14',
    },
  ],
  E: [
    {
      id: 'E1',
      label: "Charges I didn't agree to or can't get explained",
      moduleId: 'MOD-10',
    },
    {
      id: 'E2',
      label: 'Hidden fees or confusing contract terms',
      moduleId: 'MOD-16',
    },
    {
      id: 'E3',
      label: 'Money or assets being taken or pressured away',
      moduleId: 'MOD-21',
    },
  ],
  F: [
    {
      id: 'F1',
      label: 'I need to file a formal incident report',
      moduleId: 'MOD-13',
    },
    {
      id: 'F2',
      label: 'Our rights, privacy, or dignity are being violated',
      moduleId: 'MOD-22',
    },
    {
      id: 'F3',
      label: "This keeps happening — it's a pattern, not a one-off",
      moduleId: 'MOD-23',
    },
  ],
  G: [
    {
      id: 'G1',
      label: 'Unsafe conditions in their current home before a move',
      moduleId: 'MOD-01',
    },
    {
      id: 'G2',
      label: 'Wheelchair/walker or mobility equipment concerns',
      moduleId: 'MOD-02',
    },
    {
      id: 'G3',
      label: 'Building accessibility — ramps, doors, bathroom setup',
      moduleId: 'MOD-12',
    },
    {
      id: 'G4',
      label: 'Being denied physical or occupational therapy',
      moduleId: 'MOD-19',
    },
    {
      id: 'G5',
      label: 'Risk of wandering or leaving unsupervised',
      moduleId: 'MOD-20',
    },
  ],
};

export const Q3_ADDRESSEES = [
  'Administrator',
  'Business Office / Billing',
  'Social Services Director',
  'Medical Director',
  'Director of Nursing',
  'State Licensing Agency / Ombudsman',
  'Medicare Advantage Plan / QIO',
] as const;

export type Q3Addressee = (typeof Q3_ADDRESSEES)[number];

export interface ModuleData {
  id: string;
  name: string;
  track: string;
  urgency: 'high' | 'medium' | 'low';
  description: string;
  scripts: Record<Q3Addressee, string>;
}

export const MODULES: Record<string, ModuleData> = {
  'MOD-01': {
    id: 'MOD-01',
    name: 'Hoarding Remediation',
    track: 'G',
    urgency: 'medium',
    description:
      'Assessment and remediation plan for hazardous hoarding conditions in the home that present fall, fire, and hygiene risks prior to any care transition.',
    scripts: {
      Administrator:
        'We are requesting a formal environmental safety assessment before any placement decision is finalized. Documented hoarding conditions in the current home present measurable fall and health risks that must be addressed as part of care planning.',
      'Business Office / Billing':
        'Any transition fees or deposits collected must reflect that environmental remediation is a necessary condition of this move. We request written disclosure of which services cover home preparation and cleanup.',
      'Social Services Director':
        'We need a coordinated home remediation and transition plan from your department. Your role includes facilitating referrals to environmental safety services before any placement move is authorized.',
      'Medical Director':
        'The current home environment presents documented respiratory and fall hazards. We request a written clinical clearance protocol tied to remediation milestones before any discharge recommendation is signed.',
      'Director of Nursing':
        "Please document this resident's home environment risk in the active care plan. Nursing staff must be informed of hazardous home conditions affecting discharge safety.",
      'State Licensing Agency / Ombudsman':
        'We are notifying your office of documented hoarding conditions affecting safe discharge planning for this resident. We request guidance on applicable environmental safety standards and resident protection protocols.',
      'Medicare Advantage Plan / QIO':
        'We are requesting coverage review for home safety modification services as a precondition of discharge for this beneficiary. Current conditions do not meet safe discharge standards without environmental intervention.',
    },
  },
  'MOD-02': {
    id: 'MOD-02',
    name: 'Mobility Aid Safety',
    track: 'G',
    urgency: 'medium',
    description:
      'Documentation and advocacy for wheelchair, walker, and mobility equipment that is improperly fitted, in poor repair, or creating documented fall and injury exposure.',
    scripts: {
      Administrator:
        'We are formally documenting mobility aid safety deficiencies for this resident. The current equipment does not meet federal care standards and presents an active fall and injury risk requiring immediate correction.',
      'Business Office / Billing':
        'We are disputing any charges for mobility aid rental or maintenance where equipment is non-functional or improperly fitted. Please provide itemized equipment records for our review.',
      'Social Services Director':
        "We request a written mobility equipment assessment and replacement plan from your department. Advocacy for proper aid fitting falls within your scope under the resident's current care plan.",
      'Medical Director':
        "This resident's mobility aids are clinically inappropriate for their current condition. We request a formal physician order for updated equipment assessment and written authorization for replacement.",
      'Director of Nursing':
        "We request formal documentation of this mobility aid safety concern in the care plan and an immediate nursing review of this resident's transfer and ambulation equipment.",
      'State Licensing Agency / Ombudsman':
        'We are reporting a mobility aid safety deficiency at this facility. Despite family notification, no corrective action has been taken and the resident remains at elevated fall risk. We request an inspection.',
      'Medicare Advantage Plan / QIO':
        'We are requesting prior authorization for replacement mobility equipment for this beneficiary. The current aids are medically inadequate and a physician order for replacement is pending facility cooperation.',
    },
  },
  'MOD-03': {
    id: 'MOD-03',
    name: 'Anti-Psychotic Reduction',
    track: 'C',
    urgency: 'high',
    description:
      'Formal challenge to the unauthorized or inappropriate use of antipsychotic medications for sedation or behavioral management without documented clinical justification or family consent.',
    scripts: {
      Administrator:
        'We are formally objecting to the administration of antipsychotic medications to this resident without our documented consent. This practice may violate CMS regulations on unnecessary medications and we are requesting immediate review.',
      'Business Office / Billing':
        'We are disputing all charges associated with antipsychotic medications administered without our consent or clinical justification. Please provide complete medication billing records for the past 90 days.',
      'Social Services Director':
        'We are requesting a care conference to address antipsychotic medication use for this resident. Your role includes facilitating family communication and ensuring psychosocial alternatives were explored before pharmacological intervention.',
      'Medical Director':
        'We are formally requesting documentation of the clinical justification for antipsychotic use for this resident, including diagnosis, behavioral indicators, and evidence that non-pharmacological interventions were attempted first.',
      'Director of Nursing':
        'We request a complete medication administration record review and documentation of behavioral observations that triggered antipsychotic orders for this resident. We expect written acknowledgment within 72 hours.',
      'State Licensing Agency / Ombudsman':
        'We are filing a complaint regarding the unauthorized use of antipsychotic medications for chemical restraint of this resident. This may constitute a federal regulatory violation under CMS unnecessary medication standards.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a Quality Improvement Organization review of antipsychotic medication orders for this beneficiary. The prescribing pattern does not align with CMS safe prescribing guidelines for long-term care residents.',
    },
  },
  'MOD-04': {
    id: 'MOD-04',
    name: 'Pressure Injury Prevention',
    track: 'B',
    urgency: 'high',
    description:
      'Formal documentation and intervention framework for pressure injuries (bedsores), including staging, wound protocols, repositioning schedules, and regulatory reporting obligations.',
    scripts: {
      Administrator:
        "We are formally documenting a pressure injury that developed under your facility's care. This constitutes a potential regulatory deficiency and we are requesting immediate written documentation of wound staging, treatment plan, and prevention protocols.",
      'Business Office / Billing':
        'We are requesting itemized billing records for all wound care services provided. We will not authorize additional charges until a written wound care plan with measurable healing milestones is provided.',
      'Social Services Director':
        'We request that this pressure injury be formally entered into the care plan and that family communications are updated weekly with wound status reports. Your department is responsible for coordinating this documentation.',
      'Medical Director':
        'We request a written physician assessment of this pressure injury, including clinical staging, treatment orders, and documentation of whether this wound was present on admission or developed under facility care.',
      'Director of Nursing':
        'We are formally requesting the complete wound care record for this resident, including turn-and-reposition logs, pressure-relief equipment documentation, and nursing notes from the date of injury discovery to present.',
      'State Licensing Agency / Ombudsman':
        "We are reporting a Stage [_] pressure injury that developed under facility care for this resident. We request a regulatory inspection and review of this facility's pressure injury prevention and wound care protocols.",
      'Medicare Advantage Plan / QIO':
        'We are reporting a pressure injury occurrence for review by your quality improvement program. This wound may meet the threshold for a reportable adverse event under CMS hospital-acquired condition guidelines.',
    },
  },
  'MOD-05': {
    id: 'MOD-05',
    name: 'Fall Risk Safety',
    track: 'B',
    urgency: 'high',
    description:
      'Proactive fall prevention documentation, risk assessment demands, and intervention requirements before an injury occurs — including bed alarms, non-slip protocols, and staffing thresholds.',
    scripts: {
      Administrator:
        'We are formally documenting fall risk concerns for this resident and requesting written confirmation that a current fall risk assessment has been completed, documented in the care plan, and that appropriate interventions are active.',
      'Business Office / Billing':
        'We request billing disclosure for fall prevention equipment and monitoring in use for this resident. Any future fall-related injury charges will be contested if documented prevention protocols were not in place.',
      'Social Services Director':
        "Please document in the care plan that family has formally raised fall risk concerns. We request written confirmation of the fall prevention measures in place and the family's role in monitoring.",
      'Medical Director':
        "We request a written physician-ordered fall risk assessment for this resident using a validated tool. We also request documentation of any clinical risk factors — medications, diagnoses, mobility — contributing to this resident's fall risk.",
      'Director of Nursing':
        'We are requesting the current fall risk assessment score, active fall prevention interventions, and documentation of any recent near-misses or environmental hazards identified for this resident.',
      'State Licensing Agency / Ombudsman':
        'We are documenting a formal fall safety concern for this resident with your office. We request information on how to properly report an unaddressed fall risk and what interventions facilities are required to provide.',
      'Medicare Advantage Plan / QIO':
        "We are requesting a quality of care review for this beneficiary's fall risk management. Current prevention protocols appear inadequate given the resident's documented risk level.",
    },
  },
  'MOD-06': {
    id: 'MOD-06',
    name: 'Medication Safety',
    track: 'C',
    urgency: 'high',
    description:
      'Documentation and intervention framework for medication errors including missed doses, wrong medications, wrong dosages, timing failures, and pharmacy communication breakdowns.',
    scripts: {
      Administrator:
        'We are formally reporting a medication error involving this resident and requesting written incident documentation, root cause analysis, and corrective action. Failure to document may constitute a regulatory violation.',
      'Business Office / Billing':
        'We are disputing charges for medications that were either not administered or administered incorrectly. Please provide complete medication administration records (MARs) for the disputed period.',
      'Social Services Director':
        "We request that medication safety concerns be formally entered into this resident's care plan and that family communication protocols are updated to include medication change notifications.",
      'Medical Director':
        "We request a formal physician review of this resident's medication administration record. Specifically, we need written confirmation of who authorized the current medication regimen and that dosages are clinically appropriate.",
      'Director of Nursing':
        'We are requesting the complete medication administration record (MAR) for this resident for the past 30 days, including all nursing notes related to medication administration, errors, and omissions.',
      'State Licensing Agency / Ombudsman':
        "We are filing a complaint regarding medication errors affecting this resident. The errors have not been properly documented or reported, and we are requesting a licensing inspection of this facility's pharmacy and medication protocols.",
      'Medicare Advantage Plan / QIO':
        'We are requesting a medication safety review for this beneficiary under your quality oversight program. Documented medication errors may constitute a reportable adverse event under CMS quality standards.',
    },
  },
  'MOD-07': {
    id: 'MOD-07',
    name: 'Eviction Defense',
    track: 'A',
    urgency: 'high',
    description:
      'Formal legal defense framework against unlawful discharge or involuntary transfer notices — including statutory notice requirements, appeal rights, and 30-day stay procedures.',
    scripts: {
      Administrator:
        "This discharge notice violates 42 CFR §483.15 and your facility's state licensing obligations. We are formally requesting a 30-day stay of this action and a written care conference within 5 business days.",
      'Business Office / Billing':
        'The financial basis cited for this discharge does not meet the legal threshold required under state regulations. We are requesting itemized billing documentation and formal review of all charges cited as justification.',
      'Social Services Director':
        'Your role under the Nursing Home Reform Act requires facilitation of a compliant discharge planning process. We are formally requesting a care conference and a written discharge plan that meets all federal notification requirements.',
      'Medical Director':
        "The clinical justification cited in this discharge notice does not align with the resident's current medical record. We request a written physician opinion and formal review before any transfer proceeds.",
      'Director of Nursing':
        'The nursing care record does not support the clinical rationale cited for this discharge. We are requesting a full nursing assessment review and a 30-day hold on this transfer pending resolution.',
      'State Licensing Agency / Ombudsman':
        'We are filing a formal objection to an unlawful discharge notice issued by this facility. The notice fails to meet the 30-day advance notice requirement and lacks proper clinical documentation as required under state law.',
      'Medicare Advantage Plan / QIO':
        "We are requesting a QIO review of this discharge decision. The facility's notice does not meet CMS discharge planning standards and may constitute a premature discharge of a Medicare-eligible beneficiary.",
    },
  },
  'MOD-08': {
    id: 'MOD-08',
    name: 'Hydration Management',
    track: 'D',
    urgency: 'high',
    description:
      'Documentation and intervention protocol for dehydration signs in care home residents — including daily intake tracking requirements, physician notification obligations, and regulatory thresholds.',
    scripts: {
      Administrator:
        'We are formally documenting dehydration concerns for this resident and requesting written confirmation that daily fluid intake is being tracked, documented, and reviewed against physician-ordered minimums.',
      'Business Office / Billing':
        'We are requesting itemized charges for hydration-related care and supplies. We will contest any charges if documentation shows daily fluid intake goals were not being met.',
      'Social Services Director':
        'We request that hydration monitoring be formally entered into the care plan with measurable daily goals. Family should receive weekly updates on intake trends for this resident.',
      'Medical Director':
        'We request written physician orders specifying minimum daily fluid intake for this resident, along with documentation of any lab values indicating dehydration risk. A physician notification protocol should be in place.',
      'Director of Nursing':
        'We are requesting 30 days of intake and output logs for this resident. We also request documentation of any nursing assessments triggered by dehydration indicators such as decreased urine output, dry mucous membranes, or altered mentation.',
      'State Licensing Agency / Ombudsman':
        "We are reporting dehydration-related neglect concerns for this resident. Documentation and daily monitoring requirements appear to have been unmet, and we request a regulatory review of this facility's hydration protocols.",
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality review of hydration management for this beneficiary. Dehydration in a long-term care setting may constitute a preventable adverse event under CMS quality indicators.',
    },
  },
  'MOD-09': {
    id: 'MOD-09',
    name: 'Wound Care',
    track: 'B',
    urgency: 'high',
    description:
      'Clinical and regulatory documentation for infected or non-healing wounds — including wound culture requirements, antibiotic protocols, specialist referrals, and reporting thresholds.',
    scripts: {
      Administrator:
        'We are formally documenting a non-healing or infected wound for this resident and requesting written evidence of wound culture orders, current treatment protocols, and any specialist referral decisions made.',
      'Business Office / Billing':
        'We are requesting itemized billing for all wound care services. We will not authorize additional wound care charges without a written treatment plan showing measurable progress milestones.',
      'Social Services Director':
        'Please document wound care concerns in the care plan and ensure family receives written status updates no less than weekly until this wound resolves.',
      'Medical Director':
        "We request written physician orders for wound culture, antibiotic therapy where indicated, and formal wound specialist referral. We also request documentation of the wound's clinical status and expected healing timeline.",
      'Director of Nursing':
        'We are requesting complete wound care documentation including wound measurement records, dressing change logs, nursing assessments, and any physician notifications triggered by wound deterioration.',
      'State Licensing Agency / Ombudsman':
        "We are reporting a wound care management failure for this resident. An infected or non-healing wound is not being properly treated or documented, and we request an inspection of this facility's wound care protocols.",
      'Medicare Advantage Plan / QIO':
        'We are requesting quality oversight review of wound care management for this beneficiary. Wound deterioration under facility care may meet the threshold for a reportable quality event under CMS guidelines.',
    },
  },
  'MOD-10': {
    id: 'MOD-10',
    name: 'Financial Billing',
    track: 'E',
    urgency: 'medium',
    description:
      'Dispute and audit framework for unauthorized charges, unexplained billing, and care home invoices that do not align with agreed services in the admission contract.',
    scripts: {
      Administrator:
        "We are formally disputing unauthorized charges on this resident's account. We request a complete itemized billing statement, copies of all signed financial agreements, and a written explanation of each disputed charge.",
      'Business Office / Billing':
        "We are requesting an immediate billing audit for this resident's account. All charges must be matched to a specific signed agreement or authorization. Any unmatched charges should be credited pending review.",
      'Social Services Director':
        "We are requesting that billing disputes be formally noted in this resident's file and that your department facilitate communication between our family and the billing office to resolve these discrepancies.",
      'Medical Director':
        "We are requesting written physician authorization records for all medically-billed services on this resident's account. We need to verify that billed services were ordered and provided.",
      'Director of Nursing':
        "We request nursing documentation to support or dispute care-related charges on this resident's billing statement. Specifically, we need documentation of services billed but disputed as not received.",
      'State Licensing Agency / Ombudsman':
        'We are reporting unauthorized billing practices affecting this resident. The facility is charging for services not agreed to in writing, and we request a licensing review of their financial disclosure practices.',
      'Medicare Advantage Plan / QIO':
        "We are requesting a billing accuracy review for this beneficiary's claims. Charges have been submitted for services that do not align with documented care records or authorized service agreements.",
    },
  },
  'MOD-11': {
    id: 'MOD-11',
    name: 'Nutrition & Weight',
    track: 'D',
    urgency: 'high',
    description:
      'Documentation and intervention framework for unexplained weight loss, inadequate nutrition, meal refusal documentation, and dietary care plan requirements.',
    scripts: {
      Administrator:
        "We are formally documenting weight loss and nutrition concerns for this resident. We request written evidence of current dietary assessment, meal intake documentation, and dietitian involvement in this resident's care plan.",
      'Business Office / Billing':
        'We are requesting itemized charges for dietary services and nutrition supplements. We will contest charges for dietary care if documentation shows nutrition goals are not being met.',
      'Social Services Director':
        "Please facilitate a dietary care conference and ensure nutrition goals are formally entered into this resident's care plan. Family should receive weight trend reports no less than monthly.",
      'Medical Director':
        "We request written physician orders addressing this resident's weight loss, including dietary goals, supplement orders, and documentation of any clinical investigations into underlying causes of weight decline.",
      'Director of Nursing':
        "We are requesting 90-day weight records, meal intake documentation, and nursing assessments related to this resident's nutrition status. We also need records of any physician notifications triggered by weight loss thresholds.",
      'State Licensing Agency / Ombudsman':
        'We are reporting a nutrition and weight management failure for this resident. Documented weight loss and inadequate meal documentation suggest neglect of dietary care standards. We request a regulatory inspection.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality of care review for nutrition management for this beneficiary. Unexplained weight loss in a long-term care setting is a CMS quality indicator requiring formal investigation.',
    },
  },
  'MOD-12': {
    id: 'MOD-12',
    name: 'ADA Accessibility',
    track: 'G',
    urgency: 'medium',
    description:
      'Compliance documentation for ADA and state accessibility requirements — including ramps, door widths, bathroom grab bars, threshold clearances, and reasonable accommodation obligations.',
    scripts: {
      Administrator:
        "We are formally documenting ADA accessibility deficiencies in this facility or home environment. These deficiencies create barriers for this resident's safe mobility and may constitute violations of applicable disability access law.",
      'Business Office / Billing':
        'We are requesting disclosure of whether accessibility modifications are included in the contract or available as billed services. Reasonable accommodations required by law should not be charged as optional upgrades.',
      'Social Services Director':
        'We request written documentation of accessibility accommodations in place for this resident and a plan for any modifications needed to meet their mobility requirements.',
      'Medical Director':
        "We request physician documentation of this resident's mobility limitations and functional needs to support our request for specific accessibility accommodations in their living environment.",
      'Director of Nursing':
        'We request a nursing environmental safety assessment documenting specific accessibility barriers affecting this resident and recommendations for modifications needed.',
      'State Licensing Agency / Ombudsman':
        "We are reporting ADA accessibility deficiencies at this facility that are affecting this resident's safe mobility. We request a compliance inspection of physical plant accessibility.",
      'Medicare Advantage Plan / QIO':
        "We are requesting a review of whether this beneficiary's environment meets the accessibility standards required under their care plan. Accessibility barriers may contribute to preventable falls and hospitalizations.",
    },
  },
  'MOD-13': {
    id: 'MOD-13',
    name: 'Incident Reporting',
    track: 'F',
    urgency: 'high',
    description:
      'Formal incident documentation framework — proper incident report filing, mandatory reporting obligations, family notification timelines, and document preservation requirements.',
    scripts: {
      Administrator:
        "We are formally requesting a copy of the incident report filed for [incident description]. We also request documentation of your facility's mandatory reporting obligations and confirmation that appropriate agencies have been notified.",
      'Business Office / Billing':
        'We are requesting that all financial charges associated with this incident be placed on hold pending resolution of the incident report. We will not authorize new charges until documentation of the incident is complete.',
      'Social Services Director':
        'We are requesting written confirmation that this incident has been properly documented in the care plan and that required family notifications were made within mandated timeframes.',
      'Medical Director':
        'We request written physician documentation of this incident, including clinical findings, any injuries sustained, treatment provided, and physician notification timeline.',
      'Director of Nursing':
        'We are requesting the complete incident report, nursing notes from the time of the incident, and documentation of any immediate nursing interventions and supervisor notifications made.',
      'State Licensing Agency / Ombudsman':
        'We are filing a formal incident report with your office regarding an event that occurred at this facility. We believe mandatory reporting obligations may not have been met and request an investigation.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality of care review of an incident involving this beneficiary. The event may meet the threshold for a reportable adverse event under CMS quality reporting requirements.',
    },
  },
  'MOD-14': {
    id: 'MOD-14',
    name: 'Incontinence / UTI Prevention',
    track: 'D',
    urgency: 'high',
    description:
      'Documentation and intervention protocol for inadequate incontinence care, repeated UTI infections, toileting schedules, hygiene practices, and catheter care compliance.',
    scripts: {
      Administrator:
        'We are formally documenting incontinence care deficiencies and a pattern of recurrent UTIs for this resident. We request written evidence of current toileting schedules, hygiene protocols, and catheter care documentation if applicable.',
      'Business Office / Billing':
        'We are requesting itemized billing for incontinence care supplies and UTI-related treatments. Charges for care not documented as provided will be disputed.',
      'Social Services Director':
        "We request that incontinence care protocols and UTI prevention measures be formally entered into this resident's care plan with family review at the next care conference.",
      'Medical Director':
        "We request written physician documentation of this resident's UTI history, current antibiotic protocols, and whether a urology or infectious disease consultation has been ordered.",
      'Director of Nursing':
        'We are requesting incontinence care logs, toileting schedule documentation, perineal hygiene protocols, and records of all UTI episodes including urinalysis results and treatment responses for the past 90 days.',
      'State Licensing Agency / Ombudsman':
        "We are reporting incontinence care neglect and a pattern of preventable UTI infections for this resident. We request a regulatory inspection of this facility's incontinence and infection control practices.",
      'Medicare Advantage Plan / QIO':
        'We are requesting quality review of UTI prevention and incontinence care management for this beneficiary. Recurrent UTIs in long-term care are a CMS quality indicator associated with inadequate care.',
    },
  },
  'MOD-15': {
    id: 'MOD-15',
    name: 'Physical Restraints',
    track: 'C',
    urgency: 'high',
    description:
      'Formal challenge and documentation framework for the use of physical restraints — including bed rails, lap belts, and positioning devices — without proper consent, clinical justification, or alternatives.',
    scripts: {
      Administrator:
        'We are formally objecting to the use of physical restraints on this resident. Federal regulations require that restraints only be used as a last resort with documented consent and clinical justification. We request all restraint orders and consent records.',
      'Business Office / Billing':
        'We are requesting documentation of any charges associated with restraint equipment or monitoring. We will contest charges for restraint use that was not properly authorized.',
      'Social Services Director':
        'We request a care conference to review the use of physical restraints for this resident. Your department is responsible for exploring and documenting all non-restraint alternatives before restraints may be authorized.',
      'Medical Director':
        'We request written physician orders justifying restraint use for this resident, including clinical diagnosis, documentation of failed alternatives, and the specific restraint type and frequency authorized.',
      'Director of Nursing':
        'We are requesting all restraint consent forms, nursing documentation of restraint application and removal, and records of regular restraint release intervals as required by federal regulations.',
      'State Licensing Agency / Ombudsman':
        'We are filing a complaint regarding the unauthorized use of physical restraints on this resident. We believe the facility has failed to meet federal consent and alternatives requirements and request an investigation.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality review of restraint use practices for this beneficiary. Physical restraint use without proper documentation and alternatives may constitute a CMS quality of care deficiency.',
    },
  },
  'MOD-16': {
    id: 'MOD-16',
    name: 'Contractual Fees',
    track: 'E',
    urgency: 'medium',
    description:
      'Documentation and dispute framework for hidden fees, contract ambiguities, rate escalation clauses, and non-disclosed charges embedded in care home admission agreements.',
    scripts: {
      Administrator:
        'We are formally disputing fees that were not disclosed or explained at the time of admission. We request a full review of all contract terms, rate escalation schedules, and fee disclosures provided during the admissions process.',
      'Business Office / Billing':
        'We are requesting written justification for all fees appearing on this account that were not explicitly listed in the signed admission agreement. Undisclosed fees will be formally disputed.',
      'Social Services Director':
        "We request that any contractual concerns be formally noted in this resident's file. We also request your department's assistance in facilitating a billing review meeting with the administrative team.",
      'Medical Director':
        'We are requesting written documentation of any medically-justified fees being charged separately from the base contract rate, including physician authorization for those services.',
      'Director of Nursing':
        'We request nursing documentation to verify that care services billed at additional contract rates were actually provided to this resident and are consistent with the care plan.',
      'State Licensing Agency / Ombudsman':
        "We are reporting undisclosed and potentially deceptive billing practices embedded in this facility's admission contract. We request a review of their financial disclosure compliance under applicable consumer protection regulations.",
      'Medicare Advantage Plan / QIO':
        "We are requesting a billing compliance review for charges billed to this beneficiary's plan. We have identified fees that appear inconsistent with the authorized service agreement and plan coverage terms.",
    },
  },
  'MOD-17': {
    id: 'MOD-17',
    name: 'Skin Tear / Rough Handling',
    track: 'B',
    urgency: 'high',
    description:
      'Documentation and reporting framework for skin tears, unexplained bruising, and injuries consistent with rough or improper handling — including abuse reporting triggers and photography protocols.',
    scripts: {
      Administrator:
        'We are formally documenting a skin tear and pattern of unexplained bruising consistent with rough handling for this resident. We request a written incident report, documentation of the injury, and a staff review.',
      'Business Office / Billing':
        'We are placing a dispute hold on wound care charges related to this skin tear until a full incident investigation is complete and documented.',
      'Social Services Director':
        'We request that this injury be formally documented in the care plan and that family is immediately notified of any future skin or bruising incidents as they occur.',
      'Medical Director':
        'We request a written physician assessment of this skin tear and bruising pattern, including clinical opinion on whether the injuries are consistent with accidental causes or rough handling.',
      'Director of Nursing':
        'We are requesting incident documentation, nursing notes from the day of the injury, transfer and repositioning logs, and the names of staff who provided hands-on care to this resident in the 24 hours before the injury was observed.',
      'State Licensing Agency / Ombudsman':
        'We are reporting a skin tear and bruising pattern for this resident that may be consistent with rough handling or abuse. We are requesting a mandatory abuse investigation and licensing inspection.',
      'Medicare Advantage Plan / QIO':
        'We are reporting a potential adverse event involving a skin injury for this beneficiary. Injuries consistent with improper handling may meet the threshold for a reportable quality event under your program.',
    },
  },
  'MOD-18': {
    id: 'MOD-18',
    name: 'Fall Investigation',
    track: 'B',
    urgency: 'high',
    description:
      'Post-fall investigation documentation framework — incident report demands, witness statements, environmental assessment, staffing records, and formal root cause analysis.',
    scripts: {
      Administrator:
        "We are formally demanding a complete fall investigation for this resident. We request the incident report, environmental assessment of the fall location, witness statements, and the assigned staff's names at the time of the fall.",
      'Business Office / Billing':
        'We are placing a dispute hold on all treatment charges resulting from this fall until a complete investigation establishes the circumstances and staff responsibility.',
      'Social Services Director':
        "We request written confirmation that this fall has been formally documented in the care plan and that the family's fall investigation requests are on record.",
      'Medical Director':
        "We request a written physician report on this resident's fall, including clinical assessment of any injuries, documentation of the physician notification timeline, and any diagnostic orders placed post-fall.",
      'Director of Nursing':
        'We are requesting the complete incident report, call logs showing staffing at the time of the fall, nursing notes from the 4 hours before and after the fall, and any fall risk reassessment completed after the incident.',
      'State Licensing Agency / Ombudsman':
        'We are filing a formal fall incident report with your office. The facility has not provided adequate documentation of this fall or conducted a thorough investigation. We request a regulatory inspection.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality of care review of this fall event for this beneficiary. Falls resulting in injury in long-term care settings are a CMS quality indicator requiring formal investigation and documentation.',
    },
  },
  'MOD-19': {
    id: 'MOD-19',
    name: 'Rehabilitation Access',
    track: 'G',
    urgency: 'medium',
    description:
      'Documentation and advocacy framework for residents denied or discontinued from physical therapy, occupational therapy, or speech therapy — including Medicare entitlement, care plan requirements, and appeal rights.',
    scripts: {
      Administrator:
        'We are formally documenting that this resident has been denied or discontinued from rehabilitation services. We request written clinical justification for this decision and documentation that all required therapy assessments were completed.',
      'Business Office / Billing':
        'We are requesting a breakdown of all rehabilitation charges billed and services actually provided. We are also requesting documentation of any coverage decisions that reduced or eliminated therapy.',
      'Social Services Director':
        "We request that therapy access concerns be formally entered into this resident's care plan. Your department should facilitate a care conference to review therapy goals and access.",
      'Medical Director':
        'We request written physician orders and clinical justification for any discontinuation of physical, occupational, or speech therapy for this resident. We also request documentation of the functional assessment used to make this decision.',
      'Director of Nursing':
        "We request nursing documentation supporting the therapy discontinuation decision, including functional decline observations, therapy attendance records, and any clinical notes related to this resident's rehabilitation goals.",
      'State Licensing Agency / Ombudsman':
        "We are reporting a denial of rehabilitation services for this resident that may not be clinically justified. We request guidance on this resident's rights to therapy access and how to formally appeal a therapy discontinuation.",
      'Medicare Advantage Plan / QIO':
        "We are requesting a coverage determination review for rehabilitation services for this beneficiary. The facility has discontinued therapy in a manner that may not meet Medicare's medical necessity standards.",
    },
  },
  'MOD-20': {
    id: 'MOD-20',
    name: 'Elopement Risk',
    track: 'G',
    urgency: 'high',
    description:
      'Pre-elopement documentation, wandering risk assessment demands, and facility security protocol review for residents at risk of leaving unsupervised — including door alarm, wander guard, and supervision requirements.',
    scripts: {
      Administrator:
        'We are formally documenting elopement risk for this resident and requesting written confirmation of the current wandering prevention protocols in place, including door alarm systems, wander guard devices, and supervision schedules.',
      'Business Office / Billing':
        'We request itemized billing for any wander guard or wandering prevention equipment being charged for this resident, along with documentation that these devices are operational and in use.',
      'Social Services Director':
        "Please document this resident's elopement risk formally in the care plan and ensure that family is immediately notified of any elopement attempts or near-misses.",
      'Medical Director':
        "We request a written physician assessment of this resident's cognitive status and elopement risk level, including any clinical recommendations for wandering prevention interventions.",
      'Director of Nursing':
        'We are requesting documentation of the elopement risk assessment score for this resident, current prevention protocols in place, and any incident reports related to attempted or actual elopements.',
      'State Licensing Agency / Ombudsman':
        'We are documenting an unaddressed elopement risk for this resident with your office. We request information on the safety and security standards facilities are required to maintain for at-risk residents.',
      'Medicare Advantage Plan / QIO':
        'We are requesting a quality of care review of elopement risk management for this beneficiary. Inadequate wandering prevention for a cognitively impaired resident may constitute a preventable safety event.',
    },
  },
  'MOD-21': {
    id: 'MOD-21',
    name: 'Financial Exploitation',
    track: 'E',
    urgency: 'high',
    description:
      'Formal reporting and documentation framework for suspected financial exploitation — including asset transfers under pressure, unauthorized account access, and coercive financial practices by facility staff or administrators.',
    scripts: {
      Administrator:
        'We are formally reporting suspected financial exploitation of this resident. We request an immediate review of all financial transactions made by or on behalf of this resident since admission, and we are preserving all related records.',
      'Business Office / Billing':
        "We are placing a formal dispute and hold on all financial transactions on this resident's account pending a financial exploitation investigation. No further withdrawals or transfers should be processed.",
      'Social Services Director':
        "We request that financial exploitation concerns be formally documented in this resident's file and that your department report this matter to Adult Protective Services as required by mandatory reporter obligations.",
      'Medical Director':
        "We request documentation of this resident's cognitive capacity at the time of any disputed financial decisions to assess whether they were capable of giving informed financial consent.",
      'Director of Nursing':
        "We request nursing documentation of this resident's cognitive status, any observed unusual financial interactions with staff, and any resident requests or complaints related to their finances.",
      'State Licensing Agency / Ombudsman':
        'We are filing a formal financial exploitation complaint involving this resident. We believe facility staff or administration may have facilitated or enabled unauthorized financial transactions. We request an immediate investigation.',
      'Medicare Advantage Plan / QIO':
        'We are notifying your program of potential financial exploitation of this beneficiary. While this is primarily a state adult protective services matter, we request coordination of any quality of care concerns related to the exploitation.',
    },
  },
  'MOD-22': {
    id: 'MOD-22',
    name: 'Resident Rights',
    track: 'F',
    urgency: 'high',
    description:
      'Documentation and enforcement framework for resident rights violations — including privacy, dignity, visitation, mail, communication, grievance access, and freedom from retaliation.',
    scripts: {
      Administrator:
        'We are formally documenting a resident rights violation for this resident. Federal regulations under 42 CFR §483.10 guarantee specific rights that we believe have been violated. We request written acknowledgment and corrective action.',
      'Business Office / Billing':
        'We are requesting that this resident rights violation be formally noted in all relevant financial and administrative records, and that any fees charged during the period of violation be reviewed for appropriateness.',
      'Social Services Director':
        "We request formal documentation of this resident rights violation in the care plan and written confirmation of this resident's grievance rights, including how to file a formal grievance without retaliation.",
      'Medical Director':
        "We request written documentation of whether this resident rights violation has any clinical dimensions — including whether staff behavior has affected this resident's physical or psychological wellbeing.",
      'Director of Nursing':
        'We request nursing documentation of any staff conduct related to this resident rights violation, including any complaints or observations made by nursing staff.',
      'State Licensing Agency / Ombudsman':
        "We are filing a formal resident rights violation complaint with your office. We believe the facility has violated this resident's federally guaranteed rights and request a licensing investigation.",
      'Medicare Advantage Plan / QIO':
        'We are reporting a resident rights concern for this beneficiary that may affect their quality of care under your plan. We request guidance on how quality of care concerns intersecting with rights violations should be reported.',
    },
  },
  'MOD-23': {
    id: 'MOD-23',
    name: 'Incident Pattern Management',
    track: 'F',
    urgency: 'high',
    description:
      'Documentation framework for recurring or systemic incidents — building a formal pattern record for regulatory escalation when a single incident has become a repeating problem.',
    scripts: {
      Administrator:
        'We are formally documenting a pattern of recurring incidents for this resident that indicate a systemic care failure rather than an isolated event. We request a written corrective action plan addressing root causes, not individual incidents.',
      'Business Office / Billing':
        'We are formally requesting a billing audit for the period in which recurring incidents have occurred. Any care billed during this period will be reviewed against documentation of actual care delivery.',
      'Social Services Director':
        'We request that the pattern of recurring incidents be formally documented in the care plan and that a care conference be scheduled specifically to address systemic causes and prevention strategies.',
      'Medical Director':
        'We request a written physician assessment of whether the pattern of recurring incidents has had a clinical impact on this resident, and whether any diagnostic or treatment changes are warranted.',
      'Director of Nursing':
        'We are requesting a compiled record of all incident reports, nursing notes, and care plan entries related to each recurring incident in this pattern. We need documentation showing whether corrective actions were taken after each event.',
      'State Licensing Agency / Ombudsman':
        'We are filing a pattern-of-care complaint with your office. Multiple documented incidents of the same type indicate a systemic failure at this facility that exceeds the threshold for a single incident complaint.',
      'Medicare Advantage Plan / QIO':
        'We are requesting an escalated quality of care review for this beneficiary based on a pattern of recurring incidents. Repeated events of the same type may indicate a systemic quality failure at this facility.',
    },
  },
  'MOD-24': {
    id: 'MOD-24',
    name: 'Discharge Transition',
    track: 'A',
    urgency: 'high',
    description:
      'Compliant discharge and transfer management framework — ensuring proper planning, notification timelines, receiving facility standards review, and continuity of care documentation.',
    scripts: {
      Administrator:
        'We are formally requesting a compliant discharge transition plan for this resident. The plan must meet all federal requirements under 42 CFR §483.21, including written notice, care conference, and receiving facility documentation.',
      'Business Office / Billing':
        'We are requesting a full financial accounting of costs associated with this discharge transition, including any fees for transfer coordination, and written confirmation of how the final billing period will be calculated.',
      'Social Services Director':
        "We request a formal discharge planning conference with family participation, a written discharge summary, and documentation of the receiving facility's compliance record and bed availability.",
      'Medical Director':
        "We request written physician authorization for this transfer, including documentation that the receiving facility can meet this resident's current medical needs and that continuity of care has been arranged.",
      'Director of Nursing':
        'We request a complete nursing discharge summary, medication reconciliation document, and wound care or treatment continuity instructions to be provided to the receiving facility before transfer.',
      'State Licensing Agency / Ombudsman':
        'We are requesting guidance on compliant discharge and transfer standards from your office. We have concerns that the discharge transition plan being offered does not meet federal or state requirements.',
      'Medicare Advantage Plan / QIO':
        "We are requesting a discharge planning compliance review for this beneficiary's transfer. We need confirmation that the receiving facility meets quality standards and that continuity of care documentation will be transferred.",
    },
  },
};
