Scatter plots
=============

## Minimal requirements 

To generate a scatter plot one needs to define <tt>x</tt> and <tt>y</tt> properties.
They expect a function that will take data IDs as arguments and return corresponding <tt>x</tt> or <tt>y</tt> values.
In some simplest cases this may be enough, since the chart will try to automatically
estimate the number of points, assuming that their IDs are consequtive numbers and
trying to access <tt>x</tt> values one by one. The first ID, for which <tt>x</tt> is unaccessable
becomes the number of points. If this for some reason fails, an error will be trown asking 
user to define the number of points himself via the <tt>nelements</tt> property.

So the simplest possible scatter plot can be created like this

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
var scatterplot = lc.scatter()
  .x(function(k) {return data[k].sepalLength})
  .y(function(k) {return data[k].petalLength})
  .place();
</pre>

In this example, the IDs are just numbers, and you can see that on the information labels for
each point. You can change the names using <tt>elementLabel</tt>. Unlike IDs, names do not need
to be unique. This actually can be any text you want to be associated with a data point. Fot
example, try to add this line of code

<pre class="tiy" runnable="false">
scatterplot
  .elementLabel(function(k) {return data[k].species})
</pre>

More straightforward way to put your text on the information label is, of course, 
just to set the HTML code for this label through <tt>informText</tt> property.

<pre class="tiy" runnable="false">
scatterplot
  .informText(function(k) {
    return "Species: " + data[k].species;
  })
</pre>

If you don't want IDs to be consequtive numbers, you can set them manually, using
the <tt>dataIds</tt> property, which should be an array of all the IDs. This may
be useful if your data are stored in a form of object with named fields. 

On the chart bellow you can logarithmised expression values of several genes for 
two patient samples. The <tt>scatterData</tt> variable has the following structure

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
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css">
var scatterplot = lc.scatter()
  .elementIds(Object.keys(scatterData))
  .x(function(id) {return scatterData[id].sample_1;})
  .y(function(id) {return scatterData[id].sample_2;})
  .place();
</pre>

## Size, colour and shape

All these aspects can be set either for all the points or for each of them separately.

The <tt>size</tt> property defines the size of each point (default size is 6).
To define colour use <tt>colour</tt> or <tt>colourValue</tt> properties. The difference
between the two is that <tt>colour</tt> property should return colour in any form that
can be interpreted by JavaScript, while <tt>colourValue</tt> can be anything. It can be
numeric values or it can be some text. This will be converted either in continuous or in
categorical colour scale. You can also define a set of colours using the <tt>palette</tt>
property, which can be an array of colours or a function that converts values from 0 to 1 
into colours.

Shape can be set by the <tt>symbol</tt> or <tt>symbolValue</tt> property. The difference
between them is exactly the same as the difference between <tt>colour</tt> and <tt>colourValues</tt>.
<tt>symbol</tt> is expected to return one of the supported types of symbols which currently 
are <tt>"Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"</tt>. <tt>symolValues</tt>
can be any number or string.

Note that when <tt>colourValue</tt> or <tt>symbolValue</tt> are set, <tt>legend</tt> is automatically
generated, while after setting <tt>colour</tt> or <tt>symbol</tt> user should add the legend
manually. 

Let's put all this together into an example

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

To set the same shapes with <tt>symbol</tt> property, one will need to use the 
following code.

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
You can set the main title of the chart using <tt>title</tt> property
and you can add labels to axes through <tt>labelX</tt> and <tt>labelY</tt>
properties.

You can also add, rename or remove parts of the legend to make it customised.
The more detailed chapter on legends you can find over here. In this article
we just quickly mention the way to change automatically generated name, which
is by defauld "type of legend"_"layerID". To this end you can use properties
<tt>colourLegendName</tt> and <tt>symbolLegendName</tt>. Keep in mind that these
names are also used as IDs, so they need to be unique.

<pre class="tiy" width="100%" fitHeight="true"
  tiy-preload="../src/linked-charts.min.js;../src/data/iris.js;../src/linked-charts.css">
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