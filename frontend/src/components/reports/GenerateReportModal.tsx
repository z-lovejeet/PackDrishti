import React, { useState } from 'react';
import {
  DownloadSimple,
  Certificate,
  FilePdf,
  FileCode,
  FileDoc,
  CheckSquare,
  Square,
} from '@phosphor-icons/react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [reportType, setReportType] = useState('Single Product Inspection Certificate (Admissible Evidence)');
  const [district, setDistrict] = useState('Central Delhi (Zone-1)');
  const [format, setFormat] = useState<'PDF' | 'JSON' | 'DOCX'>('PDF');
  const [includeBoundingBoxes, setIncludeBoundingBoxes] = useState(true);
  const [includeTableIMetrics, setIncludeTableIMetrics] = useState(true);
  const [includeSection36, setIncludeSection36] = useState(true);
  const [includeOfficerSeal, setIncludeOfficerSeal] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      onClose();
      onSuccessToast();
    }, 600);
  };

  const formats = [
    {
      id: 'PDF',
      title: 'Signed Official PDF',
      description: 'Court-admissible certificate with embedded specimen evidence and digital seal',
      icon: <FilePdf size={22} className="text-rose-600 shrink-0" weight="fill" />,
    },
    {
      id: 'JSON',
      title: 'Machine-Readable JSON',
      description: 'Structured JSON payload for National Legal Metrology portal integration',
      icon: <FileCode size={22} className="text-navy-800 shrink-0" weight="fill" />,
    },
    {
      id: 'DOCX',
      title: 'Notice Brief (DOCX)',
      description: 'Editable notice draft for Legal Metrology Officers and court filings',
      icon: <FileDoc size={22} className="text-blue-600 shrink-0" weight="fill" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Statutory Compliance Certificate"
      subtitle="Issued pursuant to Legal Metrology (Packaged Commodities) Rules, 2011"
      maxWidth="lg"
      icon={<img src="/logo.png" alt="PackDrashiti Emblem" className="w-6 h-6 rounded-md object-contain shrink-0 shadow-2xs" />}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isGenerating}
            icon={<DownloadSimple size={16} weight="bold" />}
          >
            Generate &amp; Download Certificate
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Certificate Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-800 font-heading">
            Certificate &amp; Inspection Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-navy-800 text-xs text-neutral-800 font-sans shadow-2xs"
          >
            <option value="Single Product Inspection Certificate (Admissible Evidence)">
              Single Product Inspection Certificate (Admissible under Section 65B Indian Evidence Act)
            </option>
            <option value="Marketplace Sweep Batch Audit (Multiple Samples)">
              Marketplace Sweep Batch Audit (Multi-SKU E-Commerce Verification)
            </option>
            <option value="Monthly Zonal Legal Metrology Summary Report">
              Monthly Zonal Legal Metrology Summary Report (Statutory Enforcement Record)
            </option>
          </select>
        </div>

        {/* Jurisdiction Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-800 font-heading">
            Enforcement Jurisdiction Division
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Central Delhi (Zone-1) or Mumbai South Circle"
            className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-navy-800 text-xs text-neutral-800 font-sans shadow-2xs"
          />
          <span className="text-2xs text-neutral-500 block">
            Appears on the statutory header as the authorized Inspection Circle.
          </span>
        </div>

        {/* Output Export Format Selector Cards */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <label className="block text-xs font-bold text-neutral-800 font-heading">
            Export Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {formats.map((fmt) => {
              const isSelected = format === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as 'PDF' | 'JSON' | 'DOCX')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-navy-800 bg-navy-50/40 ring-2 ring-navy-800/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {fmt.icon}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 font-heading">{fmt.title}</h4>
                    <p className="text-2xs text-neutral-500 leading-snug mt-1">{fmt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statutory Attachments Selection */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <label className="block text-xs font-bold text-neutral-800 font-heading">
            Statutory Attachments &amp; Schedules
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Attachment 1 */}
            <div
              onClick={() => setIncludeBoundingBoxes(!includeBoundingBoxes)}
              className="p-3 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50/60 cursor-pointer flex items-start gap-2.5 transition-colors shadow-2xs"
            >
              <div className="mt-0.5 text-navy-800">
                {includeBoundingBoxes ? (
                  <CheckSquare size={18} weight="fill" />
                ) : (
                  <Square size={18} className="text-neutral-400" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-neutral-800 font-heading block">
                  High-Resolution Specimen Overlay
                </span>
                <span className="text-2xs text-neutral-500 block leading-normal">
                  Packaging photograph with highlighted statutory bounding boxes and coordinates
                </span>
              </div>
            </div>

            {/* Attachment 2 */}
            <div
              onClick={() => setIncludeTableIMetrics(!includeTableIMetrics)}
              className="p-3 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50/60 cursor-pointer flex items-start gap-2.5 transition-colors shadow-2xs"
            >
              <div className="mt-0.5 text-navy-800">
                {includeTableIMetrics ? (
                  <CheckSquare size={18} weight="fill" />
                ) : (
                  <Square size={18} className="text-neutral-400" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-neutral-800 font-heading block">
                  Rule 7 Table-I Font Height Audit
                </span>
                <span className="text-2xs text-neutral-500 block leading-normal">
                  Principal Display Panel (PDP) area calculation and numeral cap-height verification
                </span>
              </div>
            </div>

            {/* Attachment 3 */}
            <div
              onClick={() => setIncludeSection36(!includeSection36)}
              className="p-3 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50/60 cursor-pointer flex items-start gap-2.5 transition-colors shadow-2xs"
            >
              <div className="mt-0.5 text-navy-800">
                {includeSection36 ? (
                  <CheckSquare size={18} weight="fill" />
                ) : (
                  <Square size={18} className="text-neutral-400" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-neutral-800 font-heading block">
                  Section 36(1) Compounding Schedule
                </span>
                <span className="text-2xs text-neutral-500 block leading-normal">
                  Itemized penalty schedule and standard compounding notice under Legal Metrology Act
                </span>
              </div>
            </div>

            {/* Attachment 4 */}
            <div
              onClick={() => setIncludeOfficerSeal(!includeOfficerSeal)}
              className="p-3 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50/60 cursor-pointer flex items-start gap-2.5 transition-colors shadow-2xs"
            >
              <div className="mt-0.5 text-navy-800">
                {includeOfficerSeal ? (
                  <CheckSquare size={18} weight="fill" />
                ) : (
                  <Square size={18} className="text-neutral-400" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-neutral-800 font-heading block">
                  Digital Authentication &amp; Timestamp
                </span>
                <span className="text-2xs text-neutral-500 block leading-normal">
                  Cryptographic verification stamp and Legal Metrology Officer badge signature block
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
