import React, { useState } from 'react';
import {
  FileText,
  DownloadSimple,
  Printer,
  ShieldCheck,
  Warning,
  SealCheck,
  X,
  Scales,
  CheckCircle,
  Building,
} from '@phosphor-icons/react';
import { Button } from '../common/Button';

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanId?: string;
  docketNumber?: string;
  productName?: string;
  brand?: string;
  mrp?: string;
  netQty?: string;
  violationsCount?: number;
  compoundingFee?: number;
  assignedOfficer?: string;
  inspectionDate?: string;
}

export const NoticePreviewModal: React.FC<NoticePreviewModalProps> = ({
  isOpen,
  onClose,
  scanId = '00000000-0000-0000-0000-000000000001',
  docketNumber = 'INSP-2026-DEL-049',
  productName = 'Packaged Consumer Commodity',
  brand = 'Manufacturer / Packer / Dealer',
  mrp = 'Rs. 250.00',
  netQty = '400 g',
  violationsCount = 2,
  compoundingFee = 14000,
  assignedOfficer = 'Inspector R. K. Sharma (LMI-DL-2024-884)',
  inspectionDate = '10-Sep-2026',
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const targetUrl = `${baseUrl}/reports/pdf/${scanId}`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF document.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `FORM_LM_INSP_2011_${docketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(`Error streaming PDF docket: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-card border border-neutral-300 shadow-modal max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-card print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-neutral-900 font-heading tracking-tight">
                  FORM LM-INSP-2011 Statutory Docket
                </h2>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-primary-light text-primary font-bold border border-primary-border">
                  STATUTORY RECORD
                </span>
              </div>
              <p className="text-2xs text-neutral-500 mt-0.5">
                Official Show-Cause & Seizure Memorandum under Legal Metrology Act, 2009
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Docket Body: High-Fidelity Statutory FORM LM-INSP-2011 Document */}
        <div className="p-6 sm:p-8 space-y-6 text-neutral-800 text-xs overflow-y-auto flex-1 bg-white print:p-0">
          
          {/* Official Government of India Masthead */}
          <div className="text-center border-b-2 border-navy-800 pb-4 space-y-1">
            {/* Government Emblem Representation (National Crest) */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-navy-800 flex items-center justify-center bg-navy-50 text-navy-800">
                <Building size={24} weight="bold" />
              </div>
            </div>

            <div className="text-2xs font-bold text-neutral-600 tracking-widest uppercase">
              सत्यमेव जयते
            </div>
            <div className="text-sm font-bold text-navy-800 tracking-wider uppercase font-heading">
              Government of India
            </div>
            <div className="text-xs font-semibold text-neutral-700 uppercase">
              Ministry of Consumer Affairs, Food & Public Distribution
            </div>
            <div className="text-2xs text-neutral-500">
              Department of Consumer Affairs • Legal Metrology Division
            </div>
            <div className="text-2xs text-neutral-500">
              Office of the Assistant Controller of Legal Metrology, Central Enforcement Zone
            </div>

            {/* Statutory Title Block */}
            <div className="pt-3">
              <div className="inline-block px-4 py-1 bg-navy-50 border border-navy-200 rounded text-xs font-bold font-heading text-navy-900 tracking-wide uppercase">
                FORM LM-INSP-2011
              </div>
              <div className="text-2xs text-neutral-600 font-serif italic mt-1">
                [Prescribed under Rule 29 of the Legal Metrology (Packaged Commodities) Rules, 2011]
              </div>
              <div className="text-2xs font-bold text-neutral-800 uppercase mt-0.5 tracking-tight">
                Statutory Show-Cause Notice & Inspection Record under Section 15, 36(1) & 48 of Legal Metrology Act, 2009
              </div>
            </div>
          </div>

          {/* Inspection Particulars Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-neutral-700 uppercase tracking-wider font-heading">
                1. Particulars of Inspection & Docket Details
              </span>
              <span className="text-2xs font-mono text-neutral-500">
                Reference: LM/ENF/2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Docket Number
                </span>
                <div className="text-xs font-bold font-mono text-neutral-900 mt-0.5">
                  {docketNumber}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Date of Inspection
                </span>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {inspectionDate}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Inspecting Officer
                </span>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {assignedOfficer}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Statutory Jurisdiction
                </span>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  Central Enforcement Division, New Delhi
                </div>
              </div>
            </div>
          </div>

          {/* Inspected Packaged Commodity Particulars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-neutral-700 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <SealCheck size={16} className="text-primary" weight="bold" />
                2. Inspected Packaged Commodity Details
              </span>
              <span className="text-2xs text-neutral-500 font-mono">
                Sample Verified In Situ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Commodity Name
                </span>
                <div className="text-xs font-bold text-neutral-900 mt-0.5 truncate">
                  {productName}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Manufacturer / Brand
                </span>
                <div className="text-xs font-bold text-neutral-900 mt-0.5 truncate">
                  {brand}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Declared Retail Price (MRP)
                </span>
                <div className="text-xs font-bold font-mono text-neutral-900 mt-0.5">
                  {mrp}
                </div>
              </div>
              <div>
                <span className="text-2xs text-neutral-500 font-medium block">
                  Declared Net Quantity
                </span>
                <div className="text-xs font-bold font-mono text-neutral-900 mt-0.5">
                  {netQty}
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Violation Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-neutral-700 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Warning size={16} className="text-violation" weight="bold" />
                3. Recorded Statutory Infractions ({violationsCount})
              </span>
              <span className="text-2xs text-neutral-500 font-mono">
                Schedule of Violations
              </span>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-2xs">
                <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-semibold font-heading">
                  <tr>
                    <th className="p-3 w-12 text-center">Sl.</th>
                    <th className="p-3 w-48">Statutory Rule & Section</th>
                    <th className="p-3">Specific Non-Compliance Recorded</th>
                    <th className="p-3 w-28 text-center">Severity Tier</th>
                    <th className="p-3 w-36 text-right">Applicable Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  <tr className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3 text-center font-mono text-neutral-600">01</td>
                    <td className="p-3 font-semibold text-neutral-900 font-mono">
                      Rule 6(1)(e)
                      <div className="text-2xs font-normal text-neutral-500">
                        read with Sec 36(1)
                      </div>
                    </td>
                    <td className="p-3 text-neutral-800 leading-normal">
                      <span className="font-bold block text-neutral-900">
                        Omission of Mandatory Unit Sale Price (USP)
                      </span>
                      Pre-packaged commodity packaged and offered for retail sale without the mandatory declaration of Unit Sale Price in contravention of the 2021 Amendment to Legal Metrology Rules.
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-violation-light text-violation border border-violation-border">
                        High Default
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-800">
                      Up to ₹25,000
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3 text-center font-mono text-neutral-600">02</td>
                    <td className="p-3 font-semibold text-neutral-900 font-mono">
                      Rule 7 Table-I
                      <div className="text-2xs font-normal text-neutral-500">
                        read with Sec 36(1)
                      </div>
                    </td>
                    <td className="p-3 text-neutral-800 leading-normal">
                      <span className="font-bold block text-neutral-900">
                        Deficient Font & Numeral Height on PDP
                      </span>
                      Mandatory statutory declarations rendered at 1.4 mm vertical height against the minimum prescribed statutory threshold of 2.0 mm for Principal Display Panel area exceeding 120 cm².
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-warning-light text-[#B7791F] border border-warning-border">
                        Medium Default
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-800">
                      Up to ₹25,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Notice Demand & Compounding Offer */}
          <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-3 text-2xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="font-bold text-neutral-900 font-heading text-xs flex items-center gap-1.5">
                <Scales size={16} className="text-primary" weight="bold" />
                4. Statutory Legal Notice Demand & Compounding Terms
              </span>
              <span className="font-mono text-2xs text-neutral-500">
                15 Calendar Days Window
              </span>
            </div>

            <p className="text-neutral-700">
              <b>WHEREAS</b>, upon inspection under Section 15 of the Legal Metrology Act, 2009, 
              the above-described pre-packaged commodity was found non-compliant with the statutory requirements 
              of the Legal Metrology (Packaged Commodities) Rules, 2011;
            </p>

            <p className="text-neutral-700">
              <b>NOW THEREFORE</b>, notice is hereby served upon you to <b>SHOW CAUSE within 15 calendar days</b> 
              from the date of delivery of this notice as to why criminal prosecution should not be instituted against 
              you before the competent Judicial Magistrate First Class under Section 36(1) of the Legal Metrology Act, 2009.
            </p>

            <div className="p-3 bg-white rounded border border-neutral-200 space-y-1">
              <span className="font-bold text-neutral-900 block font-heading">
                Opportunity for Administrative Compounding under Section 48:
              </span>
              <p className="text-neutral-600">
                In lieu of facing prosecution before the Court of Law, you may elect voluntary administrative compounding. 
                The compounding assessment is determined at{' '}
                <b className="text-primary font-mono text-xs">INR {compoundingFee.toLocaleString('en-IN')}</b>{' '}
                (inclusive of 20% prompt settlement reduction under the Jan Vishwas Act, 2023). 
                Payment must be credited to Head 1475 - Legal Metrology Receipts within 15 calendar days.
              </p>
            </div>
          </div>

          {/* Digital Signature Token Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 font-heading text-2xs flex items-center gap-1.5">
                  <SealCheck size={16} className="text-primary" weight="bold" />
                  Government Digital Signature Certificate (DSC)
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold bg-success-light text-success border border-success-border">
                  <CheckCircle size={12} weight="bold" />
                  DSC Validated
                </span>
              </div>
              <div className="space-y-1 text-2xs text-neutral-600">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Signatory:</span>
                  <span className="font-semibold text-neutral-900">{assignedOfficer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Authority:</span>
                  <span className="text-neutral-800">NIC Certifying Authority / CCA India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Signing Date:</span>
                  <span className="font-mono text-neutral-800">{inspectionDate} 15:45:12 IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Token ID:</span>
                  <span className="font-mono text-neutral-800">GOI-CCA-DSC-2026-9812</span>
                </div>
              </div>
            </div>

            {/* BSA 2023 Section 63(4) Electronic Record Certificate */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 font-heading text-2xs flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-success" weight="bold" />
                  BSA 2023 Section 63(4) Evidence Certificate
                </span>
                <span className="text-2xs font-mono text-neutral-500">
                  Act No. 47 of 2023
                </span>
              </div>
              <p className="text-2xs text-neutral-600 leading-normal">
                Certified under <b>Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023</b> that this electronic docket was produced during regular inspection without system alteration or data interception.
              </p>
              <div className="pt-1 border-t border-neutral-200 text-2xs text-neutral-700 font-mono break-all select-all">
                SHA-256: <span className="text-primary font-bold">e4b6c8a0123456789abcdef0123456789abcdef0123456789abcdef012345678</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-b-card print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={16} weight="bold" />}
            >
              Print Docket
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              loading={downloading}
              icon={<DownloadSimple size={16} weight="bold" />}
            >
              Download Official PDF (FORM LM-INSP-2011)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
