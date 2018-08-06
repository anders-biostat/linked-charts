Linked Charts
=============

<pre class="tiy" showCode="false"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css"
  width="1100" height="400" 
  subscr="Here is a simple example of linked charts. Heatmap shows correlations between gene 
          expression and drug response for 52 samples from patients with acute myeloid leukaemia (AML).
          Scatterplot shows individual values of logarithmised read counts and drug scores for all the
          samples. Feel free to explore basic functionality of the charts by clicking on their elements.">
  //create a layout for the charts to be placed in
  var line = d3.select("body")
    .append("table")
      .append("tr");
  line.append("td")
    .attr("id", "heatmap");
  line.append("td")
    .attr("id", "scatterplot");

  //global variables to store 
  var selGene = 0;                                               
  var selDrug = 0;

  var scatterplot = lc.scatter()
    .width(300)
    .height(300)
    .axisTitleX("Gene Expression")
    .axisTitleY("Drug Score")
    .elementLabel(function(k){return "sample " + k})
    .size(3)
    .colour("CornflowerBlue")
    .x( function( k ) { return geneExprs[selGene][k] } )
    .y( function( k ) { return drugScores[selDrug][k] } )
    .title(function() { 
      return geneNames[selGene] + "/" + drugNames[selDrug]
    })
    .place("#scatterplot");

  var heatmap = lc.heatmap()
    .ncols( geneNames.length )
    .nrows( drugNames.length )
    .margins({top: 50, left: 50, right: 60, bottom: 160})
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
    .on_click( function( rowId, colId ) {
       selGene = colId;
       selDrug = rowId;
       scatterplot.update();
    })
    .cluster("Row")
    .cluster("Col")
    .legend.width(75)
    .place( "#heatmap")
</pre>

## Introduction

The _linked-charts_ is a [d3-based](https://d3js.org/) JavaSript library that 
provides user with an easy way to generate sets of linked interactive charts to allow
easy data exploration.

A process of analysing experimental data usually implies several steps of 
transformation and generalisation of raw read outs. And despite the fact 
that various quality control approaches are being used, manual inspection of the
data is still required. The _linked-charts_ library is aimed to facilitate this 
inspection by the means of a set of interactive charts that provide a detailed insight
into the main figure. 

To see how it works check our [examples](../examples/simpleExample.html).

The _linked-charts_ library allows one to generate a single stand-alone web-page
that contains all the data and functionality to explore it. Thus, it can be considered as
a way to share the data or presenting it to broad audience.

### Plot types

Currently supported types of charts are:

*   [Heatmap](../types/heatmap.html)
*   [Scatterplot](../types/scatter.html)
*   [Lineplot](../types/lines.html) ([y = f(x)], x = f(y), x = f(t) and y = g(t))
*   [Barchart](../types/barchart.html)
*   [Beeswarm](../types/beeswarm.html)
*   [Table](../types/table.html)

## Getting started

To include the current release of the _linked-charts_ library add in you page use the following code.
```
<script src = "https://kloivenn.github.io/linked-charts/lib/linked-charts.min.js"></script>
<link rel = "stylesheet" href="https://kloivenn.github.io/linked-charts/lib/linked-charts.css">
```
You can also download latest version and the source code from [GitHub](https://github.com/anders-biostat/linked-charts).
Pull requests and issue reports are greatly welcome.

## Usage

The _linked-charts_ is a JavaScript library and therefore at least minimal knowledge of this
language is required to use it. Specifically, one need to know the basic JavaScript syntax, 
understand the concenpt of global and local variables and be able to define a function.
Understanding of [d3](https://d3js.org/) library is highly recomended, although not required.

The core of the library are chart-objects that are initialised by calling a respective function.
These functions return objects which are further modified by defining a set of [properties](tutorials). 
Some of them (such as [elementIds](layer)) are required, others ([colour](), [title](), [size]() etc.) are optional.

Function [place](chart) is used to put the chart on a page, [update](chart) function changes the chart to 
bring it in concordance with the current state of the environment and [on_click](layer) property ensures the
linkage between different charts on the page.

The minimal code, needed to create a set of charts similar to the one on the top of this page, is following:
<pre class="tiy" loadOnStart="true" fitHeight="true" width="100%"
  tiy-preload="../src/linked-charts.min.js;../src/data/inputdata_simple.js;../src/linked-charts.css"
  subscr="Minimal code to generate two linked charts.">
  //global variables to store the clicked cell
  var selGene = 0;
  var selDrug = 0;

  //generating heatmap
  var heatmap = lc.heatmap()
    //number of rows and columns
    .ncols( geneNames.length )
    .nrows( drugNames.length )
    //value for each cell
    .value( function( row, col ) {  
       return lc.pearsonCorr( drugScores[row], geneExprs[col] ) 
     } )
    //column and row labels (optional properties)
    .colLabel( function(col) {return geneNames[col]} )
    .rowLabel( function(row) {return drugNames[row]} )
    //actions to be performed when a heatmap cell is clicked
    .on_click( function( rowId, colId ) {
       //change the state variables
       selGene = colId;
       selDrug = rowId;
       //update the scatterplot
       scatterplot.update();
    })
    .place();

  //generating scatterplot
  var scatterplot = lc.scatter()
    .x( function( k ) { return geneExprs[selGene][k] } )
    .y( function( k ) { return drugScores[selDrug][k] } )
    .place();
</pre>

For more information on how to use the _linked-charts_ library you can have
a look at our tutorials or browse the [list](api.html) of all the available properties
and methods.

## Contacts
Feel free to contact us with any questions or suggestions.

Simon Anders: [s.anders@zmbh.uni-heidelberg.de](mailto:s.anders@zmbh.uni-heidelberg.de)

Svetlana Ovchinnikova: [s.ovchinnikova@zmbh.uni-heidelberg.de](mailto:s.ovchinnikova@zmbh.uni-heidelberg.de)