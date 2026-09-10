import React, { useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
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
  const [reportType, setReportType] = useState('Single Product Inspection Certificate');
  const [district, setDistrict] = useState('Central Delhi (Zone-1)');
  const [format, setFormat] = useState('PDF');
  const [includeBoundingBoxes, setIncludeBoundingBoxes] = useState(true);
  const [includeTableIMetrics, setIncludeTableIMetrics] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onSuccessToast();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Statutory Compliance Certificate"
      subtitle="Issued pursuant to Legal Metrology (Packaged Commodities) Rules, 2011"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} icon={<DownloadSimple size={16} />}>
            Generate & Download Certificate
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="block font-semibold text-neutral-700">Certificate Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-neutral-300 rounded-[6px] focus:outline-none focus:border-primary text-neutral-800"
          >
            <option>Single Product Inspection Certificate (Admissible Evidence)</option>
            <option>Marketplace Sweep Batch Audit (Multiple Samples)</option>
            <option>Monthly Zonal Legal Metrology Summary Report</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-neutral-700">Jurisdiction Division</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-neutral-300 rounded-[6px] focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2 pt-1 border-t border-neutral-200">
          <label className="block font-semibold text-neutral-700">Statutory Attachments to Include</label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBoundingBoxes}
                onChange={(e) => setIncludeBoundingBoxes(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span>High-resolution packaging photograph with highlighted bounding boxes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTableIMetrics}
                onChange={(e) => setIncludeTableIMetrics(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span>Principal Display Panel (PDP) area calculation & Table-I font cap-height table</span>
            </label>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-neutral-200">
          <label className="block font-semibold text-neutral-700">Output Export Format</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                name="format"
                value="PDF"
                checked={format === 'PDF'}
                onChange={() => setFormat('PDF')}
                className="text-primary"
              />
              <span>Signed PDF (Standard Certificate)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                name="format"
                value="JSON"
                checked={format === 'JSON'}
                onChange={() => setFormat('JSON')}
                className="text-primary"
              />
              <span>JSON Machine-Readable (API Archive)</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};
