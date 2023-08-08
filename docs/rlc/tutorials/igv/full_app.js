var igvBrowser;

var maPlot = lc.scatter()
    .x(i => maData[i].AveExpr)
    .y(i => maData[i].tissuetumour)
    .colour(i => maData[i]["adj.P.Val"] < 0.1 ? "red" : "black")
    .label(i => maData[i].geneNames)
    .size(1.3)
    .on_click(i => {igvBrowser.search("chr" + maData[i].chr + ":" + maData[i].start + "-" + maData[i].end)})
    .width(400)
    .height(400)
    .set_paddings({left: 15})
    .place(d3.select("#A1"));

document.addEventListener("DOMContentLoaded", function () {
    var div = document.getElementById("A2");
   var options = {
    locus: "TSPAN6",       // OPTIONAL, open at a specific location
      genome: "hg38"
   };
   igv.createBrowser(div, options)
        .then(function (b) {
        igvBrowser = b;
      
           var site = "https://papagei.bioquant.uni-heidelberg.de/sveta/oscc_bam/",
            samples = ["PG079_dysplasia", "PG079_normal", "PG079_tumour"],
            trackConfigs = samples.map(s => ({
                name: s, 
                type: "alignment", 
                format: "bam", 
                height: 150,  
                url: site + s + ".bam", 
                indexURL: site + s + ".bam.bai"
            }));

           igvBrowser.loadTrackList(trackConfigs);
      })
})