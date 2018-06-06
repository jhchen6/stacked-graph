var width = 960,
    // height = 600;
    height = 500;
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

//prepare data
var m = 20,
    n = 200,
    k = 10;
var data = generateData(m, n, k);//

var stack = d3.stack()
    .keys(d3.range(m)) //bug: keys are needed
    .order(d3.stackOrderInsideOut)
    .offset(d3.stackOffsetWiggle);

var series = stack(data);

//to generate shape
// var x = d3.scaleOrdinal()
//     .domain(d3.range(series[0].length))
//     .range(d3.range(0, width, width / series[0].length)); 
var x = d3.scaleLinear()
    .domain([0, series[0].length - 1])
    .range([0, width]);
var y = d3.scaleLinear()
    .domain([getMin(series), getMax(series)])
    .range([height, 0]);
var area = d3.area()
    .x((d, i) => x(i))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

//to specify color
//adjust: not beautiful
// var colors = d3.scaleOrdinal(d3.schemeGnBu[9]); //bug: [9] needed to specify an array of 9 colors
var colors = d3.scaleSequential(d3.interpolateCool)
    .domain([0, series.length - 1]); //mbostock: use d3.interpolateCool(Math.random())

//add svg elements
svg.selectAll("path")
    .data(series, d => d.index)
    .enter()
    .append("path")
    .attr("d", area)
    .attr("fill", (d, i) => colors(i));

d3.select("button")
    .on("click", update);

//utility functions
function update() {
    data = generateData(m, n, k);
    series = stack(data);
    y.domain([getMin(series), getMax(series)]);
    svg.selectAll("path")
        .data(series, d => d.index)
        .transition()
        .duration(2500) //mbostock: 2500; old: 1000
        .attr("d", area);
}

function generateData(m, n, k) {
    var min = 0,
        max = 600;
    var data = [];
    // for (var i = 0; i < n; i++) {
    //     var dataPoint = data[i] = [];
    //     for (var j = 0; j < m; j++) {
    //         dataPoint.push(Math.random() * (max - min) + min);
    //     }
    // }
    // return data;
    for (var i = 0; i < m; i++) {
        data.push(bumps(n, k));
    }
    return d3.transpose(data);
}

function getMin(series) {
    var arr = [];
    series.forEach(s => {
        arr.push(d3.min(s, d => d[0]));
    });
    return d3.min(arr);
}

function getMax(series) {
    var arr = [];
    series.forEach(s => {
        arr.push(d3.max(s, d => d[1]));
    });
    return d3.max(arr);
}

//--copied from https://bl.ocks.org/mbostock/4060954 --//
// Inspired by Lee Byron’s test data generator.
function bumps(n, m) {
    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < m; ++i) bump(a, n);
    return a;
}

function bump(a, n) {
    var x = 1 / (0.1 + Math.random()),
        y = 2 * Math.random() - 0.5,
        z = 10 / (0.1 + Math.random());
    for (var i = 0; i < n; i++) {
        var w = (i / n - y) * z;
        a[i] += x * Math.exp(-w * w);
    }
}
//--------------- copied ended ----------------------//