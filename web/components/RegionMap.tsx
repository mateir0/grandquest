'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

// framer-motion + WorldMap stays off the critical path
const WorldMap = dynamic(
  () => import('./lightswind/world-map').then((m) => m.WorldMap),
  {ssr: false},
)

/** Convert a region name to a rough lat/lng for the marker. */
function regionToCoords(region: string): {lat: number; lng: number} {
  const coords: Record<string, {lat: number; lng: number}> = {
    'United Kingdom': {lat: 55.3781, lng: -3.4360},
    'United States': {lat: 37.0902, lng: -95.7129},
    'Germany': {lat: 51.1657, lng: 10.4515},
    'Netherlands': {lat: 52.1326, lng: 5.2913},
    'Sweden': {lat: 60.1282, lng: 18.6435},
    'France': {lat: 46.2276, lng: 2.2137},
    'Italy': {lat: 41.8719, lng: 12.5674},
    'Canada': {lat: 56.1304, lng: -106.3468},
    'Australia': {lat: -25.2744, lng: 133.7751},
    'South Korea': {lat: 35.9078, lng: 127.7669},
    'China': {lat: 35.8617, lng: 104.1954},
    'Singapore': {lat: 1.3521, lng: 103.8198},
    'Hong Kong': {lat: 22.3193, lng: 114.1694},
    'Saudi Arabia': {lat: 23.8859, lng: 45.0792},
    'United Arab Emirates': {lat: 23.4241, lng: 53.8478},
    'Switzerland': {lat: 46.8182, lng: 8.2275},
    'South Africa': {lat: -30.5595, lng: 22.9375},
    'Japan': {lat: 36.2048, lng: 138.2529},
    'Spain': {lat: 40.4637, lng: -3.7492},
    'Belgium': {lat: 50.5039, lng: 4.4699},
    'Denmark': {lat: 56.2639, lng: 9.5018},
    'Finland': {lat: 61.9241, lng: 25.7482},
    'Norway': {lat: 60.4720, lng: 8.4689},
    'Austria': {lat: 47.5162, lng: 14.5501},
    'Ireland': {lat: 53.4129, lng: -8.2439},
    'New Zealand': {lat: -40.9006, lng: 174.8860},
  }
  return coords[region] ?? {lat: 0, lng: 0}
}

interface RegionStat {
  name: string
  count: number
  lat: number
  lng: number
}

/**
 * Charted regions block — real Sanity region data plotted on a parchment/brass map.
 * Markers are sepia dots; tooltips show region + quest count.
 */
export function RegionMap({quests}: {quests: {countries?: string[]}[]}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [regions, setRegions] = useState<RegionStat[]>([])

  useEffect(() => {
    setMounted(true)
    // Aggregate quest counts per region from real quest data
    const counts = new Map<string, number>()
    for (const quest of quests) {
      for (const c of quest.countries ?? []) {
        counts.set(c, (counts.get(c) ?? 0) + 1)
      }
    }
    const stats: RegionStat[] = Array.from(counts.entries())
      .map(([name, count]) => {
        const {lat, lng} = regionToCoords(name)
        return {name, count, lat, lng}
      })
      .filter((r) => r.lat !== 0 || r.lng !== 0) // only regions we have coords for
    setRegions(stats)
  }, [quests])

  if (!mounted || reduced || regions.length === 0) return null

  const markers = regions.map((r) => ({
    id: r.name.toLowerCase().replace(/\s+/g, '-'),
    lat: r.lat,
    lng: r.lng,
    label: r.name,
    country: r.name,
    size: 4,
    pulse: false,
    data: {questCount: r.count},
  }))

  return (
    <section className="region-map" aria-labelledby="region-map-title">
      <h2 id="region-map-title" className="region-map-title">
        Charted regions
      </h2>
      <WorldMap
        width={900}
        height={450}
        dotRadius={1.2}
        dotColor="#b5a642"
        markerColor="#b5a642"
        pulseColor="#b5a642"
        pulse={false}
        stagger={false}
        enableTooltips={true}
        showTimezones={false}
        interactive={true}
        markers={markers}
        arcs={[]}
        renderMarkerOverlay={({marker, x, y, r}) => (
          <g>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="none"
              stroke="#b5a642"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
            <circle cx={x} cy={y} r={r * 0.5} fill="#b5a642" />
            <title>{marker.label} — {marker.data?.questCount} quests</title>
          </g>
        )}
        className="region-map-svg"
      />
      <p className="region-map-note">
        {regions.length} region{regions.length === 1 ? '' : 's'} with active quests.
      </p>
    </section>
  )
}