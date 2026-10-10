import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

replacement = """      <div
          className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
      >"""

content = content.replace("""      <div
          className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >""", replacement)

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(content)
