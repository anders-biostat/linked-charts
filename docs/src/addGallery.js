//put here short description for each example
var titleEx = [
		"Correlation of 57 RNA-Seq samples, 8000 genes", 
		"MA plot, tumor vs. normal tissue comparison (datafile size is ~20MB, loading may take a while)", 
		"Single cell RNA-Seq, cord blood (datafile size is ~20MB, loading may take a while)", 
		"Single cell RNA-Seq, cord blood, exploring the abundance of 13 protein markers.", 
		"MA plot (tumor vs. normal tissue) linked to Integrative Genomic Viewer", 
		"disabled"
	],
	//links to the corresponding tutorial pages
	linkEx = [
		"rlc/tutorials/oscc.html", 
		"rlc/tutorials/oscc.html", 
		"rlc/tutorials/citeseq1.html", 
		"rlc/tutorials/citeseq2.html", 
		"rlc/tutorials/igv.html", 
		""
	],
	captionEx = [
		'Samples correlation from <a href="https://doi.org/10.18632/oncotarget.5529">Conway et al. (2015)</a>. There, mRNA in 57 samples from 19 patients with oral cancer was sequenced. From each patient, there is a cancerous, normal and dysplasia tissue sample. The heatmap shows the overall correlation of the samples. To examine the correlation value for any two samples, please, click on the corresponding cell. The scatter plot will immediately change to display the gene expression values (CPMs) for the two selected samples against each other, thus allowing us to intuitively explore the overview plot. Here, only the expression of 8000 randomly selected genes is displayed to avoid long data download time. Try also clicking on any branch of a dendrogram to recluster the samples based only on the selected features.<br><br>To run the provided code, please, download the following data:<br><b>For R:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/oscc/oscc.rda">ocss.rda</a><br><b>For JS:</b> <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/oscc/maData.js">maData.js</a> and <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/oscc/heatmapData.js">heatmapData.js</a>',
		'Overview of genes differentially expressed in cancerous and normal tissues from <a href="https://doi.org/10.18632/oncotarget.5529">Conway et al. (2015)</a>. MA plot (to the left) shows all the sequenced genes with their average expression on X-axis and log-fold change on Y-axis. Red indicates genes, where the difference was reported as significant by the <a href="https://bioconductor.org/packages/release/bioc/html/limma.html">"limma"</a> package. Plot to the left shows expression values (CPMs) for a selected gene and all the patients. When the user clicks on a point of the MA plot, the expression plot changes, showing the new selected gene. In such a way, one can check immediately, whether the genes, labeled as significantly different, are interesting for further study.<br><br>To run the provided code, please, download the following data:<br><b>For R:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/oscc/oscc.rda">ocss.rda</a><br><b>For JS:</b> <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/oscc/maData.js">maData.js</a> and <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/oscc/heatmapData.js">heatmapData.js</a>',
		'The app is based on a single-cell RNA-Seq assay of a cord blood sample from <a href="https://doi.org/10.1038/nmeth.4380">Stoeckius et al. (2017)</a>. The plot in the left-upper corner allows picking the genes with a high variance-to-noise ratio. It shows average expression values on the X-axis and variance-to-mean ratio on the Y-axis. Genes that are above most of the others in this plot are the ones where biological signal dominates over the Poisson noise. To select a gene, please, click on the corresponding point in this plot. Then its normalised expression will be shown in colour in the t-SNE plot in the left-bottom corner. In addition, one can check the raw counts of the selected gene in the upper-right plot. Here, each point is a cell with the number of counts of the selected gene on the Y-axis and the total number of counts on the X-axis (logarithmised). Finally, one can select a cluster of cells in the t-SNE plot by stretching a rectangle over it while pressing the <i>Shif</i> key. Then in the bottom-right corner, a table with the genes that distinguish the selected cluster from the rest of the cells will appear.<br> Note that the JavaScript code for this example is quite lengthy. It is mostly due to the calculation of the separation score to generate the gene table. JavaScript is, in fact, not much suitable for calculations.<br><br>To run the provided code, please, download the following data:<br><b>For R:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/citeseq/citeseq_data.rda">citeseq_data.rda</a><br><b>For JS:</b> <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/citeseq/citeSeqData.js">citeSeqData.js</a>',
		'The app helps to explore the cord blood sample from <a href="https://doi.org/10.1038/nmeth.4380">Stoeckius et al. (2017)</a>. There, for each cell, besides its transcriptome, the abundances of 13 protein markers were measured. The plot shows a t-SNE embedding based on the transcriptome of the cells. Three sets of radio buttons to the right allow colouring the cells based on the abundance of their protein markers. Each set of the buttons corresponds to a specific colour channel, thus making it possible to visually study the combinations of protein markers.<br><br>To run the provided code, please, download the following data:<br><b>For R:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/citeseq/citeseq_data.rda">citeseq_data.rda</a> and <a href="ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE100nnn/GSE100866/suppl/GSE100866_PBMC_vs_flow_10X-ADT_umi.csv.gz">the epitome data table</a><br><b>For JS:</b> <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/gallery/ex4/data.js">data.js</a>',
		'Flexibility of the linked-charts library allows users to easily link it to other services. Here, we show an example of linking an MA-plot that displays differentially expressed genes in normal and cancerous tissues (based on data from <a href="https://doi.org/10.18632/oncotarget.5529">Conway et al. (2015)</a>) to the <a href="https://github.com/igvteam/igv.js/">JavaScript version</a> of the <a href="https://software.broadinstitute.org/software/igv/">Integrative Genomic Viewer</a> (IGV). When a user clicks a point on an MA-plot, the IGV shows the corresponding genome region and the reads that were aligned to the selected gene. This allows, for example, checking if there are any differences in exon usage between the samples. The inbuilt IGV navigation is also possible. As an example here, we are showing only one patient, and each sample is subsetted to 5,000,000 reads. Note that since the browser is not allowed to read local files without explicit permission, to run this example locally, one would need to manually open the .bam files. <br><br>To run the provided code, please, download the following data:<br><b>alingned reads and index files:</b> <a href="https://papagei.bioquant.uni-heidelberg.de/sveta/oscc_bam/oscc_bam.zip">oscc_bam.zip</a> (the file size is 2.3 GB)<br><b>HTML page:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/igv/localBam.html">localBam.html</a> (based on <a href="https://igv.org/web/release/2.2.2/examples/localBam.html">this example</a> from the IGV team)<br><b>For R:</b> <a href="https://anders-biostat.github.io/linked-charts/rlc/tutorials/oscc/oscc.rda">oscc.rda</a><br><b>For JS:</b> <a href="https://github.com/anders-biostat/linked-charts/raw/master/docs/rlc/tutorials/igv/oscc_no_counts.js">oscc_no_counts.js</a> (note, that the linked-charts.js code should be added to the provided HTML page).'
	],
	aspect_ratios = {1: "50%", 2: "46%", 3: "63%", 4: "50%", 5: "71%"};
