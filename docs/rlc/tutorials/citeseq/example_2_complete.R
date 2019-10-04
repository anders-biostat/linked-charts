# Install the packages, if you haven't yet:

devtools::install_github( "anders-biostat/rlc" )

# Download the example data. Skip this, too, if you have done this already.
download.file( "https://anders-biostat.github.io/linked-charts/rlc/tutorials/citeseq/citeseq_data.rda", 
   "citeseq_data.rda" )
download.file( "ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE100nnn/GSE100866/suppl/GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz",
   "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" )



# Load the package and the example data
library( rlc )

load( "citeseq_data.rda" )
countMatrixADT <- as.matrix( read.csv( 
  gzfile( "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" ), row.names=1 ) )
countMatrixADT <- countMatrixADT[ , colnames(countMatrix) ]


# Make the radio buttons

buttonRows <- c( "off", rownames(countMatrixADT) )

# A small convenience function
unitrange <- function( x )
  ( x - min(x) ) / ( max(x) - min(x) )

# Initalize the page
openPage(FALSE, layout = "table1x4")

red   <- "off"
green <- "off"
blue  <- "off"

lc_scatter( 
  dat(
    x = tsne$Y[,1],
    y = tsne$Y[,2],
    colour = rgb( 
      if( red=="off" )   0 else unitrange(log( countMatrixADT[red,] )), 
      if( green=="off" ) 0 else unitrange(log( countMatrixADT[green,] )), 
      if( blue=="off" )  0 else unitrange(log( countMatrixADT[blue,] )) ),
    size = 1 ),
  place = "A1" )

lc_input(type = "radio", 
         labels = buttonRows, 
         title = "Red", 
         on_change = function(value) {
           red <<- value
           updateCharts("A1")
         }, 
         value = "off",  width = 100, place = "A2")
lc_input(type = "radio", 
         labels = buttonRows, 
         title = "Green", 
         on_click = function(value) {
           green <<- value
           updateCharts("A1")
         }, 
         value = "off", width = 100, place = "A3")
lc_input(type = "radio",
         labels = buttonRows, 
         title = "Blue", 
         on_click = function(value) {
           blue <<- value 
           updateCharts("A1")
           }, 
         value = "off", width = 100, place = "A4")

