import React, { useState, useEffect } from 'react';
import { 
  Scales, 
  CheckCircle, 
  Warning, 
  XCircle, 
  Clock, 
  ArrowRight, 
  FileText,
  Info,
  Percent,
  X
} from '@phosphor-icons/react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { api } from '../../utils/apiClient';

export interface ViolationItem {
  rule_reference: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  act_section?: string;
}

export interface CompoundingBreakdownItem {
  rule_reference: string;
  act_section: string;
  title: string;
  severity: string;
  base_compounding_fee_inr: number;
  multiplier: number;
  calculated_fee_inr: number;
  statutory_ceiling_inr: number;
  statutory_citation: string;
  remarks: string;
}

export interface CompoundingResult {
  total_violations: number;
  offence_count: number;
  effective_offence_tier: string;
  is_compoundable: boolean;
  court_prosecution_mandatory: boolean;
  gross_compounding_fee_inr: number;
  prompt_settlement_discount_inr: number;
  net_payable_compounding_fee_inr: number;
  due_date: string;
  three_year_reset_applied: boolean;
  breakdown: CompoundingBreakdownItem[];
  statutory_authorities: string[];
  enforcement_summary: string;
}

interface CompoundingCalculatorProps {
  initialViolations?: ViolationItem[];
  isOpen: boolean;
  onClose: () => void;
  onApply?: (result: CompoundingResult) => void;
}

const DEFAULT_VIOLATIONS: ViolationItem[] = [
  {
    rule_reference: 'Rule 6(1)(e)',
    title: 'Missing Unit Sale Price (USP)',
    severity: 'high',
    act_section: 'Section 36(1)',
  },
  {
    rule_reference: 'Rule 7 Table-I',
    title: 'Deficient Font Height on PDP',
    severity: 'medium',
    act_section: 'Section 36(1)',
  },
];

