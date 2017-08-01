Linked Charts
-------------

<pre class="tiy" showCode="false" tiy-preload="../lib/linked-charts.min.js;../example/inputdata_simple.js;../lib/linked-charts.css"
	fitWidth="true" fitHeight="true">
	var line = d3.select("body")
		.append("table")
			.append("tr");
	line.append("td")
		.attr("id", "heatmap");
	line.append("td")
		.attr("id", "scatterplot");

	var selGene = 1;                                               
	var selDrug = 1;

	var scatterplot = lc.scatterChart()
	  .width(300)
	  .height(300)
	  .labelX("Gene Expression")
	  .labelY("Drug Score")
	  .x( function( k ) { return geneExprs[selGene][k] } )
	  .y( function( k ) { return drugScores[selDrug][k] } )
	  .place("#scatterplot");

	var heatmap = lc.heatmapChart()
	  .ncols( geneNames.length )
	  .nrows( drugNames.length )
	  .margin({top: 50, left: 50, right: 60, bottom: 160})
	  .height( 350 )
	  .width( 600 )
	  .colourRange( [ -1, 1 ] )
	  .palette( d3.interpolateRdBu )
	  .value( function( row, col ) {  
	     return lc.pearsonCorr( drugScores[row], geneExprs[col] ) 
	   } )
	  .colLabels( function(col) { 
	     return geneNames[col] 
	   } )
	  .rowLabels( function(row) { 
	     return drugNames[row] 
	   } )
	  .on_click( function( rowId, colId ) {
	     selGene = colId;
	     selDrug = rowId;
	     scatterplot.update();
	  })
	  .cluster("Row")
	  .cluster("Col")
	  .place( "#heatmap")
</pre>

<script src="lib/codeMirror/codemirror.js"></script>
<link rel="stylesheet" href="lib/codeMirror/codemirror.css">
<script src="lib/codeMirror/javascript.js"></script>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="lib/tiy.js"></script>
<link rel="stylesheet" href="lib/tiy.css">
<script>tiy.make_boxes();</script>