import re

with open('/home/wgipro/koding/newmap/my-app/components/map/BasemapSelector.tsx', 'r') as f:
    content = f.read()

old_basemaps = """export const BASEMAPS = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
  },
  {
    id: 'google-satellite',
    name: 'Citra Satelit',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '© Google',
  },
];"""

new_basemaps = """export const BASEMAPS = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
  },
  {
    id: 'google-roadmap',
    name: 'Google Peta',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-satellite',
    name: 'Google Satelit',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-hybrid',
    name: 'Google Hybrid',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-terrain',
    name: 'Google Terrain',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
];"""

content = content.replace(old_basemaps, new_basemaps)

with open('/home/wgipro/koding/newmap/my-app/components/map/BasemapSelector.tsx', 'w') as f:
    f.write(content)
