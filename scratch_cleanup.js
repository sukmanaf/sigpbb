const fs = require('fs');
const file = '/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block we injected
const blockMarker = '  // Update layer styles dynamically based on MapContext';
const parts = content.split(blockMarker);

// Keep the first part (everything before the first injection)
let newContent = parts[0];

// The last part contains the "return (" that we want to inject before
let lastPart = parts[parts.length - 1];

// But wait, parts[1] might have the rest of the file.
// Let's just remove ALL occurrences of the block and its associated useEffect
// Since we injected it with sed, it looks exactly like what we injected.
// It's easier to just strip them out and re-add it once.
