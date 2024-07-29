import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FeatureCollection } from "geojson";

type MapProps = {
  data: FeatureCollection;
};

const CONNECTIONS_DATA = [
  { start: [2.3522, 48.8566], end: [-74.006, 40.7128], startName: "Paris", endName: "New York" },
  { start: [139.6917, 35.6895], end: [-0.1276, 51.5074], startName: "Tokyo", endName: "London" },
  { start: [116.4074, 39.9042], end: [151.2093, -33.8688], startName: "Beijing", endName: "Sydney" },
  { start: [37.6173, 55.7558], end: [2.3522, 48.8566], startName: "Moscow", endName: "Paris" },
  { start: [77.209, 28.6139], end: [139.6917, 35.6895], startName: "Delhi", endName: "Tokyo" },
  { start: [151.2093, -33.8688], end: [77.209, 28.6139], startName: "Sydney", endName: "Delhi" },
  { start: [-0.1276, 51.5074], end: [37.6173, 55.7558], startName: "London", endName: "Moscow" },
];

export const Map = ({ data }: MapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const projection = d3
      .geoMercator()
      .scale(width / 2 / Math.PI - 40)
      .center([-90, 70.5]);

    const geoPathGenerator = d3.geoPath().projection(projection);

    // Clear previous elements
    svg.selectAll("*").remove();

    // Create a tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid 1px black")
      .style("padding", "5px")
      .style("border-radius", "5px");

    svg
      .selectAll(".country")
      .data(data.features.filter((shape) => shape.id !== "ATA"))
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", geoPathGenerator as any)
      .attr("stroke", "#007FE3")
      .attr("stroke-width", 0.07)
      .attr("fill", "#007FE3")
      .attr("fillOpacity", 1)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "orange");
        tooltip.style("visibility", "visible").text(d.properties.name);
      })
      .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "#007FE3");
        tooltip.style("visibility", "hidden");
      });

    let connectionIndex = 0;

    const addConnection = () => {
      if (connectionIndex >= CONNECTIONS_DATA.length) {
        connectionIndex = 0;
      }

      const connection = CONNECTIONS_DATA[connectionIndex];

      const startProjection = projection(connection.start);
      const endProjection = projection(connection.end);

      // Clear previous text
      svg.selectAll("text").remove();

      // Create text label for start
      if (startProjection) {
        svg
          .append("text")
          .attr("x", startProjection[0])
          .attr("y", startProjection[1])
          .attr("dy", -10)
          .attr("fill", "white")
          .style("font-size", "12px")
          .style("text-anchor", "middle")
          .text(connection.startName);
      }

      const connectionPath = svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: [connection.start, connection.end],
        })
        .attr("d", geoPathGenerator as any)
        .attr("stroke", "#ff5733")
        .attr("stroke-width", 3) // Set stroke width to 5 px
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("fill", "none");

      const totalLength = connectionPath.node().getTotalLength();

      connectionPath
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 3) // Maintain stroke width during transition
        .attr("stroke", "#ff5733") // Change color during transition
        .on("end", () => {
          connectionPath.transition().duration(1000).attr("opacity", 0).remove();

          // Create text label for end
          if (endProjection) {
            svg
              .append("text")
              .attr("x", endProjection[0])
              .attr("y", endProjection[1])
              .attr("dy", -10)
              .attr("fill", "white")
              .style("font-size", "12px")
              .style("text-anchor", "middle")
              .text(connection.endName)
              .transition()
              .delay(1000)
              .duration(1000)
              .attr("opacity", 0)
              .remove();
          }
        });

      connectionIndex++;
    };

    const intervalId = setInterval(addConnection, 5000);

    return () => {
      clearInterval(intervalId);
      tooltip.remove();
    };
  }, [data]);

  return (
    <div style={{ width: "96vw", height: "96vh", backgroundColor: 'black' }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
    </div>
  );
};
