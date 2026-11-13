import React from 'react';
import { Ruler, Sparkles, AlertCircle, Info } from 'lucide-react';
import { CustomSizeMeasurements } from '../types/bridal';

interface CustomSizeMeasurementFormProps {
  measurements: CustomSizeMeasurements;
  onChange: (updated: CustomSizeMeasurements) => void;
  showErrors?: boolean;
}

export const CustomSizeMeasurementForm: React.FC<CustomSizeMeasurementFormProps> = ({
  measurements,
  onChange,
  showErrors = false,
}) => {
  const handleChange = (field: keyof CustomSizeMeasurements, val: string) => {
    // Keep numbers and single decimal point (e.g. 15.5)
    const cleaned = val.replace(/[^0-9.]/g, '');
    onChange({
      ...measurements,
      [field]: cleaned,
    });
  };

  const fields: Array<{
    id: keyof CustomSizeMeasurements;
    label: string;
    placeholder: string;
    description: string;
    standardRange: string;
  }> = [
    {
      id: 'shoulder',
      label: 'Shoulder',
      placeholder: 'e.g. 15.5',
      description: 'Back seam to seam across shoulder',
      standardRange: '14" – 18"',
    },
    {
      id: 'bust',
      label: 'Bust',
      placeholder: 'e.g. 21',
      description: 'Circumference across fullest bust',
      standardRange: '18" – 26"',
    },
    {
      id: 'hips',
      label: 'Hips',
      placeholder: 'e.g. 22',
      description: 'Circumference around fullest hips',
      standardRange: '18" – 26"',
    },
    {
      id: 'daman',
      label: 'Daman',
      placeholder: 'e.g. 24',
      description: 'Shirt / choli hem flare width',
      standardRange: '20" – 28"',
    },
    {
      id: 'armhole',
      label: 'Armhole',
      placeholder: 'e.g. 8.5',
      description: 'Curved circumference around armhole',
      standardRange: '7" – 10"',
    },
  ];

  const hasEmptyFields = fields.some((f) => !measurements[f.id]?.trim());

  return (
    <div className="p-4 bg-white rounded-2xl border-2 border-[#C5A059]/60 shadow-sm space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E8DCCB] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#4A0E17] uppercase tracking-wider">
            <Ruler className="w-4 h-4 text-[#C5A059]" />
            <span>Custom Made-to-Measure Specifications</span>
          </div>
          <p className="text-[11px] text-[#68554E] leading-relaxed">
            Please enter your exact body or bespoke stitched suit measurements in <strong>inches</strong>. Our Karachi & Lahore master tailors will hand-cut and stitch your dress accordingly.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF0E1] text-[#7A0C1E] border border-[#C5A059]/40">
          Inches (")
        </span>
      </div>

      {/* Required Notice Alert if error triggered */}
      {showErrors && hasEmptyFields && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-mono animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>All 5 measurement fields below are required before adding to cart.</span>
        </div>
      )}

      {/* 5 Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map((f) => {
          const val = measurements[f.id] || '';
          const isMissing = showErrors && !val.trim();

          return (
            <div
              key={f.id}
              className={`p-3 rounded-xl border transition-all ${
                isMissing
                  ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                  : val.trim()
                  ? 'border-[#C5A059] bg-[#FAF8F5]'
                  : 'border-[#DECDBB] bg-white hover:border-[#C5A059]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono font-bold text-[#360810] uppercase flex items-center gap-1">
                  <span>{f.label}</span>
                  <span className="text-rose-600 font-bold">*</span>
                </label>
                <span className="text-[9px] font-mono text-stone-400">
                  Ref: {f.standardRange}
                </span>
              </div>

              <div className="relative mt-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={val}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-white border border-[#D5C2AD] rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-[#360810] placeholder:text-stone-300 focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#997A3D] pointer-events-none">
                  in
                </span>
              </div>

              <p className="text-[10px] text-[#78655E] mt-1.5 line-clamp-1">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Helpful Guarantee Note */}
      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DCCB] flex items-center justify-between text-[11px] font-mono text-[#5C4942]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
          <span>Complimentary boutique margin included for doorstep alterations.</span>
        </div>
        <span className="text-emerald-700 font-bold hidden sm:inline">
          ✓ Karigar Verified
        </span>
      </div>
    </div>
  );
};
