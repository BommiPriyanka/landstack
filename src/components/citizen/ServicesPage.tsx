import { useState } from 'react';
import {
  Search, FileText, Users, IndianRupee, Building2,
  FileCheck, MapPin, Award, ArrowRight, Phone, Mail,
  Clock, CheckCircle2, Shield,
} from 'lucide-react';

type ServiceTab = 'All Services' | 'Land Records' | 'Ownership & Transfer' | 'Tax & Payments' | 'Approvals & NOCs' | 'Certificates' | 'Other Services';

interface Service {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  category: ServiceTab[];
}

const SERVICE_TABS: ServiceTab[] = [
  'All Services', 'Land Records', 'Ownership & Transfer',
  'Tax & Payments', 'Approvals & NOCs', 'Certificates', 'Other Services',
];

const SERVICES: Service[] = [
  {
    title: 'Patta / Record of Rights',
    desc: 'View and apply for Patta, Chitta, Adangal and A-Register.',
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    category: ['All Services', 'Land Records'],
  },
  {
    title: 'Land Ownership Verification',
    desc: 'Verify ownership details and get ownership certificate.',
    icon: Users,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    category: ['All Services', 'Ownership & Transfer'],
  },
  {
    title: 'Property Tax',
    desc: 'View property tax details, pay dues and download receipts.',
    icon: IndianRupee,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    category: ['All Services', 'Tax & Payments'],
  },
  {
    title: 'Building Permission',
    desc: 'Apply for building plan approval and track application status.',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    category: ['All Services', 'Approvals & NOCs'],
  },
  {
    title: 'Encumbrance Certificate',
    desc: 'Apply for encumbrance certificate and check status.',
    icon: FileCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100',
    category: ['All Services', 'Certificates'],
  },
  {
    title: 'Sale Deed / Registration',
    desc: 'View registered documents and related details.',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100',
    category: ['All Services', 'Ownership & Transfer'],
  },
  {
    title: 'Land Use & Zone Details',
    desc: 'Check land use, zoning and land classification details.',
    icon: MapPin,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100',
    category: ['All Services', 'Land Records'],
  },
  {
    title: 'Other Certificates',
    desc: 'Apply for various certificates (Nativity, Income, Legal Heir, etc.).',
    icon: Award,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100',
    category: ['All Services', 'Certificates', 'Other Services'],
  },
];

export const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('All Services');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter(s =>
    s.category.includes(activeTab) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Home &rsaquo; Services</p>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Services</h2>
          <p className="text-sm text-gray-500 mt-0.5">Access all land related services in one place</p>
        </div>
        {/* Info card top-right */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs sm:max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">All services at your fingertips</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Apply, track and download documents related to your land easily.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
        />
        <Search className="w-4 h-4 text-gray-300 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SERVICE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-[#125B50] text-white border-[#125B50] shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(svc => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.title}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-3 hover:border-[#125B50]/30 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${svc.bgColor} ${svc.borderColor}`}>
                <Icon className={`w-5 h-5 ${svc.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#125B50] transition-colors">{svc.title}</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">{svc.desc}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#125B50] hover:bg-emerald-50/30 text-xs font-bold text-gray-700 hover:text-[#125B50] transition-all w-fit">
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-6">How it works</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
          {[
            { num: '1', icon: <Search className="w-6 h-6 text-gray-600" />, title: 'Search / Select', desc: 'Find your land using ULPIN, Survey No or location.' },
            { num: '2', icon: <FileText className="w-6 h-6 text-gray-600" />, title: 'Choose Service', desc: 'Select the service you want to apply for.' },
            { num: '3', icon: <IndianRupee className="w-6 h-6 text-gray-600" />, title: 'Submit & Pay', desc: 'Fill the details, upload documents and pay fee.' },
            { num: '4', icon: <CheckCircle2 className="w-6 h-6 text-gray-600" />, title: 'Track & Download', desc: 'Track status and download certificate / document.' },
          ].map((step, i, arr) => (
            <div key={step.num} className="flex sm:flex-1 items-center sm:flex-col sm:items-center gap-4 sm:gap-0">
              <div className="flex flex-col sm:items-center gap-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#125B50] text-white text-[10px] font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <div className="sm:text-center mt-2">
                  <p className="text-xs font-bold text-gray-800">{step.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 sm:max-w-[100px] sm:text-center leading-snug">{step.desc}</p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden sm:flex flex-1 items-center justify-center">
                  <div className="w-full h-px border-t-2 border-dashed border-gray-200 mx-2" />
                  <span className="text-gray-300 text-lg shrink-0">+</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Need Help */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800">Need Help?</h4>
          <p className="text-xs text-gray-500 mt-0.5">Our support team is here to assist you.</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>1800-XXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>support@landstack.tn.gov.in</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Mon - Fri : 9:00 AM - 6:00 PM</span>
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#125B50] text-white text-xs font-bold hover:bg-[#0E4940] transition-colors shadow-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Raise Support Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
        <Shield className="w-3 h-3" />
        All services are provided as per Tamil Nadu government rules and regulations.
      </p>
    </div>
  );
};
