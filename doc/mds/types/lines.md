Lines
=====

## Minimal requirements

It's very simple to create a line in the _linked-charts_ library. There is only one 
required property [lineFun]() that defines a function of the line. So the simplest 
example can look like this.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var line = lc.xLine()
	.lineFun(function(x) {return Math.sin(x);})
  .place();
</pre>

As you can see, the plot is rendered in the range from 0 to 1 for both axes. These are
the default values if scale domaines are not defined. But if you zoom out (use instrument
panel for this), you'll see that the line is actually defined for all x values. You can use
the [layerDomainX]() property to change the range of values for which your function is defined
and [domainX]() and [domainY]() to change the original domains of both scales. More about domains
you can find in [this](#Domains) section.

## Types of lines

All the lines in the _linked-charts_ library are defined as functions that can have different form.
These forms are implemented in different types of lines. The currently available are _y = f(x)_ ([xLine]()),
_x = f(y)_ ([yLine]()), _x = f(t) and y = g(t)_ ([parametricCurve]()).

### xLine

[xLine]() charts can display functions, defined in the form _y = f(x)_. This function should be defined on the
entire range of [layerDomainX]() or for any real X value if this property is not defined. These lines can have only
one y value for each x value and therefore you can't draw, for example, a circle with one line.

Here is a plot of the _y = sin(x)_ function.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var line = lc.xLine()
	.lineFun(function(x) {return Math.sin(x);})
	.domainX([0, 7])
	.domainY([-1.5, 1.5])
  .place();
</pre>

### yLine

[yLine]() charts can display functions, defined in the form _x = f(y)_. This function should be defined on the
entire range of [layerDomainY]() or for any real Y value if this property is not defined. These lines can have only
one x value for each y value and therefore you can't draw, for example, a circle with one line.

Here is a plot of the _x = sin(y)_ function.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var line = lc.yLine()
	.lineFun(function(x) {return Math.sin(x);})
	.domainX([-1.5, 1.5])
	.domainY([0, 7])
  .place();
</pre>

### Parametric Curve

Parametric curve is defined in the form _x = f(t), y = g(t)_. Unlike the previous two, it doesn't have the [lineFun]()
property and utilises [xFunction]() and [yFunction]() instead. Both of these functions need to be defined inside [paramRange](),
yet here you have more control on possible values of the parameter and so the functions may not necessary be defined for all
the values from this range. See the [next](#Connected-points) section for more details.

Using this type of charts, you can make lines of any shapes as soon as don't have any gaps and are finite.

Unlike [xLine]() and [yLine](), [parametricCurve]() has a predefined way of estimating [layerDomainX]() and [layerDomainY](),
which are by default set to fit the entire line. Of course, this can be changed by the user, but for [parametricCurve]() these
properties influence only the original domains of the chart's axes, not the range for which the line is defined.

Let's make some spirals.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var line = lc.parametricCurve()
	.xFunction(function(t) {return t * Math.sin(t * 10)})
	.yFunction(function(t) {return t * Math.cos(t * 10)})
  .place();
</pre>

#### Connected points

Sometimes you don't have the function, but just want to connect some dots. Currently, in the _linked-charts_ library there
are no special types of lines for this task, but you can use [parametricCurve] and make your functions defined only for some
certain values inside [paramRange](), by setting a specific number of steps ([nsteps]()).

For examle, you can set the [paramRange]() to <code>[0, n]</code> and number of steps to <code>n</code>. Then you can define
[xFunction]() and [yFunction]() only for integer values from _0_ to _n-1_ and just ennumerate the dots, you want to connect.

Note that because of machine errors, values of the parameter may be not exactly integer and should be rounded.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var x = [], y = [];
//generate some random set of 20 points
for(var i = 0; i < 20; i++){
	x.push(Math.random());
	y.push(Math.random())
}

var line = lc.parametricCurve()
	.xFunction(function(t) {return x[Math.round(t)];})
	.yFunction(function(t) {return y[Math.round(t)];})
	.paramRange([0, 20])
	.nsteps(20)
  .place();

//let's add also the points
lc.scatter("points", line)
	.x(function(k) {return x[k]})
	.y(function(k) {return y[k]});

line.place_layer("points")
</pre>

In this example we made a chart with two layers. One for lines and the other one for dots. You can find more information 
about layers [here](../tutorials/layers.html) and about scatter plots [here](scatter.html). 

## Multiple lines

Any line chart can have any number of lines. Each line has its own ID which is passed to [lineFun](), [xFunction]() or
[yFucntion]() as a second argument. You can initialize several lines by setting the [nelements]() property (the default 
value is 1) or by providing an array of all the IDs via the [elementIds]() property. If [nelements]() is set to <code>n</code>,
then the IDs of the lines are integer numbers from _0_ to _n - 1_.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var line = lc.xLine()
	.nelements(5)
	.lineFun(function(x, k) {return x * (k + 1);})
	.domainX([0, 4])
	.domainY([0, 4])
  .place();
</pre>

## Styles

In the _linked-charts_ library you can change [colour](layer), [opacity](), [lineWidth]()
and dashing pattern ([dasharray]()) for each line in the chart. Each of these properties
can be set for all the lines or for each of them separately via a callback function that
gets a line ID as an argument.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var param = lc.parametricCurve()
  .nelements(3)
  .xFunction(function(t, d) {
    return Math.cos(t) + d;
  })
  .yFunction(function(t, d){
    return Math.sin(t);
  })
  .colourValue(function(d) {return d.toString()})
  .lineWidth(function(d) {return d;})
  .dasharray(function(d) {return d;})
  .paramRange([0, 2 * Math.PI])
  .place();
</pre>

Besides the [colour](layer) property, there is also [colourValue](layer) that in some cases
can be more useful. The difference between the two is the followint. [colour](layer) is 
supposed to return coulour in any interpretable by CSS format. It can be name, hexademical codes,
RGB format (<code>rgb(255, 0, 0)</code>), but no random numbers or strings. The values of this
property will be directly assigned to the [stroke](https://www.w3schools.com/graphics/svg_stroking.asp)
attribute of the lines. [colourValue](layer) accepts anything. It internally transforms its value 
- strings or numbers - into a colour scale that can be both continuous or categorical. You can 
change the [palette](layer) for this scale by setting a correspoding property.

[lineWidth]() is just a number that defined the width of each line.

[dasharray]() is a sting or number that should be valid for
[stroke-dasharray](https://developer.mozilla.org/en/docs/Web/SVG/Attribute/stroke-dasharray) attribute.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var plot = lc.xLine()
	.lineFun(function(x) {return Math.sin(x)})
	.layerDomainY([0, 10])
	.colour("red");

lc.xLine("cos", plot)
	.lineFun(function(x) {return Math.cos(x)})
	.layerDomainX([2, 3])
	.colour("blue")
	.domainX([0, 5])
	.domainY([-1, 1])
	.place();
</pre>

Feel free to play with chart's and layers' domains in this example.

## Domains

First of all, you need to understand that each line chart is actually a layer (possibly, one of several
layers) of a chart. Therefore, there is a distinction between [domainX]() or [domainY]() and 
[layerDomainX]() or [layerDomainY]() properties. The first ones define what domains will be actually
used for the both scales, when the chart is rendered. The latter ones just used for default estimating
of those scales. For [xLine]() and [yLine]() [layerDomainX]() and [layerDomainY]() respectively
has also another role. The lines are defined only in this range and the line will not be
displayed outside of it.

You can read more about layers and their properties [here](../tutorials/layers.html).

For domains the general rule is the following: by default layer domains are estimated so 
that to fit all the data of the layer and chart domains fit all the layer domains. If domains
of all the layers are undefined, <code>[0, 1]</code> range is used as a domain.
The only two types of charts that don't have a default way of domain estimation are [xLine]()
and [yLine](). But if, for example, [layerDomainX]() is defined for [xLine](), [layerDomainY]()
can be estimated automatically.

## Update

For any changes, you've added to the chart, to have an effect, you need first to update the
chart. Each chart in the _linked-charts_ library has an [update](chart) method, which 
recalculates and updates all the elements of the chart. But if you know that only
some of them have been changed since the last update, you may want to
change only these ones for the sake of performance time. So the [update](chart) method
actually consists of several modules, each responsible for a certain type of changes.
These partial updates can be called independently if necessary.
The most important ones are

- [updateSize](chart) - changes the size of the chart. Internally calls [updateAxes]().

- [updateAxes]() - recalculates the domains and updates both axes. Internally calls
[updateElementPosition]().

- [updateElements]() - adds or removes elements to fit the current data.

- [updateElementPosition]() - updates the position of all the points of the chart.

- [updateElementStyle]() - updates colour, shape, size, etc. of all the points.