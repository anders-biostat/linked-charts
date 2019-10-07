library(rlc)
library(readr)
library(uwot)

cbmc <- read_rds("seuratObject.rds")

clusters <- cbmc@active.ident
pca <- cbmc@reductions$pca@cell.embeddings
X <- cbmc@assays$RNA@data

#rm(cbmc)

#subset
cells <- sample(length(clusters), 2500)

clusters <- clusters[cells]
pca <- pca[cells, ]
X <- X[, cells]

um <- umap(pca[, 1:15])
useClusters <- levels(clusters)

selGene <- "ADC"

openPage(useViewer = FALSE, layout = "table1x2")

lc_scatter(dat(opacity = ifelse(clusters %in% useClusters, 1, 0.05),
               colourLegendTitle = selGene,
               colourValue = X[selGene, ]),
           x = um[, 1], y = um[, 2], size = 1, 
           palette = RColorBrewer::brewer.pal( 9, "YlOrRd" ), 
           place = "A1")

lc_input(type = "checkbox", 
         labels = levels(clusters), 
         value = TRUE, 
         title = "Clusters",
         on_click = function(value) {
           useClusters <<- levels(clusters)[value]
           updateCharts("A1")
         }, 
         place = "A2")

lc_input(type = "text",
         label = "Show gene: ",
         place = "A2",
         id = "geneBox",
         value = selGene,
         on_change = function(value) {
           if(value %in% rownames(X)) {
             jrc::sendCommand("charts.warning.container.select('p').style('display', 'none')")
             selGene <<- value
             updateCharts("A1", updateOnly = "ElementStyle")
           } else {
             jrc::sendCommand("charts.warning.container.select('p').style('display', undefined)")
           }
           
         }
)

lc_html(content = "<p style='color: red; display: none'>There is no such gene</p>", place = "A2", id = "warning")

lc_input(type = "range",
         label = c("Number of PCs", "Spread", "Negative rate"),
         value = c(15, 1, 5),
         min = c(2, 0.01, 0.5),
         max = c(50, 5, 20),
         step = c(1, 0.01, 0.5),
         on_change = function(value) print(value))
