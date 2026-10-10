import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Add the UI button right after return (
old_return = """  return (
    <>
      {/* Edit Mode Info Banner */}"""

new_return = """  return (
    <>
      {/* Fast Edit Save Button */}
      {showBulkSaveBtn && modeRef.current === 'bulk-edit' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex gap-2">
           <button
             onClick={handleBulkSave}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             Simpan Pergeseran Massal
           </button>
           <button
             onClick={() => {
                if (drawControlRef.current) drawControlRef.current.deleteAll();
                setShowBulkSaveBtn(false);
                ctx?.setMode('view');
             }}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             Batal
           </button>
        </div>
      )}

      {/* Edit Mode Info Banner */}"""

if "Simpan Pergeseran Massal" not in content:
    content = content.replace(old_return, new_return)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
