import re

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'r') as f:
    content = f.read()

interface_replacement = """  setLayerStyles: (styles: LayerStyles) => void;
  activeTematik: string | null;
  setActiveTematik: (t: string | null) => void;
  tematikData: Record<string, any[]> | null;
  setTematikData: (d: Record<string, any[]> | null) => void;
  tematikLoading: boolean;
  setTematikLoading: (l: boolean) => void;
}"""

content = content.replace("  setLayerStyles: (styles: LayerStyles) => void;\n}", interface_replacement)

state_replacement = """  const [layerStyles, setLayerStyles] = useState<LayerStyles>(DEFAULT_LAYER_STYLES);
  const [activeTematik, setActiveTematik] = useState<string | null>(null);
  const [tematikData, setTematikData] = useState<Record<string, any[]> | null>(null);
  const [tematikLoading, setTematikLoading] = useState<boolean>(false);"""

content = content.replace("  const [layerStyles, setLayerStyles] = useState<LayerStyles>(DEFAULT_LAYER_STYLES);", state_replacement)

context_val_replacement = """        layerStyles,
        setLayerStyles,
        activeTematik,
        setActiveTematik,
        tematikData,
        setTematikData,
        tematikLoading,
        setTematikLoading,
      }}
    >"""

content = content.replace("""        layerStyles,
        setLayerStyles,
      }}
    >""", context_val_replacement)

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'w') as f:
    f.write(content)
