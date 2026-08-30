import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getParcelDocuments,
  uploadParcelDocument,
  type ParcelDocument,
} from '../../services/officerService';
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Search,
} from 'lucide-react';

interface DocumentsPageProps {
  onNavigate: (page: any) => void;
  ulpin?: string;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate, ulpin: initialUlpin }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ParcelDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialUlpin || '');

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetUlpin, setTargetUlpin] = useState(initialUlpin || 'TN-ERD-126-1-0003');
  const [docType, setDocType] = useState('Patta / Chitta');
  const [docName, setDocName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await getParcelDocuments(searchQuery || undefined);
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [searchQuery]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      alert('Please provide document title / file name.');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadParcelDocument({
        ulpin: targetUlpin.trim(),
        documentType: docType,
        documentName: docName.trim(),
        fileUrl: '#',
        fileSizeKb: Math.floor(Math.random() * 800) + 200,
        uploadedBy: user?.id || 'OFF-TN-8821',
        uploadedByName: user?.name || 'Dr. M. Sundaram',
        remarks: remarks.trim(),
      });

      if (res.success) {
        setSuccessMsg(`Document "${docName}" successfully attached to ${targetUlpin}.`);
        setShowUploadModal(false);
        setDocName('');
        setRemarks('');
        loadDocs();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Official Land Records & Deed Documents</h2>
          <p className="text-xs text-gray-500">
            Digitally certified Field Measurement Books (FMB), e-Pattas, and Encumbrance Certificates
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Official Document</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 flex items-center gap-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter by ULPIN or Document Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* ── Documents Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Document Title & Type</th>
                <th className="py-3.5 px-4">Target Parcel ULPIN</th>
                <th className="py-3.5 px-4">Uploaded By</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading verified documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No documents found.
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{doc.document_name}</div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold inline-block mt-0.5">
                            {doc.document_type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-blue-700 font-bold">
                      {doc.ulpin || 'TN-ERD-126-1-0003'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{doc.uploaded_by_name || 'Dr. M. Sundaram'}</div>
                      <div className="text-[10px] text-gray-400">{doc.uploaded_by} ({doc.uploaded_by_role})</div>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {new Date(doc.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-500">
                      {doc.file_size_kb} KB
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading verified document: ${doc.document_name}`)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-bold transition-all text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upload Document Modal ────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpload} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Upload Official Land Document
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Parcel ULPIN *</label>
                <input
                  type="text"
                  value={targetUlpin}
                  onChange={e => setTargetUlpin(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Classification *</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Patta / Chitta">Patta / Chitta Extract (TamilNilam)</option>
                  <option value="FMB Sketch">Field Measurement Book (FMB) Sketch</option>
                  <option value="A-Register">A-Register Land Record</option>
                  <option value="Encumbrance Certificate">Encumbrance Certificate (EC)</option>
                  <option value="Resurvey Demarcation Report">Resurvey Demarcation Report</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Document File Name *</label>
                <input
                  type="text"
                  placeholder="e.g. FMB_Sketch_Survey_126_1.pdf"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Officer Notes / Seal Reference</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Official stamp reference or verification details..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Save & Certify'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
