Layers
=======

Some charts in the _linked-charts_ library allow the user to put several plots on top of
each other. These plots are called layers and can be of the same or of different types.
All the layers use the same chart as basis and therefore have the same size ([width](chart) and
[height](chart)), [margins](chart), will be zoomed in or out together and updated at the same
time (unless a layer-specific update method is used). Yet, each layer has its own properties,
such as [nelements](), [colour](layer), [size]() that doesn't influence one another and 
need to be defined independently.

In the current implementation of the _linked-charts_ library only the charts with X and Y axes
([scatter](), [beeswarm](), [xLine](), [yLine](), [parametricCurve](), [barchart]()) can have
multiple layers.

In this tutorial we will explain how to use layers. The last section is for more advanced users
and will tell you, how to define your own layer type.

## Add or remove a layer

Actually, even if you have just started with the _linked-charts_ library and tried only the
most basic examples, you probably already know, how to generate a chart with layers, since 
all the functions that initialise [charts with axes](../pages/api.html#axesChart) in fact
create an empty [axesChart]() and add a layer to it. All these functions have two optional
arguments: the first one defines an ID for the new layer and the other is a chart which this
layer will be added to. If the second one is undefined, a new chart is created. Thus, all you
need to do, to add a layer to an existing chart is to define that second argument.

Let's have a look at a simple example.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var plot = lc.scatter()
  .nelements(10)
  .x(function(k) {return k})
  .y(function(k) {return k + Math.random() - 0.5});

lc.xLine("line", plot)
  .lineFun(function(t) {return t})
  .place();
</pre>

Note, that [place](chart) function should be called only once per **chart**. Otherwise you will
get several plots on the page with incorrect functionality. But it doen't mean that after calling
the [place](chart) function you can't add layers. There is also a [place_layer]() method, that can
be used for any layer separately. The following code will give exactly the same result as the example
above.

<pre class = "tiy" fitHeight = "true" loadOnStart="false"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var plot = lc.scatter()
  .nelements(10)
  .x(function(k) {return k})
  .y(function(k) {return k + Math.random() - 0.5})
  .place();

lc.xLine("line", plot)
  .lineFun(function(t) {return t})
  .place_layer("line");
</pre>

To remove a layer one can just use the [remove_layer]() method. It requires an ID of the layer as an
argument.

Another way of adding and removing layers, which is usefull, when you have too many layers to add all
of them manually or don't know beforehand, how many layers you need, you can find in the section 
[Multiple layers selection](#Multiple-layers-selection).

## Layers and properties

Each layer has its own properties and the most straightforwad way to set them
is first to get a [layer]() object via [get_layer]() method and only then to set its properties. It looks like this

<pre class = "tiy" runnable="false">
chart.get_layer(layerID).property(newValue);
</pre>

One may find it really annoying, especially since property setters always return chart
object _(not layers!)_. Therefore in the _linked-charts_ library we made it possible to
access layer properties directly from the chart object.

Let's take our previous example and modify it a bit ([symbol]() and [dasharray]() are both
layer specific properties).

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var plot = lc.scatter("scatter")
  .nelements(10)
  .x(function(k) {return k})
  .y(function(k) {return k + Math.random() - 0.5});

lc.xLine("line", plot)
  .lineFun(function(t) {return t})
  .place();

plot.dasharray(5)
  .symbol("Triangle")
//.colour("red")
  .update();
</pre>

As you can see, we changed the properties of both layers without using the [get_layer]() method.
But what happens if several layers have the same property? Try to uncomment setting colour and 
run the example again.

Now the triangles are still black. Only the line changed colour, since it belongs to the layer
that has been added the last. Any [layerChart]() has an [activeLayer]() property. It defines a
layer, whose property can be set directly from the [chart]() object without selecting a layer
at the current moment. So if <chart>property1</code> is a chart-property, <code>property2</code> is
a property of the active layer and <code>property3</code> is a property of
some other layer, one can set them like this.

<pre class = "tiy" runnable = "false">
chart.property1(newValue1)
  .property2(newValue2)
  .get_layer(id)
    .property3(newValue3);
</pre>

By default, each chart becomes active immediately after initialising.

Try adding any of these two pieces of code to the previous example.

<pre class = "tiy" runnable = "false">
plot.get_layer("scatter")
	.colour("blue")
	.opacity(0.5)
	.update();
</pre> 
<pre class = "tiy" runnable = "false">
plot.activeLayer(plot.get_layer("scatter"))
	.colour("blue")
	.opacity(0.5)
	.update();
</pre>

As you can see, in the first example the line remained the active layer and its [opacity]() property has been changed,
but in the second one it was set for the triangles.

Besides properties, there are also layer-specific methods: [updateElements](), [updateElementStyle]() and
[updateElementPosition](). They follow the same logic as properties.

## Multiple layers selection

If you don't want to define and then customize each of the layers separately, you can manipulate several 
layers at the same time. First of all, to add or remove multiple layers at once, one can just set the
[layerIds]() property. It takes an array of IDs of all the layers you want to have at the current moment.
New empty layers will be added and all those, that are no longer required, will be removed. Along with this 
property goes the [layerType]() property, since if a type of the new layer is not defined, an empty layer
is created, which is of no use unless you want to define your own type of plot. 

Setting these two properties you can quickly create any number of layers, but all of them are empty. Now,
you can manually go through each of them and fill them with data. Or you can use the [select_layers]()
method and modify several of them at once.

[select_layers]() takes as an optional argument an array of IDs of the layers you want to modify. If no array 
is provided, all existing layers are selected. The returned layer selection is similar to a [chart]() object
with two main differences:

- Only layer-specific properties can be accessed using a layer selection. You can't set [width](), [height](),
[title](), [domainX](), etc.

- Any callback function that you use to set a property will get a layer ID as it's first argument.

Another important thing is that any property you set using a layer selection will be applied only to layers
that have this property. So if you, for example, want to set [lineFun]() for several lines, you don't need
to select only layers with lines. You can have anything else in your selection.

Now let's summarise all of this with an example 

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
//define IDs for all our layers
var ids = ["cos_scatter", "sin_scatter",
           "cos_xLine", "sin_xLine"];

//create a chart with four empty layers
var plot = lc.axesChart()
  .layerIds(ids)
  .layerType(function(id) {return id.split("_")[1]});

plot.select_layers()
  //each scatter plot will have ten elements
  //each line chart will get only one line
  .nelements(function(layerId) {
    return layerId.split("_")[1] == "scatter" ? 10 : 1;
  })
  //these are properties of scatters
  .x(function(layerId, k) {return k})
  .y(function(layerId, k) {
    return layerId.split("_")[0] == "sin" ? Math.sin(k) :
                                          Math.cos(k);  
  })
  //this is a property of line charts only
  .lineFun(function(layerId, x) {
    return layerId.split("_")[0] == "sin" ? Math.sin(x) :
                                          Math.cos(x);  
  })
  //this property will be set for all the layers;
  .colour(function(layerId) {
    return layerId.split("_")[0] == "sin" ? "red" :
                                          "blue"; 
  });

//we can't place a layer selection
plot.place();
</pre>

Here is another [example](../examples/twoChannelsHeatmap.html) to show you, how it works.

## Domains

In the current implementation of the _linked-charts_ library all the layers share the same
axes. So X and Y domains of the axis scales are defined so that to fit all elements from all
the layers or, more precicely, to fill all [layerDomainX]() and [layerDomainY](), which are
in most cases defined so that to fit all the elemetns in the layer. 

You can change layer domains individually or you can change the resulting chart domain by 
setting [domainX]() and [domainY]() properties. Of course, it influences only the original
domains - the ones that you see, when the chart is just generated (or the ones that you get 
after a double click). After that there are no limitations on moving around, zooming in or out.

One thing that you can't change is type of the scale: whether it's continuous or categorical.
Here, the rule is simple - the resulting scale is continuos if and only if all the layer 
scales are continuous as well.

Sometimes, [layerDomainX]() and [layerDomainY]() may have no default value, like, for example, 
lines in the previous example. It means, that they will not influence the resulting domain 
and will be plotted in whatever area is now displayed.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var plot = lc.xLine()
	.lineFun(function(x) {return Math.sin(x)})
	.colour("red");

lc.xLine("cos", plot)
	.lineFun(function(x) {return Math.cos(x)})
	.layerDomainX([2, 3])
	.colour("blue")
	.domainX([0, 5])
	.domainY([-1, 1])
	.place();
</pre>

Now the cosinus function is only displayed for x values from 2 to 3, while the sinus is 
shown for all x values. Try to remove lines, setting the chart's domains to see what happens.
By the way, if all the layers have undefined domains for some axis, the <code>[0, 1]</code>
range is used as a default domain.

## Layer structure

Each layer inherits from the [layerBase](../pages/api.html#layer) object that already has some
predefined functionality, most common for different type of layers. And, which is more important,
this common layer ancestor defines structure that is used to link chart and its layers. All individual
aspects of any layer are described by few functions, which means that one can easily add new 
types of layers by defining or modifying these functions.

It's completely up to the user, how to define this methods, as long as they perform the actions, 
they are expected to do. Yet, the _linked-charts_ library is heavily based on the [d3](https://d3js.org/)
library and therefore to understand the further examples that are taken from the _linked-charts_ source
code one needs at least some understanding of the [d3](https://d3js.org/) library. Specifically, selections
and the idea of data binding are important. [This](https://square.github.io/intro-to-d3/data-binding/) tutorial may be of
some use.

The following functions are required for any layer:

- [updateElements]() - this function adds or removes elements of the plot to fit the current data.
Generally, this function binds data, contained in the [elementIds]() property to the selection
of the elements, and then defines attributes of [enter](https://github.com/d3/d3-selection#selection_enter)
and [exit](https://github.com/d3/d3-selection#selection_enter) selections.
Here, how it has been done for scatter plots.
<pre class = "tiy" runnable = "false">
//bind data to the selection
var sel = layer.g.selectAll( ".data_element" )
  .data( layer.elementIds(), function(d) {return d;} );
//if the element is no longer present, remove it
sel.exit()
  .remove();
//add new elements
sel.enter().append( "path" )
  .attr( "class", "data_element" )
//update all the elements  
  .merge(sel)
    .attr("id", function(d) {
      return "p" + (layer.id + "_" + d).replace(/[ .]/g,"_");
    })
    .on( "click", layer.get_on_click )
    .on( "mouseover", layer.get_elementMouseOver )
    .on( "mouseout", layer.get_elementMouseOut );
</pre> 
There are two important things here. Firstly, all the elements of a chart (dots, lines,
bars, cells) have class <code>data_element</code>. Secondly, each of them has an ID that is
defined as <code>pLayerID_elementID</code>. Since spaces and dots are allowed in our internal IDs,
but not in IDs of HTML elements, we replace them with underscores. Since in the _linked-charts_ library
this replacement always goes one way (we don't try to recover internal IDs from the corresponding
attribute), such a transformation is reasonable.

- [updateElementPosition]() - this function moves elements to their current positions, using 
the already defined scales that are stored in <code>layer.chart.axes.scale_x</code> and 
<code>layer.chart.axes.scale_y</code>. The most simple example of such a function is
<pre class = "tiy" runnable = "false">
layer.g.selectAll(".data_element")
	.attr("x", function(d) {
		return layer.chart.scale_x(layer.get_x(d));
	})
	.attr("y", function(d) {
		return layer.chart.scale_y(layer.get_y(d));
	});
</pre>
Besides that, you can add here any other layer-specific actions that happens when elements are moved or
axes are changed.

- [updateElementStyle]() - this function sets all the attributes that are related to elements appearence
on the page. Colour, size, shape, opacity, etc. Strictly speaking, this function is not compulsory, but
usually the default appearence of svg objects isn't satisfactory and some of them require some size values
to be set, otherwise they will not be displayer.
Here is a simple (but not full) example.
<pre class = "tiy" runnable = "false">
layer.g.selectAll(".data_element")
  .attr("fill", function(d) {return layer.get_colour(d)})
  .attr("stroke", function(d) {return layer.get_stroke(d)})
  .attr("stroke-width", function(d) {return layer.get_strokeWidth(d)})
  .attr("opacity", function(d) {return layer.get_opacity(d)});
</pre>
It can be also a good idea to call the [resetColourScale](layer) method here as well.

The next two functions are requiered if you want to make your layer fully functional.

- [findElements](layer) - this functions takes coordinates of the left-upper and right-bottom
corners of some rectangle area and returns the IDs of all the layer's elements inside it. The
coordinates are in pixels, relative to the chart's svg object. The IDs should be paired with
the layer ID. What means "lies inside" is up to you, but note, that the same function is used
for clicking, so it should return an element if the specified area is just a dot inside it.

Here is an example of this function for scatter plots.
<pre class = "tiy" runnable = "false">
layer.findElements = function(lu, rb){
  return layer.g.selectAll(".data_element")
    .filter(function(d) {
      var loc = [layer.chart.axes.scale_x(layer.get_x(d)), 
                layer.chart.axes.scale_y(layer.get_y(d))]
      return (loc[0] - layer.get_size(d) <= rb[0]) && 
        (loc[1] - layer.get_size(d) <= rb[1]) && 
        (loc[0] + layer.get_size(d) >= lu[0]) && 
        (loc[1] + layer.get_size(d) >= lu[1]);
    }).data().map(function(e) {return [layer.id, e]});
}
</pre>

- [get_position](layer) - this function is the opposit to the [findElements](layer).
Provided an ID, it returns the coordinates of the element, relative to the chart's
svg object. The position is always just one point (usually in the center of the element),
no matter how big the element is.
<pre class = "tiy" runnable = "false">
layer.get_position = function(id){
  return [layer.chart.axes.scale_x(layer.get_x(id)), 
          layer.chart.axes.scale_y(layer.get_y(id))];
} 
</pre>

Now, let's make an example of a new layer type. Each data element in this plot will be a
rectangle with user defined <code>upper</code> and <code>lower</code> boundaries and equal widths.
Here, to make things simple, we will use meaningless, artificially generated data, but a use case
for such a plot and a more detailed example you can find [here](../examples/newType.html).

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
//create a chart with axes and add an empty layer
var plot = lc.axesChart()
  .add_layer("layer");
//save this layer to a variable
var layer = plot.activeLayer();

//updateElements is defined almost exactly as in most implemented
//types of layers
layer.updateElements = function(){
  var sel = layer.g.selectAll( ".data_element" )
    .data( layer.elementIds(), function(d) {return d;} );
  sel.exit()
    .remove();  
	sel.enter().append( "rect" )
    .attr( "class", "data_element" )
    .merge(sel)
      .attr("id", function(d) {
        return "p" + (layer.id + "_" + d).replace(/[ .]/g,"_");
      })
      .on( "click", layer.get_on_click )
      .on( "mouseover", layer.get_elementMouseOver )
      .on( "mouseout", layer.get_elementMouseOut );
}

//here we define height, width and position of a left-upper 
//corner for each rectangle
layer.updateElementPosition = function(){
  layer.g.selectAll(".data_element")
    //we assume that all the IDs are just numbers
    //therefore left-upper corner's coordinates are defined
    //as [id, upper_value]
    .attr("x", function(d) {return layer.chart.axes.scale_x(d)})
    .attr("y", function(d) {
      return layer.chart.axes.scale_y(layer.get_upper(d));
    })
    //width of each rectangle is 1 in the chart's coordinate system
    .attr("width", function() {
      return layer.chart.axes.scale_x(1) - layer.chart.axes.scale_x(0);
    })
    //height is defined as difference between lower and upper side
    .attr("height", function(d) {
      return Math.abs(layer.chart.axes.scale_y(layer.get_lower(d)) - 
                      layer.chart.axes.scale_y(layer.get_upper(d)));
    });
}

//let's for now just allow our rectangles to be of different colour
layer.updateElementStyle = function() {
  layer.resetColourScale();
  layer.g.selectAll(".data_element")
     .attr("fill", function(d) {return layer.get_colour(d)})
}

//add some new properties
layer
  .add_property("lower", function(k) {
    return Math.log(k + 1) - Math.random();
  })
  .add_property("upper", function(k) {
    return Math.log(k + 1) + Math.random();
  });
//this will allow to user layer's properties using only the chart object
plot.syncProperties(layer);

//now we set other properties and place the chart
plot
  .nelements(15)
  .layerDomainX([0, 15])
  .layerDomainY([-1, 5])
  .colourValue(function(k) {return k})
  .place();
</pre>

By the way, in this test examples random numbers are generated on 
each update call. So don't be surprised that the plot changes each
time you use any interactivity.
