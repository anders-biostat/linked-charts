---
lang: "js"
---

# Proprerties

Each chart object in the _linked-charts_ library has a number of
properties that define all its aspects such as size, scales or colour and
links chart to the data. They are the main interface of any chart and 
therefore their understandig is crucial to use the library.

Some properties (such as [width](chart) or [height](chart)) are shared
between all objects in the _linked-charts_ library, others are
specific to the particular chart type. Some are defined for the entire
chart, while others can be set for each data point separately. A property
may be a value, or a function that returns the value, or even a fucntion
that just performs some actions under certain conditions (like the [on_click](layer)
property).

## Getters and setters

All properties follow the same logic. Each property has a getter 
and a setter function. Setters are always called after the name of
the property and always return the chart object to make chained calls
possible.

<pre class = "tiy" runnable = "false">
chart.property1(new_value_for_property1)
  .property2(new_value_for_property2);
</pre>

After a property has been set, one of the [update](chart) functions
should be called to redraw the chart.

Getters are defined as <code>get_"property_name"()</code> functions and
return the current value of the property.

<pre class = "tiy" runnable = "false">
var value = chart.get_property();
</pre>

Note, that calling a setter without any arguments is equivalent to
calling the corresponding getter.

Try to play with [width](chart) and [height](chart) properties of a 
scatter plot.
<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
  //create a scatterplot
  var scatterplot = lc.scatter()
    //set x and y values
    .x(function(k) {return data[k].sepalLength})
    .y(function(k) {return data[k].petalLength})
    //set width and heigh
    .width(300)
    .height(400)
    //put the scatter plot on the page
    .place();

  //to get a value of the property one can
  //use a getter function or a setter with no
  //arguments
  var width = scatterplot.get_width(),
    height = scatterplot.height();

  d3.select("body").append("p").text("Height: " + height);
  d3.select("body").append("p").text("Width: " + width);

  //change the width of the chart and update
  scatterplot.width(700)
    .updateSize();
</pre>

## Static and dynamic values

In the previous example we used fixed values for [width](chart) and [height](chart),
but property setters also accept functions instead of values. The 
difference being that static value is fixed until you explicitely
reset the property by calling its setter. A dynamic value is checked
on each getter call. It's useful if you think that some external
factors can influence the property value.

In the following example we have two global variables - <code>width</code>
and <code>height</code> - that can be changed through input boxes. We will
set [width](chart) property dynamically and pass [height](chart) as a 
static value. It makes no difference, when the cahrt is initialised,
but if global variables are changed, then calling the [updateSize](chart)
method will only change width.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
  var cells = d3.select("body").append("table")
    .selectAll("tr").data(["width", "height"])
      .enter().append("tr")
        .append("td")
          .attr("class", function(d) {return d});
  cells.append("text")
    .text(function(d) {return d + ": "});
  cells.append("input")
    .attr("type", "text")
    .style("width", 50)
    .on("change", function(d){
      window[d] = this.value;
    });
  //-----Precode end-----
  var width = 400,
    height = 300;

  //create a scatterplot
  var scatterplot = lc.scatter()
    //set x and y values
    .x(function(k) {return data[k].sepalLength})
    .y(function(k) {return data[k].petalLength})
    //set width and height
    .width(function() {return width;})
    .height(height)
    //put the scatter plot on the page
    .place();

  //Add an update button
  d3.select("body")
    .append("button")
      .on("click", scatterplot.updateSize)
      .text("Update");

  /* As you can see, now changing the height has no effect
    on the chart. To make it work, replace 
    the onclick function (line 18) with
    function() {
      scatterplot.height(height)
        .updateSize();
    }
  */
</pre>

## Setting properties for specific points

To change size, colour, symbol etc. of a particular data point
we need first to identify this point. All charts in the _linked-charts_ 
library assign an ID to each point (or to each row and column for 
heatmaps). The user can set the IDs him- or herself 
using the [elementIds]() (or [rowIds]() and [colIds]()) property,
which expects an array of IDs for all the points in the plot. If not set,
the IDs are generated as consecutive numbers.

Getters of the properties such as [colour](layer) or [size]() can take an ID as an argument
and return a value of this property for a point with this ID. You've
already seen it in previous examples.

<pre class = "tiy" runnable = "false">
scatterplot.x(function(k) {return data[k].sepalLength});
</pre>

Here <code>k</code> is a point ID (a number in our case), and the property [x](scatter) 
is defined independently for each ID. To get the <code>x</code>
value of the point with an ID <code>k</code>, one should use the getter
in the following way:

<pre class = "tiy" runnable = "false">
var x = scatterplot.get_x(k);
</pre>

These properties may also be independent of the IDs or even static.
In such a case, the same value will be set for all the points.

In this example, we will set two properties: [size]() and [colourValue]().
Size will be the same for all the points and colour will indicate species 
(here, we are using the Iris data set).

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
  //create a scatterplot
  var scatterplot = lc.scatter()
    //set x and y values
    .x(function(k) {return data[k].sepalLength})
    .y(function(k) {return data[k].petalLength})
    //set size (default size is 6)
    .size(3)
    //set colour
    .colourValue(function(k) {return data[k].species})
    //put scatterplot on the page
    .place();

  //try to use 'sepalWidth' as size
</pre>

Note that there is also the [colour](layer) property, but it supposed to
return colours in any understable by CSS format. If you have names or
numeric values and you want them to be converted into a colour scale,
use the [colourValue]() property instead.

Setting the [colour](layer) property overrides [colourValue](). Try, 
for example, adding

<pre class = "tiy" runnable = "false">
scatterplot
  .colour("blue")
  .updateElementStyle();
</pre>

