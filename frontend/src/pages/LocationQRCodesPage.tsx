import { useState } from 'react';
import { QrCode, Plus, Trash2, Download } from 'lucide-react';

interface LocationQR {
  id: string;
  building: string;
  floor: string;
  area: string;
}

export default function LocationQRCodesPage() {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [locations, setLocations] = useState<LocationQR[]>([]);

  function deepLink(loc: LocationQR) {
    const params = new URLSearchParams({ building: loc.building, floor: loc.floor });
    if (loc.area) params.set('area', loc.area);
    return `${window.location.origin}/report-issue?${params.toString()}`;
  }

  function qrImageUrl(loc: LocationQR) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deepLink(loc))}`;
  }

  function addLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!building.trim() || !floor.trim()) return;
    setLocations((prev) => [{ id: `${Date.now()}`, building: building.trim(), floor: floor.trim(), area: area.trim() }, ...prev]);
    setBuilding('');
    setFloor('');
    setArea('');
  }

  function removeLocation(id: string) {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><QrCode className="text-primary-600" /> Location QR Codes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate a QR sticker per building/floor. Scanning it opens the report form with the location pre-filled — no typo-prone manual entry.
        </p>
      </div>

      <form onSubmit={addLocation} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label-text">Building</label>
          <input className="input-field" value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="Academic Block A" />
        </div>
        <div className="flex-1">
          <label className="label-text">Floor</label>
          <input className="input-field" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="2" />
        </div>
        <div className="flex-1">
          <label className="label-text">Area (optional)</label>
          <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Computer Lab" />
        </div>
        <button type="submit" className="btn-primary shrink-0"><Plus size={18} /> Generate QR</button>
      </form>

      {locations.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No QR codes generated yet — add a building and floor above.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.id} className="card flex flex-col items-center gap-3 p-5 text-center">
              <img src={qrImageUrl(loc)} alt={`QR code for ${loc.building} floor ${loc.floor}`} className="h-40 w-40" />
              <div>
                <p className="font-semibold text-slate-800">{loc.building}</p>
                <p className="text-sm text-slate-500">Floor {loc.floor}{loc.area ? ` · ${loc.area}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <a href={qrImageUrl(loc)} download={`qr-${loc.building}-floor-${loc.floor}.png`} className="btn-secondary px-3 py-1.5 text-xs">
                  <Download size={14} /> Download
                </a>
                <button onClick={() => removeLocation(loc.id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
