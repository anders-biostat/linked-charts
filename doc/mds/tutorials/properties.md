# Proprerties in the Linked-Charts

Each chart object in the <tt>linked-charts</tt> library has a number of
properties that define all its aspects such as size, scales or colour and
links chart to the data. They are the main interface of any chart and 
therefore their understandig is crucial to use the library.

Some properties (such as <tt>width</tt> or <tt>height</tt>) are shared
between all objects in the <tt>linked-charts</tt> library, others are
specific to a particular chart type. Some are defined for the entire
chart, while others can be set for each data point separately. A property
may be a value, or a function that returns a value, or even a fucntion
that just perform some actions under certain conditions (like the <tt>on_click</tt>
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

After a property has been set, one of the <tt>update</tt> functions
should be called to redraw the chart.

Getters are called by <tt>get_"property_name"()</tt> functions and
return the current value of the property.

<pre class = "tiy" runnable = "false">
var value = chart.get_property();
</pre>

Note that calling a setter without any arguments is equivalent to
calling a corresponding getter.

Try to play with <tt>width</tt> and <tt>height</tt> properties of a 
scatter plot.
<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
  //create a scatterplot
  var scatterplot = lc.scatter()
    //set x and y values
    .x(function(k) {return data[k].sepalLength})
    .y(function(k) {return data[k].petalLength})
    //set width and heigh
    .width(300)
    .height(400)
    //put scatterplot on the page
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

In the previous example we used fixed values for width and height,
but property setters also accept functions instead of values. The 
difference being that static value is fixed until you explicitely
reset the property by calling its setter. A dynamic value is checked
on each getter call. It's usefult if you think that some external
factors can influence the property.

In the following example we have two global variables - <tt>width</tt>
and <tt>height</tt> - that can be changed through input boxes. We will
set <tt>width</tt> property dynamically and pass <tt>height</tt> as a 
static value. It makes no difference, when the cahrt is initialised,
but if global variables are changed, then calling the <tt>update</tt>
function will only change width.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
  var cells = d3.select("body").append("table")
    .selectAll("tr").data(["Width", "Height"])
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
    //put scatterplot on the page
    .place();

  //Add an update button
  d3.select("body")
    .append("button")
      .on("click", scatterplot.updateSize)
      .text("Update");

  /* As you can see, now changing height has no effect
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
we need first to identify this poitn. All charts in the <tt>linked-charts</tt> 
library assign an ID to each point (or to each row and column for 
heatmaps). User can set the IDs himself 
using <tt>dataIds</tt> (or <tt>rowIds</tt> and <tt>colIds</tt>) property,
which expects an array of IDs for all the points in the plot. If not set,
the IDs are generated as consecutive numbers.

Getters of properties such as colour or size can take ID as an argument
and return a value of this property for a point with this ID. You've
already seen it in previous examples.

<pre class = "tiy" runnable = "false">
scatterplot.x(function(k) {return data[k].sepalLength});
</pre>


Here <tt>k</tt> is a point ID (a number in our case), and property <tt>x</tt> 
is defined separately for each ID. To get an <tt>x</tt>
value of a point with ID <tt>k</tt>, one should use getter like this:

<pre class = "tiy" runnable = "false">
var x = scatterplot.get_x(k);
</pre>

These properties may also be independent of the IDs or even static.
In this case the same value will be set for all the points.

In this example, we will set to properties: <tt>size</tt> and <tt>colour</tt>.
Size will be the same for all the points and colour will indicate species 
(here, we are using Iris data set).

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
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

Note that there is also <tt>colour</tt> property, but it expected to
return colours in any understable by CSS format. If you have names or
numeric values and you want them to be converted into a colour scale,
use <tt>colourValue</tt> property instead.
Setting <tt>colour</tt> property overrides <tt>colourValue</tt>. Try, 
for example, adding

<pre class = "tiy" runnable = "false">
scatterplot.colour("blue");
</pre>

<a name = "layers" class = "anchor"></a>
## Properties and layers

The <tt>linked-charts</tt> library allow some types of plots to have
several layers that can be of the same or of different types. Properties
that affect the entire chart (such as <tt>width</tt>, <tt>height</tt> or <tt>title</tt>)
 are chart-properties and their usage is not influenced by
the number of layers. But there are also layer-properties which shoud be
set for each layer individually. The proper way would be

<pre class = "tiy" runnable = "false">
chart.get_layer(layerID).property(newValue);
</pre>

One may find it really annoying, especially since setters always return chart
object (not layers!). So in the <tt>linked-chart</tt> an acitve layer 
concept is introduced. Properties of the active layer can be set the
same way you set chart-prperties, without selecting a layer.

So if <tt>property1</tt> is a chart-property, <tt>property2</tt> is
a property of an active layer and <tt>property3</tt> is a property of
some other layer, one can set them like this.

<pre class = "tiy" runnable = "false">
chart.property1(newValue1)
  .property2(newValue2)
  .get_layer(id)
    .property3(newValue3);
</pre>

By default, each layer becomes active immediately after it is added to
the chart, so when you work with a chart that has only one layer, you can
even miss the fact that there are any layers at all. You can also change 
active layer using <tt>activeLayer</tt> property.

<pre class = "tiy" runnable = "false">
chart.activeLayer(layerId);
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

In this example 50 drugs in 5 concentrations that have been tested against 2 pancreatic
cancer cell lines (Pa16C and Pa14C). Plot to the right shows inhibition percantaged
averaged between all five concentrarions. Plot to the left shows individual values
of inhibition percentage for a selected drug.

<pre class="tiy" width="100%" fitHeight="true" fitWidth="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata.js;../src/linked-charts.css">
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

  //create scatter plot with average inhibition values
  var scatterplot = lc.scatter()
    //id for each point is a corresponding drug name
    .dataIds(Object.keys(data.Pa16C))
    .x(function(id) {return data.Pa16C[id].avInh})
    .y(function(id) {return data.Pa14C[id].avInh})
    //when point is clicked, change the global variable 
    //and update the dependant plot
    .on_click(function(id){
      selDrug = id;
      inhValues.update();
    })
    //place chart in a container with id = "scatter"
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
  //to add layer to an existing chart one should pass the
  //chart as a second argument to 
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
  //note that only points from second layer
  //changed their colour
  //try changing properties of different layers with these code samples
  
  //inhValues.get_layer("Pa16C").colour("black")
  //  .update();

  //inhValues.select_layers().colour("yellow");
  //inhValues.update();
  //if no IDs are passed to chart.select_layers()
  //all the layers are selected
</pre>

For more detailed information on layers in the <tt>linked-charts</tt>
library, check this tutorial.

## For developers

Not only charts, but also some additional elements in the <tt>linked-charts</tt>
library such as legend or navigation panel heavily rely on properties. So if you
want to add your own chart to the library, we highly encourage you to stick to this
pattern.

All the objects in the library are decendants from the <tt>base</tt> class, and because
of that they all have <tt>add_property</tt> metthod, which can be 
called like this

<pre class = "tiy" runnable = "false">
chart.add_property("property1", defaultValue1)
  .add_property("property2", function() {return defaultValue2})
  .add_property("property3");
</pre>

This will automatically generate a setter and a getter to the object <tt>chart</tt>.

Sometimes setting one property may influence another property. For example, 
if <tt>dataIds</tt> is set, then number of points (<tt>nelements</tt> property) 
is defined as length of the array returns by the <tt>dataIds</tt> getter. But
the user may not want to set all the IDs and instead define only the number of
points. In this case <tt>dataIds</tt> is set to <tt>[0, 1, 2, ..., n]</tt>.

In such cases "\_\_override__" mode of a setter may be handy. For example

<pre class = "tiy" runnable = "false">
chart.dataIds("__override__", "nelements", function(){
  return chart.dataIds().lenght;
}) 
</pre>

This means that each time the <tt>dataIds</tt> setter is called, <tt>nelements</tt>
property will be set to the function that is a third argument.