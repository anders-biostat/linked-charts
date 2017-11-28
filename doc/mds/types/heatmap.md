Heatmaps
========

## Minimal requirements 

There are only three required properties to generate a heatmap. 
They are [value](heatmap), [nrows]() and [ncols](). 
The latter two set number of rows and columns of the heatmap and
thus are expected to be integer numbers. [value]() should be
a function that takes a row ID and a column ID and returns a specific
cell value. In most cases these values are numbers, but other options are
also possible. Check [this](../examples/twoChannelsHeatmap.html) example for more details.

When [nrows]() or [ncols]() are set, the respective set of IDs is
defined as an array of non-negative consequtive numbers. Another option is
to set these IDs manually by [rowIds]() or [colIds]() properties.
Both of them expect to get an array of IDs of all rows or columns in the
heatmap.

The difference in these two approaches is only in the IDs that will be passed to
cell-specific properties such as [value](heatmap). The two following lines are 
completely equivalent to each other.

<pre class = "tiy" runnable = "false">
heatmap.nrows(10);
heatmap.rowIds([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
</pre>

Yet [rowIds]() and [colIds]() allow to set IDs to something
different from numbers, which may be useful when your data are stored
as an object rather than an array.

Have a look at this example. Here, we have correlation values between 
gene expression and drug scores.
<pre class = "tiy" fitHeight = "true" fitWidth = "true"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css">
d3.select("body")
  .append("table")
    .append("tr").selectAll("td").data(["matrix", "object"])
      .enter().append("td")
        .attr("id", function(d) {return d});
//-----Precode end-----

var heatmap_numbers = lc.heatmap()
  .nrows(geneNames.length)
  .ncols(drugNames.length)
  .value(function(row, col){
    return corMatrix[row][col];
  })
  .place("#matrix");

var heatmap_ids = lc.heatmap()
  .rowIds(geneNames)
  .colIds(drugNames)
  .value(function(rowId, colId){
    return corObject[rowId][colId]
  })
  .place("#object");
</pre>

The main difference between the two heatmaps lies in the structure of
their data objects. <code>corMatrix</code> is a usual <code>n x m</code> data
matrix with no lables. <code>corObject</code> looks like this:
<pre class="tiy" runnable="false">
{gene1: {
  drug1: v11,
  drug2: v12,
  ...
}, gene2: {
  drug1: v21,
  drug2: v22
  ...
}...}
</pre>
So it's easier to use keys (such as gene and drug names) instead of indices 
to access values in this object.

One can also notice that in the first heatmap (to the left) there are no
meaningful labels, since by default the IDs are used as labels. If you want to 
have there something else, use [rowLabel]() and [colLabel]() 
properties. Both of them should be functions that get row or column ID and 
return a corresponding label. Unlike IDs, labels don't need to be unique.

Try to add this lines to the example above
<pre class="tiy" runnable="false">
heatmap_numbers
  .rowLabel(function(row) {
    return geneNames[row];
  })
  .colLabel(function(col) {
    return drugNames[col];
  })
  .updateLabelText();
</pre>

Of course, you can also change labels for the other heatmap as well
<pre class="tiy" runnable="false">
  heatmap_ids
    .colLabel(function(colId) {
      return colId.toUpperCase();
    })
    .updateLabelText();
</pre>

## Colour

Like for all other charts in the library, the most basic and direct way to define
colour of cells of the heatmap is via [colour](heatmap) property. This property 
takes value (usually, returned by [value](heatmap) property)
and supposed to return colours. If you decide to set this property, the way how you want 
to transform IDs into colours is completely up to you. Yet, setting [colour](heatmap) 
property always overrides any other in-built ways of colour manipulation, and so we 
recomend not to use it unless for some special cases.

Generally, one would use [palette](heatmap) and [colourDomain](heatmap) properties to set 
an appropriate colour scheme. [colourDomain](heatmap) defines the range of the values on which we
want to stretch the palette. For example, for correlation heatmap a good choice would 
be <code>[-1, 1]</code>. By default, [colourDomain](heatmap) returns the range of the values of all
the cells. [palette](heatmap) is a functions that transforms values from <code>[0, 1]</code> into
colours. It was desined to utilise sequential scales from d3 library, but can be any
function that follows the abovementioned condition.

The combination of these two properties results in a colour scale that takes values from
[colourDomain](heatmap) and returns colours. The scale is stored as [colourScale](heatmap)
(this is not a property!) and by default is accessed via the [colour](heatmap) property.

Here is an exaple to put it all together.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css">
var heatmap = lc.heatmap()
  .rowIds(geneNames)
  .colIds(drugNames)
  .value(function(rowId, colId){
    return corObject[rowId][colId]
  })
  .colourDomain([-1, 1])
  .palette(function(val) {
    return d3.interpolateRdBu(1 - val);
  })
  .place();
</pre>

You can experiment with this, or try to set colour property like this
<pre class="tiy" runnable="false">
heatmap
  .colour(function(val){
    return this.colourScale(val/2);
  })
  .updateCellColour();
</pre>
or
<pre class="tiy" runnable="false">
heatmap
  .colour(function(val) {
    return val > 0 ? "red" : "blue";
  })
  .updateCellColour();
</pre>

Note, that in the first case we are still using the default colour scale
and therefore [colourDomain](heatmap) and [palette](heatmap) properties 
still have an effect on the heatmap's appearance. But if colour is 
set like in the second example, other colour properties will be 
ineffective.

## Clustering and dendograms

You can always cluster rows or colums of the heatmap by clicking 
the corresponding buttons on the instrument panel. Another option
is writing

<pre class="tiy" runnable="false">
heatmap
  .cluster("Row")
  .cluster("Col");
</pre>

Note that [cluster](heatmap) is not a property, but a method that
can take either "Row" or "Col" argument and will throw an error if
any other argument is passed.

There are also some other properties that will help you to customise the clustering.

[showDendogramRow]() and [showDendogramCol]() define wether or not
to show the dendogram and are expected to return boolean values. Even if these
properties are set to <code>false</code> rows or columns still can be clustered.
Just no dendogram will be displayed.

[clusterRowMetric]() and [clusterColMetric]() are used to calculate
distance between rows and columns for clustering. By default, the Euclidean distance
is used, but user can provide any other fucntion for these properties that 
will take two vectors of the same length and return a numeric value.

Now let's summarize this with an example. We will use the correlation distance
to cluster rows and columns and disable one of the dendograms.

<pre class = "tiy" fitHeight = "true"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css">
var heatmap = lc.heatmap()
  .rowIds(geneNames)
  .colIds(drugNames)
  .value(function(rowId, colId){
    return corObject[rowId][colId]
  })
  .showDendogramCol(false)
  .clusterRowMetric(function(a, b){
    return 1 - lc.pearsonCorr(a, b);
  })
  .clusterColMetric(function(a, b){
    return 1 - lc.pearsonCorr(a, b);
  })
  .cluster("Row")
  .cluster("Col")
  .place();
</pre>

As you can see, when dendogram is added to the heatmap, labels are moved to the bottom
or to the right. Yet the default margin size is too small so now you can see only the 
first letter of each row label. Add this to the example code to change the margin size

<pre class="tiy" runnable="false">
heatmap
  .set_margins({right: 100})
  .updateSize();
</pre>

It doesn't matter in which order you define properties. But [cluster](heatmap) is not
a property. It's a method that performs clusterisation, when called. So if you use
it, make sure that by that time you've already set all the required prperties. For 
example try to put [cluster](heatmap) before distance metric is changed and see what 
happens.

By the way, try to click on any branch of the dendogram. Then rows or columns will be
reclustered, using only the selected cluster as features.

## Update

To change anything in the heatmap, you need to update it. There is an [update](chart)
method that will just redraw all the elements of the heatmap. But if you know that only
some of the heatmap's elements have been changed since the last update, you may want to
change only them for the sake of performance time. So the [update](chart) function
actually consists of several modules each responsible for a certain type of changes.
These partial updates can be called independently if necessary.
The most important ones are

- [updateSize](chart) - changes the size of the chart. Internally calls [updateLabelPosition]().

- [updateLabels]() - adds or removes row and column labels. Internally 
calls [updateCells]().

- [updateCells]() - adds or removes cells.

- [updateLabelPosition]() - changes the size and location of the row and column
labels. Internally calls [updateCellPosition]()

- [updateCellPosition]() - changes the size and location of all the cells.

- [updateLabelText]() - changes the text of row and column labels.

- [updateCellColour]() - changes the colour of all the cells.

- [updateCanvas]() - if the heatmap is working in the "canvas" [mode](), this function
will redraw the canvas.

Unlike SVG, Canvas can not be changed partially. Even if you need to change colour of
a single cell, the entire canvas has to be redrawn. Thus, if you are working with 
canvas, [updateCells](), [updateCellPosition]() and [updateCellColour]()
will call [updateCanvas](). So if you make such a chain of updates
<pre class="tiy" runnable="false">
heatmap
  .updateCells()
  .updateCellPosition()
  .updateCellColour();
</pre>
canvas will be updated three times. So that not to lose time for this, you can indicate
that all of these updates are a part of a single chain and canvas should be updated only
once
<pre class="tiy" runnable="false">
heatmap.updateStarted = true;
heatmap
  .updateCells()
  .updateCellPosition()
  .updateCellColour();
heatmap.updateStarted = false;
</pre>

You can find the full list of heatmap's properties and methods [here](../pages/api.html#heatmap).
