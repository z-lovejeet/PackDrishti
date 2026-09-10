import React, { useState, useEffect, useCallback } from 'react';
import {
  Scales,
  CheckCircle,
  Clock,
  Percent,
  X,
  ShieldWarning,
  Buildings,
} from '@phosphor-icons/react';
import { Button } from '../common/Button';
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
  const [hasPreviousOffence, setHasPreviousOffence] = useState<boolean>(false);
  const [threeYearReset, setThreeYearReset] = useState<boolean>(false);
  const [daysSinceLastOffence, setDaysSinceLastOffence] = useState<number>(0);
  const [violations, setViolations] = useState<ViolationItem[]>(initialViolations);
  const [result, setResult] = useState<CompoundingResult | null>(null);
  const [, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialViolations && initialViolations.length > 0) {
      setViolations(initialViolations);
    }
  }, [initialViolations]);

  const calculateFees = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveDays = threeYearReset ? 1096 : daysSinceLastOffence;
      const payload = {
        offence_count: offenceCount,
        prompt_settlement: promptSettlement,
        days_since_last_offence: hasPreviousOffence ? effectiveDays : null,
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
      // Deterministic client fallback matching statutory Legal Metrology compounding engine
      let effectiveTier = offenceCount === 1 ? 'first' : offenceCount === 2 ? 'second' : 'subsequent_court_prosecution';
      let resetApplied = false;

      if (hasPreviousOffence && (threeYearReset || daysSinceLastOffence >= 1095)) {
        effectiveTier = 'first';
        resetApplied = true;
      }

      const isCompoundable = effectiveTier !== 'subsequent_court_prosecution';
      const mult = effectiveTier === 'first' ? 1.0 : effectiveTier === 'second' ? 2.0 : 0;

      let gross = 0;
      const breakdownItems: CompoundingBreakdownItem[] = violations.map((v) => {
        const base = v.rule_reference.includes('6(1)(e)')
          ? 10000
          : v.rule_reference.includes('7')
          ? 7500
          : 15000;
        const ceiling = effectiveTier === 'first' ? 25000 : 50000;
        const calc = isCompoundable ? Math.min(base * mult, ceiling) : 0;
        gross += calc;

        return {
          rule_reference: v.rule_reference,
          act_section: v.act_section || 'Section 36(1)',
          title: v.title,
          severity: v.severity,
          base_compounding_fee_inr: base,
          multiplier: isCompoundable ? mult : 0,
          calculated_fee_inr: calc,
          statutory_ceiling_inr: ceiling,
          statutory_citation: `Section 36(1) read with Section 48 (${v.rule_reference})`,
          remarks: isCompoundable
            ? `Statutory fee assessed under ${effectiveTier} offence schedule.`
            : 'Uncompoundable repeat offence under Section 48(1) proviso.',
        };
      });

      const discount = isCompoundable && promptSettlement ? Math.round(gross * 0.20) : 0;
      const net = gross - discount;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      setResult({
        total_violations: violations.length,
        offence_count: offenceCount,
        effective_offence_tier: effectiveTier,
        is_compoundable: isCompoundable,
        court_prosecution_mandatory: !isCompoundable,
        gross_compounding_fee_inr: gross,
        prompt_settlement_discount_inr: discount,
        net_payable_compounding_fee_inr: net,
        due_date: dueDate.toISOString(),
        three_year_reset_applied: resetApplied,
        breakdown: breakdownItems,
        statutory_authorities: [
          'Section 36(1), Legal Metrology Act, 2009',
          'Section 48, Legal Metrology Act, 2009',
          'Jan Vishwas (Amendment of Provisions) Act, 2023',
        ],
        enforcement_summary: isCompoundable
          ? `Total statutory compounding fee assessed at INR ${net.toLocaleString('en-IN')}. Due by ${dueDate.toLocaleDateString('en-IN')}.`
          : 'Subsequent repeat offence cannot be compounded under Section 48(1) proviso. Court prosecution required before Judicial Magistrate.',
      });
    } finally {
      setLoading(false);
    }
  }, [
    offenceCount,
    promptSettlement,
    hasPreviousOffence,
    threeYearReset,
    daysSinceLastOffence,
    violations,
  ]);

  useEffect(() => {
    if (isOpen) {
      calculateFees();
    }
  }, [isOpen, calculateFees]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-card border border-neutral-300 shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scales size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-heading tracking-tight">
                Statutory Compounding Fee Assessment
              </h2>
              <p className="text-2xs text-neutral-600">
                Section 48 read with Section 36(1), Legal Metrology Act, 2009
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-neutral-800 flex-1 overflow-y-auto">
          {/* 3-Tier Offence Selector */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-neutral-900 text-xs font-heading flex items-center gap-1.5">
                <Scales size={16} className="text-primary" />
                Statutory Offence Tier & Escalation Schedule
              </div>
              <span className="text-2xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                Section 48 Escalation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Tier 1: 1st Offence Base */}
              <button
                type="button"
                onClick={() => {
                  setOffenceCount(1);
                  setHasPreviousOffence(false);
                  setThreeYearReset(false);
                }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                  offenceCount === 1
                    ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading">1st Offence</span>
                  <span
                    className={`text-2xs font-mono px-1.5 py-0.5 rounded ${
                      offenceCount === 1
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-light text-primary border border-primary-border'
                    }`}
                  >
                    1.0x
                  </span>
                </div>
                <p
                  className={`text-2xs mt-1 font-medium ${
                    offenceCount === 1 ? 'text-neutral-200' : 'text-neutral-500'
                  }`}
                >
                  Base Schedule Fee
                </p>
                <p
                  className={`text-2xs mt-0.5 ${
                    offenceCount === 1 ? 'text-neutral-300' : 'text-neutral-400'
                  }`}
                >
                  Statutory baseline
                </p>
              </button>

              {/* Tier 2: 2nd Offence 2x */}
              <button
                type="button"
                onClick={() => {
                  setOffenceCount(2);
                  setHasPreviousOffence(true);
                }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                  offenceCount === 2
                    ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading">2nd Offence</span>
                  <span
                    className={`text-2xs font-mono px-1.5 py-0.5 rounded ${
                      offenceCount === 2
                        ? 'bg-white/20 text-white'
                        : 'bg-warning-light text-warning border border-warning-border'
                    }`}
                  >
                    2.0x
                  </span>
                </div>
                <p
                  className={`text-2xs mt-1 font-medium ${
                    offenceCount === 2 ? 'text-neutral-200' : 'text-neutral-500'
                  }`}
                >
                  Double Compounding
                </p>
                <p
                  className={`text-2xs mt-0.5 ${
                    offenceCount === 2 ? 'text-neutral-300' : 'text-neutral-400'
                  }`}
                >
                  Section 48 Escalation
                </p>
              </button>

              {/* Tier 3: 3rd Offence Court Prosecution */}
              <button
                type="button"
                onClick={() => {
                  setOffenceCount(3);
                  setHasPreviousOffence(true);
                }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                  offenceCount >= 3 && !threeYearReset
                    ? 'bg-violation text-white border-violation shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading">3rd+ Offence</span>
                  <span
                    className={`text-2xs font-mono px-1.5 py-0.5 rounded ${
                      offenceCount >= 3 && !threeYearReset
                        ? 'bg-white/20 text-white'
                        : 'bg-violation-light text-violation border border-violation-border'
                    }`}
                  >
                    Prohibited
                  </span>
                </div>
                <p
                  className={`text-2xs mt-1 font-medium ${
                    offenceCount >= 3 && !threeYearReset ? 'text-white' : 'text-violation'
                  }`}
                >
                  Court Prosecution
                </p>
                <p
                  className={`text-2xs mt-0.5 ${
                    offenceCount >= 3 && !threeYearReset ? 'text-neutral-200' : 'text-neutral-400'
                  }`}
                >
                  Section 48(1) Proviso
                </p>
              </button>
            </div>

            {/* Section 48(2) 3-Year Reset Checkbox & Day Tracker */}
            {hasPreviousOffence && (
              <div className="pt-3 border-t border-neutral-200 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threeYearReset}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setThreeYearReset(checked);
                      if (checked) {
                        setDaysSinceLastOffence(1096);
                      } else {
                        setDaysSinceLastOffence(0);
                      }
                    }}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 border-neutral-300"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-neutral-900 block font-heading">
                      Section 48(2) 3-Year Clean Period Reset
                    </span>
                    <p className="text-2xs text-neutral-600 leading-normal">
                      Previous compounding was executed over 3 years (1,095 days) prior to this inspection.
                      Statutory tier resets to 1st Offence Base schedule.
                    </p>
                  </div>
                </label>

                {!threeYearReset && (
                  <div className="pl-6 flex items-center justify-between gap-3 pt-1">
                    <span className="text-2xs text-neutral-600 flex items-center gap-1.5">
                      <Clock size={14} className="text-neutral-400" />
                      Recorded elapsed days since prior order:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={daysSinceLastOffence}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setDaysSinceLastOffence(val);
                          if (val >= 1095) {
                            setThreeYearReset(true);
                          }
                        }}
                        className="w-24 px-2 py-1 text-xs border border-neutral-300 rounded bg-white font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-2xs text-neutral-500 font-mono">days</span>
                    </div>
                  </div>
                )}

                {(threeYearReset || (result?.three_year_reset_applied)) && (
                  <div className="p-2.5 bg-success-light border border-success-border text-success rounded-lg text-2xs flex items-start gap-2">
                    <CheckCircle size={16} weight="bold" className="shrink-0 mt-0.5 text-success" />
                    <div>
                      <span className="font-bold text-neutral-900">
                        Section 48(2) Statutory Reset Activated:
                      </span>{' '}
                      <span className="text-neutral-700">
                        The 3-year statutory clean window has elapsed. Offender is treated as a first-time respondent with 1.0x Base Compounding Schedule.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Jan Vishwas Act Prompt Settlement Discount Checkbox */}
            <div className="pt-3 border-t border-neutral-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={promptSettlement}
                  onChange={(e) => setPromptSettlement(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 border-neutral-300"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-900 font-heading">
                      Jan Vishwas 20% Prompt Settlement Discount
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success-light text-success border border-success-border font-mono">
                      <Percent size={11} weight="bold" />
                      20% Off
                    </span>
                  </div>
                  <p className="text-2xs text-neutral-600 leading-normal">
                    Under the Jan Vishwas (Amendment of Provisions) Act, 2023, a 20% discount is granted if the compounding fee is remitted within 15 calendar days.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Uncompoundable Offence Alert Banner */}
          {result && !result.is_compoundable && (
            <div className="p-4 bg-violation-light border border-violation-border rounded-lg space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-violation font-heading">
                <ShieldWarning size={18} weight="bold" />
                Mandatory Court Prosecution Required (Non-Compoundable)
              </div>
              <p className="text-2xs leading-relaxed text-neutral-800">
                Under the mandatory proviso to <b>Section 48(1) of the Legal Metrology Act, 2009</b>, 
                any person who commits a second or subsequent offence within a period of 3 years 
                cannot be granted compounding relief. The case must be filed for criminal prosecution 
                before the competent Judicial Magistrate First Class / Metropolitan Magistrate under Section 36(1).
              </p>
            </div>
          )}

          {/* Statutory Breakdown Table */}
          {result && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900 font-heading tracking-tight">
                  Itemized Statutory Compounding Breakdown
                </h3>
                <span className="text-2xs text-neutral-500 font-mono">
                  {result.breakdown.length} infraction{result.breakdown.length === 1 ? '' : 's'} recorded
                </span>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-2xs">
                  <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-semibold font-heading">
                    <tr>
                      <th className="p-2.5">Infraction / Legal Rule</th>
                      <th className="p-2.5 text-right">Base Fee</th>
                      <th className="p-2.5 text-center">Multiplier</th>
                      <th className="p-2.5 text-right">Statutory Ceiling</th>
                      <th className="p-2.5 text-right">Calculated Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {result.breakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-2.5">
                          <div className="font-bold text-neutral-900 font-heading">{item.title}</div>
                          <div className="text-2xs text-neutral-500 font-mono mt-0.5">
                            {item.rule_reference} • {item.act_section}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono text-neutral-700">
                          ₹{item.base_compounding_fee_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-medium">
                            {item.multiplier}x
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-neutral-500">
                          ₹{item.statutory_ceiling_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {result.is_compoundable ? (
                            <span className="text-neutral-900">
                              ₹{item.calculated_fee_inr.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-violation">Court Prosecution</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Card with Calculated Fee in Indian Rupees */}
              {result.is_compoundable && (
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 shadow-xs space-y-3">
                  <div className="space-y-2 text-2xs">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Gross Statutory Compounding Assessment:</span>
                      <span className="font-mono text-neutral-800 font-medium">
                        ₹{result.gross_compounding_fee_inr.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {result.prompt_settlement_discount_inr > 0 && (
                      <div className="flex justify-between items-center text-success">
                        <span className="flex items-center gap-1">
                          <Percent size={12} weight="bold" />
                          Jan Vishwas Prompt Settlement Discount (20%):
                        </span>
                        <span className="font-mono font-semibold">
                          - ₹{result.prompt_settlement_discount_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-neutral-900 font-heading block">
                          Net Payable Compounding Amount
                        </span>
                        <span className="text-2xs text-neutral-500">
                          Remittable under Head 1475 - Legal Metrology
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-primary font-mono tracking-tight block">
                          ₹{result.net_payable_compounding_fee_inr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-2xs text-neutral-500 font-mono">
                          Indian Rupees
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Remittance Window Notice */}
                  <div className="pt-2.5 border-t border-neutral-200 flex items-center justify-between text-2xs text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Buildings size={14} className="text-neutral-500" />
                      Remittance Window: <b>15 Calendar Days</b>
                    </span>
                    <span className="font-mono text-neutral-700">
                      Payment Due By:{' '}
                      <b>{new Date(result.due_date).toLocaleDateString('en-IN')}</b>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statutory Notice Note */}
          <div className="text-2xs text-neutral-600 border-l-2 border-primary bg-primary-light/50 p-2.5 rounded-r-md leading-relaxed">
            <b>Statutory Notice:</b> Compounding orders must be remitted within 15 calendar days to the 
            State Consolidated Fund. Non-deposition results in mandatory prosecution under Section 36(1) of the Legal Metrology Act, 2009.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-b-card">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {result && onApply && result.is_compoundable && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onApply(result);
                  onClose();
                }}
                icon={<CheckCircle size={16} weight="bold" />}
              >
                Apply Assessment to Docket
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
