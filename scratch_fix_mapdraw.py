import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Add useAuth import
if 'useAuth' not in content:
    content = content.replace("import { MapContext }", "import { useAuth } from '@/contexts/AuthContext';\nimport { MapContext }")

# Add canEdit check
replacement = """export function MapDrawCtrl() {
  const ctx = useContext(MapContext);
  const { canEdit } = useAuth();
  const drawControlRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState<any[]>([]);

  // States for Editing existing polygons
  const [editingPolygonInfo, setEditingPolygonInfo] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!canEdit) return null;

  useEffect(() => {"""

content = re.sub(
    r"export function MapDrawCtrl\(\) \{\n  const ctx = useContext\(MapContext\);\n  const drawControlRef = useRef<any>\(null\);\n  const \[modalOpen, setModalOpen\] = useState\(false\);\n  const \[drawnCoordinates, setDrawnCoordinates\] = useState<any\[\]>\(\[\]\);\n\n  // States for Editing existing polygons\n  const \[editingPolygonInfo, setEditingPolygonInfo\] = useState<any>\(null\);\n  const \[editModalOpen, setEditModalOpen\] = useState\(false\);\n\n  useEffect\(\(\) => \{",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
