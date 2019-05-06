# Complete code for R/LinkChart usage example 1
# See tutorial page for explanations

devtools::install_github( "anders-biostat/rlc" )

library( rlc )

# Load the prepared data. You can get this file from here:
# https://https://anders-biostat.github.io/linked-charts/rlc/citeseq/citeseq_data.rda
#download.file( "https://anders-biostat.github.io/linked-charts/rlc/citeseq/citeseq_data.rda", "citeseq_data.rda" )

load( "citeseq_data.rda" )

openPage( layout = "table2x2", useViewer=FALSE )

gene <- "CD79A"
# the function to find genes high in the selected cells that
# writes its result to the table in B2
getHighGenes <- function(){
  
  marked <- getMarked("B1")
  
  # If no genes are marked, clear output, do nothing else
  if( length(marked) == 0 ) {
    return( "" )
  }
  
  df <- data.frame(
    meanMarked   =  apply( expr[ varGenes,  marked ], 1, mean ),
    sdMarked     =  apply( expr[ varGenes,  marked ], 1, sd ),
    meanUnmarked =  apply( expr[ varGenes, -marked ], 1, mean ),
    sdUnmarked   =  apply( expr[ varGenes, -marked ], 1, sd )
  )
  df$sepScore <- ( df$meanMarked - df$meanUnmarked ) / pmax( df$sdMarked + df$sdUnmarked, 0.002 )
  
  # round to two decimal places
  df <- round(df * 100)/100
  
  head( df[ order( df$sepScore, decreasing=TRUE ), ], 15 )
}


# the variance-mean overview plot (A1)
lc_scatter(
  dat( 
    x = means, 
    y = vars / means,
    logScaleX=10, 
    logScaleY=10, 
    size=2.5,
    on_click = function(i) {
      gene <<- names(means)[i]
      updateCharts( c( "A2", "B1" ) )
    } ), 
  "A1"
)

# the expression of the selected gene (A2)
lc_scatter(
  dat( 
    x = sf, 
    y = countMatrix[ gene, ], 
    logScaleX = 10, 
    title = gene,
    opacity = 0.2 ),
  "A2"
)

# the t-SNE plot (B1)
lc_scatter(
  dat(
    x = tsne$Y[,1],
    y = tsne$Y[,2],
    label = colnames(countMatrix),
    colourValue = sqrt( countMatrix[ gene, ] / sf ),
    palette = RColorBrewer::brewer.pal( 9, "YlOrRd" ),
    size = 1,
    colourLegendTitle = gene,
    on_marked = function() {
       updateCharts("B2")
    }),
  "B1"
)

#table with the top significantly different genes
lc_html(dat(
  content = getHighGenes() ), 
  "B2"
)
