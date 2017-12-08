Types of charts
===============

The main building blocks of the _linked-charts_ library are plots of various types. Each of them is 
initialised by calling a specific function and each has its own set of properties. Some properties and
methods are specific for a particular chart type, but wherever possible they follow the same logic.
In the navigation panel at the top of the page you can easily find detailed descriptions of each type,
and here we will give a quick overview of all the implemented types with simple examples.

## Heatmap

<pre class="tiy"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css"
  loadOnStart="true" fitHeight="true" width="100%">
  var heatmap = lc.heatmap()
    .ncols( geneNames.length )
    .nrows( drugNames.length )
    .margins({top: 50, left: 50, right: 60, bottom: 60})
    .height( 350 )
    .width( 600 )
    .colourDomain( [-1, 1] )
    .palette( d3.interpolateRdBu )
    .value( function( row, col ) {  
       return lc.pearsonCorr( drugScores[row], geneExprs[col] ) 
     } )
    .colLabel( function(col) { 
       return geneNames[col] 
     } )
    .rowLabel( function(row) { 
       return drugNames[row] 
     } )
    .cluster("Row")
    .cluster("Col")
    .place()
</pre>

<a href="../types/heatmap.html">Heatmaps</a> are very common way to present or to explore results of
biological research. They provide an easily interpretable overview of the data and can be really helpful
in detecting intresting patterns or possible outliers.

Heatmaps in the _linked-charts_ library have a completely adjustable colour scale. Rows or columns can be
clustered and reclustered on the fly, using the Euclidean or any other user provided distance. One can zoom in
and out, reorder rows and columns by clicking on the labels. It's also possible to 
<a href="../examples/colourSlider.html">replace</a> the default static
legend with an interactive <a>colourSlider</a> that allows to change contrast of the colour scale and highlight
the most interesting range of values.

Each cell of the heatmap is clickable.

## Charts with axes and layers

All the charts, that have X and Y axes are implemented as layers, which means that you can put any of them on top
of each other. Each layer of the chart has its own properties, that can be changed separately or simultanuously,
while some other proprties describe the entire chart. All the layers share the same axes, but it is possible to 
provide several sets of ticks like in <a href="../examples/twoChannelsHeatmap.html">this</a> example. A chart 
with only one layer behaves exactly as a usual chart, so you don't need to care about layers at all, unless
you want to have several of them in one chart.
More about layer manipulation in the _linked-charts_ library you can find <a href="../tutorials/layers.html">here</a>.

### Scatter plot

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .size(function(k) {return data[k].sepalWidth * 2})
  .colourValue(function(k) {return data[k].petalWidth})
  .symbolValue(function(k) {return data[k].species})
  .place(); 
</pre>

A <a href="types">scatter</a> plot is the most basic type of charts possible that requires 
the user to set the exact coordinates of each point. In the _linked-charts_ implementation 
of the scatter plot, one can set colours, size and shape of each data point. It is also possible
to zoom in or out and to mark some specific points. If a data point is outside the currently displayed
region, it is shown as a dash at the side of the plot. Clicking on this dash will cause
the chart to rescale to fit the corresponding point.

Each data point is clickable.

#### Beeswarm

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/data/input_difExpr.js;../src/linked-charts.css">
  list = [];
  for(var i = 0; i < 100; i++){
    list.push({x: "RNA", y: Object.keys(inputData.info)[i]});
    list.push({x: "MA", y: Object.keys(inputData.info)[i]})
  }

  //-----Precode end-----
var beeswarm = lc.beeswarm()
  .height(300)
  .x(function(i) {return list[i].x;})
  .y(function(i){
    return inputData.info[list[i].y]["Average." + list[i].x];
  })
  .colourValue(function(i) {return list[i].x;})
  .size(4)
  .place();  
</pre>

A <a href="types">beeswarm</a> is a modification of the scatter plot, where no data points can be
placed on top of each other. To this end, the data points are spread along one of the axes. Each new
point is placed as close to its real position as possible so that not to overlap with any other already
existing points. The values along the other axis are kept unchanged.

