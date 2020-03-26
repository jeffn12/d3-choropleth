import "./styles.css";
import * as d3 from "d3";
import * as topojson from "topojson";

const generateChoropleth = async function() {
  //US Education Data:
  var edData = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  )
    .then(res => res.json())
    .then(data => data);
  //US County Data:
  var countyData = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  )
    .then(res => res.json())
    .then(data => data);

  d3.select("body")
    .append("h3")
    .text("US Higher Education Attainment By State")
    .attr("id", "title");
  d3.select("body")
    .append("h5")
    .text("Percentage of adults over age 25 with a Bachelor's Degree or higher")
    .attr("id", "description");

  var width = 960,
    height = 600;
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  var path = d3.geoPath();

  var colorScale = d3
    .scaleThreshold(d3.schemeOranges[9])
    .domain([0, 10, 20, 30, 40, 50, 60, 70, 80]);
  //create div for tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  var legend = svg
    .append("g")
    .attr("id", "legend")
    .selectAll("rect")
    .data(colorScale.range())
    .enter();
  legend
    .append("rect")
    .attr("fill", d => d)
    .attr("height", 20)
    .attr("width", 25)
    .attr("x", (d, i) => 2 * (width / 3) + i * 25)
    .attr("y", 30);
  legend
    .insert("text")
    .text((d, i) => (i * 10).toString() + "%")
    .attr("x", (d, i) => 2 * (width / 3) + i * 25)
    .attr("y", 40)
    .attr("class", "legendText");

  svg //add counties to the svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county") //outline counties in blue
    .attr("fill", (d, i) => {
      var foo = edData.find(bar => bar.fips === d.id);
      return colorScale(foo.bachelorsOrHigher);
    })
    .attr("data-fips", d => edData.find(county => county.fips === d.id).fips)
    .attr(
      "data-education",
      d => edData.find(county => county.fips === d.id).bachelorsOrHigher
    )
    //add tooltip functionality
    .on("mouseover", d => {
      var foo = edData.find(bar => bar.fips === d.id);
      tooltip
        .style("opacity", 0.9)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .attr(
          "data-education",
          edData.find(county => county.fips === d.id).bachelorsOrHigher
        )
        .html(`${foo.area_name} - ${foo.bachelorsOrHigher}%`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  svg //add states to the svg
    .append("path")
    .datum(topojson.mesh(countyData, countyData.objects.states))
    .attr("id", "state-borders")
    .attr("d", path)
    .attr("stroke", "black") //outline states in black
    .attr("fill", "none");
};

generateChoropleth();

/*
  //find range of percentages- bacherlors degress or higher
  var minmax = [100, 0];
  edData.forEach(i => {
    if (i.bachelorsOrHigher < minmax[0]) minmax[0] = i.bachelorsOrHigher;
    if (i.bachelorsOrHigher > minmax[1]) minmax[1] = i.bachelorsOrHigher;
  });

  var scale = d3
    .scaleLinear()
    .domain(minmax)
    .range([0, 30]); //scale the percentages so more colors are available
   var colorScale = d3
     .scaleSequential(d3.interpolateOranges)
     .domain([scale(minmax[0]), scale(minmax[1])]);
 */
