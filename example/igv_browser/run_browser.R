library(rlc)

load("src/oscc.rda")

app <- openPage(useViewer = FALSE, startPage = "localBam.html")

gene <- 1

lc_scatter(dat(
  x = voomResult$AveExpr,
  y = voomResult$tissuetumour,
  color = ifelse( voomResult$adj.P.Val < 0.1, "red", "black" ),
  label = rownames(voomResult),
  size = 1.3,
  on_click = function(k) {
    geneName <- rownames(voomResult)[k]
    com <- paste0("igvBrowser.search('", geneName, "')")
    app$getSession(.id)$sendCommand(com)
    gene <<- k; updateCharts("A2")
    } ),
  "A1")

countsums <- colSums(countMatrix)

lc_scatter(dat(
  x = sampleTable$patient,
  y = countMatrix[gene,] / countsums * 1e6 + .1,
  logScaleY = 10,
  colorValue = sampleTable$tissue,
  title = rownames(countMatrix)[gene],
  axisTitleY = "counts per million (CPM)",
  ticksRotateX = 45),
  "A2")