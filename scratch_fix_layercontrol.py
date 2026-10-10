import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

# 1. Update the label
content = content.replace(
    "{LAYER_LABELS[key]}",
    "{key === 'nops' && ctx.activeTematik ? 'Tematik (NOP)' : LAYER_LABELS[key]}"
)

# 2. Hide/disable Fill Color if tematik is active
old_fill_input = """                      {/* Fill Color */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Warna Area</span>
                        <input
                          type="color"
                          value={layerStyles[key].fillColor}
                          onChange={(e) => handleStyleChange(key, 'fillColor', e.target.value)}
                          className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                        />
                      </div>"""

new_fill_input = """                      {/* Fill Color */}
                      {!(key === 'nops' && ctx.activeTematik) ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Warna Area</span>
                          <input
                            type="color"
                            value={layerStyles[key].fillColor}
                            onChange={(e) => handleStyleChange(key, 'fillColor', e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between opacity-50">
                          <span className="text-xs text-gray-600 italic">Warna dikontrol API</span>
                          <div className="w-8 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <Palette size={14} className="text-gray-400" />
                          </div>
                        </div>
                      )}"""

content = content.replace(old_fill_input, new_fill_input)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
