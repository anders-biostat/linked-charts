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
        })
})

function load() {
    var fileWidget = document.getElementById("fileWidget");
    var files = fileWidget.files;

    // Find BAM files and cache index files.  Note there are 2 index naming conventions, .bam.bai and .bai
    // This scheme catches both.
    var bamFiles = [];
    var indexFiles = {};

    for (let file of files) {
        if (file.name.endsWith(".bam")) {
            bamFiles.push(file);
        }
        else if (file.name.endsWith(".bai")) {
            var key = getKey(file.name);
            indexFiles[key] = file;
        }
        else {
            alert("Unsupported file type: " + file.name);
        }
    }
    // Create track objects
    var trackConfigs = [];

    for (let file of bamFiles) {
        var key = getKey(file.name);
        var indexFile = indexFiles[key];
        if (indexFile) {
            trackConfigs.push({
                name: file.name,
                type: "alignment",
                format: "bam",
                height: 150,
                url: file,
                indexURL: indexFile
            })
        }
        else {
            alert("No index file for: " + file.name);
        }
    }
    if (trackConfigs.length > 0) {
        igvBrowser.loadTrackList(trackConfigs);
    }

    function getKey(filename) {
        var idx = filename.indexOf(".");
        if (idx < 0) {
            console.error("File with no extension: " + filename);
        }
        else {
            return filename.substring(0, idx);
        }
     }
}