Beeswarms can be a simple alternative to box plots or violinplots.

Since <a>beeswarm</a> inherits from the <a>scatter</a> chart, it has all its properties and functionality.

We used slightly modified <a href="https://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8">d3-beeswarm
plugin</a> to implement this type of charts.

### Lines

In the _linked-charts_ library <a href="types">lines</a> are generally defined as functions with a user defined domain.
It is also possible to define a line as a set of points that should be connected in a specific order using the <a>parametricCurve</a>.
One can change colour and width of each line and also set any pattern of dashes. There can be any number of lines of the same type in
one plot.

Each line is clickable. 

#### xLine

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var xLine = lc.xLine()
  .height(300)
  .nelements(3)
  .lineFun(function(t, d) {
    return Math.sin(t) + d;
  })
  .layerDomainX([0, 7])
  .dasharray(function(d) {
    return d + " " + d;
  })
  .place();
</pre>

<a>xLine</a> defines _y = f(x)_ curve. The fucntion should be defined in the entire specified domain. 

#### yLine

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var yLine = lc.yLine()
  .height(300)
  .nelements(3)
  .lineFun(function(t, d) {
    return Math.cos(t) + d;
  })
  .layerDomainY([0, 7])
  .lineWidth(function(d) {
    return d + 1;
  })
  .place();   
</pre>

<a>yLine</a> defines _x = f(y)_ curve. The fucntion should be defined in the entire specified domain. 

#### Parametric curve

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var param = lc.parametricCurve()
  .height(300)
  .nelements(3)
  .xFunction(function(t, d) {
    return Math.cos(t) + d;
  })
  .yFunction(function(t, d){
    return Math.sin(t);
  })
  .colourValue(function(d) {return d.toString()})
  .paramRange([0, 2 * Math.PI])
  .place();
</pre>

<a>parametricCurve</a> defines _x = f(t), y = g(t)_ curve. Both functions should be defined for all possible
parameter values. You can also use this type of lines to draw a line through a fixed set of points in any given order.

### Barchart

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/data/input_difExpr.js;../src/linked-charts.css">
  var geneList = {ASC_AC: {}, KLSPC_KLCC10: {}, KP_KL: {}};
  for(var i in geneList){
    geneList[i]["MA"] = {};
    geneList[i]["RNA"] = {};
    for(var j in geneList[i]){
      geneList[i][j]["up"] = [];
      geneList[i][j]["down"] = [];
    }
  }
  for(var i in inputData.info)
    for(var j in geneList)
      for(var k in geneList[j])
        if(inputData.info[i][j + "_Adj.p.value_" + k] < 0.05)
          if(inputData.info[i][j + "_LogFoldC_" + k] > 0)
            geneList[j][k].up.push(i)
          else
            geneList[j][k].down.push(i);

  //-----Precode end-----

var bar = lc.barchart()
  .height(300)
  .groupIds(Object.keys(geneList))
  .stackIds(["up", "down"])
  .barIds(["MA", "RNA"])
  .value(function(groupId, barId, stackId){
    return geneList[groupId][barId][stackId].length;
  })
  .place();  
</pre>

A <a href="types">barchart</a> generates several bars with height that is proportional to some given value,
which can be useful for visual comparison of the values or group of values.

Barcharts in the _linked-charts_ library support grouping and multiple stacks for each bar. Colour of each
stack, as wel as width and colour of the strokes are adjustable.

Each stack is clickable.

## Table

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata.js;../src/linked-charts.css">
var table = lc.table()
  .record(inputData[0])
  .place();
</pre>

A <a href="types">table</a> provides a simple way to display some information (for example, about the clicked point or cell).
It transforms any given object into a two-column table. One column contains names of all properties of the object and the other - 
their values.

A table doesn't have any clickable elements.

## Additional objects

All mentioned above types of charts are independent and selfsuficient. They don't require anything else to function properly.
Unlike them the following charts either need to be linked to others or are just parts of other charts. Nevertheless, even
the latter ones have their own properties and are modified in the same way as other charts.

