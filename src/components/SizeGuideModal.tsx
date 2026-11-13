import React from 'react';
import { X, Sparkles, Check, Info, Ruler } from 'lucide-react';
import { AHK_SIZE_GUIDE, BridalSize } from '../types/bridal';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: BridalSize | string;
  onSelectSize?: (size: BridalSize) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
}) => {
  if (!isOpen) return null;

  const sizes: BridalSize[] = ['S', 'M', 'L', 'XL'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF8F5] border border-[#D5C2AD] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#360810] text-[#FAF8F5] border-b border-[#54131D] flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#E5C378]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AHK BRIDAL STUDIO</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF8F5] tracking-tight">
              SIZE GUIDE
            </h2>
            <p className="text-xs text-[#E0D2C3] font-mono tracking-wider">
              ALL MEASUREMENTS ARE IN INCHES (INCH)
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10 cursor-pointer"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick instructions / notice */}
          <div className="flex items-start gap-3 p-3.5 bg-[#F5EFEB] border border-[#E3D4C4] rounded-xl text-xs text-[#68554E] leading-relaxed">
            <Ruler className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#360810]">Standard Bridal Sizing:</span> Our bespoke silhouettes are tailored according to the traditional royal Pakistani bridal drape. Reference the precise measurements below to choose your ideal size.
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto rounded-xl border border-[#D5C2AD] shadow-xs bg-white">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-[#4A0E17] text-white">
                  <th className="py-3 px-4 text-left font-mono uppercase tracking-wider text-[11px] font-bold text-[#E5C378] border-r border-[#631823]">
                    MEASUREMENT (INCH)
                  </th>
                  {sizes.map((s) => (
                    <th 
                      key={s} 
                      className={`py-3 px-4 font-mono font-bold text-sm tracking-widest border-r border-[#631823] last:border-r-0 transition-colors ${
                        selectedSize === s ? 'bg-[#C5A059] text-[#1C1417]' : 'hover:bg-[#5C131F]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{s}</span>
                        {selectedSize === s && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE0D3]">
                {AHK_SIZE_GUIDE.map((row, idx) => (
                  <tr 
                    key={row.parameter}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-[#FAF6F0]' : 'bg-[#FAF8F5] hover:bg-[#FAF6F0]'}
                  >
                    <td className="py-3.5 px-4 text-left font-mono font-bold text-[#360810] border-r border-[#EAE0D3]">
                      <div className="text-xs uppercase tracking-wider text-[#4A0E17] font-bold">
                        {row.parameter}
                      </div>
                      <div className="text-[10px] text-[#8C766C] font-sans font-normal mt-0.5">
                        {row.description}
                      </div>
                    </td>
                    <td className={`py-3.5 px-4 font-mono text-sm font-semibold border-r border-[#EAE0D3] ${
                      selectedSize === 'S' ? 'bg-[#C5A059]/15 text-[#4A0E17] font-bold' : 'text-[#4A0E17]'
                    }`}>
                      {row.S}&quot;
                    </td>
                    <td className={`py-3.5 px-4 font-mono text-sm font-semibold border-r border-[#EAE0D3] ${
                      selectedSize === 'M' ? 'bg-[#C5A059]/15 text-[#4A0E17] font-bold' : 'text-[#4A0E17]'
                    }`}>
                      {row.M}&quot;
                    </td>
                    <td className={`py-3.5 px-4 font-mono text-sm font-semibold border-r border-[#EAE0D3] ${
                      selectedSize === 'L' ? 'bg-[#C5A059]/15 text-[#4A0E17] font-bold' : 'text-[#4A0E17]'
                    }`}>
                      {row.L}&quot;
                    </td>
                    <td className={`py-3.5 px-4 font-mono text-sm font-semibold ${
                      selectedSize === 'XL' ? 'bg-[#C5A059]/15 text-[#4A0E17] font-bold' : 'text-[#4A0E17]'
                    }`}>
                      {row.XL}&quot;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Size Selection Selector if interactive */}
          {onSelectSize && (
            <div className="pt-2">
              <div className="text-xs font-mono uppercase text-[#78655E] mb-2 font-bold">
                Choose Size to Apply:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onSelectSize(s);
                      onClose();
                    }}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedSize === s
                        ? 'bg-[#4A0E17] text-white shadow-md ring-2 ring-[#C5A059]'
                        : 'bg-white border border-[#D5C2AD] text-[#360810] hover:border-[#C5A059] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span>Size {s}</span>
                    {selectedSize === s && <Check className="w-3.5 h-3.5 text-[#E5C378]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Atelier Tailoring Promise */}
          <div className="p-4 bg-[#F2EDE6] rounded-xl border border-[#DDCFBF] space-y-1.5 text-left text-xs text-[#5C4942]">
            <div className="font-semibold text-[#360810] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Complimentary Atelier Fitting Adjustments</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#68554E]">
              Every bridal order at AHK Bridal Studio includes 1-on-1 WhatsApp bridal styling consultation. Our master tailors ensure 100% precision fit before dispatching your heirloom ensemble.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F5EFEB] border-t border-[#E3D4C4] flex items-center justify-between">
          <div className="text-[11px] text-[#78655E] font-mono">
            AHK BRIDAL STUDIO · KARACHI
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#4A0E17] hover:bg-[#631823] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
