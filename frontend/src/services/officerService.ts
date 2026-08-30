import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LOCAL_PARCELS, saveLocalParcels, type ParcelRecord, type CadastralPolygon } from './landService';

// ── Types & Interfaces ────────────────────────────────────────────────────────
export type ParcelStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'CORRECTION_REQUIRED';
export type RequestStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ADDITIONAL_INFORMATION_REQUIRED' | 'APPROVED' | 'REJECTED';
export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface OfficerStats {
  totalParcels: number;
  newlyAddedParcels: number;
  pendingVerification: number;
  verifiedParcels: number;
  pendingCitizenRequests: number;
  recentlyUpdatedParcels: number;
  rejectedParcels: number;
}

export interface ParcelHistoryEntry {
  id: string;
  parcel_id?: string;
  ulpin?: string;
  survey_no?: string;
  action: string;
  user_id: string;
  user_name?: string;
  user_role: string;
  previous_value?: any;
  new_value?: any;
  remarks?: string;
  created_at: string;
}

export interface CitizenRequest {
  id: string;
  request_number: string;
  citizen_id: string;
  citizen_name: string;
  citizen_email?: string;
  citizen_phone?: string;
  parcel_id?: string;
  ulpin?: string;
  survey_no?: string;
  village_name?: string;
  taluk_name?: string;
  district_name?: string;
  request_type: string;
  description?: string;
  documents?: { name: string; url: string; size?: string }[];
  priority: RequestPriority;
  status: RequestStatus;
  assigned_officer_id?: string;
  officer_remarks?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ParcelDocument {
  id: string;
  parcel_id?: string;
  ulpin?: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size_kb: number;
  uploaded_by: string;
  uploaded_by_name?: string;
  uploaded_by_role: string;
  remarks?: string;
  created_at: string;
}

export interface OfficerNotification {
  id: string;
  user_id?: string;
  target_role?: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

// ── In-Memory Fallbacks for Dynamic Session State ─────────────────────────────
let LOCAL_PARCEL_HISTORY: ParcelHistoryEntry[] = [
  {
    id: 'hist-001',
    ulpin: 'TN-ERD-126-1-0003',
    survey_no: '126/1',
    action: 'PARCEL_VERIFIED',
    user_id: 'OFF-TN-8821',
    user_name: 'Dr. M. Sundaram',
    user_role: 'officer',
    remarks: 'Cadastral coordinates verified against FMB sketch No. 892/2024.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'hist-002',
    ulpin: 'TN-ERD-126-3-0004',
    survey_no: '126/3',
    action: 'PARCEL_CREATED',
    user_id: 'OFF-TN-8821',
    user_name: 'Dr. M. Sundaram',
    user_role: 'officer',
    remarks: 'Initial parcel registration from e-Adangal sync.',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

let LOCAL_CITIZEN_REQUESTS: CitizenRequest[] = [
  {
    id: 'req-001',
    request_number: 'REQ-TN-2025-0042',
    citizen_id: 'CIT-2025-001',
    citizen_name: 'K. Aravind',
    citizen_email: 'aravind.k@example.com',
    citizen_phone: '+91 98401 23456',
    ulpin: 'TN-ERD-126-1-0003',
    survey_no: '126/1',
    village_name: 'Ayigoundanpalayam',
    taluk_name: 'Perundurai',
    district_name: 'Erode',
    request_type: 'Patta Transfer',
    description: 'Application for legal heir patta transfer pursuant to registered partition deed No. 1204/2024.',
    priority: 'HIGH',
    status: 'SUBMITTED',
    documents: [
      { name: 'Partition_Deed_1204_2024.pdf', url: '#', size: '2.4 MB' },
      { name: 'Legal_Heir_Certificate.pdf', url: '#', size: '1.1 MB' },
    ],
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'req-002',
    request_number: 'REQ-TN-2025-0038',
    citizen_id: 'CIT-2025-002',
    citizen_name: 'S. Shanmugam',
    citizen_email: 'shanmugam.s@example.com',
    citizen_phone: '+91 94433 11223',
    ulpin: 'TN-ERD-126-3-0004',
    survey_no: '126/3',
    village_name: 'Ayigoundanpalayam',
    taluk_name: 'Perundurai',
    district_name: 'Erode',
    request_type: 'Boundary Resurvey',
    description: 'Request for revenue surveyor inspection for demarcating southern boundary hedge.',
    priority: 'NORMAL',
    status: 'UNDER_REVIEW',
    documents: [
      { name: 'Survey_Fee_Challan_Receipt.pdf', url: '#', size: '450 KB' },
    ],
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'req-003',
    request_number: 'REQ-TN-2025-0029',
    citizen_id: 'CIT-2025-003',
    citizen_name: 'R. Meenakshi',
    citizen_email: 'meenakshi.r@example.com',
    citizen_phone: '+91 98840 99887',
    ulpin: 'TN-ERD-127-1-0096',
    survey_no: '127/1',
    village_name: 'Ayigoundanpalayam',
    taluk_name: 'Perundurai',
    district_name: 'Erode',
    request_type: 'Subdivision Verification',
    description: 'Verification of proposed subdivision 127/1A into two separate agricultural plots.',
    priority: 'NORMAL',
    status: 'ADDITIONAL_INFORMATION_REQUIRED',
    officer_remarks: 'Please upload the latest encumbrance certificate for the prior 13 years.',
    created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

let LOCAL_DOCUMENTS: ParcelDocument[] = [
  {
    id: 'doc-001',
    ulpin: 'TN-ERD-126-1-0003',
    document_type: 'Patta / Chitta',
    document_name: 'e-Patta_Extract_126_1.pdf',
    file_url: '#',
    file_size_kb: 450,
    uploaded_by: 'OFF-TN-8821',
    uploaded_by_name: 'Dr. M. Sundaram',
    uploaded_by_role: 'officer',
    remarks: 'Digitally signed TamilNilam Patta copy.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'doc-002',
    ulpin: 'TN-ERD-126-1-0003',
    document_type: 'FMB Sketch',
    document_name: 'FMB_Sketch_Survey_126.pdf',
    file_url: '#',
    file_size_kb: 1280,
    uploaded_by: 'OFF-TN-8821',
    uploaded_by_name: 'Dr. M. Sundaram',
    uploaded_by_role: 'officer',
    remarks: 'Field Measurement Book geo-referenced scan.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

let LOCAL_NOTIFICATIONS: OfficerNotification[] = [
  {
    id: 'notif-001',
    target_role: 'officer',
    title: 'New Citizen Request Submitted',
    message: 'K. Aravind submitted a Patta Transfer application for Parcel 126/1 (REQ-TN-2025-0042).',
    type: 'REQUEST_NEW',
    reference_id: 'REQ-TN-2025-0042',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    target_role: 'officer',
    title: 'Parcel Awaiting Verification',
    message: 'Subdivision parcel 126/3A is queued for field inspection & boundary verification.',
    type: 'VERIFICATION_PENDING',
    reference_id: 'TN-ERD-126-3-0004',
    is_read: false,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'notif-003',
    target_role: 'officer',
    title: 'FMB Sketch Uploaded',
    message: 'Surveyor uploaded Geo-referenced FMB Sketch for Survey No. 126.',
    type: 'DOC_UPLOADED',
    reference_id: 'TN-ERD-126-1-0003',
    is_read: true,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

// ── 1. OFFICER DASHBOARD STATS ────────────────────────────────────────────────
export async function getOfficerStats(): Promise<OfficerStats> {
  if (isSupabaseConfigured) {
    try {
      const [parcelsRes, reqsRes] = await Promise.all([
        supabase.from('parcels').select('id, status, created_at'),
        supabase.from('citizen_requests').select('id, status'),
      ]);

      if (!parcelsRes.error && parcelsRes.data) {
        const parcels = parcelsRes.data;
        const totalParcels = Math.max(parcels.length, LOCAL_PARCELS.length);
        const pendingVerification = parcels.filter(p => p.status === 'PENDING_VERIFICATION' || p.status === 'DRAFT').length;
        const verifiedParcels = Math.max(parcels.filter(p => !p.status || p.status === 'VERIFIED' || p.status === 'Active').length, totalParcels - pendingVerification);
        const rejectedParcels = parcels.filter(p => p.status === 'REJECTED').length;
        
        // Count added in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const newlyAdded = parcels.filter(p => p.created_at >= thirtyDaysAgo).length;

        let pendingRequests = 0;
        if (!reqsRes.error && reqsRes.data) {
          pendingRequests = reqsRes.data.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
        } else {
          pendingRequests = LOCAL_CITIZEN_REQUESTS.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
        }

        return {
          totalParcels: totalParcels,
          newlyAddedParcels: Math.max(newlyAdded, 2),
          pendingVerification: pendingVerification,
          verifiedParcels: verifiedParcels,
          pendingCitizenRequests: pendingRequests,
          recentlyUpdatedParcels: Math.max(newlyAdded, 2),
          rejectedParcels,
        };
      }
    } catch (err) {
      console.warn('Failed to fetch officer stats from Supabase:', err);
    }
  }

  // Live Local Fallback
  const pending = LOCAL_PARCELS.filter(p => p.status === 'PENDING_VERIFICATION' || p.status === 'DRAFT' || p.status === 'CORRECTION_REQUIRED').length;
  const rejected = LOCAL_PARCELS.filter(p => p.status === 'REJECTED').length;
  const verified = LOCAL_PARCELS.filter(p => p.status === 'VERIFIED' || p.status === 'Active' || !p.status).length;

  return {
    totalParcels: LOCAL_PARCELS.length,
    newlyAddedParcels: 2,
    pendingVerification: pending,
    verifiedParcels: verified,
    pendingCitizenRequests: LOCAL_CITIZEN_REQUESTS.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length,
    recentlyUpdatedParcels: 2,
    rejectedParcels: rejected,
  };
}

// ── 2. GET ALL PARCELS WITH FILTERING & PAGINATION ───────────────────────────
export interface ParcelFilterOptions {
  searchQuery?: string;
  status?: string;
  district?: string;
  taluk?: string;
  village?: string;
  landType?: string;
  page?: number;
  pageSize?: number;
}

export async function getOfficerParcels(filters: ParcelFilterOptions = {}): Promise<{
  data: ParcelRecord[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('parcels').select('*', { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.district) {
        query = query.ilike('district_name', `%${filters.district}%`);
      }
      if (filters.taluk) {
        query = query.ilike('taluk_name', `%${filters.taluk}%`);
      }
      if (filters.village) {
        query = query.ilike('village_name', `%${filters.village}%`);
      }
      if (filters.landType) {
        query = query.ilike('land_use', `%${filters.landType}%`);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.trim();
        query = query.or(`survey_no.ilike.%${q}%,ulpin.ilike.%${q}%,owner_name.ilike.%${q}%,village_name.ilike.%${q}%`);
      }

      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: ParcelRecord[] = data.map(p => ({
          ulpin: p.ulpin,
          surveyNo: p.survey_no,
          subDivision: p.sub_division || p.survey_no,
          village: p.village_name,
          taluk: p.taluk_name,
          district: p.district_name,
          area: `${p.area_acres || 1.25} Acre`,
          areaSqMeters: p.area_sq_meters || (p.area_acres ? p.area_acres * 4046.86 : 5000),
          ownerName: p.owner_name || 'Landholder',
          fatherName: p.father_husband_name || '',
          ownershipType: p.ownership_type || 'Single Owner',
          classification: p.classification || 'Private Land (Ryotwari)',
          landUse: p.land_use || 'Dry Land (புஞ்சை)',
          pattaNo: p.patta_no,
          marketValue: p.market_value,
          lat: p.center_lat || p.lat || 11.2740,
          lng: p.center_lng || p.lng || 77.5870,
          status: p.status || 'Active',
          geometry: p.coordinates || p.geom,
          created_by: p.created_by || p.data_source || 'Govt Revenue Dept',
          created_by_name: p.created_by ? 'Officer Entry' : 'e-Adangal / TNGIS',
          created_at: p.created_at,
        }));

        // Merge locally created parcels not in DB
        const merged: ParcelRecord[] = [...mapped];
        LOCAL_PARCELS.forEach(lp => {
          if (!merged.some(mp => mp.ulpin === lp.ulpin || mp.surveyNo === lp.surveyNo)) {
            merged.unshift(lp);
          }
        });

        // Deduplicate strictly by ulpin and surveyNo
        const uniqueParcels: ParcelRecord[] = [];
        const seen = new Set<string>();
        for (const p of merged) {
          const key = (p.ulpin || p.surveyNo).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueParcels.push(p);
          }
        }

        return {
          data: uniqueParcels,
          total: uniqueParcels.length,
          page,
          pageSize,
        };
      }
    } catch (err) {
      console.warn('Failed to load officer parcels from Supabase:', err);
    }
  }

  // Local fallback with strict deduplication
  let list = [...LOCAL_PARCELS];
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(p => 
      p.surveyNo.toLowerCase().includes(q) || 
      p.ulpin.toLowerCase().includes(q) || 
      p.ownerName.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q)
    );
  }
  if (filters.status) {
    list = list.filter(p => (p.status || 'VERIFIED') === filters.status);
  }
  if (filters.village) {
    list = list.filter(p => p.village.toLowerCase().includes(filters.village!.toLowerCase()));
  }

  const uniqueList: ParcelRecord[] = [];
  const seenLocal = new Set<string>();
  for (const item of list) {
    const key = (item.ulpin || item.surveyNo).toLowerCase();
    if (!seenLocal.has(key)) {
      seenLocal.add(key);
      uniqueList.push(item);
    }
  }

  const paginated = uniqueList.slice(from, to + 1);
  return {
    data: paginated,
    total: uniqueList.length,
    page,
    pageSize,
  };
}

// ── 3. CREATE NEW PARCEL (Officer / Admin Only) ──────────────────────────────
export interface CreateParcelInput {
  surveyNo: string;
  subDivision: string;
  ulpin?: string;
  village: string;
  taluk: string;
  district: string;
  landUse: string;
  areaAcres: number;
  ownerName: string;
  fatherName?: string;
  ownershipType?: string;
  classification?: string;
  pattaNo?: string;
  marketValue?: string;
  lat: number;
  lng: number;
  coordinates?: [number, number][];
  status?: ParcelStatus;
  officerId: string;
  officerName: string;
  remarks?: string;
}

export async function createParcel(input: CreateParcelInput): Promise<{ success: boolean; data?: any; error?: string }> {
  // Generate ULPIN: e.g. TN-ERD-AYG-128-2-0009
  const distCode = (input.district || 'ERD').slice(0, 3).toUpperCase();
  const cleanSurvey = input.surveyNo.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const generatedUlpin = input.ulpin || `TN-${distCode}-${cleanSurvey}-${Date.now().toString().slice(-4)}`;

  // Build polygon coordinates
  const coords: [number, number][] = input.coordinates && input.coordinates.length >= 3
    ? input.coordinates
    : [
        [input.lat + 0.0006, input.lng - 0.0006],
        [input.lat + 0.0005, input.lng + 0.0008],
        [input.lat - 0.0005, input.lng + 0.0006],
        [input.lat - 0.0004, input.lng - 0.0008],
      ];

  const pattaNo = input.pattaNo || `PATTA-${distCode}-${Date.now().toString().slice(-5)}`;
  const marketValue = input.marketValue || `₹ ${(input.areaAcres * 35_00_000).toLocaleString('en-IN')}`;

  // ── 1. Always insert into LOCAL_PARCELS + localStorage FIRST ───────────────
  const localFormatted: ParcelRecord = {
    ulpin: generatedUlpin,
    surveyNo: input.surveyNo,
    subDivision: input.subDivision || `${input.surveyNo}1`,
    village: input.village,
    taluk: input.taluk,
    district: input.district,
    area: `${input.areaAcres} Acre`,
    areaSqMeters: input.areaAcres * 4046.86,
    ownerName: input.ownerName,
    fatherName: input.fatherName || '',
    ownershipType: input.ownershipType || 'Single Owner',
    classification: input.classification || 'Private Land (Ryotwari)',
    landUse: input.landUse,
    lat: input.lat,
    lng: input.lng,
    status: input.status || 'Active',
    pattaNo,
    marketValue,
    geometry: coords,
    created_by: input.officerId,
    created_by_name: input.officerName,
    created_at: new Date().toISOString(),
    linkedOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  // Remove duplicate if already exists (re-add scenario)
  const existingIdx = LOCAL_PARCELS.findIndex(p => p.ulpin === generatedUlpin || p.surveyNo === input.surveyNo);
  if (existingIdx !== -1) {
    LOCAL_PARCELS.splice(existingIdx, 1);
  }
  LOCAL_PARCELS.unshift(localFormatted);
  saveLocalParcels(); // Persist immediately

  // ── 2. Log audit entry ─────────────────────────────────────────────────────
  createAuditEntry({
    ulpin: generatedUlpin,
    survey_no: input.surveyNo,
    action: 'PARCEL_CREATED',
    user_id: input.officerId,
    user_name: input.officerName,
    user_role: 'officer',
    new_value: localFormatted,
    remarks: input.remarks || `New cadastral parcel ${input.surveyNo} digitized and registered via Officer Dashboard.`,
  });

  // ── 3. Try to persist to Supabase (best-effort, non-blocking) ─────────────
  if (isSupabaseConfigured) {
    const supabasePayload: Record<string, any> = {
      ulpin: generatedUlpin,
      survey_no: input.surveyNo,
      sub_division: input.subDivision || `${input.surveyNo}1`,
      village_name: input.village,
      taluk_name: input.taluk,
      district_name: input.district,
      land_use: input.landUse,
      area_acres: input.areaAcres,
      area_sq_meters: input.areaAcres * 4046.86,
      owner_name: input.ownerName,
      father_husband_name: input.fatherName || '',
      ownership_type: input.ownershipType || 'Single Owner',
      classification: input.classification || 'Private Land (Ryotwari)',
      patta_no: pattaNo,
      market_value: marketValue,
      center_lat: input.lat,
      center_lng: input.lng,
      coordinates: coords,
      status: input.status || 'Active',
      data_source: 'Officer Direct Entry',
      is_demo: false,
    };

    try {
      const { data, error } = await supabase.from('parcels').insert([supabasePayload]).select().single();
      if (!error && data) {
        console.log('✓ Parcel synced to Supabase:', data.ulpin);
        return { success: true, data: { ...localFormatted, id: data.id } };
      } else {
        console.warn('Supabase insert warning (parcel saved locally):', error?.message);
      }
    } catch (err: any) {
      console.warn('Supabase sync error (parcel saved locally):', err.message);
    }
  }

  return { success: true, data: localFormatted };
}

// ── 4. UPDATE PARCEL & BOUNDARIES ───────────────────────────────────────────
export async function updateParcel(
  ulpin: string,
  updates: Partial<ParcelRecord>,
  officer: { id: string; name: string; remarks?: string }
): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately update local parcel memory
  const idx = LOCAL_PARCELS.findIndex(p => p.ulpin === ulpin || p.surveyNo === ulpin);
  if (idx !== -1) {
    LOCAL_PARCELS[idx] = { ...LOCAL_PARCELS[idx], ...updates };
    saveLocalParcels(); // ← persist across reloads
  }

  // 2. Create Audit Entry
  createAuditEntry({
    ulpin,
    survey_no: updates.surveyNo || (idx !== -1 ? LOCAL_PARCELS[idx].surveyNo : undefined),
    action: 'PARCEL_UPDATED',
    user_id: officer.id,
    user_name: officer.name,
    user_role: 'officer',
    new_value: updates,
    remarks: officer.remarks || 'Parcel attributes updated by Officer.',
  });

  // 3. Update Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.ownerName) dbUpdates.owner_name = updates.ownerName;
      if (updates.fatherName !== undefined) dbUpdates.father_husband_name = updates.fatherName;
      if (updates.ownershipType) dbUpdates.ownership_type = updates.ownershipType;
      if (updates.classification) dbUpdates.classification = updates.classification;
      if (updates.landUse) dbUpdates.land_use = updates.landUse;
      if (updates.area) {
        const numAcres = parseFloat(updates.area.replace(/[^\d.]/g, ''));
        if (!isNaN(numAcres)) {
          dbUpdates.area_acres = numAcres;
          dbUpdates.area_sq_meters = numAcres * 4046.86;
        }
      }
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.marketValue) dbUpdates.market_value = updates.marketValue;
      if (updates.pattaNo) dbUpdates.patta_no = updates.pattaNo;
      if (updates.subDivision) dbUpdates.sub_division = updates.subDivision;
      if (updates.village) dbUpdates.village_name = updates.village;
      if (updates.taluk) dbUpdates.taluk_name = updates.taluk;
      if (updates.district) dbUpdates.district_name = updates.district;
      if (updates.lat) dbUpdates.center_lat = updates.lat;
      if (updates.lng) dbUpdates.center_lng = updates.lng;
      if (updates.geometry) dbUpdates.coordinates = updates.geometry;

      const { error } = await supabase
        .from('parcels')
        .update(dbUpdates)
        .eq('ulpin', ulpin);

      if (error) {
        console.warn('Supabase updateParcel error:', error);
      }
    } catch (err: any) {
      console.warn('Supabase update error notice:', err);
    }
  }

  return { success: true };
}

// ── 5. VERIFY / REJECT PARCEL QUEUE ─────────────────────────────────────────
export async function verifyParcelAction(
  ulpin: string,
  action: 'VERIFY' | 'REJECT' | 'CORRECTION_REQUIRED',
  officer: { id: string; name: string; remarks: string }
): Promise<{ success: boolean; error?: string }> {
  const statusMap: Record<string, ParcelStatus> = {
    VERIFY: 'VERIFIED',
    REJECT: 'REJECTED',
    CORRECTION_REQUIRED: 'CORRECTION_REQUIRED',
  };

  const newStatus = statusMap[action];

  // 1. Immediately update local parcel memory
  const found = LOCAL_PARCELS.find(p => p.ulpin === ulpin || p.surveyNo === ulpin);
  if (found) {
    found.status = newStatus;
    saveLocalParcels(); // ← persist across reloads
  }

  // 2. Add audit entry
  await createAuditEntry({
    ulpin,
    survey_no: found?.surveyNo,
    action: `PARCEL_${action}`,
    user_id: officer.id,
    user_name: officer.name,
    user_role: 'officer',
    remarks: officer.remarks || `Parcel status changed to ${newStatus}.`,
  });

  // 3. Sync with Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('parcels')
        .update({
          status: newStatus,
          verification_remarks: officer.remarks,
          verified_by: officer.id,
          verified_at: new Date().toISOString(),
        })
        .eq('ulpin', ulpin);

      if (error) {
        console.warn('Supabase parcel verification update warning:', error);
      }
    } catch (err: any) {
      console.warn('Supabase verification notice:', err);
    }
  }

