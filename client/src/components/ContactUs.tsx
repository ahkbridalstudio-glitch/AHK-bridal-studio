import React, { useState } from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2, Navigation, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { DirectInquiry } from '../types/admin';
import { api } from '../services/api';

interface ContactUsProps {
  onOpenMap: () => void;
  onSendMessage?: (inquiry: DirectInquiry) => void;
}

// Converts inputs like 03360333585 or 0336-0333585 into +923360333585 for WhatsApp compatibility
export const formatPakistanPhone = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');

  // 11-digit Pakistani mobile starting with 03 (e.g. 03360333585 -> +923360333585)
  if (digitsOnly.startsWith('03') && digitsOnly.length === 11) {
    return `+92${digitsOnly.slice(1)}`;
  }

  // Any other Pakistani mobile with leading 0 (e.g. 0300... -> +92300...)
  if (digitsOnly.startsWith('0') && digitsOnly.length >= 10) {
    return `+92${digitsOnly.slice(1)}`;
  }

  // 10 digits starting with 3 (e.g. 3360333585 -> +923360333585)
  if (digitsOnly.startsWith('3') && digitsOnly.length === 10) {
    return `+92${digitsOnly}`;
  }

  // Already has 92 (e.g. 923360333585 or +923360333585)
  if (digitsOnly.startsWith('92')) {
    return `+${digitsOnly}`;
  }

  // International phone starting with +
  if (trimmed.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  // Fallback
  return digitsOnly.length >= 9 ? `+92${digitsOnly}` : (digitsOnly ? `+${digitsOnly}` : trimmed);
};

