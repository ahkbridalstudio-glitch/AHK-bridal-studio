import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Send,
  MessageCircle,
  Check,
  Archive,
  RefreshCw,
  Tag,
  User,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { DirectInquiry } from '../../types/admin';

interface AdminMessagesProps {
  inquiries: DirectInquiry[];
  onUpdateStatus: (inquiryId: string, status: DirectInquiry['status']) => void;
  onUpdateNotes: (inquiryId: string, notes: string) => void;
  onDeleteInquiry: (inquiryId: string) => void;
  selectedInquiryId?: string | null;
  onSelectInquiry?: (inquiryId: string) => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  inquiries,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteInquiry,
  selectedInquiryId: externalSelectedId,
  onSelectInquiry
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    inquiries[0]?.id || null
  );
  const activeSelectedId = externalSelectedId ?? internalSelectedId;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Read' | 'Replied' | 'Archived'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Active selected item
  const selectedInquiry = inquiries.find((inq) => inq.id === activeSelectedId) || inquiries[0];

  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    onSelectInquiry?.(id);
    // If selecting a 'New' item, optionally mark as Read automatically if needed or leave manual
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    // Status filter
    if (statusFilter !== 'All' && inq.status !== statusFilter) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'All' && inq.inquiryType !== categoryFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inq.name.toLowerCase().includes(q);
      const matchPhone = inq.phone.toLowerCase().includes(q);
      const matchEmail = inq.email.toLowerCase().includes(q);
      const matchCity = inq.cityCountry.toLowerCase().includes(q);
      const matchTicket = inq.ticketNumber.toLowerCase().includes(q);
      const matchType = inq.inquiryType.toLowerCase().includes(q);
      const matchMsg = inq.message.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchCity || matchTicket || matchType || matchMsg;
    }
    return true;
  });

  // Calculate stats
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const repliedCount = inquiries.filter((i) => i.status === 'Replied').length;
  const rushCount = inquiries.filter((i) => i.priority === 'Rush').length;

  // Clean phone number for WhatsApp link: ensures Pakistani numbers start with 92 and overseas country codes remain intact
  const getCleanPhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    // If starts with 0 (e.g. 03360333585), convert leading 0 to 92 -> 923360333585
    if (digits.startsWith('0') && digits.length >= 10) {
      return `92${digits.slice(1)}`;
    }
    // If starts with 3 and is 10 digits (e.g. 3360333585) -> 923360333585
    if (digits.startsWith('3') && digits.length === 10) {
      return `92${digits}`;
    }
    return digits;
  };

  // Helper to format days until wedding
  const getWeddingTimelineBadge = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const wDate = new Date(dateStr);
      const today = new Date();
      const diffTime = wDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
            diffDays <= 45 ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
          }`}>
            Wedding in {diffDays} days
          </span>
        );
      } else {
        return <span className="text-[10px] text-stone-500 font-mono">Date passed</span>;
      }
    } catch {
      return null;
    }
  };

  const handleSaveNotes = (id: string) => {
    const noteText = editingNotes[id] ?? inquiries.find((i) => i.id === id)?.adminNotes ?? '';
    onUpdateNotes(id, noteText);
  };

  const handleCopyQuickTemplate = (templateName: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTemplate(templateName);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>Storefront Direct Messaging Inbox</span>
            <span>•</span>
            <span>Dolmen Mall Tariq Road Flagship</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Client Inquiries & Direct Messages
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time messages submitted by brides and clients via the storefront contact desk, complete with phone, email, and wedding dates.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#1F1722] border border-[#352538] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono text-stone-300">
              <strong className="text-white">{newCount}</strong> New Unread
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1F1722] border border-[#352538] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-stone-300">
              <strong className="text-white">{repliedCount}</strong> Replied
            </span>
          </div>
          {rushCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center gap-1.5 text-amber-300 text-xs font-mono">
              <span>{rushCount} Rush Timeline</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#161217] border border-[#2C222A] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone, email, city, ticket #, or message text..."
            className="w-full pl-10 pr-4 py-2 bg-[#1F1821] rounded-lg border border-[#38283A] text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-mono">
          {(['All', 'New', 'Read', 'Replied', 'Archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#7A0C1E] text-white font-bold shadow'
                  : 'text-stone-400 hover:text-white hover:bg-[#201822]'
              }`}
            >
              {status}
              {status === 'New' && newCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#1F1821] border border-[#38283A] rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="All">All Categories</option>
            <option value="Dolmen Mall Tariq Road Store Visit">Store Visit</option>
            <option value="Order & Sizing Assistance">Order & Sizing</option>
            <option value="Custom Bespoke Design Tool Question">Bespoke Atelier</option>
            <option value="Fabric Swatches & Zari Samples">Fabric Swatches</option>
            <option value="Rush Wedding Timeline Inquiry">Rush Timeline</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Work Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inquiry List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-mono">
            <span>Showing {filteredInquiries.length} of {totalCount} messages</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#C5A059] hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredInquiries.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#161217] border border-[#2C222A] space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-sm text-stone-300 font-medium">No messages found</p>
                <p className="text-xs text-stone-500">
                  Try adjusting your search query or status filter.
                </p>
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                const isNew = inq.status === 'New';

                return (
                  <div
                    key={inq.id}
                    onClick={() => handleSelect(inq.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative group ${
                      isSelected
                        ? 'bg-[#221822] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]/40'
                        : isNew
                        ? 'bg-[#1A121A] border-[#7A0C1E]/60 hover:border-[#7A0C1E]'
                        : 'bg-[#151116] border-[#2C222A] hover:border-stone-700'
                    }`}
                  >
                    {/* Top Row: Name, Status badge & Time */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="New Message" />
                        )}
                        <h4 className="font-serif font-semibold text-sm text-white group-hover:text-[#E5C378] transition-colors">
                          {inq.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {inq.priority === 'Rush' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 text-[9px] font-mono font-bold uppercase">
                            Rush
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            inq.status === 'New'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : inq.status === 'Replied'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : inq.status === 'Read'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                              : 'bg-stone-900 text-stone-400'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    {/* Metadata line: City & Ticket */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5A059]" />
                        {inq.cityCountry}
                      </span>
                      <span>•</span>
                      <span className="text-[#C5A059] font-medium">#{inq.ticketNumber}</span>
                    </div>

                    {/* Inquiry category */}
                    <div className="mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[#2D202F] text-stone-300 border border-[#3C293F]">
                      {inq.inquiryType}
                    </div>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-300 line-clamp-2 mt-2 leading-relaxed">
                      "{inq.message}"
                    </p>

                    {/* Bottom: Date & Contact pills */}
                    <div className="mt-3 pt-2 border-t border-[#2C222A] flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>{new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-stone-500 flex items-center gap-1 group-hover:text-stone-300">
                        <span>Inspect dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Complete User Dossier & Management (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInquiry ? (
            <div className="rounded-2xl bg-[#161217] border border-[#2C222A] overflow-hidden shadow-xl text-left">
              {/* Header Strip with Actions */}
              <div className="p-5 bg-gradient-to-r from-[#211622] via-[#1A121B] to-[#161217] border-b border-[#2C222A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#E5C378] border border-[#C5A059]/40 font-semibold uppercase">
                      Ticket #{selectedInquiry.ticketNumber}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Received {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mt-1">
                    {selectedInquiry.name}
                  </h3>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => onUpdateStatus(selectedInquiry.id, e.target.value as any)}
                    className="bg-[#2A1D2D] border border-[#442E49] rounded-lg px-3 py-1.5 text-xs font-mono text-[#E5C378] focus:outline-none cursor-pointer"
                  >
                    <option value="New">Status: New</option>
                    <option value="Read">Status: Read</option>
                    <option value="Replied">Status: Replied</option>
                    <option value="Archived">Status: Archived</option>
                  </select>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete inquiry #${selectedInquiry.ticketNumber} from ${selectedInquiry.name}?`)) {
                        onDeleteInquiry(selectedInquiry.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-[#2A1D2D] hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 border border-[#442E49] transition-colors"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Complete Info Grid */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* 1-Click Direct Outreach Action Bar */}
                <div className="p-4 rounded-xl bg-[#221824] border border-[#3A293E] flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}?text=${encodeURIComponent(
                      `Assalam o Alaikum ${selectedInquiry.name}, this is AHK Bridal Studio at Dolmen Mall Tariq Road regarding your inquiry (#${selectedInquiry.ticketNumber}) about ${selectedInquiry.inquiryType}. How may we assist you today?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (selectedInquiry.status !== 'Replied') {
                        onUpdateStatus(selectedInquiry.id, 'Replied');
                      }
                    }}
                    className="py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-black font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="py-2.5 px-4 rounded-lg bg-[#2D2130] hover:bg-[#3B2B3E] text-stone-200 font-medium text-xs flex items-center gap-2 border border-[#453249] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Call ({selectedInquiry.phone})</span>
                  </a>

                  <a
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                      `AHK Bridal Studio: Inquiry #${selectedInquiry.ticketNumber} Response`
                    )}&body=${encodeURIComponent(
                      `Dear ${selectedInquiry.name},\n\nThank you for reaching out to AHK Bridal Studio at Dolmen Mall Tariq Road Karachi regarding "${selectedInquiry.inquiryType}".\n\n`
                    )}`}
                    className="py-2.5 px-4 rounded-lg bg-[#2D2130] hover:bg-[#3B2B3E] text-stone-200 font-medium text-xs flex items-center gap-2 border border-[#453249] transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Send Email</span>
                  </a>

                  {selectedInquiry.status !== 'Replied' && (
                    <button
                      onClick={() => onUpdateStatus(selectedInquiry.id, 'Replied')}
                      className="py-2.5 px-4 rounded-lg bg-[#7A0C1E] hover:bg-[#920F24] text-white font-medium text-xs flex items-center gap-2 ml-auto transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Mark Replied</span>
                    </button>
                  )}
                </div>

                {/* Client Information Grid */}
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#C5A059] tracking-wider mb-3 font-semibold">
                    Client Information & Wedding Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Client Full Name</span>
                      </div>
                      <div className="font-semibold text-white text-sm">
                        {selectedInquiry.name}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>WhatsApp & Phone</span>
                      </div>
                      <div className="font-mono text-emerald-400 font-bold">
                        {selectedInquiry.phone}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Email Address</span>
                      </div>
                      <div className="font-mono text-stone-200 break-all">
                        {selectedInquiry.email}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>City & Country</span>
                      </div>
                      <div className="text-white font-medium">
                        {selectedInquiry.cityCountry}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Tentative Wedding Date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">
                          {selectedInquiry.weddingDate || 'Not specified'}
                        </span>
                        {getWeddingTimelineBadge(selectedInquiry.weddingDate)}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1C151E] rounded-xl border border-[#2E2030] space-y-1">
                      <div className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Inquiry Category</span>
                      </div>
                      <div className="text-[#E5C378] font-medium">
                        {selectedInquiry.inquiryType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Message Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-[#C5A059] tracking-wider font-semibold">
                    <span>Inquiry Content / Special Request</span>
                    <span className="text-[10px] text-stone-400 lowercase font-normal">
                      verified client submission
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1C151E] border border-[#2E2030] text-sm text-stone-200 leading-relaxed font-serif whitespace-pre-wrap">
                    "{selectedInquiry.message}"
                  </div>
                </div>

                {/* Quick Response Templates (1-Click Copy) */}
                <div className="space-y-2.5 pt-2 border-t border-[#2C222A]">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-stone-400">
                    <span>Quick Response Templates for Karigar / Stylist Desk</span>
                    {copiedTemplate && (
                      <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Copied "{copiedTemplate}" to clipboard!
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        handleCopyQuickTemplate(
                          'Dolmen Mall Visit',
                          `Assalam o Alaikum ${selectedInquiry.name}! Thank you for contacting AHK Bridal Studio. We would be delighted to host you at our Dolmen Mall Tariq Road flagship store (Shop G-32). Please let us know your preferred time between 11:30 AM and 10:30 PM.`
                        )
                      }
                      className="p-2.5 rounded-lg bg-[#1E1720] hover:bg-[#2A1F2C] border border-[#352538] text-left text-xs text-stone-300 hover:text-white transition-colors"
                    >
                      <div className="font-semibold text-[#E5C378]">Dolmen Mall Visit</div>
                      <div className="text-[10px] text-stone-400 truncate">Confirm VIP trial room slot</div>
                    </button>

                    <button
                      onClick={() =>
                        handleCopyQuickTemplate(
                          'Measurements Guide',
                          `Dear ${selectedInquiry.name}, for your custom bridal order, our master cutter will guide you step-by-step over a WhatsApp video call. Could you let us know your availability today or tomorrow?`
                        )
                      }
                      className="p-2.5 rounded-lg bg-[#1E1720] hover:bg-[#2A1F2C] border border-[#352538] text-left text-xs text-stone-300 hover:text-white transition-colors"
                    >
                      <div className="font-semibold text-[#E5C378]">Measurements Guide</div>
                      <div className="text-[10px] text-stone-400 truncate">Bespoke sizing video call</div>
                    </button>

                    <button
                      onClick={() =>
                        handleCopyQuickTemplate(
                          'Courier Timeline',
                          `Assalam o Alaikum ${selectedInquiry.name}. Yes, we offer express insured shipping worldwide (DHL Express to USA/UK/Dubai in 3-5 days; TCS nationwide in Pakistan). All bridal ensembles are packed in heirloom wooden trunks.`
                        )
                      }
                      className="p-2.5 rounded-lg bg-[#1E1720] hover:bg-[#2A1F2C] border border-[#352538] text-left text-xs text-stone-300 hover:text-white transition-colors"
                    >
                      <div className="font-semibold text-[#E5C378]">Worldwide Courier</div>
                      <div className="text-[10px] text-stone-400 truncate">Delivery timeframe & packing</div>
                    </button>
                  </div>
                </div>

                {/* Admin Internal Notes Box */}
                <div className="space-y-2 pt-2 border-t border-[#2C222A]">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-[#C5A059] tracking-wider font-semibold">
                    <span>Admin Internal Follow-up Notes</span>
                    <span className="text-[10px] text-stone-500 font-mono">Private to Studio Team</span>
                  </div>
                  <textarea
                    rows={3}
                    value={editingNotes[selectedInquiry.id] ?? selectedInquiry.adminNotes ?? ''}
                    onChange={(e) =>
                      setEditingNotes({
                        ...editingNotes,
                        [selectedInquiry.id]: e.target.value
                      })
                    }
                    placeholder="e.g. Spoke to bride on WhatsApp; scheduled trial for Saturday 4 PM at Dolmen Mall. Sent sample pictures..."
                    className="w-full px-3 py-2 bg-[#1C151E] rounded-xl border border-[#2E2030] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C5A059] leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveNotes(selectedInquiry.id)}
                      className="px-4 py-2 rounded-lg bg-[#362738] hover:bg-[#49344C] text-[#E5C378] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Admin Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#161217] border border-[#2C222A] space-y-3">
              <MessageSquare className="w-10 h-10 text-stone-600 mx-auto" />
              <h3 className="text-lg font-serif font-semibold text-white">Select a message</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Select an inquiry from the inbox on the left to view the complete client dossier, contact via WhatsApp/Email, and manage response status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