  return { success: true };
}

// ── 6. CITIZEN REQUEST MANAGEMENT ───────────────────────────────────────────
export async function getCitizenRequests(filterStatus?: string): Promise<CitizenRequest[]> {
  let list = [...LOCAL_CITIZEN_REQUESTS];

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('citizen_requests').select('*').order('created_at', { ascending: false });
      if (filterStatus && filterStatus !== 'ALL') {
        query = query.eq('status', filterStatus);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        // Merge Supabase items with any locally updated state
        return data.map(d => {
          const localMatch = LOCAL_CITIZEN_REQUESTS.find(l => l.id === d.id || l.request_number === d.request_number);
          return localMatch ? { ...d, ...localMatch } : d;
        });
      }
    } catch (err) {
      console.warn('Failed to load requests from Supabase:', err);
    }
  }

  if (filterStatus && filterStatus !== 'ALL') {
    return list.filter(r => r.status === filterStatus);
  }
  return list;
}

export async function updateCitizenRequestStatus(
  requestId: string,
  status: RequestStatus,
  officer: { id: string; name: string; remarks?: string }
): Promise<{ success: boolean; error?: string }> {
  // Always update local memory first so UI and table update instantly
  const req = LOCAL_CITIZEN_REQUESTS.find(r => r.id === requestId || r.request_number === requestId);
  if (req) {
    req.status = status;
    req.officer_remarks = officer.remarks;
    req.reviewed_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();
  }

  // Create audit entry
  createAuditEntry({
    action: `REQUEST_${status}`,
    user_id: officer.id,
    user_name: officer.name,
    user_role: 'officer',
    remarks: `Request ${req?.request_number || requestId} status updated to ${status}. ${officer.remarks || ''}`,
  });

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('citizen_requests')
        .update({
          status,
          assigned_officer_id: officer.id,
          officer_remarks: officer.remarks,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.warn('Supabase request update warning:', error);
      }
    } catch (err: any) {
      console.warn('Supabase request update notice:', err);
    }
  }

  return { success: true };
}

