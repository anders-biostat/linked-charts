library(rlc)

load("src/oscc.rda")

app <- openPage(useViewer = FALSE, startPage = "localBam.html")

gene <- "TSPAN6"

lc_scatter(dat(
  x = voomResult$AveExpr,
  y = voomResult$tissuetumour,
  color = ifelse( voomResult$adj.P.Val < 0.1, "red", "black" ),
  label = rownames(voomResult),
  size = 1.3,
  on_click = function(k) {
    geneName <- rownames(voomResult)[k]
    position <- paste0("chr", gene_positions[geneName, "chr"], ":", 
                       gene_positions[geneName, "start"], "-", 
                       gene_positions[geneName, "end"])
    com <- paste0("igvBrowser.search('", geneName, "')")
    app$getSession(.id)$sendCommand(com)
    } ),
  "A1")