import React, { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlass,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CompoundingCalculator } from '../../components/officer/CompoundingCalculator';
import { NoticePreviewModal } from '../../components/officer/NoticePreviewModal';
import { ViolationRecord } from '../../types';
import { api } from '../../utils/apiClient';

interface LedgerMetrics {
  totalInspections: number;
  certifiedCompliant: number;
  infractionsFlagged: number;
  compoundedClosed: number;
}

export const InspectionsPage: React.FC = () => {
  const [records, setRecords] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<LedgerMetrics>({
    totalInspections: 0,
    certifiedCompliant: 0,
    infractionsFlagged: 0,
    compoundedClosed: 0,
  });
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompoundingOpen, setIsCompoundingOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [activeViolationData, setActiveViolationData] = useState<{
    docketNumber?: string;
    productName?: string;
    brand?: string;
    assignedOfficer?: string;
    inspectionDate?: string;
    rule_reference?: string;
    title?: string;
    severity?: 'high' | 'medium' | 'low';
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInspections = async () => {
      setLoading(true);
      try {
        const [historyRes, metricsRes] = await Promise.allSettled([
          api.get<any>('/scan/history'),
          api.get<any>('/dashboard/metrics'),
        ]);

        if (metricsRes.status === 'fulfilled' && metricsRes.value && isMounted) {
          const m = metricsRes.value;
          setMetrics({
            totalInspections: m.total_inspections || 0,
            certifiedCompliant: m.compliant_count || 0,
            infractionsFlagged: m.violations_recorded || 0,
            compoundedClosed: m.compounded_closed || 0,
          });
        }

        if (historyRes.status === 'fulfilled' && isMounted) {
          const res = historyRes.value;
          const historyList = Array.isArray(res) ? res : (res && res.history ? res.history : []);

          if (historyList && historyList.length > 0) {
            const liveRecords: ViolationRecord[] = [];
            historyList.forEach((h: any, hIdx: number) => {
              if (h.violations && h.violations.length > 0) {
                h.violations.forEach((v: any, vIdx: number) => {
                  liveRecords.push({
                    id: v.violation_id || `live-${h.scan_id || hIdx}-${vIdx}`,
                    violationCode: `INSP-2026-DEL-${String(hIdx * 10 + vIdx + 50).padStart(3, '0')}`,
                    productName: h.product_name || 'Audited Packaging Specimen',
                    brand: h.brand || h.brand_name || 'Inspected Brand',
                    category: 'Packaged Commodity',
                    ruleReference: v.rule_clause || 'Rule 6(1)',
                    violationType: v.description || 'Statutory Non-Compliance',
                    severity: v.severity || 'high',
                    dateDetected: h.scanned_at || h.created_at ? new Date(h.scanned_at || h.created_at).toLocaleDateString('en-GB') : '10-Sep-2026',
                    status: 'Notice Issued',
                    assignedOfficer: 'Sh. Rajesh Kumar Sharma (DL-LM-INSP-0442)',
                    location: 'Delhi Enforcement Division',
                    timeline: [
                      {
                        date: h.scanned_at || h.created_at ? new Date(h.scanned_at || h.created_at).toLocaleString() : '10-Sep-2026 14:00 IST',
                        action: 'Statutory Non-Compliance Flagged via Field Optical Scan',
                        by: 'Sh. Rajesh Kumar Sharma (Sr. Inspector)',
                        note: v.description || 'Statutory infraction recorded under Legal Metrology Rules, 2011.',
                      },
                    ],
                  });
                });
              } else if (h.compliance_status === 'violation') {
                liveRecords.push({
                  id: `live-scan-${h.scan_id || hIdx}`,
                  violationCode: `INSP-2026-DEL-${String(hIdx + 60).padStart(3, '0')}`,
                  productName: h.product_name || 'Audited Packaging Specimen',
                  brand: h.brand_name || h.brand || 'Inspected Commodity',
                  category: 'Pre-Packaged Commodity',
                  ruleReference: 'Rule 6(1)(e)',
                  violationType: 'Missing Mandatory Declaration / Unit Sale Price Defect',
                  severity: 'high',
                  dateDetected: h.created_at ? new Date(h.created_at).toLocaleDateString('en-GB') : '10-Sep-2026',
                  status: 'Notice Issued',
                  assignedOfficer: 'Sh. Rajesh Kumar Sharma (DL-LM-INSP-0442)',
                  location: 'Central Delhi Market Division',
                  timeline: [
                    {
                      date: h.created_at ? new Date(h.created_at).toLocaleString() : 'Recent',
                      action: 'Field Inspection Notice Drafted under Section 36(1)',
                      by: 'Sh. Rajesh Kumar Sharma (Sr. Inspector)',
                      note: 'Non-compliant packaging sample logged into statutory ledger.',
                    },
                  ],
                });
              }
            });

            setRecords(liveRecords);
            if (liveRecords.length > 0) {
              setExpandedId(liveRecords[0].id);
            }
          } else {
            setRecords([]);
            setExpandedId(null);
          }
        }
      } catch {
        if (isMounted) {
          setRecords([]);
          setExpandedId(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInspections();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((v) => {
      const matchesStatus = activeStatus === 'All' || v.status === activeStatus;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        v.productName.toLowerCase().includes(term) ||
        v.brand.toLowerCase().includes(term) ||
        v.violationCode.toLowerCase().includes(term) ||
        v.ruleReference.toLowerCase().includes(term) ||
        v.violationType.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [records, activeStatus, searchTerm]);

  const handleExportLedger = () => {
    const csvRows = [
      ['Docket Ref', 'Product Name', 'Brand', 'Rule Clause', 'Infraction', 'Severity', 'Status', 'Date', 'Officer'].join(','),
      ...filteredRecords.map((r) =>
        [
          r.violationCode,
          `"${r.productName.replace(/"/g, '""')}"`,
          `"${r.brand.replace(/"/g, '""')}"`,
          r.ruleReference,
          `"${r.violationType.replace(/"/g, '""')}"`,
          r.severity,
          r.status,
          r.dateDetected,
          `"${r.assignedOfficer.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `STATUTORY_INSPECTION_LEDGER_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportSingleDocket = (viol: ViolationRecord) => {
    const docketData = {
      docketNumber: viol.violationCode,
      productName: viol.productName,
      brand: viol.brand,
      category: viol.category,
      ruleReference: viol.ruleReference,
      violationType: viol.violationType,
      severity: viol.severity,
      status: viol.status,
      assignedOfficer: viol.assignedOfficer,
      location: viol.location,
      dateDetected: viol.dateDetected,
      caseChronology: viol.timeline,
      statutoryAuthority: 'Legal Metrology Act, 2009 (Section 36(1) & Section 48)',
    };
    const blob = new Blob([JSON.stringify(docketData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DOCKET_${viol.violationCode}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans antialiased text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            Statutory Field Register • LMPC Rules, 2011
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1 tracking-tight">
            Field Inspection Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Administrative register of market inspections, Section 36(1) notices, Rule 7 Table-I defaults, and Section 48 compounding orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLedger}
            className="text-xs font-medium"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Clean, Minimal Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl border border-slate-200 bg-white">
        <div>
          <span className="text-2xs font-mono font-medium text-slate-500 uppercase tracking-wider block">
            Total Inspections
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1">
            {metrics.totalInspections.toLocaleString()}
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Central register telemetry</p>
        </div>

        <div>
          <span className="text-2xs font-mono font-medium text-slate-500 uppercase tracking-wider block">
            Certified Compliant
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-emerald-700 mt-1">
            {metrics.certifiedCompliant.toLocaleString()}
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">
            {metrics.totalInspections > 0
              ? `${((metrics.certifiedCompliant / metrics.totalInspections) * 100).toFixed(1)}% statutory conformity`
              : 'Zero non-compliance verified'}
          </p>
        </div>

        <div>
          <span className="text-2xs font-mono font-medium text-slate-500 uppercase tracking-wider block">
            Infractions Flagged
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-rose-700 mt-1">
            {metrics.infractionsFlagged.toLocaleString()}
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Section 36(1) show-cause slated</p>
        </div>

        <div>
          <span className="text-2xs font-mono font-medium text-slate-500 uppercase tracking-wider block">
            Compounded &amp; Closed
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-700 mt-1">
            {metrics.compoundedClosed.toLocaleString()}
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Section 48 compounding orders</p>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by docket number, commodity, brand, or rule..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
          />
        </div>

        {/* Minimal Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Notice Issued', 'Under Review', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                activeStatus === st
                  ? 'bg-slate-900 text-white font-medium shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
          <span className="text-2xs font-mono text-slate-400 ml-2">
            {filteredRecords.length} records
          </span>
        </div>
      </div>

      {/* Inspection Ledger Table / List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-100">
        {filteredRecords.map((viol) => {
          const isExpanded = expandedId === viol.id;
          return (
            <div key={viol.id} className="transition-colors">
              
              {/* Row Summary */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : viol.id)}
                className={`p-4 sm:p-5 cursor-pointer hover:bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isExpanded ? 'bg-slate-50/50' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {viol.violationCode}
                    </span>
                    <span className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {viol.ruleReference}
                    </span>
                    <span className="text-2xs text-slate-400 font-mono">
                      {viol.dateDetected}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 leading-snug">
                      {viol.productName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="text-slate-700 font-medium">{viol.brand}</span>
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span>{viol.violationType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-slate-800">
                      {viol.assignedOfficer.split('(')[0].trim()}
                    </div>
                    <div className="text-2xs text-slate-500">
                      {viol.location}
                    </div>
                  </div>

                  <span className={`text-2xs font-mono font-medium px-2.5 py-1 rounded-full border ${
                    viol.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : viol.status === 'Notice Issued'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {viol.status}
                  </span>

                  <div className="text-slate-400 hover:text-slate-700 p-1">
                    {isExpanded ? (
                      <CaretUp size={16} />
                    ) : (
                      <CaretDown size={16} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Inspection Detail Drawer */}
              {isExpanded && (
                <div className="px-5 sm:px-6 py-5 bg-slate-50/60 border-t border-slate-100 space-y-5 text-xs">
                  
                  {/* Case Particulars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200/80">
                    <div>
                      <span className="text-2xs font-mono uppercase text-slate-400 block">Statutory Authority</span>
                      <span className="font-mono text-xs font-semibold text-slate-900 mt-0.5 block">
                        Legal Metrology Act, 2009 (Sec 36(1))
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs font-mono uppercase text-slate-400 block">Rule Citation</span>
                      <span className="font-mono text-xs font-semibold text-slate-900 mt-0.5 block">
                        {viol.ruleReference} • LMPC Rules, 2011
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs font-mono uppercase text-slate-400 block">Inspection Site</span>
                      <span className="text-xs font-medium text-slate-800 mt-0.5 block">
                        {viol.location}
                      </span>
                    </div>
                  </div>

                  {/* Case Chronology */}
                  <div className="space-y-2">
                    <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                      Case Chronology
                    </span>

                    <div className="space-y-3 pl-2 border-l border-slate-200 ml-1">
                      {viol.timeline.map((item, idx) => (
                        <div key={idx} className="space-y-1 relative pl-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 absolute -left-[4px] top-1.5"></div>
                          <div className="font-medium text-slate-900 text-xs">{item.action}</div>
                          <div className="text-2xs font-mono text-slate-400">
                            {item.date} • <span className="font-sans text-slate-600">{item.by}</span>
                          </div>
                          {item.note && (
                            <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                              {item.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-end gap-2.5 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveViolationData({
                          rule_reference: viol.ruleReference,
                          title: viol.violationType,
                          severity: viol.severity,
                        });
                        setIsCompoundingOpen(true);
                      }}
                      className="text-xs font-medium"
                    >
                      Compounding Desk
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
                      className="text-xs font-medium"
                    >
                      FORM LM-INSP-2011 Notice
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSingleDocket(viol)}
                      className="text-xs font-medium"
                    >
                      Export Docket
                    </Button>

                    <Button
                      variant="primary"
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
                      className="text-xs font-medium"
                    >
                      Open Case
                    </Button>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {/* Clean empty state */}
        {filteredRecords.length === 0 && !loading && (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {records.length === 0 ? "Statutory Register Empty" : "No inspection records found"}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {records.length === 0
                ? "No field inspection dockets or statutory notices have been recorded yet. Audits performed via the Inspection Station will automatically appear in this ledger."
                : `No dockets match "${searchTerm}" under status "${activeStatus}".`}
            </p>
            {records.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setActiveStatus('All');
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
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