### Colour Slider

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var slider = lc.colourSlider()
	.straightColourScale(d3.scaleSequential(d3.interpolateRdYlGn))
  .place();
</pre>

A [colourSlider]() is a an interactive alternative to fixed static colour scales. It takes any given continuous colour
scale and allows user to apply a custom sigmoid transformation on it simly by moving one of its three pointers. One allows
to change the midpoint of the scale, for example, to put it to zerovalue or to set some thresholds. The other to change the
slope and therefore the contrast of the colour scale. The transformed colour scale then can be used for any oter chart.

Here is an [example](../examples/colourSlider.html) of how it can be done.

### Dendogram

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css">
var dendo = lc.dendogram()
  .elementIds(geneNames)
  .data(function(id) {return geneExprs[geneNames.indexOf(id)]})
  .place();
</pre>

Altough a [dendogram]() can be an independent chart, in the current implementation its functionality is focused on
being a part of a heatmap. The dedogram internally performs hierachical clustering using a provided distance function.
Any branch of a dendogram can be selected by clicking. When the dendogram is a part of a heatmap, clicking of a branch
will cause reclustering of rows or colums of the heatmap, using only selected branch as features.  

### Legend

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .size(function(k) {return data[k].sepalWidth * 2})
  .colourValue(function(k) {return data[k].petalWidth})
  .place();

scatterplot
	.legend.add_block([["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"], 
			["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"]],
			"symbol", "Available symbols")
	.legend.add_block([["Solid line", "dash 1", "dash 2", "dash 3", "dash 4"], 
			[undefined, 5, "5, 10", "15, 10, 5", "5, 5, 1, 5"]], 
			"dash", "Dash examples");
</pre>

A [legend]() is always a part of a chart, but its content can be manupulated independently. By default the legend is 
placed to the right from the chart, but by setting the [container]() property one can move it into any other element on
the page. Any legend consists of one or several blocks. A block is a part of a legend based on one scale of a particular
type (colour, symbol, dash or size). Some of the blocks are generated automatically, when the user sets such properties
as [colourValue]() or [symbolValue](), others need to be added manually.

More about legends you can find [here](../tutorials/legends.html).

### Instrument panel

An instrument [panel]() contains button that provide access to charts' functionality and is already
present in most types of charts. It is shown as a grey triangle which is by default located in the 
top right corner of the plot. Clicking on the triangle will show or hide the panel. By setting panel's
properties one may change it's size, location, orientation (use a vertical layout of the buttons instead
of horizontal). It is also possible to add your own buttons as it is shown in the example bellow.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
//generate a scatter plot
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .colourValue(function(k) {return data[k].petalWidth})
  .symbolValue(function(k) {return data[k].species})
  .place();

//get a "def" object, where all the icons are stored
var defs = scatterplot.panel.g.select("def"),
//get the current button size
//we subtract 10 in order to leave some space between
//the icons
  bs = scatterplot.panel.buttonSize() - 10;

//add new icons
//for the sake of simplicity they are both
//circles of different size
defs.append("g")
  .attr("id", "bigger")
  .append("circle")
    .attr("fill", "#444")
    .attr("cx", bs/2)
    .attr("cy", bs/2)
    .attr("r", bs/2);

defs.append("g")
  .attr("id", "smaller")
  .append("circle")
    .attr("fill", "#444")
    .attr("cx", bs/2)
    .attr("cy", bs/2)
    .attr("r", bs/4);

scatterplot.panel
  //add first button
  .add_button("Bigger points", "#bigger", function(chart) {
    var currentSize = chart.get_size();
    chart.size(currentSize + 1)
      .updateElementStyle();
  })
  //add second button
  .add_button("Smaller points", "#smaller", function(chart) {
    var currentSize = chart.get_size();
    chart.size(currentSize - 1)
      .updateElementStyle();
  })
  //now we need to update the size of the panel
  .updateSize();

//Now you can try these new buttons
</pre>