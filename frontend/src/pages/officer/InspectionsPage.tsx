import React, { useState } from 'react';
import { 
  DownloadSimple, 
  MagnifyingGlass, 
  CaretDown, 
  CaretUp,
  Scales,
  FileText 
} from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CompoundingCalculator } from '../../components/officer/CompoundingCalculator';
import { NoticePreviewModal } from '../../components/officer/NoticePreviewModal';
import { MOCK_VIOLATIONS } from '../../data/mockViolations';

export const InspectionsPage: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('viol-rec-101');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompoundingOpen, setIsCompoundingOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [activeViolationData, setActiveViolationData] = useState<any>(null);

  const filteredRecords = MOCK_VIOLATIONS.filter((v) => {
    const matchesStatus = activeStatus === 'All' || v.status === activeStatus;
    const matchesSearch = 
      v.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violationCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Field Inspections & Violations Log
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
              ENFORCEMENT RECORD
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Official ledger of market inspections, Section 36(1) show-cause notices, and Section 48 compounding orders.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert('Exporting enforcement inspections log...')}
          icon={<DownloadSimple size={16} />}
        >
          Export Inspection Docket
        </Button>
      </div>

      {/* 4 Clean Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Total Field Inspections</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-heading">1,247</div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Across 86 retail markets</p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 border-l-4 border-l-success">
          <div className="text-xs text-neutral-500 font-medium">Certified Compliant</div>
          <div className="text-2xl font-bold text-success mt-1 font-heading">834</div>
          <p className="text-[11px] text-neutral-500 mt-0.5">66.9% compliance rate</p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 border-l-4 border-l-violation">
          <div className="text-xs text-neutral-500 font-medium">Violations Recorded</div>
          <div className="text-2xl font-bold text-violation mt-1 font-heading">413</div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Actionable infractions</p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 border-l-4 border-l-primary">
          <div className="text-xs text-neutral-500 font-medium">Compounded & Closed</div>
          <div className="text-2xl font-bold text-primary mt-1 font-heading">290</div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Section 48 compounding fee</p>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="bg-white border border-neutral-200 rounded-[8px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} className="text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case ID, product, or brand..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-300 rounded-[6px] focus:bg-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['All', 'Notice Issued', 'Under Review', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                activeStatus === st
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspections Table */}
      <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden divide-y divide-neutral-200">
        {filteredRecords.map((viol) => {
          const isExpanded = expandedId === viol.id;
          return (
            <div key={viol.id} className="transition-colors">
              <div
                onClick={() => setExpandedId(isExpanded ? null : viol.id)}
                className="p-4 cursor-pointer hover:bg-neutral-50 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">{viol.violationCode}</span>
                    <Badge variant={viol.severity === 'high' ? 'violation' : 'warning'} size="sm">
                      {viol.ruleReference}
                    </Badge>
                    <span className="text-[11px] text-neutral-400 font-mono">• {viol.dateDetected}</span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 font-heading">
                    {viol.productName}
                  </h3>

                  <div className="text-xs text-neutral-600">
                    <span className="font-medium text-neutral-800">Infraction:</span> {viol.violationType}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-neutral-800">{viol.assignedOfficer}</div>
                    <div className="text-[11px] text-neutral-500">{viol.location}</div>
                  </div>

                  <Badge 
                    variant={
                      viol.status === 'Resolved' ? 'compliant' : 
                      viol.status === 'Notice Issued' ? 'violation' : 'warning'
                    }
                    size="md"
                  >
                    {viol.status}
                  </Badge>

                  {isExpanded ? (
                    <CaretUp size={16} className="text-neutral-400" />
                  ) : (
                    <CaretDown size={16} className="text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Expanded Action Detail */}
              {isExpanded && (
                <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-200 space-y-3 text-xs">
                  <div className="font-semibold text-neutral-800 font-heading">
                    Inspection Case Chronology
                  </div>

                  <div className="space-y-2 border-l-2 border-neutral-200 pl-3 ml-1">
                    {viol.timeline.map((item, idx) => (
                      <div key={idx} className="space-y-0.5 relative">
                        <div className="w-2 h-2 rounded-full bg-primary absolute -left-[17px] top-1.5 ring-2 ring-white"></div>
                        <div className="font-medium text-neutral-900">{item.action}</div>
                        <div className="text-[11px] text-neutral-500">{item.date} • {item.by}</div>
                        {item.note && (
                          <div className="text-[11px] text-neutral-600 bg-white p-2 rounded border border-neutral-200 mt-1">
                            {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveViolationData({
                          rule_reference: viol.ruleReference,
                          title: viol.violationType,
                          severity: viol.severity,
                          act_section: 'Section 36(1)',
                        });
                        setIsCompoundingOpen(true);
                      }}
                      icon={<Scales size={15} />}
                    >
                      Calculate Compounding
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveViolationData({
                          docketNumber: viol.violationCode,
                          productName: viol.productName,
                          brand: viol.brand,
                          assignedOfficer: viol.assignedOfficer,
                          inspectionDate: viol.dateDetected,
                        });
                        setIsNoticeOpen(true);
                      }}
                      icon={<FileText size={15} />}
                    >
                      View Notice (FORM LM-INSP-2011)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert(`Opening official case file for ${viol.violationCode}`)}
                    >
                      Open Case File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compounding Fee Calculator Modal */}
      <CompoundingCalculator
        isOpen={isCompoundingOpen}
        onClose={() => setIsCompoundingOpen(false)}
        initialViolations={
          activeViolationData
            ? [
                {
                  rule_reference: activeViolationData.rule_reference || 'Rule 6(1)(e)',
                  title: activeViolationData.title || 'Packaging Non-Compliance',
                  severity: activeViolationData.severity || 'high',
                },
              ]
            : undefined
        }
      />

      {/* FORM LM-INSP-2011 Notice Preview Modal */}
      <NoticePreviewModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        docketNumber={activeViolationData?.docketNumber}
        productName={activeViolationData?.productName}
        brand={activeViolationData?.brand}
        assignedOfficer={activeViolationData?.assignedOfficer}
        inspectionDate={activeViolationData?.inspectionDate}
      />

    </div>
  );
};
