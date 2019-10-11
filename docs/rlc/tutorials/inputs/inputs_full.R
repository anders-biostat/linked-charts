library(rlc)
library(readr)
library(uwot)

cbmc <- read_rds("seuratObject.rds")

clusters <- cbmc@active.ident
pca <- cbmc@reductions$pca@cell.embeddings
X <- cbmc@assays$RNA@data

#rm(cbmc)

#subset
cells <- sample(length(clusters), 4000)

clusters <- clusters[cells]
pca <- pca[cells, ]
X <- X[, cells]

npca <- 15
negRate <- 5
spread <- 1

um <- umap(pca[, 1:npca], negative_sample_rate = negRate, spread = spread)
useClusters <- levels(clusters)
inclCells <- rep(T, ncol(X))

selGene <- "CD3E"

openPage(useViewer = FALSE, layout = "table1x2")

lc_scatter(dat(opacity = ifelse(clusters[inclCells] %in% useClusters, 0.8, 0.1),
               colourLegendTitle = selGene,
               colourValue = X[selGene, inclCells], 
               x = um[, 1], y = um[, 2]),
           size = 2, 
           palette = rje::cubeHelix(n = 11)[9:1], 
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
             display <<- "none"
             selGene <<- value
             updateCharts("A1", updateOnly = "ElementStyle")
           } else {
             display <<- "undefined"
           }
           updateCharts("warning")
         }
)

display <- "none"
lc_html(dat(content = paste0("<p style='color: red; display: ", display, "'>There is no such gene</p>")), 
        place = "A2", id = "warning")

lc_input(type = "range",
         label = c("Number of PCs", "Spread", "Negative rate"),
         width = 300,
         value = c(15, 1, 5),
         min = c(2, 0.01, 0.5),
         max = c(50, 5, 20),
         step = c(1, 0.01, 0.5),
         on_change = function(value) {
           npca <<- value[1]
           spread <<- value[2]
           negRate <<- value[3]
         })

lc_input(type = "button",
         label = "Recalculate", 
         on_click = function(value) {
           print("Recalculation started. Please, wait...")
           inclCells <<- clusters %in% useClusters
           um <<- umap(pca[inclCells, 1:npca], negative_sample_rate = negRate, spread = spread)
           print("Recalculation finished")
           updateCharts("A1")
         })