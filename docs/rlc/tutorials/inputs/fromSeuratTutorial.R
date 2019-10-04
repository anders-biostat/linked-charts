library(Seurat)
library(readr)

# from https://satijalab.org/seurat/v3.1/multimodal_vignette.html

# Load in the RNA UMI matrix

# Note that this dataset also contains ~5% of mouse cells, which we can use as negative controls
# for the protein measurements. For this reason, the gene expression matrix has HUMAN_ or MOUSE_
# appended to the beginning of each gene.
cbmc.rna <- as.sparse(read.csv(file = "~/Downloads/GSE100866_CBMC_8K_13AB_10X-RNA_umi.csv.gz", sep = ",", 
                               header = TRUE, row.names = 1))

# To make life a bit easier going forward, we're going to discard all but the top 100 most
# highly expressed mouse genes, and remove the 'HUMAN_' from the CITE-seq prefix
cbmc.rna <- CollapseSpeciesExpressionMatrix(cbmc.rna)

cbmc <- CreateSeuratObject(counts = cbmc.rna)

# standard log-normalization
cbmc <- NormalizeData(cbmc)

# choose ~1k variable features
cbmc <- FindVariableFeatures(cbmc)

# standard scaling (no regression)
cbmc <- ScaleData(cbmc)

# Run PCA, select 13 PCs for tSNE visualization and graph-based clustering
cbmc <- RunPCA(cbmc, verbose = FALSE)

cbmc <- FindNeighbors(cbmc, dims = 1:25)
cbmc <- FindClusters(cbmc, resolution = 0.8)

# Note, for simplicity we are merging two CD14+ Monocyte clusters (that differ in expression of
# HLA-DR genes) and NK clusters (that differ in cell cycle stage)
new.cluster.ids <- c("Memory CD4 T", "CD14+ Mono", "Naive CD4 T", "NK", "CD14+ Mono", "Mouse", "B", 
                     "CD8 T", "CD16+ Mono", "T/Mono doublets", "NK", "CD34+", "Multiplets", "Mouse", "Eryth", "Mk", 
                     "Mouse", "DC", "pDCs")
names(new.cluster.ids) <- levels(cbmc)
cbmc <- RenameIdents(cbmc, new.cluster.ids)

write_rds(cbmc, "seuratObject.rds", compress = "gz")
