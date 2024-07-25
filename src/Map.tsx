import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FeatureCollection } from "geojson";

type MapProps = {
  width: number;
  height: number;
  data: FeatureCollection;
};

const CONNECTIONS_DATA = [
  { start: [2.3522, 48.8566], end: [-74.006, 40.7128] },
  { start: [139.6917, 35.6895], end: [-0.1276, 51.5074] },
  { start: [116.4074, 39.9042], end: [151.2093, -33.8688] },
  { start: [37.6173, 55.7558], end: [2.3522, 48.8566] },
  { start: [77.209, 28.6139], end: [139.6917, 35.6895] },
  { start: [151.2093, -33.8688], end: [77.209, 28.6139] }, 
  { start: [-0.1276, 51.5074], end: [37.6173, 55.7558] }, 
];

export const Map = ({ width, height, data }: MapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const projection = d3
      .geoMercator()
      .scale(width / 2 / Math.PI - 40)
      .center([10, 35]);
    const geoPathGenerator = d3.geoPath().projection(projection);

    // Clear previous elements
    svg.selectAll("*").remove();

    svg
      .selectAll(".country")
      .data(data.features.filter((shape) => shape.id !== "ATA"))
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", geoPathGenerator as any)
      .attr("stroke", "blue")
      .attr("strokeWidth", 0.9)
      .attr("fill", "grey")
      .attr("fillOpacity", 1);

    let connectionIndex = 0;

    const addConnection = () => {
      if (connectionIndex >= CONNECTIONS_DATA.length) {
        connectionIndex = 0;
      }

      const connection = CONNECTIONS_DATA[connectionIndex];

      const connectionPath = svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: [connection.start, connection.end],
        })
        .attr("d", geoPathGenerator as any)
        .attr("stroke", "#d11d1d")
        .attr("strokeWidth", 9)
        .attr("fill", "none");

      const totalLength = connectionPath.node().getTotalLength();

      connectionPath
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          connectionPath.transition().duration(1000).attr("opacity", 0).remove();
        });

      connectionIndex++;
    };

    const intervalId = setInterval(addConnection, 5000);

    return () => clearInterval(intervalId);
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
