<pre class="tiy" showCode="false"
  tiy-preload="src/linked-charts.min.js;src/data/inputdata_simple.js;src/linked-charts.css"
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
    .label(function(k){return "sample " + k})
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
    .paddings({top: 50, left: 50, right: 60, bottom: 160})
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

# LinkedCharts

"LinkedCharts" is a JavaScript framework for visual data exploration, built on top of [D3](http://d3js.org). 

It makes it easy to very rapidly set up "mini-apps" to explore a data set. These mini apps display the data in "linked" 
charts. By "linking", we mean that a user's interaction with one chart controls what another chart shows. For example,
click on the correlation heatmap above will cause the scatter plot to the right to show the underlying points.

LinkedCharts can be used with JavaScript or from **R** statistical programmin environment. Use navigation buttons above
to learn more about each of the versions.
