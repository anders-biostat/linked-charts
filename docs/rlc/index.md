# R/LinkedCharts

R/LinkedCharts is a powerful novel way to perform exploratory data analysis in R. With only very few lines of code, you can create interactive data visualization apps that allow you to simuyltaneously get an overview of your data and dive deeply into details.

See the Examples and Tutorials section for simple (and more complex) usage examples.

## Installation

To install R/LinkedCharts, start R and type

```r
install.packages( "devtools" )
devtools::install_github( "anders-biostat/JsRCom" )
devtools::install_github( "anders-biostat/rlc" )
```


## Examples and Tutorials

#### Understanding RNA-Seq data

**This simple tutorial** [being written] shows how R/LinkedCharts can help you with a standard bioinformatics task: analysing an RNA-Seq data set, here of tissue samples from patients with oral cancer. The tutorial shows how scatter plots and heatmaps can easily be interactively combined. This is a good start into R/LinkedCharts

#### Exploring single-cell data

[**This tutorial**](citeseq/example_1.html) uses the "CiteSeq" data set by Stoecklin et al. to demonstrate how LinkedCharts can help you to understand your single-cell transcriptomics data. It introduces `lc_scatter`, the workhorse of R/LinkedCharts, which produces interactively linked scatter plots. Like the previous one, this tutorial is a good way to get started and get a quick idea what you can do with R/LinkedCharts.

#### A multicolored t-SNE plot

[**This tutorial**](citeseq/example_2.html) continues from the previous one and demonstrated how you can leverage standard HTML5 and JavaScript techniques and make them interact smoothly with R/LinkedCharts functions.


## Questions

If you have any questions, send us an e-mail, or, even better, ask them at the [R/LinkedCharts Issue Tracker](https://github.com/anders-biostat/rlc/issues).


## Authors

LinkedChart and R/LinkedChart are being developed by Svetlana Ovchinnikova (s.ovchinnikova@zmbh.uni-heidelberg.de, [kloivenn](https://github.com/kloivenn) on GitHub) and Simon Anders (s.anders@zmbh.uni-heidelberg.de, [simon-anders](https://github.com/simon-anders) on GitHub). We are researchers at the [Center for Molecular Biology of the University of Heidelberg](https://www.zmbh.uni-heidelberg.de/).