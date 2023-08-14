---
usePrism: true
title: "R/LinkedCharts"
showGallery: "true"
---

# R/LinkedCharts

R/LinkedCharts is a powerful novel way to perform exploratory data analysis in R. With only very few lines of code, you can create interactive data visualization apps that allow you to simultaneously get an overview of your data and dive deeply into details.

<div class="gallery"></div>

See the examples above and the Tutorials section in the navigation menu for simple (and more complex) usage examples.

## Installation

R/LinkedCharts is available on CRAN as the `rlc` package. To install R/LinkedCharts, start R and type

```r
install.packages("rlc")
```

A more recent version can be installed from our [GitHub repo](https://github.com/anders-biostat/rlc).

```r
install.packages( "devtools" )
devtools::install_github( "anders-biostat/rlc" )
```

## Examples and Tutorials

#### Understanding RNA-Seq data

[**This simple tutorial**](tutorials/oscc.html) shows how R/LinkedCharts can help you with a standard bioinformatics task: analysing an RNA-Seq data set, here of tissue samples from patients with oral cancer. The tutorial shows how scatter plots and heatmaps can easily be interactively combined. This is a good start into R/LinkedCharts

#### Exploring single-cell data

[**This tutorial**](tutorials/citeseq1.html) uses the "CiteSeq" data set by Stoecklin et al. to demonstrate how LinkedCharts can help you to understand your single-cell transcriptomics data. It introduces `lc_scatter`, the workhorse of R/LinkedCharts, which produces interactively linked scatter plots. Like the previous one, this tutorial is a good way to get started and get a quick idea of what you can do with R/LinkedCharts.

#### A multicoloured t-SNE plot

[**This tutorial**](tutorials/citeseq2.html) continues from the previous one and demonstrates how you can leverage standard HTML5 and JavaScript techniques and make them interact smoothly with R/LinkedCharts functions.

#### User input

[**Here**](tutorials/inputs.html) you can learn how to add forms for user input and use this input to change your charts.

#### Customise your chart

[**Here**](tutorials/props.html) you can find use cases of all the adjustable parameters in R/LinkedCharts. This tutorial demonstrates how to youse colours, change the shape of elements, add titles, use all built-in parameters to control interactivity, etc.

#### Further customisation

[**Here**](tutorials/inputs.html) possibilities of the **jrc** package, which is the foundation of R/LinkedCharts are explored. As an example, we combine R/LinkedCharts with the [IGV](https://software.broadinstitute.org/software/igv/) browser.

## Jupyter notebooks

Since an R session in Jupiter Notebook is not considered interactive, no messages from the app will be processed without an explicit command. This means that an R/LinkedCharts app, while remaining fully functional, cannot run without blocking the R session. Use `listen` function to do so.

For example,
```r
listen(activeSessions = TRUE)
```
will make R session to listen to the R/LinkedCharts app until there at least one web page connected to the app. Closing all the opened pages will unblock the R session. You can also interrupt this function at any moment to return control over the R session and then run it again to restore the app's functionality. Any changes to the R session's environment done via the app will be stored.

## Questions

If you have any questions, send us an e-mail, or, even better, ask them at the [R/LinkedCharts Issue Tracker](https://github.com/anders-biostat/rlc/issues).

## Authors

LinkedChart and R/LinkedChart are being developed by **Svetlana Ovchinnikova** ([s.ovchinnikova@zmbh.uni-heidelberg.de](mailto:s.ovchinnikova@zmbh.uni-heidelberg.de), [kloivenn](https://github.com/kloivenn) on GitHub) and **Simon Anders** ([s.anders@zmbh.uni-heidelberg.de](mailto:s.anders@zmbh.uni-heidelberg.de), [simon-anders](https://github.com/simon-anders) on GitHub). 

We are researchers at the [Center for Molecular Biology of the **University of Heidelberg**](https://www.zmbh.uni-heidelberg.de/).