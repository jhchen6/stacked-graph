var svgNS = "http://www.w3.org/2000/svg",
    ;

$(document).ready(function () {
    var svg = $("svg"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        x = scale([0, m - 1], [0, width]),
        y = scale([findMinY(), findMaxY()], [0, height]),
        n = 20, // number of series
        m = 200, // number of samples per series
        k = 10, // number of bumps per series
        ;

    var calSeries = stack()
        .keys(range(n))
        .offset()
        .order();
    var series = calSeries(bumps(m, k));

    var path;
    series.forEach(function (s, i) {
        path = document.createElementNS(svgNS, "path");
        $(path).attr("d", calPath(s, i)).attr("fill", color());
        $(svg).append(path);
    });
});

function range(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function stack() {
    var stack,
        keys = [],
        offset,
        order,
        ;
    stack = function (data) {
        var series = [],
            i, j,
            n = data.length,
            m = data[0].length,
            s,
            key,
            ;
        for (i = 0; i < n; i++) {
            s = [];
            key = keys[i];
            s.key = key;
            for (j = 0; j < m; j++) {
                s.push([0, data[j][key]]);
            }
            series.push(s);
        }

        order(series);
        offset(series);
        return series;
    }
    stack.keys = function (_) {
        return arguments.length ? (keys = _, stack) : keys;
    }
    stack.offset = function (_) {
        return arguments.length ? (offset = _, stack) : offset;
    }
    stack.order = function (_) {
        return arguments.length ? (order = _, stack) : order;
    }
    return stack;
}

function calPath(s, i) {

}

function scale(domain, range) {
    var k = (range[0] - range[1]) / (domain[0] - domain[1]),
        b = range[1] - k * domain[1];
    return function (x) {
        return k * x + b;
    }
}

function color() {
    return "#" + Math.floor(Math.random() * 0x1000000);
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