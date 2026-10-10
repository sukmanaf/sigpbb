import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

garis_tepi_old = """                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Garis Tepi</span>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden cursor-pointer shadow-sm">
                        <input
                          type="color"
                          value={style.outlineColor}
                          onChange={(e) => updateStyle(key, { outlineColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                        />
                      </div>
                      <input 
                        type="text" 
                        value={style.outlineColor.toUpperCase()}
                        onChange={(e) => {
                           if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              updateStyle(key, { outlineColor: e.target.value });
                           }
                        }}
                        className="w-20 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-gray-600 focus:outline-none focus:border-emerald-500"
                        maxLength={7}
                      />
                    </div>
                  </div>"""

garis_tepi_new = """                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden cursor-pointer shadow-sm shrink-0">
                        <input
                          type="color"
                          value={style.outlineColor}
                          onChange={(e) => updateStyle(key, { outlineColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Garis Tepi</span>
                    </div>
                    <input 
                      type="text" 
                      value={style.outlineColor.toUpperCase()}
                      onChange={(e) => {
                         if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            updateStyle(key, { outlineColor: e.target.value });
                         }
                      }}
                      className="w-20 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-gray-600 focus:outline-none focus:border-emerald-500"
                      maxLength={7}
                    />
                  </div>"""

content = content.replace(garis_tepi_old, garis_tepi_new)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
