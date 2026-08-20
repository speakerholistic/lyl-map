'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import type { Property } from '@/data/mockProperties';
import type {
  LayerId,
  LayerData,
  MedicalProvider,
  MobilityRiskZone,
  DensityCluster,
  OwnershipChain,
} from '@/data/layerTypes';

/** Stable type for the Google Maps instance without relying on the global google namespace */
type GMap = NonNullable<ReturnType<typeof useMap>>;

interface Props {
  properties: Property[];
  onPinClick: (property: Property) => void;
  selectedId: string | null;
  activeLayers: Set<LayerId>;
  layerData: LayerData;
  onReset: () => void;
  /** When set, the map smoothly pans+zooms to this location */
  focusTarget?: { lat: number; lng: number; zoom: number } | null;
}

// ─── SVG → data URI helper ────────────────────────────────────────────────────
function svgUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Pre-built icon data URIs ─────────────────────────────────────────────────
const ICONS = {
  clean: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#16a34a" stroke="white" stroke-width="1.5"/><circle cx="14" cy="14" r="4.5" fill="white"/></svg>`
  ),
  cleanSel: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#16a34a" stroke="#111827" stroke-width="2.5"/><circle cx="14" cy="14" r="4.5" fill="white"/></svg>`
  ),
  warning: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="26" viewBox="0 0 28 26"><polygon points="14,2 27,24 1,24" fill="#ca8a04" stroke="white" stroke-width="1.5"/></svg>`
  ),
  warningSel: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="34" viewBox="0 0 28 26"><polygon points="14,2 27,24 1,24" fill="#ca8a04" stroke="#111827" stroke-width="2.5"/></svg>`
  ),
  critical: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><polygon points="9,2 19,2 26,9 26,19 19,26 9,26 2,19 2,9" fill="#dc2626" stroke="white" stroke-width="1.5"/></svg>`
  ),
  criticalSel: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 28 28"><polygon points="9,2 19,2 26,9 26,19 19,26 9,26 2,19 2,9" fill="#dc2626" stroke="#111827" stroke-width="2.5"/></svg>`
  ),
  hospital: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><rect x="1" y="1" width="20" height="20" rx="3" fill="#EF4444" stroke="white" stroke-width="1.5"/><rect x="9" y="4" width="4" height="14" fill="white"/><rect x="4" y="9" width="14" height="4" fill="white"/></svg>`
  ),
  homeHealth: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><polygon points="11,1 21,10 18,10 18,21 4,21 4,10 1,10" fill="#3B82F6" stroke="white" stroke-width="1.5"/><rect x="8" y="14" width="6" height="7" fill="white"/></svg>`
  ),
  hospice: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><path d="M11,19 C11,19 2,13 2,7.5 C2,4.5 4.4,2.5 7.5,2.5 C9.2,2.5 10.4,3.3 11,4.4 C11.6,3.3 12.8,2.5 14.5,2.5 C17.6,2.5 20,4.5 20,7.5 C20,13 11,19 11,19Z" fill="#A855F7" stroke="white" stroke-width="1.5"/></svg>`
  ),
};

function complianceIcon(status: Property['status'], selected: boolean) {
  if (status === 'clean') return selected ? ICONS.cleanSel : ICONS.clean;
  if (status === 'warning') return selected ? ICONS.warningSel : ICONS.warning;
  return selected ? ICONS.criticalSel : ICONS.critical;
}

function medicalIcon(type: string) {
  if (type === 'hospital') return ICONS.hospital;
  if (type === 'home_health') return ICONS.homeHealth;
  return ICONS.hospice;
}

// ─── Map style ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MAP_STYLES: any[] = [
  { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dce8f0' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f3f6f9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a8bfcf' }, { weight: 1 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#7a9cb4' }, { weight: 1.5 }],
  },
];

// ─── Map constants ────────────────────────────────────────────────────────────
const CONUS_CENTER = { lat: 39.5, lng: -98.35 };
const CONUS_ZOOM = 4;
const CONUS_RESTRICTION = {
  latLngBounds: { north: 50.0, south: 23.5, east: -65.5, west: -127.0 },
  strictBounds: true,
};
// AK_CENTER, AK_ZOOM, HI_CENTER, HI_ZOOM removed — insets are now StatInset panels, not Google Maps

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// ─── Facility marker ──────────────────────────────────────────────────────────
function FacilityMarker({
  property,
  selected,
  onPinClick,
}: {
  property: Property;
  selected: boolean;
  onPinClick: (p: Property) => void;
}) {
  const [open, setOpen] = useState(false);
  const pos = { lat: property.lat, lng: property.lng };
  const sz = selected ? 36 : 28;
  const anchor = selected
    ? { x: 18, y: 18, equals: () => false }
    : { x: 14, y: 14, equals: () => false };

  const statusLabel =
    property.status === 'critical'
      ? '⬡ Serious Violations'
      : property.status === 'warning'
        ? '▲ Safety Issues Found'
        : '● Clean Record';
  const statusColor =
    property.status === 'critical'
      ? '#DC2626'
      : property.status === 'warning'
        ? '#B45309'
        : '#16A34A';

  return (
    <>
      <Marker
        position={pos}
        icon={{
          url: complianceIcon(property.status, selected),
          scaledSize: { width: sz, height: sz, equals: () => false },
          anchor,
        }}
        zIndex={selected ? 100 : 10}
        onClick={() => {
          onPinClick(property);
          setOpen((v) => !v);
        }}
        onMouseOver={() => setOpen(true)}
        onMouseOut={() => setOpen(false)}
      />
      {open && (
        <InfoWindow position={pos} onCloseClick={() => setOpen(false)} headerDisabled>
          <div
            style={{
              minWidth: 160,
              fontFamily: 'system-ui,sans-serif',
              fontSize: 12,
              padding: '2px 0',
            }}
          >
            <p style={{ fontWeight: 600, margin: '0 0 3px', color: '#111827' }}>{property.name}</p>
            <p style={{ margin: '0 0 3px', color: '#6B7280' }}>
              {property.city}, {property.state} · {property.citationCount} citation
              {property.citationCount !== 1 ? 's' : ''}
            </p>
            <p style={{ margin: 0, fontWeight: 500, color: statusColor }}>{statusLabel}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// ─── Medical marker ───────────────────────────────────────────────────────────
function MedicalMarker({ provider }: { provider: MedicalProvider }) {
  const [open, setOpen] = useState(false);
  const pos = { lat: Number(provider.lat), lng: Number(provider.lng) };

  const typeLabel =
    provider.providerType === 'hospital'
      ? '✛ Acute Hospital'
      : provider.providerType === 'home_health'
        ? '⌂ Home Health Agency'
        : '♥ Hospice Provider';
  const typeColor =
    provider.providerType === 'hospital'
      ? '#DC2626'
      : provider.providerType === 'home_health'
        ? '#2563EB'
        : '#9333EA';

  return (
    <>
      <Marker
        position={pos}
        icon={{
          url: medicalIcon(provider.providerType),
          scaledSize: { width: 22, height: 22, equals: () => false },
          anchor: { x: 11, y: 11, equals: () => false },
        }}
        zIndex={5}
        onMouseOver={() => setOpen(true)}
        onMouseOut={() => setOpen(false)}
      />
      {open && (
        <InfoWindow position={pos} onCloseClick={() => setOpen(false)} headerDisabled>
          <div
            style={{
              minWidth: 160,
              fontFamily: 'system-ui,sans-serif',
              fontSize: 12,
              padding: '2px 0',
            }}
          >
            <p style={{ fontWeight: 600, margin: '0 0 3px', color: '#111827' }}>{provider.name}</p>
            <p style={{ margin: '0 0 3px', color: '#6B7280' }}>
              {provider.city}, {provider.state}
              {provider.county ? ` · ${provider.county}` : ''}
            </p>
            <p style={{ margin: 0, fontWeight: 500, color: typeColor }}>{typeLabel}</p>
            {provider.nonprofit && (
              <p style={{ margin: '2px 0 0', color: '#059669', fontSize: 11 }}>
                Non-Profit Provider
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// ─── Mobility marker ──────────────────────────────────────────────────────────
function MobilityMarker({ zone }: { zone: MobilityRiskZone }) {
  const [open, setOpen] = useState(false);
  const pos = { lat: Number(zone.lat), lng: Number(zone.lng) };
  const color =
    zone.deconditioningScore > 70
      ? '#EF4444'
      : zone.deconditioningScore > 50
        ? '#F59E0B'
        : '#10B981';
  const iconUrl = svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="${color}" fill-opacity="0.7" stroke="white" stroke-width="2"/></svg>`
  );

  return (
    <>
      <Marker
        position={pos}
        icon={{
          url: iconUrl,
          scaledSize: { width: 20, height: 20, equals: () => false },
          anchor: { x: 10, y: 10, equals: () => false },
        }}
        zIndex={2}
        onMouseOver={() => setOpen(true)}
        onMouseOut={() => setOpen(false)}
      />
      {open && (
        <InfoWindow position={pos} onCloseClick={() => setOpen(false)} headerDisabled>
          <div
            style={{
              minWidth: 160,
              fontFamily: 'system-ui,sans-serif',
              fontSize: 12,
              padding: '2px 0',
            }}
          >
            <p style={{ fontWeight: 600, margin: '0 0 3px', color: '#111827' }}>
              {zone.countyName}
            </p>
            <p style={{ margin: '0 0 3px', fontWeight: 500, color }}>
              Fall & Mobility Risk Score: {zone.deconditioningScore}/100
            </p>
            <p style={{ margin: 0, color: '#6B7280' }}>
              {zone.pctOver65}% age 65+ · {zone.pctMobilityLimited}% with mobility challenges
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// ─── Density marker ───────────────────────────────────────────────────────────
function DensityMarker({ cluster }: { cluster: DensityCluster }) {
  const [open, setOpen] = useState(false);
  const pos = { lat: Number(cluster.lat), lng: Number(cluster.lng) };
  const hasCritical = cluster.criticalCount > 0;
  const iconUrl = svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="rgba(8,145,178,0.2)" stroke="${hasCritical ? '#DC2626' : '#0891B2'}" stroke-width="1.5" stroke-dasharray="${hasCritical ? '4 3' : 'none'}"/><text x="18" y="23" text-anchor="middle" font-size="11" font-weight="700" font-family="system-ui,sans-serif" fill="#0E7490">${cluster.count}</text></svg>`
  );

  return (
    <>
      <Marker
        position={pos}
        icon={{
          url: iconUrl,
          scaledSize: { width: 36, height: 36, equals: () => false },
          anchor: { x: 18, y: 18, equals: () => false },
        }}
        zIndex={3}
        onMouseOver={() => setOpen(true)}
        onMouseOut={() => setOpen(false)}
      />
      {open && (
        <InfoWindow position={pos} onCloseClick={() => setOpen(false)} headerDisabled>
          <div
            style={{
              minWidth: 140,
              fontFamily: 'system-ui,sans-serif',
              fontSize: 12,
              padding: '2px 0',
            }}
          >
            <p style={{ fontWeight: 600, margin: '0 0 3px', color: '#111827' }}>Density Cluster</p>
            <p style={{ margin: '0 0 3px', color: '#6B7280' }}>
              {cluster.count} facilities in region
            </p>
            <p style={{ margin: 0, color: hasCritical ? '#DC2626' : '#6B7280' }}>
              {cluster.criticalCount} critical violations
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// ─── MapController: captures map ref + handles auto-zoom on pin click ─────────
// Must render INSIDE <GoogleMap> so bare useMap() resolves to the enclosing map.
function MapController({
  selectedId,
  properties,
  onMapReady,
  focusTarget,
}: {
  selectedId: string | null;
  properties: Property[];
  onMapReady: (map: GMap) => void;
  focusTarget?: { lat: number; lng: number; zoom: number } | null;
}) {
  // bare useMap() auto-resolves to the enclosing GoogleMap instance
  const map = useMap();
  const readyFired = useRef(false);

  // Expose the map instance to the parent via callback (for the overlay buttons)
  useEffect(() => {
    if (map && !readyFired.current) {
      readyFired.current = true;
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Auto-center + zoom when user clicks a pin
  useEffect(() => {
    if (!map || !selectedId) return;
    const prop = properties.find((p) => p.id === selectedId);
    if (!prop) return;
    // setCenter then setZoom — both synchronous, no animation race
    map.setCenter({ lat: prop.lat, lng: prop.lng });
    map.setZoom(13);
  }, [map, selectedId, properties]);

  // Fly to focusTarget whenever it changes (state or city selection)
  useEffect(() => {
    if (!map || !focusTarget) return;
    map.panTo({ lat: focusTarget.lat, lng: focusTarget.lng });
    // slight delay so panTo starts before zoom kicks in — feels smoother
    const t = setTimeout(() => map.setZoom(focusTarget.zoom), 120);
    return () => clearTimeout(t);
  }, [map, focusTarget]);

  return null;
}

// ─── Inset panel (Alaska / Hawaii) — no extra Google Maps instance ───────────
function StatInset({
  label,
  properties,
  onPinClick,
  style,
}: {
  label: string;
  properties: Property[];
  onPinClick: (p: Property) => void;
  style: React.CSSProperties;
}) {
  const clean = properties.filter((p) => p.status === 'clean').length;
  const warning = properties.filter((p) => p.status === 'warning').length;
  const critical = properties.filter((p) => p.status === 'critical').length;

  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        border: '1.5px solid #cbd5e1',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
        background: '#f8fafc',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 8px',
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#1e3a5f',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      {properties.length === 0 ? (
        <span style={{ fontSize: 10, color: '#94a3b8' }}>No facilities</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {clean > 0 && (
            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>● {clean} Clean</span>
          )}
          {warning > 0 && (
            <span style={{ fontSize: 10, color: '#b45309', fontWeight: 600 }}>
              ▲ {warning} Citation{warning !== 1 ? 's' : ''}
            </span>
          )}
          {critical > 0 && (
            <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>
              ⬡ {critical} Critical
            </span>
          )}
          {/* Clickable list of facilities */}
          <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {properties.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onPinClick(p)}
                style={{
                  textAlign: 'left',
                  fontSize: 9,
                  color: '#475569',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 130,
                }}
              >
                {p.name}
              </button>
            ))}
            {properties.length > 4 && (
              <span style={{ fontSize: 9, color: '#94a3b8' }}>+{properties.length - 4} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ComplianceMapCanvas({
  properties,
  onPinClick,
  selectedId,
  activeLayers,
  layerData,
  onReset,
  focusTarget,
}: Props) {
  const handlePinClick = useCallback((property: Property) => onPinClick(property), [onPinClick]);

  // Store the live map instance in a ref so the overlay buttons can call it directly
  const mapRef = useRef<GMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Detect mobile so we can hide insets and reposition buttons
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMapReady = useCallback((map: GMap) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  // ── Overlay button handlers ──────────────────────────────────────────────
  const [locating, setLocating] = useState(false);

  const goTo = useCallback((lat: number, lng: number, zoom: number) => {
    const m = mapRef.current;
    if (!m) return;
    m.setCenter({ lat, lng });
    m.setZoom(zoom);
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        goTo(pos.coords.latitude, pos.coords.longitude, 12);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }, [goTo]);

  const handleZoomOut = useCallback(() => {
    goTo(CONUS_CENTER.lat, CONUS_CENTER.lng, CONUS_ZOOM);
  }, [goTo]);

  const handleReset = useCallback(() => {
    onReset();
    goTo(CONUS_CENTER.lat, CONUS_CENTER.lng, CONUS_ZOOM);
  }, [goTo, onReset]);

  // Split properties by region
  const akProperties = properties.filter((p) => p.state === 'AK');
  const hiProperties = properties.filter((p) => p.state === 'HI');
  const conusProperties = properties.filter((p) => p.state !== 'AK' && p.state !== 'HI');

  const ownershipColorMap = new Map<string, string>();
  if (activeLayers.has('ownership')) {
    (layerData.ownership ?? []).forEach((chain: OwnershipChain) => {
      chain.propertyIds.forEach((pid) => ownershipColorMap.set(pid, chain.accentColor));
    });
  }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1.5px solid',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
    background: 'none',
    fontFamily: 'system-ui, sans-serif',
  };

  // On mobile: buttons sit at bottom:8 (insets hidden).
  // On desktop: buttons sit at bottom:125 to clear the stat inset panels.
  const btnStackBottom = isMobile ? 8 : 125;

  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* ── Main CONUS map ── */}
        <GoogleMap
          id="conus-map"
          style={{ width: '100%', height: '100%' }}
          defaultCenter={CONUS_CENTER}
          defaultZoom={CONUS_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoomControl
          restriction={CONUS_RESTRICTION}
          styles={MAP_STYLES}
        >
          {activeLayers.has('mobility') &&
            (layerData.mobility ?? []).map((zone) => (
              <MobilityMarker key={zone.fips} zone={zone} />
            ))}

          {activeLayers.has('geographic') &&
            (layerData.geographic ?? []).map((cluster, i) => (
              <DensityMarker key={i} cluster={cluster} />
            ))}

          {activeLayers.has('medical') &&
            (layerData.medical ?? []).map((provider) => (
              <MedicalMarker key={provider.id} provider={provider} />
            ))}

          {conusProperties.map((prop) => (
            <FacilityMarker
              key={prop.id}
              property={prop}
              selected={selectedId === prop.id}
              onPinClick={handlePinClick}
            />
          ))}

          <MapController
            selectedId={selectedId}
            properties={conusProperties}
            onMapReady={handleMapReady}
            focusTarget={focusTarget}
          />
        </GoogleMap>

        {/* ── Overlay control buttons ── */}
        {mapReady && (
          <div
            style={{
              position: 'absolute',
              bottom: btnStackBottom,
              right: 12,
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-end',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={handleMyLocation}
              disabled={locating}
              title="Zoom to my location"
              style={{
                ...btnBase,
                background: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151',
                opacity: locating ? 0.7 : 1,
              }}
            >
              <span style={{ fontSize: 14 }}>📍</span>
              {locating ? 'Locating…' : 'My Location'}
            </button>

            <button
              onClick={handleZoomOut}
              title="Zoom out to see all facilities"
              style={{
                ...btnBase,
                background: '#EFF6FF',
                borderColor: '#93c5fd',
                color: '#1d4ed8',
              }}
            >
              <span style={{ fontSize: 14 }}>🗺</span>
              Zoom Out
            </button>

            {selectedId && (
              <button
                onClick={handleReset}
                title="Deselect facility and reset view"
                style={{
                  ...btnBase,
                  background: '#FFF7ED',
                  borderColor: '#fed7aa',
                  color: '#c2410c',
                }}
              >
                <span style={{ fontSize: 14 }}>↺</span>
                Reset View
              </button>
            )}
          </div>
        )}

        {/* ── AK + HI insets — hidden on mobile (too small to be useful) ── */}
        {!isMobile && (
          <>
            <StatInset
              label="AK"
              properties={akProperties}
              onPinClick={handlePinClick}
              style={{ bottom: 8, left: 4, width: 148, height: 104 }}
            />
            <StatInset
              label="HI"
              properties={hiProperties}
              onPinClick={handlePinClick}
              style={{ bottom: 8, left: 158, width: 104, height: 84 }}
            />
          </>
        )}
      </div>
    </APIProvider>
  );
}
