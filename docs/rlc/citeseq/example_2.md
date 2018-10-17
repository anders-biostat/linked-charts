## R/LinkedCharts Tutorial: Example 2
# A multi-coloured t-SNE plot

In this example, we continue our exploration of the CiteSeq cord blood single-cell dataset by Stoecklin et al. ([Nature Methods, 2017](https://doi.org/10.1038/nmeth.4380)). If you haven't read the [first part](example_1.md) yet, please go there first.

This is what we are aiming for:

![](example_2_screenshot.png)

In the life version of this app, you can assign a colour channel to each antibody, and so explore the identities of the cells in a colourful manner. If you want to try this out first before reading the details, [here is the complete code](example_2_complete.R). It's less than a page of R.

## Loading the data

The CiteSeq method presented by Stoecklin et al. in their paper is a way to simultaneously sequence the transcriptome and the "epitome" of thousands of single cells, where "epitome" means a collection of surface markers (epitopes) of the cells: they conjugated antibodies for NN different blood cell surface markers with DNA oligomers, which they sequenced alongside the cell's own transcripts, thus getting counts of sequencing reads from the labelled antibody molecules, which they denote "antibody-derived tags" (ADTs). 

We have already explored the transcriptome data in the first part of this tutorial. Now, we will use the epitome data to learn more about the cells' identities. 

We start by loading again the `rlc` library and the CiteSeq data file that we have prepared in the first part, and which you can download [here](https://github.com/anders-biostat/rlc_tutorial/blob/master/citeseq_example/citeseq_data.rda?raw=true).


```r
library( rlc )

load( "citeseq_data.rda" )
```

We also download the [epitome data table](ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE100nnn/GSE100866/suppl/GSE100866_PBMC_vs_flow_10X-ADT_umi.csv.gz) (ADT table) from [GEO](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE100866).


```r
download.file( "ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE100nnn/GSE100866/suppl/GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz",
   "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" )

countMatrixADT <- as.matrix( read.csv( gzfile( "GSE100866_CBMC_8K_13AB_10X-ADT_umi.csv.gz" ), row.names=1 ) )
```

We first subset the matrix to only those rows that describe the cells that we had retained when filtering the RNA count matrix:


```r
countMatrixADT <- countMatrixADT[ , colnames(countMatrix) ]
```

We now have UMI count values for antibody-derived tags (ADTs) from antibodies against 13 epitopes, for ~8000 cells. Here are the first 4 cells:


```r
countMatrixADT[ , 1:4 ]
```

```
##        TACAGTGTCTCGGACG GTTTCTACATCATCCC ATCATGGAGTAGGCCA GTACGTATCCCATTTA
## CD3                  36               34              370               49
## CD4                  28               21             1706               38
## CD8                  34               41             9559               52
## CD45RA              228              228           102390              300
## CD56                 26               18             1518               48
## CD16                 44               38             4617               51
## CD10                 41               48              363               48
## CD11c                25               16             8204               41
## CD14                 44               57             4402               89
## CD19                 24               27              988               29
## CD34                 24              230              422               57
## CCR5                 28               24              879               42
## CCR7                 24               27              239               36
```

## A multi-channel flourescent t-SNE plot

Last time, we calculated from the RNA-Seq data a t-SNE plot. If we want to know which of these cells are T cells, we cold colour the cells by the strength of expression of the [T-cell marker CD3](https://en.wikipedia.org/wiki/CD3_(immunology)):


```r
unitrange <- function( x )
  ( x - min(x) ) / ( max(x) - min(x) )

plot( tsne$Y, 
   col = rgb( unitrange( log( countMatrixADT[ "CD3", ] ) ), 0, 0 ),
   asp = 1, pch=20, cex=.5 )
```

![plot of chunk unnamed-chunk-5](figure/unnamed-chunk-5-1.png)

Here, we have defined a function `unitrange`, which simply takes a vector of numbers (here, the logarithmized expression of the CD3 epitope) and scales them such that the smallest number becomes 0 and the largest 1. This is what the `rgb` function wants: three numbers, all between 0 and 1, which is uses to mix a colour with the specified amount of red (R), green (G) and blue (B). (If you are unfamiliar with the RGB color model, look it up, e.g., [on Wikipedia](https://en.wikipedia.org/wiki/RGB_color_model).)

To see, for example, both T cells and B cells on one glance, we could continue to use the red channel for CD3 and the green channel for [CD19](https://en.wikipedia.org/wiki/CD19), a B-cell marker:


```r
plot( tsne$Y, 
   col = rgb( 
     unitrange( log( countMatrixADT[ "CD3", ] ) ),    # red channel:   T cell marker
     unitrange( log( countMatrixADT[ "CD19", ] ) ),   # green channel: B cell marker
     0 ),                                             # blue channel:  not used
   asp = 1, pch=20, cex=.5 )
```

![plot of chunk unnamed-chunk-6](figure/unnamed-chunk-6-1.png)

Is the big cluster on top, with the brownish red-green mix now a B or a T cell, or something else. It would be nice to be able to quickly explore all the markers by attaching to them red, green or blue "virtual flourophores" on the click of a button. This is what the app, depcited as screen shot on top, allows us to do.

## The browser talks back to R

To build it, we need to construct the matrix of radio buttons, put it to the right of a LinkedChart scatter plot (`lc_scatter`) of the t-SNE, and link the two components.

First, on terminology, for readers unfamiliar with web or GUI development: A radio button is a button, which is part of a group, such that only one button can be checked at a time. If several buttons of the same groups can be checked simultaneously, we call them "checkboxes". Usually, radiobuttons are circles and check boxes are squares. In HTML coding, both are created with the `<input>` tag.

We can use the R package `hwriter` to conviniently produce HTML code. 


```r
library( hwriter )
```

For example, to make a radio button, we can use hwriter's `hmakeTag` function:

```r
hmakeTag( "input", "a radio button", type="radio" )
```

```
## [1] "<input type=\"radio\">a radio button</input>"
```

As we did in Part 1, we can make a vector of three such buttons and hand them to `hwrite` to form a nice html table.


```r
s <- hwrite( hmakeTag( "input", paste( "Button", 1:3), type="radio" ) )

s
```

```
## [1] "<table border=\"1\">\n<tr>\n<td><input type=\"radio\">Button 1</input></td><td><input type=\"radio\">Button 2</input></td><td><input type=\"radio\">Button 3</input></td></tr>\n</table>\n"
```

How does this HTML text looks like in a web browser? Let's quickly save it and display it, using R/LinkedCharts's `openPage` function:


```r
writeLines( s, "test.html" )
rlc::openPage( startPage = "test.html" )
```

```
## [1] "Reading /home/anders/w/repos/rlc_tutorial/citeseq_example/test.html"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/JsRCom//http_root/JsRCom.js"
## [1] "WebSocket opened"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.css"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/rlc.js"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.min.js"
```
You should see this:

<table border="1">
<tr>
<td><input type="radio">Button 1</input></td><td><input type="radio">Button 2</input></td><td><input type="radio">Button 3</input></td></tr>
</table>

(Two notes: (i) We have to write `rlc::` in front of `openPage` because, unfortunately, the `hwriter` package also has an `openPage` function, and R might take the wrong one. (ii) We could also simply have used standard R's `browseURL` function instead of `rlc::openPage`, but `rlc` offers extra functionality, which we will use further down.)

If you run this and try it out you will see that the buttons are not yet connected: you can click multiple ones, because your browser does not know that they are supposed to from a group. To achieve this, we have to give them the same `name` attribute. Also, nothing happens if you click them. 

As we serve the page with R/LinkedCharts, we can use a functionality of the `JsRCom` package that it uses: We can ask the browser to send back data to the R session using a JavaScript function called `jrc.sendData`, which is among the function that JsRCom "spikes" into any web page it serves.

This may sound complicated but is very simple. We first build our radio buttons as before:


```r
radiobuttons <-
  hmakeTag( "input", 
    paste( "Button", 1:3 ), 
    type = "radio", 
    name = "mygroup", 
    value = paste0( "B", 1:3 ),
    onchange = "jrc.sendData( 'radio', this.value )" )

radiobuttons
```

```
## [1] "<input type=\"radio\" name=\"mygroup\" value=\"B1\" onchange=\"jrc.sendData( 'radio', this.value )\">Button 1</input>"
## [2] "<input type=\"radio\" name=\"mygroup\" value=\"B2\" onchange=\"jrc.sendData( 'radio', this.value )\">Button 2</input>"
## [3] "<input type=\"radio\" name=\"mygroup\" value=\"B3\" onchange=\"jrc.sendData( 'radio', this.value )\">Button 3</input>"
```

We have now just added a few more attributes. `input` refers to the HTML `<input>` tag. The next argument is the label, `Button i`. Then, `type="radio"` to make it a radio button, `name="mygroup"` to make all three buttons part of the same group (so that only one of them can be checked), a "value", which is `B1`, `B2`, or `B3`, and, finally, the `onchange` attribute, which contains the JavaScript code that the browser should execute whenever the radio buttons change, e.g., due to a user clicl. You don't need to kmnow JavaScript to use this, because we simple send the data stright back to R: `jrc.sendData( 'radio', this.value )` means: send the content of the `value` tag (i.e., `B1`, `B2`, or `B3`) to R, where it should appear in a global variable called `radio`.

Try it out: Write the tags to a file, serve it with `rlc`, click the buttons and then, after the click, switch back to the window with your R session and observe how a variable called `radio` has appeared whose content magically changes whenever you press one of the radio buttons.

```r
writeLines( radiobuttons, "test.html" )
rlc::openPage( startPage = "test.html" )
```

Click a button, then try

```r
> radio
[1] "B1"
```

The try changing the `onchange` line above to 

```
   onchange = "jrc.sendData( 'radio', this.value ); jrc.sendCommand( 'print(radio)' )"
``` 

to cause R to execute the R command `print(radio)` and thus print the value on your R console the moment you press the button.

Besides sending R commands from the browser to R, JsRCom can also send JavaScript command from R to the web browser. Type this here in R to cause your browser to greet you. (`alert` is a JavaScript function directing the browser to display a message in a dialog box.)

```r
JsRCom::sendCommand(
  'alert( "Hello from R" )' )
```


## Making a matrix of buttons

With these ingredients, we can now make our matrix of buttons


```r
buttonRows <- c( "off", rownames(countMatrixADT) )
buttonCols <- c( "red", "green", "blue" )

buttonMatrix <- outer( buttonRows, buttonCols, function( row, col ) 
   hmakeTag( "input",   
      type = "radio",       # it's radio buttons again
      name = col,           # each column (red, green or blue) is one group
      value = row,          # the rowname (an antibody, or "off") is the value
      onchange = "jrc.sendData( this.name, this.value ); jrc.sendCommand( 'updateChart()' )" ) ) 

rownames(buttonMatrix) <- buttonRows
colnames(buttonMatrix) <- buttonCols
```

In case you haven't seen the base R function `outer` yet: It creates a matrix with the specified rows and columns, and fills each matrix element with the value returned by the specified function when given one element from the row and one from the columns vector. We hence get a 14x3 matrix of strings, each of the HTML code to describe a button


```r
str( buttonMatrix )
```

```
##  chr [1:14, 1:3] "<input type=\"radio\" name=\"red\" value=\"off\" onchange=\"jrc.sendData( this.name, this.value ); jrc.sendComm"| __truncated__ ...
##  - attr(*, "dimnames")=List of 2
##   ..$ : chr [1:14] "off" "CD3" "CD4" "CD8" ...
##   ..$ : chr [1:3] "red" "green" "blue"
```

If we give this code to `hwrite`, it will make a nice HTML table out of it, which we can display:


```r
hwrite( buttonMatrix, page="test.html" )
rlc::openPage( startPage="test.html" )
```

```
## [1] "Reading /home/anders/w/repos/rlc_tutorial/citeseq_example/test.html"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/JsRCom//http_root/JsRCom.js"
## [1] "WebSocket opened"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.css"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/rlc.js"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.min.js"
```

You should see this in your browser or viewer pane:

<table border="1">
<tr>
<td></td><td>red</td><td>green</td><td>blue</td></tr>
<tr>
<td>off</td><td><input type="radio" name="red" value="off"></input></td><td><input type="radio" name="green" value="off"></input></td><td><input type="radio" name="blue" value="off"></input></td></tr>
<tr>
<td>CD3</td><td><input type="radio" name="red" value="CD3"></input></td><td><input type="radio" name="green" value="CD3"></input></td><td><input type="radio" name="blue" value="CD3"></input></td></tr>
<tr>
<td>CD4</td><td><input type="radio" name="red" value="CD4"></input></td><td><input type="radio" name="green" value="CD4"></input></td><td><input type="radio" name="blue" value="CD4"></input></td></tr>
<tr>
<td>CD8</td><td><input type="radio" name="red" value="CD8"></input></td><td><input type="radio" name="green" value="CD8"></input></td><td><input type="radio" name="blue" value="CD8"></input></td></tr>
<tr>
<td>CD45RA</td><td><input type="radio" name="red" value="CD45RA"></input></td><td><input type="radio" name="green" value="CD45RA"></input></td><td><input type="radio" name="blue" value="CD45RA"></input></td></tr>
<tr>
<td>CD56</td><td><input type="radio" name="red" value="CD56"></input></td><td><input type="radio" name="green" value="CD56"></input></td><td><input type="radio" name="blue" value="CD56"></input></td></tr>
<tr>
<td>CD16</td><td><input type="radio" name="red" value="CD16"></input></td><td><input type="radio" name="green" value="CD16"></input></td><td><input type="radio" name="blue" value="CD16"></input></td></tr>
<tr>
<td>CD10</td><td><input type="radio" name="red" value="CD10"></input></td><td><input type="radio" name="green" value="CD10"></input></td><td><input type="radio" name="blue" value="CD10"></input></td></tr>
<tr>
<td>CD11c</td><td><input type="radio" name="red" value="CD11c"></input></td><td><input type="radio" name="green" value="CD11c"></input></td><td><input type="radio" name="blue" value="CD11c"></input></td></tr>
<tr>
<td>CD14</td><td><input type="radio" name="red" value="CD14"></input></td><td><input type="radio" name="green" value="CD14"></input></td><td><input type="radio" name="blue" value="CD14"></input></td></tr>
<tr>
<td>CD19</td><td><input type="radio" name="red" value="CD19"></input></td><td><input type="radio" name="green" value="CD19"></input></td><td><input type="radio" name="blue" value="CD19"></input></td></tr>
<tr>
<td>CD34</td><td><input type="radio" name="red" value="CD34"></input></td><td><input type="radio" name="green" value="CD34"></input></td><td><input type="radio" name="blue" value="CD34"></input></td></tr>
<tr>
<td>CCR5</td><td><input type="radio" name="red" value="CCR5"></input></td><td><input type="radio" name="green" value="CCR5"></input></td><td><input type="radio" name="blue" value="CCR5"></input></td></tr>
<tr>
<td>CCR7</td><td><input type="radio" name="red" value="CCR7"></input></td><td><input type="radio" name="green" value="CCR7"></input></td><td><input type="radio" name="blue" value="CCR7"></input></td></tr>
</table>

Note the `onchange` attribute. We change an R variable with the names `red`, `green` or `blue`, then we call `updateChart`. The latter will not do anything, as we haven't added any charts yet, but you can already check whether the variables appear once you check a radiobutton.

```r
> red
[1] "CD8"
> green
[1] "CD45RA"
> blue
[1] "CD10"
```

One minor inconvenience is that, so far, none of the radio buttons are initially checked. We could set the `checked` attribute for the buttons in the first row (those with `value="off"`) in the code above that constructs the button matrix. Another possibility is to send a JavaScript command to do so:

```r
JsRCom::sendCommand(
  'd3.selectAll("input[type=radio][value=off]").attr( "checked", "yes" )' )
```

Maybe, the R way of changing the `buttonMatrix` code above is easy to understand for developers without JavaScript knowledge. For those with JavaScript experience, the following explanations will be helpful: LinkedChart builds on top of [D3](https://d3js.org/); therefor, we can use D3 commands, such as `d3.selectAll`. We specify a [CSS selector](https://www.w3schools.com/cssref/css_selectors.asp) to select all `<input>` tags with attribute `type=radio` (i.e., all radio buttons) and attribute `value=off` (i.e., those in the first row, which is labelled "off"). For these, we create a new attribute, `checked`, and set it to some arbitrary value. 

As the changes the radiobutton, the `onchange` event is triggered, and our `onchange` code is run, causing the R variables `red`, `green`, and `blue` to be put to the correct value, `"off"`.


## Adding the scatter chart

Where should our chart go? Before or to the left of the scatter plot. Let's put an empty `<div>` tag there, to mark the place, by setting the div tag's `id` attribute to some arbitrary label. Then we put the button matrix next. 


```r
writeLines(
   hwrite( c(
      hmakeTag( "div", id="tsneChart" ),
      hwrite( buttonMatrix ) ) ), 
   "rgbTSNE.html" )
```

Then, we make R/LinkedChart serve the HTML file that we have just created and ask it to place a scatter plot next to it.


```r
rlc::openPage( FALSE, startPage="rgbTSNE.html" )
```

```
## [1] "Reading /home/anders/w/repos/rlc_tutorial/citeseq_example/rgbTSNE.html"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/JsRCom//http_root/JsRCom.js"
## [1] "WebSocket opened"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.css"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/rlc.js"
## [1] "Reading /home/anders/R/x86_64-pc-linux-gnu-library/3.4/rlc//http_root/linked-charts.min.js"
```

```r
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
```

```
## [1] "main"
## [1] "Layer1"
```

Now, we get our app:

![](example_2_screenshot.png)

It's simple and functional, though maybe not as beautiful as it could be. However, if you know a bit about web design, it is easy to edit the HTML file, `rgbTSNE.html`, and add decorations, or attach a suitable CSS style sheet. In this manner, one can first make a simple app with few lines, and then polish it later.
