"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const geoUrl = "/indonesia-prov.geojson";

export default function IndonesiaMap() {
  const [tooltipContent, setTooltipContent] = useState("");

  const handleMouseEnter = (geo) => {
    setTooltipContent(geo.properties.name_1);
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1100,         // <-- PERUBAHAN: Dikecilkan sedikit dari 1350
          center: [118, -2],   // <-- PERUBAHAN: Dikembalikan ke posisi awal yang lebih sentris
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => handleMouseEnter(geo)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: { fill: "#D6D6DA", stroke: "#FFF", strokeWidth: 0.5, outline: "none" },
                    hover: { fill: "#10B981", outline: "none", cursor: "pointer" },
                    pressed: { fill: "#059669", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltipContent && (
        <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-md shadow-lg border text-sm font-semibold">
          {tooltipContent}
        </div>
      )}
    </div>
  );
}