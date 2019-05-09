---
lang: "js"
---

Scatter plots
=============

## Minimal requirements 

To generate a scatter plot one needs to define [x](scatter) and [y](scatter) properties.
They should be functions that will take point IDs as an argument and return 
corresponding <code>x</code> or <code>y</code> values.
In some simplest cases this may be enough, since the chart will try to automatically
estimate the number of points, assuming that their IDs are consequtive numbers.
To this end the chart tries to access [x](scatter) values one by one. The first ID, 
for which [x](scatter) is undefined or unaccessable for any reason,
becomes the number of points. If this for some reason fails, an error will be trown asking 
the user to define the number of points him- or herself via the [nelements]() property.

So the simplest possible scatter plot can be created like this

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .place();
</pre>

In this example, the IDs are just numbers, and you can see that on the information labels for
each point. You can change the names using [elementLabel](). Unlike IDs, names do not need
to be unique. This actually can be any text you want to be associated with a data point. Fot
example, try to add these lines to the code

<pre class="tiy" runnable="false">
scatterplot
  .elementLabel(function(k) {return data[k].species})
  .update();
</pre>

More straightforward way to put your text on the information label is, of course, 
just to set the HTML code for this label through [informText](layer) property.

<pre class="tiy" runnable="false">
scatterplot
  .informText(function(k) {
    return "<b>Species:</b> " + data[k].species;
  })
  .update();
</pre>

If you don't want IDs to be consequtive numbers, you can set them manually, using
the [elementIds]() property, which should be an array of all the IDs. This may
be useful if your data are stored in a form of an object with named fields. 

On the chart bellow you can see logarithmised expression values of several genes for 
two patient samples. The <code>scatterData</code> variable has the following structure

<pre class="tiy" runnable="false">
{
  gene1: {sample_1: v11, sample_2: v21},
  gene2: {sample_1: v12, sample_2: v22},
  ... ,
  genen: {sample_1: v1n, sample_2: v2n},  
}
</pre>

So in thist case it seems reasonable to use gene names as IDs.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/inputdata_simple.js;../../src/linked-charts.css">
var scatterplot = lc.scatter()
  .elementIds(Object.keys(scatterData))
  .x(function(id) {return scatterData[id].sample_1;})
  .y(function(id) {return scatterData[id].sample_2;})
  .place();
</pre>

## Size, colour and shape

All these aspects can be set either for all the points or for each of them separately.

The [size]() property defines the size of each point (default size is 6).
To define colour use the [colour](layer) or [colourValue]() properties. The difference
between the two is that the [colour](layer) property should return colour in any form that
can be interpreted by JavaScript, while [colourValue]() can be anything. It can be a
numeric value, or it can be some text, or actually anything else. This will be converted either 
in a continuous or in a categorical colour scale. You can also define a set of colours using the [palette](layer)
property, which can be an array of colours or a function that converts values from 0 to 1 
into colours.

Shape can be set by the [symbol]() or [symbolValue]() properties. The difference
between them is exactly the same as the difference between [colour](layer) and [colourValue]().
[symbol]() is expected to be one of the supported types of symbols which currently 
are <code>"Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"</code>. [symbolValue]()
can be any number or string.

Note, that when [colourValue]() or [symbolValue]() is set, a [legend]() is automatically
generated, while after setting [colour](layer) or [symbol]() the user should add a legend
manually. 

Let's put all this together into an example

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .size(function(k) {return data[k].sepalWidth * 2})
  .colourValue(function(k) {return data[k].petalWidth})
  .symbolValue(function(k) {return data[k].species})
  .place(); 
</pre>

To set the same shapes with [symbol]() property, one will need to use the 
following code (insert it instead of the [symbolValue]() property in the 
example above).

<pre class="tiy" runnable = "false">
scatterplot
  .symbol(function(k) { 
    if(data[k].species == "setosa") 
      return "Circle"; 
    if(data[k].species == "versicolor") 
      return "Cross"; 
    if(data[k].species == "virginica") 
      return "Diamond";     
  }) 
</pre>

## Titles and labels

One more thing that any chart needs is meaningful labels and titles.
You can set the main title of the chart using the [title](chart) property
and you can add labels to axes using [axisTitleX]() and [axisTitleY]()
properties.

You can also add, rename or remove parts of the legend to make it customised.
The more detailed chapter on legends you can find [here](../tutorials/legends.html). In this article
we just quickly mention a way to change the automatically generated name, which
is by defauld <code>"type of legend"_"layerID"</code>. To this end you can use properties
[colourLegendTitle]() and [symbolLegendTitle](). Keep in mind that these
names are also used as IDs, so they need to be unique.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../../src/linked-charts.min.js;../../src/data/iris.js;../../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .size(function(k) {return data[k].sepalWidth * 2})
  .colourValue(function(k) {return data[k].petalWidth})
  .symbolValue(function(k) {return data[k].species})
  .title("Iris dataset")
  .axisTitleX("Sepal Length")
  .axisTitleY("Petal Length")
  .colourLegendTitle("Petal Width")
  .symbolLegendTitle("Species")
  .place(); 
</pre>

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