export const CompoundingCalculator: React.FC<CompoundingCalculatorProps> = ({
  initialViolations = DEFAULT_VIOLATIONS,
  isOpen,
  onClose,
  onApply,
}) => {
  const [offenceCount, setOffenceCount] = useState<number>(1);
  const [promptSettlement, setPromptSettlement] = useState<boolean>(true);
  const [daysSinceLastOffence, setDaysSinceLastOffence] = useState<number>(0);
  const [hasPreviousOffence, setHasPreviousOffence] = useState<boolean>(false);
  const [violations, setViolations] = useState<ViolationItem[]>(initialViolations);
  const [result, setResult] = useState<CompoundingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialViolations && initialViolations.length > 0) {
      setViolations(initialViolations);
    }
  }, [initialViolations]);

  const calculateFees = async () => {
    setLoading(true);
    try {
      const payload = {
        offence_count: offenceCount,
        prompt_settlement: promptSettlement,
        days_since_last_offence: hasPreviousOffence ? daysSinceLastOffence : null,
        violations: violations.map((v) => ({
          rule_reference: v.rule_reference,
          title: v.title,
          severity: v.severity,
          act_section: v.act_section || 'Section 36(1)',
        })),
      };

      const res = await api.post<CompoundingResult>('/compounding/calculate', payload);
      setResult(res);
    } catch {
      // Deterministic client fallback matching Python compounding engine
      let effectiveTier = offenceCount === 1 ? 'first' : offenceCount === 2 ? 'second' : 'subsequent_court_prosecution';
      let threeYearReset = false;
      let isCompoundable = offenceCount <= 2;
      let mult = offenceCount === 1 ? 1.0 : 2.0;

      if (hasPreviousOffence && daysSinceLastOffence >= 1095) {
        effectiveTier = 'first';
        threeYearReset = true;
        isCompoundable = true;
        mult = 1.0;
      }

      let gross = 0;
      const breakdownItems: CompoundingBreakdownItem[] = violations.map((v) => {
        const base = v.rule_reference.includes('6(1)(e)') ? 10000 : v.rule_reference.includes('7') ? 7500 : 15000;
        const calc = isCompoundable ? Math.min(base * mult, effectiveTier === 'first' ? 25000 : 50000) : 0;
        gross += calc;
        return {
          rule_reference: v.rule_reference,
          act_section: v.act_section || 'Section 36(1)',
          title: v.title,
          severity: v.severity,
          base_compounding_fee_inr: base,
          multiplier: isCompoundable ? mult : 0,
          calculated_fee_inr: calc,
          statutory_ceiling_inr: effectiveTier === 'first' ? 25000 : 50000,
          statutory_citation: 'Section 36(1) read with Section 48 (' + v.rule_reference + ')',
          remarks: isCompoundable ? ('Statutory fee for ' + effectiveTier + ' offence.') : 'Uncompoundable repeat offence.',
        };
      });

      const disc = isCompoundable && promptSettlement ? Math.round(gross * 0.20) : 0;
      const net = gross - disc;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      setResult({
        total_violations: violations.length,
        offence_count: offenceCount,
        effective_offence_tier: effectiveTier,
        is_compoundable: isCompoundable,
        court_prosecution_mandatory: !isCompoundable,
        gross_compounding_fee_inr: gross,
        prompt_settlement_discount_inr: disc,
        net_payable_compounding_fee_inr: net,
        due_date: dueDate.toISOString(),
        three_year_reset_applied: threeYearReset,
        breakdown: breakdownItems,
        statutory_authorities: [
          'Section 36(1), Legal Metrology Act, 2009',
          'Section 48, Legal Metrology Act, 2009',
          'Jan Vishwas (Amendment of Provisions) Act, 2023',
        ],
        enforcement_summary: isCompoundable 
          ? ('Total compounding fee assessed at INR ' + net.toLocaleString('en-IN') + '. Due by ' + dueDate.toLocaleDateString('en-IN') + '.')
          : 'Subsequent repeat offence cannot be compounded under Section 48(1) proviso. Court prosecution required.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateFees();
    }
  }, [isOpen, offenceCount, promptSettlement, hasPreviousOffence, daysSinceLastOffence, violations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] border border-neutral-300 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-[10px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
              <Scales size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-heading">
                Statutory Compounding Fee Calculator
              </h2>
              <p className="text-xs text-neutral-600">
                Section 48 read with Section 36(1), Legal Metrology Act, 2009
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-neutral-800 flex-1">
          
          {/* Offence Tier Selector */}
          <div className="bg-neutral-50 p-3.5 rounded-[6px] border border-neutral-200 space-y-2.5">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Info size={15} className="text-primary" />
              Offence History & Statutory Multiplier
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setOffenceCount(1); setHasPreviousOffence(false); }}
                className={'py-2 px-3 rounded border text-center font-medium transition-all ' + (
                  offenceCount === 1
                    ? 'bg-primary text-white border-primary shadow-xs font-bold'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                )}
              >
                1st Offence
                <div className="text-[10px] font-normal opacity-90">Base Schedule</div>
              </button>

              <button
                type="button"
                onClick={() => { setOffenceCount(2); setHasPreviousOffence(true); }}
                className={'py-2 px-3 rounded border text-center font-medium transition-all ' + (
                  offenceCount === 2
                    ? 'bg-primary text-white border-primary shadow-xs font-bold'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                )}
              >
                2nd Offence
                <div className="text-[10px] font-normal opacity-90">2x Fee (Sec. 48)</div>
              </button>

              <button
                type="button"
                onClick={() => { setOffenceCount(3); setHasPreviousOffence(true); }}
                className={'py-2 px-3 rounded border text-center font-medium transition-all ' + (
                  offenceCount >= 3
                    ? 'bg-violation text-white border-violation shadow-xs font-bold'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                )}
              >
                3rd+ Offence
                <div className="text-[10px] font-normal opacity-90">Court Prosecution</div>
              </button>
            </div>

            {/* 3-Year Reset Input (Section 48(2)) */}
            {hasPreviousOffence && (
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-neutral-500" />
                  <span className="text-neutral-700">Days since previous compounding:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={daysSinceLastOffence}
                    onChange={(e) => setDaysSinceLastOffence(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-xs border border-neutral-300 rounded bg-white font-mono text-right"
                  />
                  <span className="text-[11px] text-neutral-500">days</span>
                </div>
              </div>
            )}

            {result?.three_year_reset_applied && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[11px] flex items-center gap-1.5">
                <CheckCircle size={14} weight="bold" />
                <span><b>Section 48(2) 3-Year Reset Applied:</b> Exceeded 1,095 days since prior compounding; statutory status reset to First Offence.</span>
              </div>
            )}

            {/* Jan Vishwas Act Prompt Settlement Discount Checkbox */}
            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promptSettlement}
                  onChange={(e) => setPromptSettlement(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-medium text-neutral-800 flex items-center gap-1">
                  <Percent size={13} className="text-primary" />
                  Jan Vishwas Act Prompt Settlement (20% reduction if paid in 15 days)
                </span>
              </label>
            </div>
          </div>

          {/* Uncompoundable Warning Banner */}
          {result && !result.is_compoundable && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-[6px] text-red-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-violation">
                <XCircle size={18} weight="bold" />
                Mandatory Court Prosecution (Uncompoundable Offence)
              </div>
              <p className="text-xs leading-relaxed text-red-800">
                Under the proviso to Section 48(1) of the Legal Metrology Act, 2009, 
                subsequent repeat offences cannot be compounded. The matter must be referred 
                for trial before the Judicial Magistrate First Class / Metropolitan Magistrate under Section 36(1).
              </p>
            </div>
          )}

          {/* Breakdown Table */}
          {result && (
            <div className="space-y-2">
              <div className="font-bold text-neutral-900">Itemized Statutory Breakdown</div>
              <div className="border border-neutral-200 rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-semibold">
                    <tr>
                      <th className="p-2">Infraction / Rule</th>
                      <th className="p-2 text-right">Base (INR)</th>
                      <th className="p-2 text-center">Mult.</th>
                      <th className="p-2 text-right">Calculated (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {result.breakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="p-2">
                          <div className="font-bold text-neutral-900">{item.title}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{item.rule_reference} • {item.act_section}</div>
                        </td>
                        <td className="p-2 text-right font-mono">
                          ₹{item.base_compounding_fee_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-center font-mono">
                          {item.multiplier}x
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-neutral-900">
                          {result.is_compoundable ? ('₹' + item.calculated_fee_inr.toLocaleString('en-IN')) : 'Prohibited'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              {result.is_compoundable && (
                <div className="bg-neutral-50 p-3 rounded-[6px] border border-neutral-200 space-y-1.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Gross Compounding Assessment:</span>
                    <span className="font-mono">₹{result.gross_compounding_fee_inr.toLocaleString('en-IN')}</span>
                  </div>
                  {result.prompt_settlement_discount_inr > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Jan Vishwas Prompt Settlement (20%):</span>
                      <span className="font-mono">-₹{result.prompt_settlement_discount_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-neutral-300 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Net Payable Compounding Amount:</span>
                    <span className="text-primary font-mono text-base">₹{result.net_payable_compounding_fee_inr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statutory Notice Note */}
          <div className="text-[11px] text-neutral-500 border-l-2 border-primary pl-2.5 py-0.5">
            Compounding orders must be remitted within 15 calendar days to the State Consolidated Fund. 
            Non-deposition leads to mandatory prosecution under Section 36(1) of the Legal Metrology Act, 2009.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-b-[10px]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {result && onApply && result.is_compoundable && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => { onApply(result); onClose(); }}
                icon={<CheckCircle size={16} />}
              >
                Apply to Case File
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
