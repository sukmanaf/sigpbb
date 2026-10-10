import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

old_fill = """    'paint': {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'fill-opacity': 0.1,
    },"""

new_fill = """    'paint': {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
      'fill-opacity': ['case', ['==', ['get', 'active'], 'true'], 0.4, 0.1],
    },"""

content = content.replace(old_fill, new_fill)

old_line = """    'paint': {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'line-width': 2,
    },"""

new_line = """    'paint': {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
      'line-width': ['case', ['==', ['get', 'active'], 'true'], 3, 2],
    },"""
    
content = content.replace(old_line, new_line)

old_circle = """    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
    },"""

new_circle = """    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
    },"""

content = content.replace(old_circle, new_circle)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