Note, that although all the points are now blue, the legend still
shows three different colours. This happens because the legend is
generated according to the [colourValue]() property and the [colour](layer)
property overrides it, but doesn't change.

## Properties and layers

In the _linked-charts_ library some of the charts can have
several layers of the same or of different types. Properties
that affect the entire chart (such as [width](chart), [height](chart) or [title](chart))
are chart-properties and their usage is not influenced by
the number of layers. But there are also layer-properties which shoud be
set for each layer individually. The proper way would be

<pre class = "tiy" runnable = "false">
chart.get_layer(layerID).property(newValue);
</pre>

One may find it really annoying, especially since setters always return chart
object _(not layers!)_. So in the _linked-chart_ library an acitve layer 
concept is introduced. Properties of the active layer can be set the
same way you set chart-properties, without selecting a layer.

So if <chart>property1</code> is a chart-property, <code>property2</code> is
a property of the active layer and <code>property3</code> is a property of
some other layer, one can set them like this.

<pre class = "tiy" runnable = "false">
chart.property1(newValue1)
  .property2(newValue2)
  .get_layer(id)
    .property3(newValue3);
</pre>

By default, each layer becomes active immediately after it has been added to
the chart, so when you work with a chart that has only one layer, you can
even miss the fact that there are any layers at all. You can also change 
active layer using the [activeLayer]() property.

<pre class = "tiy" runnable = "false">
chart.activeLayer(chart.get_layer(layerId));
</pre>

You can also select several layers and set properties for all of them
simultaniously.

<pre class = "tiy" runnable = "false">
chart.select_layers([id1, id2])
  .property(newValue);
</pre>

You can't do without layers, if you want to put several types of plots
in one chart. In examples, like the one bellow, it's possible to have all
the points on one layer, but here, for demonstration purpuses, we will 
utilise layers.

In this example 50 drugs in 5 concentrations have been tested against 2 pancreatic
cancer cell lines (Pa16C and Pa14C). Plot to the right shows inhibition percantage
averaged between all five concentrarions. Plot to the left shows individual values
of inhibition percentage for the selected drug.

<pre class="tiy" width="100%" fitHeight="true" fitWidth="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/inputdata.js;../../src/linked-charts.css">
  d3.select("body")
    .append("table")
      .append("tr")
        .selectAll("td").data(["scatter", "inhValues"])
          .enter().append("td")
            .attr("id", function(d){return d;});

  var data = {};
  data.Pa16C = lc.separateBy(inputData, ["screen", "CellLine", "Drug"]).RTG.Pa16C;
  data.Pa14C = lc.separateBy(inputData, ["screen", "CellLine", "Drug"]).RTG.Pa14C;
  //-----Precode end-----
  //global variable to store the clicked point
  var selDrug = "Filanesib";

  //create a scatter plot with average inhibition values
  var scatterplot = lc.scatter()
    //id for each point is the corresponding drug name
    .elementIds(Object.keys(data.Pa16C))
    .x(function(id) {return data.Pa16C[id].avInh})
    .y(function(id) {return data.Pa14C[id].avInh})
    //when a point is clicked, change the global variable 
    //and update the dependant plot
    .on_click(function(id){
      selDrug = id;
      inhValues.update();
    })
    //place chart in the container with id = "scatter"
    .place("#scatter");

  //create the first layer of the chart
  //note the optional argument that sets layer ID
  var inhValues = lc.scatter("Pa16C")
    .nelements( 5 )
    .x( function( k ) {return k;} )
    .y( function( k ) {
      return data.Pa16C[selDrug]["D" + (k + 1)];
    })
    .colour( "blue" );
  //to add a layer to the existing chart one should pass the
  //chart as a second argument to initialising function
  lc.scatter("Pa14C", inhValues)
    .nelements( 5 )
    .x( function( k ) {return k} )
    .y( function( k ) {
      return data.Pa14C[selDrug]["D" + (k + 1)];
    })
    .colour("red")
    .place( "#inhValues" );

  inhValues.colour("green")
    .update();
  //note that only points from the second layer
  //changed their colour
  //try changing properties of different layers with these code samples
  
  //inhValues.get_layer("Pa16C").colour("black")
  //  .update();

  //inhValues.select_layers().colour("yellow");
  //inhValues.update();
  //if no IDs are passed to chart.select_layers()
  //all the layers are selected
</pre>

For more detailed information on layers in the _linked-charts_
library, check [this](../tutorials/layers.html) tutorial.

## For developers

Not only charts, but also some additional elements in the _linked-charts_
library such as the [legend]() or the instrument [panel]() heavily rely on properties. So if you
want to add your own chart to the library, we highly encourage you to stick to this
pattern.

All the objects in the library are decendants from the [base]() class, and because
of that they all have the [add_property]() method that can be 
called in the following way

<pre class = "tiy" runnable = "false">
chart.add_property("property1", defaultValue1)
  .add_property("property2", function() {return defaultValue2})
  .add_property("property3");
</pre>

This will automatically add a setter and a getter to the object <code>chart</code>.

Sometimes setting one property may influence another property. For example, 
if [elementIds](layer) is set, then the number of points (the [nelements]() property) 
is defined as length of the array returned by the [elementIds](layer) getter. But
the user may not want to set all the IDs and instead define only the number of
points. In this case [elementIds](layer) is set to <code>[0, 1, 2, ..., n]</code>.

In such cases the [wrapSetter]() method may be handy. For example

<pre class = "tiy" runnable = "false">
chart.wrapSetter("elementIds", function(oldSetter){
  return function() {
    chart.get_nelements = function(){
      return oldSetter().length;
    };
    return oldSetter.apply(chart, arguments);
  }
});
</pre>

This means that each time the [elementIds](layer) setter is replaced with a new
one that on each call first redefines the [nelements]() getter and only after that
performs its usual actions.