var lastEx = titleEx.length, currentEx = 1,
	showEx = d3.range(6).map(e => e + 1);

d3.select(".gallery")
	.append("div")
		.attr("class", "aspect-ratio")
			.append("iframe")
				.attr("frameBorder", 0);

d3.select(".gallery")
	.append("div")
		.attr("class", "numbertext");	

d3.select(".gallery")
	.selectAll("a").data([-1, 1])
		.enter()
			.append("a")
				.attr("class", d => d == -1 ? "prev" : "next")
				.on("click", function(event, d) {
					currentEx += d;
					if(currentEx == 0) currentEx = lastEx;
					if(currentEx > lastEx) currentEx = 1;
					changeSlides(d);
				})
				.text(d => d == -1 ? "<" : ">");

d3.select(".gallery")
	.append("div")
		.attr("class", "caption-container")
			.append("p")
				.attr("id", "caption-title");

d3.select(".gallery")
	.select(".caption-container")
			.append("p")
				.attr("id", "caption");

d3.select(".gallery")
	.append("div")
		.attr("class", "row");

function changeSlides(shift) {
	d3.select(".gallery")
		.select("iframe")
			.attr("src", document.location.origin + "/linked-charts/gallery/ex" + currentEx + "/index.html");
	d3.select(".gallery")
		.select(".numbertext")
			.text(currentEx + "/" + lastEx);
	d3.select(".gallery")
		.select("#caption-title")
			.html(titleEx[currentEx - 1]);
	d3.select(".gallery")
		.select("#caption")
		.html(captionEx[currentEx - 1]);

	if(showEx.indexOf(currentEx) == -1) {
		showEx = showEx.map(e => (e + shift) % lastEx).map(e => e == 0 ? lastEx : e);
		changeThumb();
	}

	d3.select(".gallery")
		.selectAll(".demo")
			.classed("active", false)
			.filter(d => d == currentEx)
				.classed("active", true);

	d3.select(".gallery")
		.select(".aspect-ratio")
			.style("padding-bottom", aspect_ratios[currentEx] || "51%");
}

function changeThumb() {
	var imgs = d3.select(".gallery")
		.select(".row")
			.selectAll(".column")
				.data(showEx)
					.enter()
						.append("div")
							.attr("class", "column")
							.append("img")
								.attr("class", "demo cursor")
								.on("click", function(event, d) {
									currentEx = d;
									changeSlides();
								})
								.filter(d => d == 1)
									.classed("active", true);

	d3.select(".gallery")
		.select(".row")
			.selectAll("img")
				.attr("src", d => document.location.origin + "/linked-charts/gallery/ex" + d + "/image.png");
}

changeSlides();
changeThumb();

d3.select(".gallery")
	.append("div")
		.style("overflow", "hidden")
		.selectAll(".button")
			.data([0, 1, 2])
			.enter()
				.append("div")
					.attr("class", "button")
					.text(function (d) {
						if(d == 0)
							return "Get R code";
						if(d == 1)
							return "Get JS code";
						if(d == 2)
							return "Go to the tutorial";
					})
					.on("click", function(event, d) {
						if(d == 0)
							window.open(document.location.origin + "/linked-charts/gallery/ex" + currentEx + "/code_R.html", 
								"R code for the example", "width=700,height=600");
						if(d == 1)
							window.open(document.location.origin + "/linked-charts/gallery/ex" + currentEx + "/code_JS.html", 
								"JavaScript code for the example", "width=700,height=600");
						if(d == 2)
							window.open(document.location.origin + "/linked-charts/" + linkEx[currentEx - 1]);
					})
