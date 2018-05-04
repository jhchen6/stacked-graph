var svgNS = "http://www.w3.org/2000/svg";

$(document).ready(function () {
    var svg = $("svg"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        n = 20, // number of series
        m = 200, // number of samples per series
        k = 10; // number of bumps per series

    var calSeries = stack()
        .keys(range(n))
        .offset(weightedWiggle)
        .order(insideOut);
    var series = calSeries(data(n, m, k));

    var x = scale([0, m - 1], [0, width]),
        y = scale(findMinMaxY(series), [0, height]),
        calPath = area().x(x).y(y);

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
    var keys = [],
        offset,
        order;

    function stack(data) {
        var series = [],
            j, i,
            m = data.length,
            n = keys.length,
            s,
            key,
            o;
        for (i = 0; i < n; i++) {
            s = [];
            key = keys[i];
            s.key = key;
            for (j = 0; j < m; j++) {
                s.push([0, data[j][key]]);
            }
            series.push(s);
        }

        o = order(series);
        offset(series, o);
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

function insideOut(series) {
    var n = series.length,
        m = series[0].length,
        i, j,
        rank = [],
        top = 0,
        bottom = 0,
        sum,
        order = [];

    var sums = series.map(function (s) {
        var sum = 0;
        for (var i = 0; i < m; i++) {
            sum += s[i][1];
        }
        return sum;
    });

    // var onset = series.map(function (s) {
    //     var onset = m;
    //     for (var i = 0; i < m; i++) {
    //         if (s[i][1] != 0) {
    //             onset = i;
    //             break;
    //         }
    //     }
    //     return onset;
    // });

    var volatilities = series.map(function (s, i) {
        var mean = sums[i] / m,
            sum = 0,
            d;
        for (var j = 0; j < m; j++) {
            d = s[j][1] - mean;
            sum += d * d;
        }
        return Math.sqrt(sum / (m - 1));
    });

    for (i = 0; i < n; i++) {
        rank[i] = i;
    }
    rank.sort(function (a, b) {
        // return onset[a] - onset[b];
        return volatilities[a] - volatilities[b];
        // return sums[b]-sums[a];
    });

    for (i = 0; i < n; i++) {
        j = rank[i];
        sum = sums[j];
        if (top > bottom) {
            order.push(j);
            bottom += sum;
        }
        else {
            order.unshift(j);
            top += sum;
        }
    }

    return order; //
}

function wiggle(series, order) {
    var n = series.length,
        m = s0.length,
        s0 = series[order[0]],
        s1 = s0,
        g0;

    for (var j = 0; j < m; j++) {
        g0 = 0;
        for (var i = 0; i < n; i++) {
            g0 += (n - i) * series[order[i]][j][1];
        }
        g0 /= -(n + 1);
        s0[j][0] = g0;
        s0[j][1] += g0;
    }

    for (i = 1; i < n; i++) {
        s0 = s1;
        s1 = series[order[i]];
        for (j = 0; j < m; j++) {
            s1[j][0] = s0[j][1];
            s1[j][1] += s1[j][0];
        }
    }
}

function weightedWiggle(series, order) {
    var s0 = series[order[0]],
        s1 = s0,
        n = series.length,
        m = s0.length,
        i, j, k,
        si,
        sk,
        sum1,
        sum2,
        sum3;

    s0[0][0] = 0;
    for (j = 1; j < m; j++) { //use f[i] - f[i-1] as f[i]'
        sum1 = sum2 = 0;
        for (i = 0; i < n; i++) {
            si = series[order[i]];
            sum3 = (si[j][1] - si[j - 1][1]) / 2;
            for (k = 0; k < i; k++) {
                sk = series[order[k]];
                sum3 += sk[j][1] - sk[j - 1][1];
            }
            sum2 += sum3 * si[j][1];
            sum1 += si[j][1];
        }
        s0[j - 1][1] += s0[j - 1][0];
        s0[j][0] = s0[j - 1][0] - sum2 / sum1;
    }
    s0[j - 1][1] += s0[j - 1][0];

    for (i = 1; i < n; i++) {
        s0 = s1;
        s1 = series[order[i]];
        for (j = 0; j < m; j++) {
            s1[j][0] = s0[j][1];
            s1[j][1] += s1[j][0];
        }
    }
}

function area() {
    var x,
        y;
    function area(s, i) {
        var m = s.length,
            d = "M " + x(0) + " " + y(s[0][0]);
        for (var j = 1; j < m; j++) {
            d += " L " + x(j) + " " + y(s[j][0]);
        }
        for (j = m - 1; j >= 0; j--) {
            d += " L " + x(j) + " " + y(s[j][1]);
        }
        d += " Z";
        return d;
    }

    area.x = function (_) {
        return arguments.length ? (x = _, area) : x;
    }
    area.y = function (_) {
        return arguments.length ? (y = _, area) : y;
    }
    return area;
}

function scale(domain, range) {
    var k = (range[0] - range[1]) / (domain[0] - domain[1]),
        b = range[1] - k * domain[1];
    return function (x) {
        return k * x + b;
    }
}

function color() {
    // return "rgb(" + Math.random() * 256 + "," + Math.random() * 256 +
    //     ", " + Math.random() * 256 + ")";
    return "hsl(" + (90 + Math.random() * 180) + "," + (60 + Math.random() * 20) +
        "%, " + 50 + "%)";
}

function findMinMaxY(series) {
    var min = Infinity,
        max = -Infinity,
        i,
        j,
        n = series.length,
        m = series[0].length,
        s;
    for (i = 0; i < n; i++) {
        s = series[i];
        for (j = 0; j < m; j++) {
            if (s[j][0] < min) {
                min = s[j][0];
            }
            if (s[j][1] > max) {
                max = s[j][1];
            }
        }
    }
    return [min, max];
}

function data(n, m, k) {
    var data = [];
    for (var i = 0; i < n; i++) {
        data.push(bumps(m, k));
    }
    return transpose(data);
}

function transpose(m1) {
    var m2 = [],
        row = m1.length,
        col = m1[0].length;
    for (var j = 0; j < col; j++) {
        m2[j] = [];
    }
    for (var i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
            m2[j][i] = m1[i][j];
        }
    }
    return m2;
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