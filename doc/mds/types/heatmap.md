Heatmaps
========

## Minimal requirements 

There are only three required properties to generate a heatmap. 
They are [value](), [nrows]() and [ncols](). 
The latter two set number of rows and columns of the heatmap and
thus are expected to be integer numbers. [value]() should be
a function that takes a row ID and a column ID and returns a specific
cell value. In most cases these values are numbers, but other options are
also possible. Check this example for more details.

When <tt>nrows</tt> or <tt>ncols</tt> are set, the respective set of IDs is
defined as an array of non-negative consequtive numbers. Another option is
to set these IDs manually by <tt>rowIds</tt> or <tt>colIds</tt> properties.
Both of them expect to get an array of IDs of all rows or columns in the
heatmap.

The difference in these two approaches is only in the IDs that will be passed to
cell-specific properties such as <tt>value</tt>. The two following lines are 
completely equivalent to each other.

<pre class = "tiy" runnable = "false">
heatmap.nrows(10);
heatmap.rowIds([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
</pre>

Yet <tt>rowIds</tt> and <tt>colIds</tt> allow to set IDs to something
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
their data objects. <tt>corMatrix</tt> is a usual <tt>n x m</tt> data
matrix with no lables. <tt>corObject</tt> looks like this:
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
So it's easier to use keys instead of indices to access values in this 
object.

One can also notice that in the first heatmap (to the left) there are no
meaningful labels, since by default IDs are used as labels. If you want to 
have there something else, use <tt>rowLabel</tt> and <tt>colLabel</tt> 
properties. Both of them should be functions that get row or column ID and 
return a corresponding label.

Try to add this lines to the example above
<pre class="tiy" runnable="false">
heatmap_numbers
  .rowLabel(function(row) {
    return geneNames[row];
  })
  .colLabel(function(col) {
    return drugNames[col];
  });
</pre>

Of course, you can also change labels for the other heatmap as well
<pre class="tiy" runnable="false">
  heatmap_ids
    .colLabel(function(colId) {
      return colId.toUpperCase();
    });
</pre>

## Colour

Like for all other charts in the library, the most basic and direct way to define
colour of cells is via <tt>colour</tt> property. This property takes value (usually, returned by <tt>value</tt> property)
and supposed to return colours. If you decide to set this property, the way how you want 
to transform IDs into colours is completely up to you. Yet, setting <tt>colour</tt> 
property always overrides any other in-built ways of colour manipulation, and so we 
recomend not to use it unless in some special cases.

Generally, one would use <tt>palette</tt> and <tt>colourDomain</tt> properties to set 
an appropriate colour scheme. <tt>colourDomain</tt> defines the values range on which we
want to stretch the palette. For example, for correlation heatmap a good choice would 
be <tt>[-1, 1]</tt>. By default <tt>colourDomain</tt> returns the range of values of all
the cells. <tt>palette</tt> is a functions that transforms values from <tt>[0, 1]</tt> into
colours. It was desined to utilise sequential scales from d3 library, but can be any
function that follows abovementioned condition.

The combination of these two properties results in a colour scale that takes values from
<tt>colourDomain</tt> and returns colours. The scale is stored as <tt>chart.colourScale</tt>
(this is not a property!) and by default is accessed via the <tt>colour</tt> property.

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
</pre>
or
<pre class="tiy" runnable="false">
heatmap
  .colour(function(val) {
    return val > 0 ? "red" : "blue";
  })
</pre>

Note that in first case we are still using the default colour scale
and therefore <tt>colourDomain</tt> and <tt>palette</tt> properties 
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

Note that <tt>cluster</tt> is not a prperty, but rather a method that
can take either "Row" or "Col" argument and will throw an error if
any other argument is passed.

There are also some properties that will help you to customise the clustering.

<tt>showDendogramRow</tt> and <tt>showDendogramCol</tt> define wether or not
to show the dendogram and are expected to return boolean values. Even is this
properties are set to <tt>false</tt> rows or columns still can be clustered.
Just no dendogram will be displayed.

<tt>clusterRowMetric</tt> and <tt>clusterColMetric</tt> are used to calculate
distance between rows and columns for clustering. By default Euclidean distance
is used, but user can provide any other fucntion for these properties that 
will take two vectors of the same lengt and return numeric value.

Now let's summarize this with an example. We will use correlation distance
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
  .set_margin({right: 100})
</pre>

It doesn't matter in which order you define properties. But <tt>cluster</tt> is not
a property. It's a method that performs clusterisation, when called. So if you use
it, make sure that by that time you've already set all the required prperties. For 
example try to put <tt>cluster</tt> before distance metric is changed and see what 
happens.

By the way, try to click on any branch of a dendogram. Then rows or columns will be
reclustered, using only the selected cluster as features.

## Update

To change anything in the heatmap, you need to update it. There is an <tt>update</tt>
method that will just redraw all the elements of the heatmap. But if you know that only
some of the heatmap's elements have been changed since last update, you may want to
update only them for the sake of performance time. So the <tt>update</tt> function
actually consists of several modules each responsible for a certain type of changes.
These partial updates can be called independently if necessary.
The most important ones are
<tt>updateSize</tt> - changes the size of the chart. Internally calls <tt>updateLabelPosition</tt>.
<tt>updateLabels</tt> - adds or removes row and column labels. Internally 
calls <tt>updateCells</tt>.
<tt>updateCells</tt> - adds or removes cells.
<tt>updateLabelPosition</tt> - changes the size and location of the row and column
labels. Internally calls <tt>updateCellPosition</tt>
<tt>updateCellPosition</tt> - changes the size and location of all the cells.
<tt>updateLabelText</tt> - changes the text of row and column labels.
<tt>updateCellColour</tt> - changes the colour of all the cells.
<tt>updateCanvas</tt> - if the heatmap is working in the "canvas" mode, this function
will redraw the canvas.

Unlike SVG Canvas can not be changed partially. Even if you need to change colour of
a single cell, the entire canvas has to be redrawn. Thus, if you are working with 
canvas, <tt>updateCells</tt>, <tt>updateCellPosition</tt> and <tt>updateCellColour</tt>
will call <tt>updateCanvas</tt>. So if you make such a chain of updates
<pre class="tiy" runnable="false">
heatmap
  .updateCells()
  .updateCellPosition()
  .updateCellColour();
</pre>
canvas will be updated three times. So that not to lose time for this, you can indicate
that all of these updates are part of single chain and canvas should be updated only
once
<pre class="tiy" runnable="false">
heatmap.updateStarted = true;
heatmap
  .updateCells()
  .updateCellPosition()
  .updateCellColour();
heatmap.updateStarted = false;
</pre>

You can find the full list of heatmap's properties and methods here.