export const ContactUs: React.FC<ContactUsProps> = ({ onOpenMap, onSendMessage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [inquiryType, setInquiryType] = useState('Dolmen Mall Tariq Road Store Visit');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const ticketNumber = `NA-${Math.floor(10000 + Math.random() * 90000)}`;
    const formattedPhone = formatPakistanPhone(phone);

    // Determine priority based on wedding timeline or urgency
    let priority: DirectInquiry['priority'] = 'Normal';
    if (inquiryType === 'Rush Wedding Timeline Inquiry' || message.toLowerCase().includes('rush') || message.toLowerCase().includes('urgent')) {
      priority = 'Rush';
    } else if (inquiryType === 'Dolmen Mall Tariq Road Store Visit') {
      priority = 'High';
    } else if (weddingDate) {
      try {
        const diffDays = Math.ceil((new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45 && diffDays > 0) priority = 'Rush';
      } catch {
        // ignore
      }
    }

    const newInquiry: DirectInquiry = {
      id: `inq-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: formattedPhone,
      email: email.trim(),
      cityCountry: cityCountry.trim() || 'Pakistan',
      weddingDate: weddingDate || undefined,
      inquiryType,
      message: message.trim(),
      status: 'New',
      priority
    };

    try {
      setSubmitError(null);
      const createdInquiry = await api.submitInquiry(newInquiry);
      window.dispatchEvent(new CustomEvent('ahk_new_inquiry', { detail: createdInquiry }));
      onSendMessage?.(createdInquiry);
      setSubmittedTicket(createdInquiry.ticketNumber);
      setSubmittedPhone(createdInquiry.phone);
      setPhone(createdInquiry.phone);
      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message || 'Could not submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="py-16 lg:py-24 bg-[#FAF8F5] border-b border-[#E8DCCB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Connect with AHK Bridal Studio</span>
            <span aria-hidden="true">·</span>
            <span>Dolmen Mall Tariq Road Flagship</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight text-balance">
            Visit Our Store or Contact Us
          </h2>
          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
            Our flagship bridal studio is located at <strong>Dolmen Mall, Tariq Road, Karachi</strong>. Come explore our bridal lehengas, meet our couture team, or send us a message below.
          </p>
        </div>

        {/* Featured Flagship Store Banner with Direct Map Trigger */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#1C1417] text-white border border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E5C378]">
              <MapPin className="w-4 h-4 text-[#E5C378]" />
              <span>Flagship Bridal Studio · Karachi</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF8F5]">
              AHK Studio · Dolmen Mall Tariq Road
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Shop # G-32, Ground Floor, AHK Studio, Dolmen Mall, Tariq Road, Karachi, Pakistan.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1 font-mono">
              <span className="flex items-center gap-1.5 text-[#E5C378]">
                <Clock className="w-3.5 h-3.5" />
                <span>Open Daily: 11:30 AM – 10:30 PM PKT</span>
              </span>
              <span>·</span>
              <span>Phone / WhatsApp: <a href="tel:+923222586576" className="text-white hover:text-[#E5C378] font-bold underline decoration-[#C5A059]">+92 322 2586576</a></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenMap}
              className="py-3 px-5 bg-[#C5A059] hover:bg-[#B38728] text-[#1C1417] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Store Map & Directions</span>
            </button>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Dolmen+Mall+Tariq+Road+Karachi"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 text-xs font-medium uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* 2-Column Grid: Contact Form & Atelier Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Interactive Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D5C2AD] p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-8 sm:py-10 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#FAF0E1] text-[#4A0E17] border-2 border-[#C5A059] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9 text-[#4A0E17]" />
                </div>
                
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dispatched to Admin Portal · Dolmen Mall Karachi</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#360810]">
                    Inquiry Received, {name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68554E] max-w-lg mx-auto leading-relaxed">
                    Your inquiry has been logged as Ticket <strong className="font-mono text-[#4A0E17]">#{submittedTicket}</strong>. The AHK studio master and couture team have received your full message in the Admin Portal and will reach out via WhatsApp (<span className="font-mono font-medium text-[#4A0E17]">{submittedPhone || phone}</span>) or Email within 4 business hours.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D2C3] max-w-md mx-auto text-left text-xs space-y-1.5">
                  <div className="flex justify-between border-b border-[#E8DDD1] pb-1.5">
                    <span className="text-[#78655E]">Ticket ID:</span>
                    <span className="font-mono font-bold text-[#4A0E17]">#{submittedTicket}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8DDD1] pb-1.5">
                    <span className="text-[#78655E]">WhatsApp Number:</span>
                    <span className="font-mono font-bold text-emerald-700">{submittedPhone || phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8DDD1] pb-1.5">
                    <span className="text-[#78655E]">Inquiry Category:</span>
                    <span className="font-medium text-[#360810]">{inquiryType}</span>
                  </div>
                  {weddingDate && (
                    <div className="flex justify-between border-b border-[#E8DDD1] pb-1.5">
                      <span className="text-[#78655E]">Wedding Date:</span>
                      <span className="font-mono font-medium text-[#360810]">{weddingDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-0.5">
                    <span className="text-[#78655E]">Status:</span>
                    <span className="font-mono text-emerald-700 font-bold">Queued for Stylist Review</span>
                  </div>
                </div>

                {/* Instant WhatsApp bridge & Send Another Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <a
                    href={`https://wa.me/923222586576?text=${encodeURIComponent(
                      `Assalam o Alaikum AHK Bridal Studio! I just submitted an inquiry on your website (Ticket #${submittedTicket}) regarding ${inquiryType}. My name is ${name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-[#0F5132] hover:bg-[#0c4128] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp Now</span>
                  </a>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-[#4A0E17] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#681421] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {submitError && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">{submitError}</p>}
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-[#360810] font-semibold">
                    Send Direct Message
                  </h3>
                  <p className="text-xs text-[#78655E]">
                    Our couture stylists answer all inquiries personally within 4 business hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. Fatima Tariq"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      WhatsApp Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => {
                        if (phone.trim()) {
                          setPhone(formatPakistanPhone(phone));
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 03360333585 or +923360333585"
                    />
                    <span className="text-[10px] text-[#997A3D] font-mono mt-0.5 block">
                      Auto-converts 0336... to +92336... for direct WhatsApp
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="fatima@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      City & Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={cityCountry}
                      onChange={(e) => setCityCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. Karachi, Pakistan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                    >
                      <option value="Dolmen Mall Tariq Road Store Visit">Dolmen Mall Tariq Road Store Visit</option>
                      <option value="Order & Sizing Assistance">Order & Sizing Assistance</option>
                      <option value="Custom Bespoke Design Tool Question">Custom Bespoke Design Tool Question</option>
                      <option value="Fabric Swatches & Zari Samples">Fabric Swatches & Zari Samples</option>
                      <option value="Rush Wedding Timeline Inquiry">Rush Wedding Timeline Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Tentative Wedding Date
                    </label>
                    <input
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                    Your Message / Specific Request *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none leading-relaxed"
                    placeholder="Tell us about your bridal silhouette preferences, visiting Dolmen Mall Tariq Road, or any specific fabric inquiries..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#E5C378]" />
                  <span>Send Message to Atelier</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Atelier Directory & Quick Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Quick Instant WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-[#1C1417] text-white border border-[#C5A059]/40 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700/80 flex items-center justify-center text-white">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#E5C378] font-mono">Instant Support</div>
                  <h4 className="font-serif text-lg font-semibold">Bridal WhatsApp Desk</h4>
                </div>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Connect directly with our master stylists at Dolmen Mall Tariq Road for live location, real-time video swatches, and sizing assistance.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://wa.me/923222586576?text=Hello%20AHK%20Bridal%20Studio,%20I%20would%20like%20to%20inquire%20about%20bridal%20wear"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-[#E5C378] font-bold hover:underline flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>+92 322 2586576</span>
                </a>
                <span className="text-[11px] text-stone-400 font-mono">10 AM - 10 PM PKT</span>
              </div>
            </div>

            {/* Exclusive Karachi Physical Boutique Details */}
            <div className="space-y-4">
              <h4 className="font-serif text-xl text-[#360810] font-semibold">
                Our Physical Boutique Location
              </h4>

              <div className="space-y-3">
                {/* Dolmen Mall Tariq Road Exclusive Store */}
                <div className="p-5 bg-[#FAF0E1] rounded-xl border-2 border-[#C5A059] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-base font-bold text-[#4A0E17] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C5A059]" />
                      <span>AHK Studio · Karachi</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[#4A0E17] text-white px-2 py-0.5 rounded font-semibold uppercase">
                      Exclusive Shop
                    </span>
                  </div>
                  <div className="text-xs text-[#5C4942] space-y-1">
                    <p className="font-semibold text-[#360810] text-sm">
                      Shop # G-32, Ground Floor, AHK Studio
                    </p>
                    <p>
                      Dolmen Mall, Tariq Road, Karachi, Pakistan
                    </p>
                    <p className="text-[#8C2333] font-medium pt-0.5">
                      (We only operate our physical boutique in Karachi; no branches in Lahore, London, or Dubai)
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono text-[#4A0E17] flex flex-col gap-1.5 border-t border-[#D5C2AD]/50">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Phone: <a href="tel:+923222586576" className="font-bold hover:underline">+92 322 2586576</a></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp: <a href="https://wa.me/923222586576?text=Hello%20AHK%20Bridal%20Studio" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-emerald-800">+92 322 2586576</a></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Email: <a href="mailto:karachi@ahkbridal.com" className="hover:underline">karachi@ahkbridal.com</a></span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={onOpenMap}
                      className="w-full py-2 px-3 bg-[#4A0E17] hover:bg-[#681421] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>View Map, Floor & Directions</span>
                    </button>
                  </div>
                </div>

                {/* Worldwide Courier Info Card */}
                <div className="p-4 bg-white rounded-xl border border-[#D5C2AD] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold text-[#360810]">Worldwide Bridal Shipping</span>
                    <span className="text-[10px] font-mono text-[#997A3D] uppercase">Insured Courier</span>
                  </div>
                  <p className="text-xs text-[#68554E] leading-relaxed">
                    While our only physical studio is at Dolmen Mall Karachi, we ship bespoke wedding suits directly to brides worldwide across the USA, UK, Canada, UAE, Europe, and all Pakistan.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
