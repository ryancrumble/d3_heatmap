// Colors Var
const colors = [
	"#5e519f",
	"#3788ba",
	"#6ac1a5",
	"#acdca6",
	"#e6f49d",
	"#fffec2",
	"#fddf90",
	"#f26d4a",
	"#d34052",
	"#9a0942",
	"#ff0000"
];

// Months Var
const months = {
	1: "January",
	2: "February",
	3: "March",
	4: "April",
	5: "May",
	6: "June",
	7: "July",
	8: "August",
	9: "September",
	10: "October",
	11: "November",
	12: "December"
};

const tooltip = d3
	.select("#chart-area")
	.append("div")
	.attr("id", "tooltip");

// set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 100, left: 80 },
	width = 1000 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
	.select("#chart-area")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Title
const title = svg
	.append("text")
	.attr("id", "title")
	.attr("class", "heading")
	.attr("x", width / 2)
	.attr("y", -10)
	.style("text-anchor", "middle")
	.attr("font-size", "26px")
	.text("Monthly Global Land-Surface Temperature");

const subtitle = svg
	.append("text")
	.attr("id", "description")
	.attr("class", "heading")
	.attr("x", width / 2)
	.attr("y", 15)
	.style("text-anchor", "middle")
	.attr("font-size", "18px")
	.text("1753 - 2015: base temperature 8.66℃");

// Labels
const xLabel = svg
	.append("text")
	.attr("class", "x-axis-label label")
	.attr("x", width / 2)
	.attr("y", height + 60)
	.style("text-anchor", "middle")
	.attr("font-size", "26px")
	.text("Year");

const yLabel = svg
	.append("text")
	.attr("class", "y-axis-label label")
	.attr("x", -180)
	.attr("y", -60)
	.style("text-anchor", "middle")
	.attr("font-size", "26px")
	.attr("transform", "rotate(-90)")
	.text("Months");

///////////////////////////////////////////////////////
// Read the data
d3.json(
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(data => {
	// console.log(data);
	const dataset = data.monthlyVariance;
	console.log(dataset);

	// Variables
	const barHeight = height / 12;
	const barWidth = width / (dataset.length / 12);
	const baseTemp = data.baseTemperature;

	// Build color scale
	const colorMin = d3.min(dataset.map(d => d.variance));
	const colorMax = d3.max(dataset.map(d => d.variance));
	const colorScale = d3
		.scaleQuantile()
		.domain([colorMin + baseTemp, colorMax + baseTemp])
		.range(colors);

	// Scales
	const xScale = d3
		.scaleBand()
		.range([0, width])
		.domain(dataset.map(d => d.year));
	const yScale = d3
		.scaleBand()
		.range([margin.top, height])
		.domain(dataset.map(d => d.month));

	//  Axes
	const xAxis = svg
		.append("g")
		.attr("id", "x-axis")
		.attr("transform", `translate(0,${height})`)
		.call(
			d3.axisBottom(xScale).tickValues(
				xScale.domain().filter(year => {
					return year % 10 === 0;
				})
			)
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("font-size", "12px")
		.attr("dx", "-0.5em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-40)");

	const yAxis = svg
		.append("g")
		.attr("id", "y-axis")
		.call(d3.axisLeft(yScale).tickFormat(m => months[m]))
		.selectAll("text")
		.attr("font-size", "12px");

	// Append Data
	svg
		.selectAll()
		.data(dataset)
		.enter()
		.append("rect")
		.attr("class", "cell")
		.attr("x", function(d) {
			return xScale(d.year);
		})
		.attr("y", function(d) {
			return yScale(d.month);
		})
		.attr("width", barWidth)
		.attr("height", barHeight)
		.style("fill", d => colorScale(d.variance + baseTemp))
		.attr("data-month", function(d) {
			return d.month - 1;
		})
		.attr("data-year", function(d) {
			return d.year;
		})
		.attr("data-temp", function(d) {
			return d.variance + baseTemp;
		})
		.on("mouseover", d => {
			tooltip
				.html(
					`
			<p>
					<strong>${d.year} -</strong> ${months[d.month]} </br>
					${(d.variance + baseTemp).toFixed(1)}℃ </br>
					${d.variance < 0 ? d.variance : `${+d.variance}`}℃
			</p>
			`
				)
				.style("opacity", 0.9)
				.style("top", yScale(d.month) + 130 + "px")
				.style("left", xScale(d.year) - 40 + "px")
				.style("transform", "translateX(100px)")
				.attr("data-year", d.year);
		})
		.on("mouseout", d => {
			tooltip.style("opacity", 0);
		});

	// legend adapted from Kenzo's code on codepen
	// Legend
	const legend = svg
		.append("g")
		.attr("id", "legend")
		.classed("legend", true);
	const legWidth = 30;

	legend
		.selectAll("rect")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("width", legWidth)
		.attr("height", 20)
		.attr("x", function(d, i) {
			return (i + 18) * legWidth;
		})
		.attr("y", height + 45)
		.style("fill", function(d) {
			return d;
		});

	legend
		.selectAll("text")
		//[0].concat is use to add '0' label for legend
		.data([0].concat(colorScale.quantiles()))
		.enter()
		.append("text")
		.attr("x", function(d, i) {
			return (i + 17.75) * legWidth;
		})
		.attr("y", height + 75)
		.text(function(d, i) {
			let value = Math.round(d * 10) / 10;
			return value;
		})
		.attr("dx", 13)
		.style("fill", "black")
		.style("stroke", "none")
		.attr("font-size", 10);
});
