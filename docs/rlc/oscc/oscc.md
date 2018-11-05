<script src = "../../src/linked-charts.min.js"></script>
<link rel="stylesheet" type="text/css" href="../../src/linked-charts.css">

## R/LinkedCharts Tutorial
# Augmenting and checking a standard RNA-Seq analysis

In this simple tutorial, we show how to explore a standard RNA-Seq analysis.

## The data

We are working with data from this paper:

| C. Conway et al.: *Elucidating drivers of oral epithelial dysplasia formation and malignant transformation to cancer using RNAseq*. Oncotarget, 6:40186-40201 (2015), [doi:10.18632/oncotarget.5529](https://doi.org/10.18632/oncotarget.5529)

Conweay et al. have collected tissue samples from 19 patients with oral squamous
cell carcinoma (OSCC). From each patient, they took 3 samples, one of normal oral mucosa ("N"), 
one of epithelial dysplasia (i.e., abnormal but not yet malignant tissue, "D"), 
and one sample of the tumour ("T"). We will use their data (available from the European
Read Archive (ERA) under accession [PRJEB7455](https://www.ebi.ac.uk/ena/data/view/PRJEB7455))
to demonstrate how LinkedCharts can be helpful in a standard bioinformatics task like
analysing an RNA-Seq data set.

Fortunately, we do not have to redo the whole abalysis, as the Recount2 project 
(Collado Torres et al., Nature Biotechnology, 2017, [doi:10.1038/nbt.3838](https://doi.org/10.1038/nbt.3838)) 
gives us a headstart by providing a count table for this and other data sets.

Nevertheless, a bit of data wrangling is necessary, and in order to keep this tutorial short,
we describe these preparatory steps in an [appendix](data_prep.md). 

We hence start by loading the data file resulting from the preparations, which is 
available here: [oscc.rda](oscc.rda)


```r
load( "oscc.rda" )
```

We have data for 57 samples (19 patients x 3 tissue samples per patient), with the metadata in `sampleTable`:


```r
sampleTable
```

```
##    run_accession sample_name patient    tissue
## 1      ERR649059     PG004-N   PG004    normal
## 2      ERR649060     PG004-D   PG004 dysplasia
## 3      ERR649061     PG004-T   PG004    tumour
## 4      ERR649035     PG038-N   PG038    normal
## 5      ERR649018     PG038-D   PG038 dysplasia
## 6      ERR649025     PG038-T   PG038    tumour
## 7      ERR649022     PG049-N   PG049    normal
## 8      ERR649021     PG049-D   PG049 dysplasia
## 9      ERR649020     PG049-T   PG049    tumour
## 10     ERR649026     PG063-N   PG063    normal
## 11     ERR649023     PG063-D   PG063 dysplasia
## 12     ERR649024     PG063-T   PG063    tumour
## 13     ERR649062     PG079-N   PG079    normal
## 14     ERR649064     PG079-D   PG079 dysplasia
## 15     ERR649065     PG079-T   PG079    tumour
## 16     ERR649034     PG086-N   PG086    normal
## 17     ERR649037     PG086-D   PG086 dysplasia
## 18     ERR649036     PG086-T   PG086    tumour
## 19     ERR649053     PG105-N   PG105    normal
## 20     ERR649063     PG105-D   PG105 dysplasia
## 21     ERR649045     PG105-T   PG105    tumour
## 22     ERR649029     PG108-N   PG108    normal
## 23     ERR649028     PG108-D   PG108 dysplasia
## 24     ERR649027     PG108-T   PG108    tumour
## 25     ERR649072     PG114-N   PG114    normal
## 26     ERR649073     PG114-D   PG114 dysplasia
## 27     ERR649074     PG114-T   PG114    tumour
## 28     ERR649069     PG122-N   PG122    normal
## 29     ERR649070     PG122-D   PG122 dysplasia
## 30     ERR649071     PG122-T   PG122    tumour
## 31     ERR649043     PG123-N   PG123    normal
## 32     ERR649033     PG123-D   PG123 dysplasia
## 33     ERR649044     PG123-T   PG123    tumour
## 34     ERR649030     PG129-N   PG129    normal
## 35     ERR649031     PG129-D   PG129 dysplasia
## 36     ERR649032     PG129-T   PG129    tumour
## 37     ERR649019     PG136-N   PG136    normal
## 38     ERR649041     PG136-D   PG136 dysplasia
## 39     ERR649042     PG136-T   PG136    tumour
## 40     ERR649038     PG137-N   PG137    normal
## 41     ERR649039     PG137-D   PG137 dysplasia
## 42     ERR649040     PG137-T   PG137    tumour
## 43     ERR649046     PG144-N   PG144    normal
## 44     ERR649047     PG144-D   PG144 dysplasia
## 45     ERR649048     PG144-T   PG144    tumour
## 46     ERR649049     PG146-N   PG146    normal
## 47     ERR649050     PG146-D   PG146 dysplasia
## 48     ERR649051     PG146-T   PG146    tumour
## 49     ERR649052     PG174-N   PG174    normal
## 50     ERR649055     PG174-D   PG174 dysplasia
## 51     ERR649054     PG174-T   PG174    tumour
## 52     ERR649058     PG187-N   PG187    normal
## 53     ERR649057     PG187-D   PG187 dysplasia
## 54     ERR649056     PG187-T   PG187    tumour
## 55     ERR649066     PG192-N   PG192    normal
## 56     ERR649067     PG192-D   PG192 dysplasia
## 57     ERR649068     PG192-T   PG192    tumour
```

Our actual data is a matrix of read counts: The samples are the columns, the rows the genes, the matrix entries the
number of RNA-Seq reads that mapped to each gene in each sample. Here is the top left corner of `countMatrix`:


```r
countMatrix[ 1:5, 1:5 ]
```

```
##          PG004-N PG004-D PG004-T PG038-N PG038-D
## TSPAN6     11642   25423    1526   37354   30699
## TNMD         405       0    1628     371       0
## DPM1       21828   32694     973   55566   33814
## SCYL3      31332   38436   11661   77985   63853
## C1orf112   14207   21808    8047   25159   25862
```

## An interactive heatmap for quality assessment

When starting to work with such data, it is usually a good idea to first assess the quality of the data. It is unlikely
that all of these many samples are of equally perfect quality. A good way to check is to calculate the correlation or distance between
all pairs of samples. We use Spearman correlation so that we don not have to worry (yet) about how to normalize and transform
the data.


```r
corrMat <- cor( countMatrix, method="spearman" )
corrMat[1:5,1:5]
```

```
##           PG004-N   PG004-D   PG004-T   PG038-N   PG038-D
## PG004-N 1.0000000 0.8927562 0.7745358 0.8963811 0.8948413
## PG004-D 0.8927562 1.0000000 0.7775693 0.9026254 0.9015365
## PG004-T 0.7745358 0.7775693 1.0000000 0.7569003 0.7538902
## PG038-N 0.8963811 0.9026254 0.7569003 1.0000000 0.9363055
## PG038-D 0.8948413 0.9015365 0.7538902 0.9363055 1.0000000
```

We visualize this matrix as a heatmap (using Raivo Kolde's `pheatmap` package)


```r
rownames(sampleTable) <- sampleTable$sample_name  # pheatmap insists on that
pheatmap::pheatmap( corrMat,
   cluster_rows=FALSE, cluster_cols=FALSE,
   annotation_col = sampleTable[,c("patient","tissue")] )
```

![plot of chunk heatmap](figure/heatmap-1.png)

We can see that most samples pairs correlate well with each other, with correlation coefficients
above ~0.85, in the yellow-orange colour range. Same samples, however, show consitently poorer
correlation with all other samples. But is 0.8 really a good cut point, or is this just what the 
arbitrary color scale happens to highlight?

Each square in this heatmap summerizes a scatter plot. For example, the square between relating
to the first two samples, PG004-N and PG004-D, is the Spearman correlation associated with this plot:


```r
plot( 
   log10( 1 + countMatrix[,"PG004-N"] ), 
   log10( 1 + countMatrix[,"PG004-D"] ), 
   asp=1, col=adjustcolor("black",0.2), pch=20, cex=.5 )
```

![plot of chunk scatter](figure/scatter-1.png)

We have plotted here logarithms of the count values, $\log_{10}(k+1)$, with one pseudocount added to avoid zeroes, 
which cannot be shown in a log-log plot, because $\log 0 = -\infty$.

If we looked at several such plots for different squares in the heatmap, maybe some orange ones, a few yellow ones, and
some of the blueish ones, we could get a quick feeling about how good or bad a correlation value of 0.9 or 0.8 is.

With LinkedCharts, we can do precisely that. We can display the two plots side-by-side, and when one clicks with the mouse 
on a square on the heatmap, the scatter plot will change to display the correlation between the two samples associated with 
the heatmap square.

Here is first the code to display the two plots side-by-side, for now without linking them (i.e., without handling mouse clicks):


```r
library( rlc )

openPage( useViewer=FALSE, layout="table1x2" )
```

```
## WebSocket opened
```

```r
lc_heatmap(
   dat(
      value = corrMat
   ),
   place = "A1"
)
```

```
## Chart 'A1' added.
```

```r
sampleX <- "PG004-N"
sampleY <- "PG004-D"

lc_scatter(
   dat(
      x = log10( 1 + countMatrix[,sampleX] ),
      y = log10( 1 + countMatrix[,sampleY] ),
      size = .3,
      opacity = .3
   ),
   place = "A2"
)
```

```
## Chart 'A2' added.
```

```
## Layer 'Layer1' is added to chart 'A2'.
```

To run this code, you first need to install R/LinkedCharts. If you haven't done so yet, see the simple instructions on 
the [overview page](..). 

Once you run the code, you should see, in your web browser, charts like these. (Give the scatter plot a few seconds to appear; it has nearly 60,000 points.) Note how sample names and gene names are displayed when you hover your mouse over a square or point. You can also zoom in (draw a rectangle with the mouse) or out (double-click) or use other functions in the tool menu (click on the arrow button).

<script src = "heatmapData.js"></script>
<div id = "heatmap-scatter">
<table>
   <tr>
      <td id = "heatmap"></td>
      <td id = "scatter"></td>
   </tr>
</table>
</div>
<script src = "heatmap.js"></script>

We go through this code now and explain line for line:

First, we load the R/LinkedCharts package ("`rlc`"). Then, we use `openPage` to open a new page. We can open the page 
either in the web browser (`useViewer=FALSE`) or in the viewer pane of RStudio (`useViewer=TRUE`, the default). As
we have two plots, we opt for a layout with 1 row and 2 columns (`layout="table1x2"`). 

Next, we insert the first chart, the heatmap, using the `lc_heatmap` fucntion. All charts in R/LinkedCharts are placed
with functions starting with `lc_`, and they all want a first argument that sets all their data and that has to be enclosed
in `dat(...)` (which we will explain later). For a heatmap, we just need a matrix, which has to be assigned (in the `dat` phrase)
to `value`. The second argument is the `place` where the chart should be put. In our `table1x2` layout, the places are 
labelled `A1` and `A2`. (If we had, say, a `table2x2` layout, there would also be `B1` and `B2` for the second row.)

Now, we set two global variables, `sampleX` and `sampleY`, to the names of the two samples that we want to initially
display in the scatter plot.

The scatter plot is inserted with `lc_scatter`. Again, its first argument must be enclosed in `dat(...)`. Within the `dat`, we 
set four properties: `x`, `y`, `size` and `opacity`. The first two are mandatory: They are vectors with the values of the x
and y coordinates. As before, when using R's standard `plot` function, we use `log10( 1 + countMatrix[,sample])`. 

The other two properties are optional: We set `size = .3` to make the points a bit smaller than the default, and we make 
them somewhat transparent, by reducing the `opacity`, so that one can see whether several points sit on top of each other 
(similar to the use of `adjustcolor` above). We place the chart at position `A2`, to the right of the heatmap at `A1`.

Next, we need to "link" the charts. For this, we just add four very simple lines, marked below with hashes (#):



```r
library( rlc )

openPage( useViewer=FALSE, layout="table1x2" )
```

```
## WebSocket opened
```

```r
sampleX <- "PG004-N"
sampleY <- "PG004-D"

lc_heatmap(
   dat(
      value = corrMat,
      on_click = function(k) {     #  \  
         sampleX <<- k[1]          #  |  Linking the
         sampleY <<- k[2]          #  |  charts
         updateCharts( "A2" )       #  /
      }
   ),
   place = "A1"
)
```

```
## Chart 'A1' added.
```

```r
countMatrix_downsampled <- 
   countMatrix[ sample.int( nrow(countMatrix), 8000 ), ]

lc_scatter(
   dat(
      x = log10( 1 + countMatrix_downsampled[,sampleX] ),
      y = log10( 1 + countMatrix_downsampled[,sampleY] ),
      size = .3,
      opacity = .3
   ),
   place = "A2"
)
```

```
## Chart 'A2' added.
```

```
## Layer 'Layer1' is added to chart 'A2'.
```

We have added a second property to the heatmap, inside the `dat`. The property `on_click` tells LinkedCharts what to
do when the user clicks on a square in the heatmap. It is a function with one argument, `k`, which R/LinkedCharts will
call whenever a mouse-click event happens in the heatmap, and R/LinkedCharts will then place in `k` the row and column 
indices of the square that was clicked.

Our `on_click` function just does two things: First, it stores the row and column indices (passed as `k[1]` and `k[2]`) in
`sampleX` and `sampleY`, the two global variables that we used to indicate which samples the scatter plot should show. Now, they
indicate that the scatter plot should show the samples corresponding to the square that has just been clicked. We only need to tell
the scatter plot that its data has changes and that it should redraw itself. Hence, the call to `updateCharts`, which causes
the indicated chart (here the one at `A2`) to be redrawn.

Now we can also see why the property assignments have to be enclosed into `dat`: `dat` is a construct that keeps the code it 
encloses in an unevaluated form, so that it can be re-evaluated over and over as needed. And here, the code in the scatter plots
`dat`, e.g., `x = log10( 1 + countMatrix_downsampled[,sampleX] )`, will get a different result whenever `sampleX` has changed.

This is the general idea of LinkedCharts: You describe, with the `dat` properties, how your plot should look like, using global 
variables, which you can change, e.g., when the user clicks somewhere, and the cause the plot to be redrawn. This makes is extremely easy to link charts in the manner just shown.

One subtelty: Because the `on_click` fucntion needs to set a global variable, we have used in it the special global 
assignment operator `<<-` instead of the usual `<-` or `=`. It is important not to foget to use `<<-` as otherwise, R would
create a local variable `sampleX` and discard it immediatly instead of changing the global variable that also the other chart 
can see.

And for completeness: There is a second change in the plot above: We have downsampled the count matrix from 58,000 genes to just 8,000
genes. This is merely to ensure that the app reacts smoothly to mouse clicks also on less powerful computers. It shouldn't change the appearance of the plots much.


If you use the app, you can now easily see which samples are bad and how bad they are. For example, you will notice that they seem to have especially strong noise for the weaker genes.


## Exploring the differentially expressed genes

In the [appendix](data_prep.md), which shows the data preparation, we have also performed a differential expression analysis using limma-voom. For details, see there. In brief, we have looked for genes whose expression differs between the three tissue types. The result table was also in the
data file `oscc.rda` that we have loaded in the beginning:


```r
head( voomResult )
```

```
##          tissuedysplasia tissuetumour   AveExpr         F      P.Value
## TSPAN6        -0.6794364  -1.17596765  3.940362 17.369998 2.751020e-06
## TNMD          -2.2216329   0.29408807 -4.690724  4.164227 2.206521e-02
## DPM1           0.3353803   0.14224571  3.551261  1.659938 2.018351e-01
## SCYL3          0.2533487   0.06609826  4.212959  2.152911 1.282229e-01
## C1orf112       0.3422943   0.32698821  3.350802  3.262281 4.774102e-02
## FGR            0.6687112   1.06189945  2.673165  7.042142 2.221402e-03
##             adj.P.Val
## TSPAN6   8.515251e-05
## TNMD     7.345409e-02
## DPM1     3.391010e-01
## SCYL3    2.492604e-01
## C1orf112 1.264950e-01
## FGR      1.397246e-02
```

Here, `tissuedysplasia` and `tissuetumour` are the log fold changes (LFCs) between dysplasia an normal, and between tumour and normal, respectively. `P.Value` is the p value from an F test comparing the the three tissue types after account for patient-to-patient baseline differences, and `adj.P.Val` is the result of a Benjamini-Hochberg adjustment.

The following code shows how to use R/LinkedCharts to explore these results

```r
openPage( useViewer=FALSE, layout="table1x2" )
```

```
## WebSocket opened
```

```r
gene <- 1

lc_scatter(
   dat(
      x = voomResult$AveExpr,
      y = voomResult$tissuetumour,
      color = ifelse( voomResult$adj.P.Val < 0.1, "red", "black" ),
      label = rownames(voomResult),
      size = 1.3,
      on_click = function(k) { gene <<- k; updateCharts("A2") }
   ),
   "A1"
)
```

```
## Chart 'A1' added.
```

```
## Layer 'Layer1' is added to chart 'A1'.
```

```r
countsums <- colSums(countMatrix)

lc_scatter(
   dat(
      x = sampleTable$patient,
      y = countMatrix[gene,] / countsums * 1e6 + .1,
      logScaleY = 10,
      colorValue = sampleTable$tissue,
      title = rownames(countMatrix)[gene],
      axisTitleY = "counts per million (CPM)",
      ticksRotateX = 45
   ),
   "A2"
)
```

```
## Chart 'A2' added.
```

```
## Layer 'Layer1' is added to chart 'A2'.
```

<script type="text/javascript" src = "maData.js"></script>
<div id = "ma-expr">
<table>
   <tr>
      <td id = "ma"></td>
      <td id = "expr"></td>
   </tr>
</table>
</div>	
<script type="text/javascript" src="maPlot.js"></script>

The left plot is an MA plot: Each point is one gene in the result table, the x axis is the average expression of the gene (column `AveExpr` in `voomResult`), the y axis is the log fold change between tumour and normal tissue (column `tissuetumour`). The colour of the points is red or black, indicating whether the gene is significant at 10% false discovery rate (`voomResult$adj.P.Val < 0.1`). If one hovers the mouse over a point, the gene name is shown, which is taken from the rownames of the result table (`label = rownames(voomResult)`).

The right plot now shows details of a selected gene, and as before, there is a global variable, `gene`, which contains a number, indicating a row and hence a gene in the results table and the count matrix. (The rows of both `voomResults` and `countMatrix` are in the same order). Each point in the plot is one sample, the x position indicates the patient (`x = sampleTable$patient`) and the colour the tissue type (`colorValue = sampleTable$tissue`). The y axis shows the expression of the selected gene (`countMatrix[gene,]`; remember that the rows in `countMatrix` and `resultsTable` are in the same order). We display the expression of the gene as "counts per million" (CPM). To this end, we divide the count value by the total count for each libary (`countsums = colSums(countMatrix)`) and multiply by one million (`1e6`). We also add 0.1 pseudocounts to avoid losing zeroes on the axis, which we have made logarithmic with decadic tick marks (`logScaleY = 10`). Ticks on the other axis are rotated by 45 degrees (`ticksRotateX = 45`) so that they don't overlap with each other. Above the plot, a title shows the name of the displayed gene, as given by the rowname of the result table (`title = rownames(countMatrix)[gene]`).

Note here that in the left plot, we used `colour`, in the right plot `colourValue`: The difference is that in the left plot, we passed a string vector with elements that directly prescribe a color (`"red"` or `"black"`), in the right plot, we pass a word (`normal`, `dysplasia` or `tumour`) and expect LinkedCharts to choose three colours to map these to. LinkedCharts therefore also adds a legend.

Describing the two plots did not require more R code than when describing the same plots, when using e.g., ggplot2. To link the two plots, we 
only needed a single extra line: `on_click = function(k) { gene <<- k; updateCharts("A2") }`
As explained before, this simply changes the gloabl variable `gene` to the index of the point the user clicked to and then redraws the
right-hand plot: There, reevaluating the content of the `dat` call gives the new plot, because `gene` has changed and now, another row of the `countMatrix` is used.

If you play a bit with these linked charts you will quickly notice that they are helpful to gain a better feel for the data. You will quickly see how common it is that a gene really behaves the same way in all patients, and how strong such changes are; and you might even come up with ideas for a better statistic to use as y axis in the left-hand plot to really find the genes with the most consistant patterns.

<!--

Lastly, you may want to examine interesting genes. What is INHBA, for example? A look at [Gene Cards](https://www.genecards.org/) might tell as more, but entering each gene symbol in Gene Cards' search box is cumbersome. As Gene Cards URLs always have the form `https://www.genecards.org/cgi-bin/carddisp.pl?gene=SYMBOL`, with `SYMBOL` replaced by some gene symbol, we could automatically put a link below the right-hand plot. Here's the code from above, with a few more lines to this end:

-->
