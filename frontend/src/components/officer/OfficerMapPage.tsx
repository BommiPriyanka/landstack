import React, { useState, useEffect, useRef } from 'react';
import RealMap, { type MapHandle } from '../common/RealMap';
import { getVillageCadastralParcels, type CadastralPolygon } from '../../services/landService';
import { TN_DISTRICTS } from '../../data/tnDistricts';
import { TamilNilamParcelModal } from '../common/TamilNilamParcelModal';
import {
  MapPin,
  Layers,
  Search,
  CheckCircle2,
  ShieldCheck,
  Building,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface OfficerMapPageProps {
  onNavigate: (page: any, data?: any) => void;
  ulpin?: string;
}

export const OfficerMapPage: React.FC<OfficerMapPageProps> = ({ onNavigate, ulpin: targetUlpin }) => {
  const mapRef = useRef<MapHandle>(null);
  const [district, setDistrict] = useState('Erode');
  const [taluk, setTaluk] = useState('Perundurai');
  const [village, setVillage] = useState('Ayigoundanpalayam');
  const [baseMap, setBaseMap] = useState<'satellite' | 'streets' | 'topographic' | 'terrain'>('satellite');
  const [parcels, setParcels] = useState<CadastralPolygon[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<CadastralPolygon | null>(null);
  const [modalParcel, setModalParcel] = useState<CadastralPolygon | null>(null);

  const selectedDistData = TN_DISTRICTS.find(d => d.name === district);
  const availableTaluks = selectedDistData ? selectedDistData.taluks : [];
  const selectedTalukData = availableTaluks.find(t => t.name === taluk);

  // Handle District Change & Relocate
  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const dData = TN_DISTRICTS.find(d => d.name === newDist);
    if (dData && dData.taluks.length > 0) {
      const firstTaluk = dData.taluks[0];
      setTaluk(firstTaluk.name);
      setVillage(firstTaluk.villages[0] || 'Main Village');
      mapRef.current?.flyTo(firstTaluk.lat || dData.lat, firstTaluk.lng || dData.lng, 14);
    } else if (dData) {
      mapRef.current?.flyTo(dData.lat, dData.lng, 12);
    }
  };

  // Handle Taluk Change & Relocate
  const handleTalukChange = (newTaluk: string) => {
    setTaluk(newTaluk);
    const tData = availableTaluks.find(t => t.name === newTaluk);
    if (tData) {
      if (tData.villages.length > 0) {
        setVillage(tData.villages[0]);
      }
      mapRef.current?.flyTo(tData.lat, tData.lng, 15);
    }
  };

  // Handle Village Change & Relocate
  const handleVillageChange = (newVillage: string) => {
    setVillage(newVillage);
  };

  useEffect(() => {
    const centerLat = selectedTalukData?.lat || selectedDistData?.lat || 11.2740;
    const centerLng = selectedTalukData?.lng || selectedDistData?.lng || 77.5870;

    getVillageCadastralParcels(district, taluk, village, [centerLat, centerLng]).then(data => {
      setParcels(data);
      if (data.length > 0 && mapRef.current) {
        const coords = data.flatMap(p => p.coordinates);
        mapRef.current.fitBounds(coords);
      } else if (mapRef.current) {
        mapRef.current.flyTo(centerLat, centerLng, 15);
      }
    });
  }, [district, taluk, village]);

  useEffect(() => {
    if (targetUlpin && parcels.length > 0) {
      const found = parcels.find(p => p.ulpin === targetUlpin || p.surveyNo === targetUlpin);
      if (found) {
        setSelectedParcel(found);
        mapRef.current?.flyTo(found.center[0], found.center[1], 17);
      }
    }
  }, [targetUlpin, parcels]);

  return (
    <div className="space-y-4">
      {/* ── Top Geographic Selection Bar ─────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={district}
            onChange={e => handleDistrictChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
          >
            {TN_DISTRICTS.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={taluk}
            onChange={e => handleTalukChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
          >
            {availableTaluks.map(t => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>

          <select
            value={village}
            onChange={e => handleVillageChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
          >
            {selectedTalukData?.villages && selectedTalukData.villages.length > 0 ? (
              selectedTalukData.villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))
            ) : (
              <>
                <option value="Ayigoundanpalayam">Ayigoundanpalayam</option>
                <option value="Perundurai East">Perundurai East</option>
                <option value="Perundurai West">Perundurai West</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={baseMap}
            onChange={e => setBaseMap(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-700"
          >
            <option value="satellite">Satellite (Hybrid Labels)</option>
            <option value="streets">Streets (CartoDB / OSM)</option>
            <option value="topographic">Topographic</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>

      {/* ── Map Canvas & Sidebar Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs h-[650px] relative">
          <RealMap
            ref={mapRef}
            baseLayer={baseMap}
            polygons={parcels}
            selectedSurveyNo={selectedParcel?.surveyNo}
            onSelectParcel={p => setSelectedParcel(p)}
            className="w-full h-full"
          />
        </div>

        {/* Right Details Card */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Officer Parcel Inspector</span>
            </h3>

            {selectedParcel ? (
              <div className="space-y-3 text-xs">
                <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-700 font-mono">Assigned ULPIN</span>
                  <div className="font-extrabold text-sm text-gray-900 font-mono mt-0.5">{selectedParcel.ulpin}</div>
                  <div className="text-xs font-bold text-blue-900 mt-1">Survey No. {selectedParcel.surveyNo} ({selectedParcel.subDivision || '126/1A'})</div>
                </div>

                <div className="space-y-2 border-y border-gray-100 py-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattadhar:</span>
                    <strong className="text-gray-900">{selectedParcel.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area:</span>
                    <strong className="text-gray-900">{selectedParcel.area}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Land Use:</span>
                    <strong className="text-gray-900">{selectedParcel.landUse}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Patta Number:</span>
                    <strong className="font-mono text-emerald-700">{selectedParcel.pattaNo || 'PATTA-ERD-4521'}</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setModalParcel(selectedParcel)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Official TamilNilam Records</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigate('All Parcels', { searchQuery: selectedParcel.surveyNo })}
                    className="w-full py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-all cursor-pointer"
                  >
                    Open in Parcel Manager
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto" />
                <p>Click any cadastral parcel on the map to inspect revenue attributes and boundaries.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalParcel && (
        <TamilNilamParcelModal
          isOpen={Boolean(modalParcel)}
          parcel={modalParcel}
          onClose={() => setModalParcel(null)}
        />
      )}
    </div>
  );
};
