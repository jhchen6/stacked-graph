# stacked-graph

This is merely a coding practice following [Mike Bostock](https://bost.ocks.org/mike/)'s [Streamgraph](https://bl.ocks.org/mbostock/4060954) example.

## current version

The current version uses [d3.js](https://d3js.org/).

Notes of using d3 are included as comments in "script.js".

## old version

An old hand-coded version without directly using d3.js is archived under directory "old".

I got initial inspiration from [Stacked Graphs – Geometry & Aesthetics](http://leebyron.com/streamgraph/stackedgraphs_byron_wattenberg.pdf), and implemented a (non-)working demo. Remains can be found in "/old/main.js" such as insideOut order with volatility and weightedWiggle offset.

Then, I read the source code of d3 and implemented some functionalities manually, such as

- stack
- wiggle offset
- inside-out order
- area
- range
- transpose

and finally got things to work.

## data generator

Both versions use the random data generator from aforementioned Mike Bostock's example. Code snippet:

```javascript
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
```

This produces nice series with defined number of humps.

(I had used the straightforward `Math.random()` but the resulting graph looked soooo jagged.)