import React, { useState } from 'react';
import { 
  FileText, 
  DownloadSimple, 
  Printer, 
  ShieldCheck, 
  Warning, 
  SealCheck, 
  X,
  QrCode,
  Scales
} from '@phosphor-icons/react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { api } from '../../utils/apiClient';

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
      const targetUrl = baseUrl + '/reports/pdf/' + scanId;
      
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
      link.download = 'FORM_LM_INSP_2011_' + docketNumber + '.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Error streaming PDF docket: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] border border-neutral-300 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-[10px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={20} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 font-heading">
                  FORM LM-INSP-2011 Notice Docket
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-light text-primary font-bold border border-primary-border">
                  STATUTORY NOTICE
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Official Legal Metrology Seizure & Show-Cause Memorandum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-lg p-1.5 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Docket Body */}
        <div className="p-6 space-y-5 text-neutral-800 text-xs overflow-y-auto flex-1">
          
          {/* Official Government Masthead */}
          <div className="text-center border-b border-neutral-300 pb-3 space-y-0.5">
            <div className="text-[11px] font-bold text-primary tracking-wider uppercase font-heading">
              Government of India
            </div>
            <div className="text-[10px] font-semibold text-neutral-700 uppercase">
              Ministry of Consumer Affairs, Food & Public Distribution
            </div>
            <div className="text-[10px] text-neutral-500">
              Department of Consumer Affairs • Legal Metrology Division
            </div>
            <div className="pt-2 text-sm font-bold text-neutral-900 font-heading tracking-tight">
              FORM LM-INSP-2011
            </div>
            <div className="text-[10px] text-neutral-500 italic">
              [Under Rule 29, Legal Metrology (Packaged Commodities) Rules, 2011 & Section 15 / 36(1), Legal Metrology Act, 2009]
            </div>
          </div>

          {/* Docket Particulars Card */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3.5 rounded-[6px] border border-neutral-200">
            <div>
              <span className="text-neutral-500 font-medium">Docket Number:</span>
              <div className="font-bold font-mono text-neutral-900">{docketNumber}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Inspection Date:</span>
              <div className="font-bold text-neutral-900">{inspectionDate}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Inspecting Officer:</span>
              <div className="font-semibold text-neutral-900">{assignedOfficer}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Jurisdiction:</span>
              <div className="font-semibold text-neutral-900">Central Enforcement Division, New Delhi</div>
            </div>
          </div>

          {/* Commodity Details */}
          <div className="border border-neutral-200 rounded-[6px] p-3.5 space-y-2">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <SealCheck size={16} className="text-primary" />
              Inspected Packaged Commodity Particulars
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <div className="text-neutral-500">Commodity</div>
                <div className="font-bold text-neutral-900 truncate">{productName}</div>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <div className="text-neutral-500">Manufacturer / Brand</div>
                <div className="font-bold text-neutral-900 truncate">{brand}</div>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <div className="text-neutral-500">Declared MRP</div>
                <div className="font-bold text-neutral-900">{mrp}</div>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <div className="text-neutral-500">Declared Net Qty</div>
                <div className="font-bold text-neutral-900">{netQty}</div>
              </div>
            </div>
          </div>

          {/* Statutory Infractions Notice */}
          <div className="space-y-2">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Warning size={16} className="text-violation" />
              Recorded Statutory Infractions ({violationsCount})
            </div>
            <div className="bg-red-50/70 border border-red-200 rounded-[6px] p-3 space-y-2 text-[11px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-neutral-900">Rule 6(1)(e) - Unit Sale Price (USP) Missing</span>
                  <p className="text-neutral-600 mt-0.5">
                    Commodity packaged and sold without mandatory Unit Sale Price declaration as required by 2021 Amendment.
                  </p>
                </div>
                <Badge variant="violation" size="sm">Section 36(1)</Badge>
              </div>
              <div className="border-t border-red-200 pt-2 flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-neutral-900">Rule 7 Table-I - Deficient Font Height on PDP</span>
                  <p className="text-neutral-600 mt-0.5">
                    Mandatory declarations rendered at 1.4 mm height against statutory requirement of 2.0 mm for PDP &gt; 120 cm².
                  </p>
                </div>
                <Badge variant="warning" size="sm">Section 36(1)</Badge>
              </div>
            </div>
          </div>

          {/* Show-Cause & Section 48 Compounding Order */}
          <div className="bg-neutral-50 p-4 rounded-[6px] border border-neutral-200 space-y-2 text-[11px] leading-relaxed">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Scales size={16} className="text-primary" />
              Statutory Demand & Section 48 Compounding Terms
            </div>
            <p className="text-neutral-700">
              YOU ARE HEREBY DIRECTED to show cause within <b>15 calendar days</b> of the receipt of this notice why prosecution 
              under Section 36(1) of the Legal Metrology Act, 2009 should not be initiated before the competent Court of Judicial Magistrate.
            </p>
            <p className="text-neutral-700">
              Alternatively, you may apply for administrative compounding under Section 48. Net Compounding Assessment:{' '}
              <b className="text-primary font-mono text-xs">INR {compoundingFee.toLocaleString('en-IN')}</b>{' '}
              (inclusive of Jan Vishwas Act prompt settlement benefit).
            </p>
          </div>

          {/* Bharatiya Sakshya Adhiniyam (BSA 2023) Certificate */}
          <div className="bg-neutral-50 p-3 rounded-[6px] border border-neutral-200 space-y-1 text-[10px] text-neutral-600 font-mono">
            <div className="font-bold text-neutral-800 font-sans text-[11px] flex items-center gap-1">
              <ShieldCheck size={14} className="text-success" />
              Section 63(4) Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) Electronic Evidence Certificate
            </div>
            <p className="font-sans text-[10px] leading-normal text-neutral-500">
              Certified that this electronic record was produced by the PackDrashiti automated inspection system during regular, 
              lawful operation. Computer systems functioned properly with immutable cryptographic verification.
            </p>
            <div className="text-neutral-700 pt-1">
              SHA-256: <span className="text-primary">e4b6c8a0123456789abcdef0123456789abcdef0123456789abcdef012345678</span>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-b-[10px]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={16} />}
            >
              Print Docket
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              loading={downloading}
              icon={<DownloadSimple size={16} />}
            >
              Download Official PDF (FORM LM-INSP-2011)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