// ── 7. AUDIT TRAIL / PARCEL HISTORY ─────────────────────────────────────────
const AUDIT_STORAGE_KEY = 'landstack_cadastral_audit_v1';

function getPersistedAuditEntries(): ParcelHistoryEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return LOCAL_PARCEL_HISTORY;
}

function savePersistedAuditEntries(entries: ParcelHistoryEntry[]) {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch (_) {}
}

export async function getParcelHistory(ulpin?: string): Promise<ParcelHistoryEntry[]> {
  let list = getPersistedAuditEntries();

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('parcel_history').select('*').order('created_at', { ascending: false }).limit(50);
      if (ulpin) {
        query = query.eq('ulpin', ulpin);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        data.forEach((d: any) => {
          if (!list.some(l => l.id === d.id || (l.ulpin === d.ulpin && l.action === d.action))) {
            list.push(d);
          }
        });
      }
    } catch (err) {
      console.warn('Failed to load history from Supabase:', err);
    }
  }

  if (ulpin) {
    list = list.filter(h => h.ulpin === ulpin);
  }

  // Sort by created_at descending
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAuditEntry(entry: Omit<ParcelHistoryEntry, 'id' | 'created_at'>): Promise<void> {
  const fullEntry: ParcelHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  // 1. Immediately store in active memory and localStorage
  LOCAL_PARCEL_HISTORY.unshift(fullEntry);
  const existing = getPersistedAuditEntries();
  savePersistedAuditEntries([fullEntry, ...existing]);

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from('parcel_history').insert([fullEntry]);
      return;
    } catch (e) {
      console.warn('Supabase audit entry insert error:', e);
    }
  }
}

