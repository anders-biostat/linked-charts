# Install the packages, if you haven't yet:
devtools::install_github( "anders-biostat/JsRCom" )
devtools::install_github( "anders-biostat/rlc" )

# Download the example data. Skip this, too, if you have done this already.
download.file( "https://github.com/anders-biostat/rlc_tutorial/blob/master/citeseq_example/citeseq_data.rda?raw=true", 
   "citeseq_data.rda" )
download.file( "ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE100nnn/GSE100866/suppl/GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz",
   "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" )



# Load the package and the example data
library( rlc )
library( hwriter )

load( "citeseq_data.rda" )
countMatrixADT <- as.matrix( read.csv( 
  gzfile( "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" ), row.names=1 ) )
countMatrixADT <- countMatrixADT[ , colnames(countMatrix) ]


# Make the radio buttons

buttonRows <- c( "off", rownames(countMatrixADT) )
buttonCols <- c( "red", "green", "blue" )

buttonMatrix <- outer( buttonRows, buttonCols, function( row, col ) 
   hmakeTag( "input",   
      type = "radio",       # it's radio buttons again
      name = col,           # each column (red, green or blue) is one group
      value = row,          # the rowname (an antibody, or "off") is the value
      onchange = "jrc.sendData( this.name, this.value ); jrc.sendCommand( 'updateChart()' )" ) ) 

writeLines(
   hwrite( c(
      hmakeTag( "div", id="tsneChart" ),
      hwrite( buttonMatrix ) ) ), 
   "rgbTSNE.html" )


# A small convenience function
unitrange <- function( x )
  ( x - min(x) ) / ( max(x) - min(x) )


# Initalize the page

rlc::openPage( FALSE, startPage="rgbTSNE.html" )

red   <- "off"
green <- "off"
blue  <- "off"

JsRCom::sendCommand(
  'd3.selectAll("input[type=radio][value=off]").attr( "checked", "yes" )' )

lc_scatter( 
  dat(
    x = tsne$Y[,1],
    y = tsne$Y[,2],
    colour = rgb( 
      if( red=="off" )   0 else unitrange(log( countMatrixADT[red,] )), 
      if( green=="off" ) 0 else unitrange(log( countMatrixADT[green,] )), 
      if( blue=="off" )  0 else unitrange(log( countMatrixADT[blue,] )) ),
    size = 1 ),
  place = "tsneChart" )

