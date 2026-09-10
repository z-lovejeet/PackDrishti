import { ViolationRecord } from '../types';

export const MOCK_VIOLATIONS: ViolationRecord[] = [
  {
    id: 'viol-rec-101',
    violationCode: 'VIO-2026-DEL-041',
    productName: 'Parle-G Gold Glucose Biscuits 800g',
    brand: 'Parle Products Pvt. Ltd.',
    category: 'Food & Beverage',
    ruleReference: 'Rule 6(1)(e) Proviso & Rule 7 Table-I',
    violationType: 'Missing Unit Sale Price & Deficient Font Height',
    severity: 'high',
    dateDetected: '15-Aug-2026',
    status: 'Notice Issued',
    assignedOfficer: 'Sh. Rajesh Kumar Sharma',
    location: 'Sadar Bazaar, Delhi',
    timeline: [
      { date: '15-Aug-2026 14:35', action: 'Violation Detected & Verified by MetroScan', by: 'Sh. Rajesh Kumar Sharma', note: 'Automated scan detected USP omission and 1.9mm font height on 148 cm² PDP.' },
      { date: '16-Aug-2026 10:00', action: 'Field Inspection Case File Created', by: 'Sh. Rajesh Kumar Sharma' },
      { date: '18-Aug-2026 11:30', action: 'Show Cause Notice Issued under Sec 36(1)', by: 'State Controller of Legal Metrology, Delhi', note: 'Notice Ref: DL/LM/2026/SCN-881' }
    ]
  },
  {
    id: 'viol-rec-102',
    violationCode: 'VIO-2026-DEL-040',
    productName: 'Catch Black Pepper Sprinkler 100g',
    brand: 'DS Group (Dharampal Satyapal Ltd.)',
    category: 'Food & Beverage',
    ruleReference: 'Rule 13(1) of LMPC Rules, 2011',
    violationType: 'Non-Standard Metric Abbreviation ("gms")',
    severity: 'medium',
    dateDetected: '11-Aug-2026',
    status: 'Under Review',
    assignedOfficer: 'Sh. Rajesh Kumar Sharma',
    location: 'Karol Bagh, Delhi',
    timeline: [
      { date: '11-Aug-2026 10:20', action: 'Detected via MetroScan mobile field scanner', by: 'Sh. Rajesh Kumar Sharma' },
      { date: '12-Aug-2026 15:00', action: 'Assigned to Legal Metrology Officer Zone-1 for hearing', by: 'Superintendent LMO' }
    ]
  },
  {
    id: 'viol-rec-103',
    violationCode: 'VIO-2026-MUM-019',
    productName: 'Everest Meat Masala 100g',
    brand: 'Everest Food Products Pvt. Ltd.',
    category: 'Food & Beverage',
    ruleReference: 'Rule 18(5) of LMPC Rules',
    violationType: 'Sticker Overprinted on Pre-printed MRP',
    severity: 'high',
    dateDetected: '05-Aug-2026',
    status: 'Notice Issued',
    assignedOfficer: 'Smt. Priya Nair',
    location: 'Crawford Market, Mumbai',
    timeline: [
      { date: '05-Aug-2026 13:10', action: 'Field seizure of 24 units with altered price stickers', by: 'Smt. Priya Nair' },
      { date: '06-Aug-2026 14:00', action: 'Notice issued under Section 36(1) & Rule 18(5)', by: 'Controller of LM, Maharashtra' }
    ]
  },
  {
    id: 'viol-rec-104',
    violationCode: 'VIO-2026-BLR-088',
    productName: 'Imported Bluetooth Headphones Model X2',
    brand: 'Apex Electronics Imports',
    category: 'Electronics',
    ruleReference: 'Rule 6(1)(aa) & Rule 27',
    violationType: 'Missing Country of Origin & Importer Registration',
    severity: 'high',
    dateDetected: '02-Aug-2026',
    status: 'Open',
    assignedOfficer: 'Sh. Arun Patel',
    location: 'SP Road, Bengaluru',
    timeline: [
      { date: '02-Aug-2026 16:20', action: 'Physical package lacks country of origin and importer LMPC registration number', by: 'Sh. Arun Patel' }
    ]
  },
  {
    id: 'viol-rec-105',
    violationCode: 'VIO-2026-KOL-054',
    productName: 'Patanjali Dant Kanti 200g',
    brand: 'Patanjali Ayurved Ltd.',
    category: 'Personal Care',
    ruleReference: 'Rule 6(1)(n)',
    violationType: 'Omission of Consumer Care Email Address',
    severity: 'low',
    dateDetected: '28-Jul-2026',
    status: 'Resolved',
    assignedOfficer: 'Sh. Subir Chatterjee',
    location: 'Barabazar, Kolkata',
    timeline: [
      { date: '28-Jul-2026 11:00', action: 'Detected during routine market inspection', by: 'Sh. Subir Chatterjee' },
      { date: '05-Aug-2026 10:00', action: 'Manufacturer submitted revised artwork proof', by: 'Compliance Liaison' },
      { date: '10-Aug-2026 12:00', action: 'Improvement Notice cured; case marked resolved', by: 'Sh. Subir Chatterjee' }
    ]
  },
  {
    id: 'viol-rec-106',
    violationCode: 'VIO-2026-DEL-032',
    productName: 'Sunfeast Dark Fantasy Choco Fills 300g',
    brand: 'ITC Limited',
    category: 'Food & Beverage',
    ruleReference: 'Rule 7 Table-I',
    violationType: 'Net Quantity Font Height Deficient (1.8mm vs 2.5mm)',
    severity: 'medium',
    dateDetected: '25-Jul-2026',
    status: 'Resolved',
    assignedOfficer: 'Sh. Rajesh Kumar Sharma',
    location: 'Connaught Place, New Delhi',
    timeline: [
      { date: '25-Jul-2026', action: 'Notice issued', by: 'Sh. Rajesh Kumar Sharma' },
      { date: '08-Aug-2026', action: 'Compounding fee paid under Section 48; new batch compliant', by: 'ITC Legal Representative' }
    ]
  }
];
