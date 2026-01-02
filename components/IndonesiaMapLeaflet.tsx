// src/components/IndonesiaMapLeaflet.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix standar untuk ikon Leaflet di Next.js
// ASUMSI: marker-icon.png dan marker-shadow.png ada di public/images/
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ganti ikon default Leaflet secara global
L.Marker.prototype.options.icon = DefaultIcon;

// --- TIPE DATA ---
interface IndonesiaMapLeafletProps {
    statusData?: { lat: number, lng: number, name: string, status: string }[];
    height?: string;
    onProvinceClick?: (provinceName: string) => void;
}

interface GeoJSONFeatureProperties {
    Propinsi?: string;
    kode?: string;
    SUMBER?: string;
}

type GeoJSONFeature = GeoJSON.Feature<GeoJSON.Geometry, GeoJSONFeatureProperties>;

interface GeoJSONData extends GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSONFeatureProperties> {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

const DUMMY_DATA = [
    { lat: -6.1754, lng: 106.8272, name: 'DLH DKI Jakarta', status: 'Selesai' },
    { lat: -7.2758, lng: 112.7667, name: 'DLH Kota Surabaya', status: 'Perlu Revisi' },
    { lat: -0.9456, lng: 100.3605, name: 'DLH Kota Padang', status: 'Menunggu' },
    { lat: 4.6738, lng: 96.7820, name: 'DLH Aceh', status: 'Belum Unggah' },
];

// --- FUNGSI STYLING & EVENT HANDLER ---

// Warna berdasarkan provinsi (contoh sederhana)
const getColorByProvince = (provinceName: string) => {
    const colors: { [key: string]: string } = {
        'DKI JAKARTA': '#3388ff',
        'JAWA BARAT': '#33cc33',
        'JAWA TENGAH': '#ff9933',
        'JAWA TIMUR': '#ff3333',
        'BALI': '#9966ff',
    };
    // Jika tidak ada nama, gunakan ID untuk warna agar unik
    return colors[provinceName] || '#3388ff'; 
};

// Style untuk GeoJSON
const getProvinceStyle = (feature?: GeoJSONFeature) => {
    const provinceName = feature?.properties?.Propinsi?.toUpperCase() || '';
    return {
        fillColor: getColorByProvince(provinceName),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};
// --- AKHIR FUNGSI STYLING ---


export default function IndonesiaMapLeaflet({ 
    statusData = DUMMY_DATA, 
    height = '600px',
    onProvinceClick 
}: IndonesiaMapLeafletProps) {
    const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const INDONESIA_CENTER: [number, number] = [-2.5, 118.5];
    const INITIAL_ZOOM = 5;

    // EFEK: Load GeoJSON data (hanya sekali)
    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                const response = await fetch('/indonesia-prov.geojson');
                if (!response.ok) {
                    throw new Error('Failed to load GeoJSON data');
                }
                const data = await response.json();
                setGeoData(data);
                setLoading(false);
            } catch (err) {
                setError('Error loading map data');
                setLoading(false);
                console.error('Error loading GeoJSON:', err);
            }
        };

        loadGeoJSON();
    }, []);
    
    // Fungsi Internal untuk Event Handler
    const onEachFeatureInternal = (feature: GeoJSONFeature, layer: L.Layer) => {
        if (feature.properties && feature.properties.Propinsi) {
            const provinceName = feature.properties.Propinsi;
            
            layer.bindPopup(`
                 <div>
                    <strong>${provinceName}</strong><br/>
                    Kode: ${feature.properties.kode || 'N/A'}
                 </div>
            `);
            
            layer.on({
                // Mouseover: Highlight peta
                mouseover: (event: L.LeafletEvent) => {
                    const targetLayer = event.target; 
                    if (targetLayer.setStyle) {
                        targetLayer.setStyle({
                            weight: 3,
                            color: '#666',
                            dashArray: '',
                            fillOpacity: 0.9
                        });
                    }
                    if (targetLayer.bringToFront) {
                        targetLayer.bringToFront();
                    }
                },
                // Mouseout: Kembalikan style
                mouseout: (event: L.LeafletEvent) => {
                    const targetLayer = event.target;
                    if (targetLayer.setStyle) {
                        targetLayer.setStyle(getProvinceStyle(feature));
                    }
                },
                // Click: Panggil prop onProvinceClick (jika ada)
                click: () => {
                    if (onProvinceClick) {
                        onProvinceClick(provinceName);
                    }
                }
            });
        }
    };


    if (loading) {
        return (
            <div style={{ height, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Memuat peta...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'red' }}>
                <div>Error: {error}. Pastikan /indonesia-prov.geojson tersedia.</div>
            </div>
        );
    }

    return (
        <div style={{ height: height, width: '100%' }}>
            <MapContainer 
                center={INDONESIA_CENTER} 
                zoom={INITIAL_ZOOM} 
                scrollWheelZoom={true}
                className="rounded-xl shadow-inner z-0"
                style={{ height: '100%', width: '100%' }}
            >
                {/* Layer Peta */}
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render GeoJSON peta Indonesia */}
                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={getProvinceStyle}
                        onEachFeature={onEachFeatureInternal}
                    />
                )}

                {/* Markers untuk Status Data */}
                {statusData.map((data, index) => (
                    <Marker key={index} position={[data.lat, data.lng]}>
                        <Popup>
                            <div className="p-2">
                                <span className="font-semibold">{data.name}</span><br/>
                                Status: <span className={`font-bold ${
                                    data.status.includes('Selesai') ? 'text-green-600' : 
                                    data.status.includes('Revisi') ? 'text-yellow-600' : 
                                    data.status.includes('Menunggu') ? 'text-blue-600' : 
                                    'text-red-600'
                                }`}>
                                    {data.status}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}