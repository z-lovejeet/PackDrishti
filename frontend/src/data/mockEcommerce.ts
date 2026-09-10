import { EcommerceAuditItem } from '../types';

export const MOCK_ECOMMERCE_AUDITS: EcommerceAuditItem[] = [
  {
    id: 'ecom-001',
    url: 'https://www.amazon.in/dp/B07T4XYZ12/fortune-sunflower-oil-1l',
    productTitle: 'Fortune Sunlite Refined Sunflower Oil, 1L Pouch',
    platform: 'Amazon.in',
    scannedAt: '15-Aug-2026 12:40 IST',
    status: 'violation',
    declarations: [
      { rule: 'Rule 6(10)', name: 'Product Name & Generic Description', status: 'present', details: 'Displayed clearly in listing headline.' },
      { rule: 'Rule 6(10)', name: 'Net Quantity', status: 'present', details: 'Declared as "1 Litre" in product specification table.' },
      { rule: 'Rule 6(10)', name: 'Maximum Retail Price (MRP)', status: 'present', details: 'MRP ₹165.00 displayed inclusive of all taxes.' },
      { rule: 'Rule 6(10) & Rule 6(1)(e)', name: 'Unit Sale Price (USP)', status: 'missing', details: 'Omitted on digital listing page. Required: ₹ 165.00 / L.' },
      { rule: 'Rule 6(10) & Rule 6(1)(a)', name: 'Complete Manufacturer Postal Address', status: 'incomplete', details: 'Only "Ahmedabad, Gujarat" shown; building, street, and 6-digit PIN code missing.' },
      { rule: 'Rule 6(10) & Rule 6(1)(aa)', name: 'Country of Origin Declaration', status: 'present', details: 'Declared as "India".' },
      { rule: 'Rule 6(10A)', name: 'Searchable & Sortable Country Filter', status: 'present', details: 'Amazon platform supports country of origin search facets.' },
      { rule: 'Rule 6(10) & Rule 6(1)(n)', name: 'Consumer Care Contact', status: 'incomplete', details: 'Customer service phone provided, but email address is absent from seller detail tab.' },
      { rule: 'Rule 6(10) Proviso', name: 'Month & Year of Manufacture', status: 'exempt', details: 'Statutorily exempted from digital listing displays due to rapid batch turns.' },
    ]
  },
  {
    id: 'ecom-002',
    url: 'https://www.flipkart.com/tata-salt-iodized/p/itm12345678',
    productTitle: 'Tata Salt Vacuum Evaporated Iodised Salt 1 kg',
    platform: 'Flipkart',
    scannedAt: '14-Aug-2026 16:15 IST',
    status: 'compliant',
    declarations: [
      { rule: 'Rule 6(10)', name: 'Generic Name', status: 'present', details: 'Vacuum Evaporated Iodised Salt' },
      { rule: 'Rule 6(10)', name: 'Net Quantity', status: 'present', details: '1 kg' },
      { rule: 'Rule 6(10)', name: 'MRP', status: 'present', details: '₹ 28.00 (Incl. of all taxes)' },
      { rule: 'Rule 6(10)', name: 'Unit Sale Price (USP)', status: 'present', details: '₹ 28.00 / kg conspicuously displayed.' },
      { rule: 'Rule 6(10)', name: 'Manufacturer Full Address', status: 'present', details: '1, Bishop Lefroy Road, Kolkata 700020' },
      { rule: 'Rule 6(10)', name: 'Country of Origin', status: 'present', details: 'India' },
      { rule: 'Rule 6(10A)', name: 'Country Filter Compliance', status: 'present', details: 'Filter facet active.' },
      { rule: 'Rule 6(10)', name: 'Consumer Care', status: 'present', details: 'Toll-free 1800-345-1720 & care@tataconsumer.com both present.' },
      { rule: 'Rule 6(10) Proviso', name: 'Date of Mfg', status: 'exempt', details: 'Exempted for e-commerce.' },
    ]
  },
  {
    id: 'ecom-003',
    url: 'https://blinkit.com/prn/haldirams-aloo-bhujia/prid/41920',
    productTitle: "Haldiram's Nagpur Aloo Bhujia 400 g",
    platform: 'Blinkit',
    scannedAt: '12-Aug-2026 18:30 IST',
    status: 'compliant',
    declarations: [
      { rule: 'Rule 6(10)', name: 'Generic Name', status: 'present', details: 'Extruded potato snack (Bhujia)' },
      { rule: 'Rule 6(10)', name: 'Net Quantity', status: 'present', details: '400 g' },
      { rule: 'Rule 6(10)', name: 'MRP', status: 'present', details: '₹ 90.00' },
      { rule: 'Rule 6(10)', name: 'Unit Sale Price (USP)', status: 'present', details: '₹ 0.23 / g displayed next to price.' },
      { rule: 'Rule 6(10)', name: 'Manufacturer Address', status: 'present', details: 'Plot No. 145/146, Old Pardi Naka, Nagpur 440008' },
      { rule: 'Rule 6(10)', name: 'Country of Origin', status: 'present', details: 'India' },
      { rule: 'Rule 6(10)', name: 'Consumer Care', status: 'present', details: 'care@haldirams.com' },
      { rule: 'Rule 6(10) Proviso', name: 'Date of Mfg', status: 'exempt', details: 'Exempted.' },
    ]
  }
];