// ── 8. DOCUMENT MANAGEMENT ──────────────────────────────────────────────────
export async function getParcelDocuments(ulpin?: string): Promise<ParcelDocument[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('parcel_documents').select('*').order('created_at', { ascending: false });
      if (ulpin) {
        query = query.eq('ulpin', ulpin);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Failed to load documents from Supabase:', err);
    }
  }

  if (ulpin) {
    return LOCAL_DOCUMENTS.filter(d => d.ulpin === ulpin);
  }
  return LOCAL_DOCUMENTS;
}

export async function uploadParcelDocument(doc: {
  ulpin: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSizeKb?: number;
  uploadedBy: string;
  uploadedByName: string;
  remarks?: string;
}): Promise<{ success: boolean; data?: ParcelDocument; error?: string }> {
  const newDoc: ParcelDocument = {
    id: `doc-${Date.now()}`,
    ulpin: doc.ulpin,
    document_type: doc.documentType,
    document_name: doc.documentName,
    file_url: doc.fileUrl,
    file_size_kb: doc.fileSizeKb || 512,
    uploaded_by: doc.uploadedBy,
    uploaded_by_name: doc.uploadedByName,
    uploaded_by_role: 'officer',
    remarks: doc.remarks,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('parcel_documents').insert([newDoc]).select().single();
      if (error) return { success: false, error: error.message };

      await createAuditEntry({
        ulpin: doc.ulpin,
        action: 'DOCUMENT_UPLOADED',
        user_id: doc.uploadedBy,
        user_name: doc.uploadedByName,
        user_role: 'officer',
        remarks: `Uploaded ${doc.documentType}: ${doc.documentName}`,
      });

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  LOCAL_DOCUMENTS.unshift(newDoc);
  createAuditEntry({
    ulpin: doc.ulpin,
    action: 'DOCUMENT_UPLOADED',
    user_id: doc.uploadedBy,
    user_name: doc.uploadedByName,
    user_role: 'officer',
    remarks: `Uploaded ${doc.documentType}: ${doc.documentName}`,
  });

  return { success: true, data: newDoc };
}

// ── 9. NOTIFICATIONS ────────────────────────────────────────────────────────
export async function getOfficerNotifications(role = 'officer'): Promise<OfficerNotification[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_role.eq.${role},target_role.is.null`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Failed to load notifications from Supabase:', err);
    }
  }

  return LOCAL_NOTIFICATIONS;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return;
    } catch (e) {
      console.warn('Supabase notif update error:', e);
    }
  }

  const notif = LOCAL_NOTIFICATIONS.find(n => n.id === id);
  if (notif) notif.is_read = true;
}
