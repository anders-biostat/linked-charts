---
title: "R/LinkedCharts Tutorial"
usePrism: true
useLC: true
---

<!-- From the parent directory only! -->
<!-- knitr::knit("igv/igv.Rmd", "igv.md") -->

## R/LinkedCharts Tutorial
# Use JRC package to combine LinkedCharts with other tools

R/LinkedCharts is built on top of the [JRC package](https://CRAN.R-project.org/package=jrc), which enables communication between the R session and a web page. Therefore, the flexibility of R/LinkedCharts is not limited to customized callback functions in R but can also extend to custom actions on the web page via JavaScript commands. One of the applications of such flexibility is linking charts to other web-based services. In this tutorial, we show how to combine R/LinkedCharts with the [Integrative Genomic Viewer (IGV)](https://software.broadinstitute.org/software/igv/).

Below is the app that we are going to build.

<script type="text/javascript" src = "igv/oscc_no_counts.js"></script>
<script type="text/javascript" src = "igv/igv.min.js"></script>
<div id = "top">
<table>
   <tr>
      <td id = "A1"></td>
      <td id = "A2"></td>
   </tr>
</table>
</div>		
<script type="text/javascript" src="igv/full_app.js"></script>

To the left in the MA-plot that shows differential gene expression between normal and tumour tissues from <a href="https://doi.org/10.18632/oncotarget.5529">Conway et al. (2015)</a>. As is described in more details in [this](oscc.md) tutorial, 19 cancerous samples
from patients with oral cancer are compared with healthy tissue samples from the same patients. Each point in the plot corresponds to a gene with its 
average expression on the X-axis and log-fold change between tumour and healthy tissue on the Y-axis. In red are shown the genes with significant difference
in expression (*adj. p-value < 0.1*).

To the right, IGV allows to explore the reads alignment for one of the patients. When user clicks on a point from the MA-plot, the IGV automatically shows the corresponding genome region, thus allowing to explore the reads that were aligned to the selected gene. Here, we subset the reads to include only 5,000,000 
sequences per sample. The aligned reads and the corresponding index files can be downloaded [here](https://papagei.bioquant.uni-heidelberg.de/sveta/oscc_bam/oscc_bam.zip) *(file size is 2.3 GB!)*.

## Open an HTML file

By default, R/LinkedCharts adds plots to an empty web page with only the *linked-charts.js* library loaded.
However, it is also possible to open any existing HTML page with the predefined layout and functionality.
For this tutorial, we will use [this example](https://igv.org/web/release/2.2.2/examples/localBam.html) from the IGV team, 
which demonstrates how to load local .bam files into the IGV. The page contains the IGV with already loaded *hg19* version of
the human genome assembly, a button that opens a dialog menu to open local .bam files and a navigation text field. We will not
go through the example code since the IGV functionality is out of scope of this tutorial. More on the *igv.js* usage can be found
[here](https://github.com/igvteam/igv.js/).

The provided example is fully functional and can be used by R/LinkedCharts, but we still add some minor changes.

First, there is a `<div>` container to which the IGV browser will be added (Lines 41-42). We remove it, and instead add a table with two cells:
one for the MA-plot and the other for the IGV browser.

```
<table><tr>
    <td id="A1"></td>
    <td id="A2"></td>
</tr></table>
```

In Line 53 we now need to replace the removed gene ID `"myDiv"` with the ID of the table cell `"A2"`.

We also remove the header (Line 20), list of loaded files (Lines 27-29 and Lines 77-82), and the Goto text field (Lines 31-37 and Lines 67-70). Since our example reads were aligned to a later version of the genome assembly, in Line 57 we replace `"hg19"` with `"hg38"` (this version is also provided by the IGV team). The page with all the changes described above can be downloaded [here](igv/localBam.html).

Now, with all the preparations complete, we can switch to the R session.

To open with R/LinkedCharts an existing web page, one needs to use the `startPage` argument of the `openPage` function.


```r
app <- openPage(useViewer = FALSE, startPage = "localBam.html")
```

```
## Error in openPage(useViewer = FALSE, startPage = "localBam.html"): could not find function "openPage"
```

This command with open the `localBam.html` page in the default browser. The functional IGV browser will already be there, but we still need to add 
an MA-plot.

## The "app" object and running the JavaScript code

The read may have already noticed that unlike in our other tutorials, here we store the result of the `openPage` function to the `app` variable.
The object returned by the `openPage` function stores all the information about the running app and can be used for custom communication between 
the R session and each of the web pages connected to it. We need it to run some JavaScript code in response to mouse clicks on the MA-plot points.

First, we need to load the required data, which can be downloaded from [here](igv/oscc.rda).


```r
load( "oscc.rda" )
```

Now, we have everything to complete the app by adding the MA-plot. 


```r
lc_scatter(dat(
  x = voomResult$AveExpr,
  y = voomResult$tissuetumour,
  color = ifelse( voomResult$adj.P.Val < 0.1, "red", "black" ),
  label = rownames(voomResult),
  size = 1.3,
  on_click = function(k) {
    position <- paste0("chr", gene_positions[k, "chr"], ":", 
                       gene_positions[k, "start"], "-", 
                       gene_positions[k, "end"])
    com <- paste0("igvBrowser.search('", position, "')")
    app$getSession(.id)$sendCommand(com)
    } ),
  "A1")
```

```
## Error in lc_scatter(dat(x = voomResult$AveExpr, y = voomResult$tissuetumour, : could not find function "lc_scatter"
```

The detailed explanations of most part of this code are given in [this](oscc.md) tutorial. Here, we will only go throug 
the `on_click` function. It now has three commands. First, we use the index of a clicked point to construnct the position
of the selected gene in the genome in the format that is understood by the IGV browser (for example, `chr12:98986464-98997143`).
Second, we construct a JavaScript command for the browser to show the specified position. `igvBrowser` here is a variable that
stores the browser object (it is defined in Line 62 of the provided example). This object has method `search`, that accepts gene names
or genomic locations. Finally, we need to run this command on the web page. To do this, we first need to get the specific connection 
that called the `on_click` functtion: `app$getSession(.id)`. If you're running the app locally, there is usually just one active session
and the `.id` argument becomes optional. It is required only if the app is running on the server and can be accessed by multiple users 
simultaneously. Then we can use the session to send our JavaScript command with the `sendCommand` function, which is a part of the [JRC package](https://CRAN.R-project.org/package=jrc). This simple function accepts any code as a string, sends it to the web page and executes it there.
In our example, it changes the currently shown genome region.
