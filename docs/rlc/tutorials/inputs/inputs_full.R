library(rlc)
library(readr)
library(uwot)

cbmc <- read_rds("seuratObject.rds")

clusters <- cbmc@active.ident
pca <- cbmc@reductions$pca@cell.embeddings
X <- cbmc@assays$RNA@data

rm(cbmc)

#subset
cells <- sample(length(clusters), 2500)

clusters <- clusters[cells]
pca <- pca[cells, ]
X <- X[, cells]

um <- umap(pca[, 1:15])
useClusters <- levels(clusters)

openPage(useViewer = FALSE, layout = "table1x2")

lc_scatter(dat(opacity = ifelse(clusters %in% useClusters, 1, 0.05)),
           x = um[, 1], y = um[, 2], size = 1, place = "A1")

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
         on_change = function(value) {
           print(value)
         }
)
