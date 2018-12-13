var selGeneFA = 0;

var tmp = lc.scatter()
	.x(i => data.means[i])
	.y(i => data.vars[i]/data.means[i])
	.label(i => data.geneNames[i])
	.logScaleX(10)
	.logScaleY(10)
	.width(340)
	.height(340)
	.set_paddings({left:30})
	.size(2.5)
	.on_click(function(i) {
		selGeneFA = i;
		exprFA.update();
		tsneFA.updateElementStyle();
	})
	.place(d3.select("#fullApp").select("#mean-var"));

var exprFA = lc.scatter()
	.x(i => data.sf[i])
	.y(i => data.countMatrix[selGeneFA][i])
	.label(i => data.cellNames[i])
	.logScaleX(10)
	.title(() => data.geneNames[selGeneFA])
	.opacity(0.2)
	.width(340)
	.height(340)
	.set_paddings({left:25})
	.place(d3.select("#fullApp").select("#expr"));

var tsneFA = lc.scatter()
	.x(i => data.tsne[i][0])
	.y(i => data.tsne[i][1])
	.label(i => data.cellNames[i])
	.colourValue(i => Math.sqrt(data.countMatrix[selGeneFA][i]/data.sf[i]))
	.palette(["#FFFFCC","#FFEDA0","#FED976","#FEB24C","#FD8D3C","#FC4E2A","#E31A1C","#BD0026","#800026"])
	.size(3)
	.colourLegendTitle(() => data.geneNames[selGeneFA])
	.on_marked(makeTable)
	.width(340)
	.height(340)
	.set_paddings({left:20})
	.place(d3.select("#fullApp").select("#tsne"));

tsneFA.legend.width(60).update();

var colOrder = ["geneName", "meanMarked", "sdMarked", "meanUnmarked", "sdUnmarked", "sepScore"],
	nrow = 15, 
	varGenes = d3.range(data.geneNames.length)
		.filter((el, i) => (data.vars[i]/data.means[i] > 1.5 && data.means[i] > 1e-3));

function topGenes() {
	var selCells = tsneFA.get_marked().layer0,
		stats = {geneName: [], meanMarked: [], sdMarked: [], meanUnmarked: [], sdUnmarked: [], sepScore: []},
		i, mm, sdm, mu, sdu, gene;

	if(selCells.length == 0 || selCells.length == data.cellNames.length)
		return stats;

	for(var sg = 0; sg < varGenes.length; sg++) {

		gene = varGenes[sg];
		i = 0; mm = 0; mu = 0; sdm = 0; sdu = 0;

		stats.geneName.push(data.geneNames[gene]);

		for(var cell = 0; cell < data.cellNames.length; cell++) 
			if(cell == selCells[i]) {
				mm += data.countMatrix[gene][cell];
				i++;
			}	else
				mu += data.countMatrix[gene][cell];
	
		mm /= selCells.length;
		mu /= (data.cellNames.length - selCells.length);
		stats.meanMarked.push(mm.toFixed(2));
		stats.meanUnmarked.push(mu.toFixed(2));

		i = 0;
		for(var cell = 0; cell < data.cellNames.length; cell++)
			if(cell == selCells[i]) {
				sdm += (data.countMatrix[gene][cell] - mm) * (data.countMatrix[gene][cell] - mm);
				i++;
			}	else
				sdu += (data.countMatrix[gene][cell] - mu) * (data.countMatrix[gene][cell] - mu);

		sdm /= (selCells.length - 1);
		sdu /= ((data.cellNames.length - selCells.length) - 1);
		sdm = Math.sqrt(sdm);
		sdu = Math.sqrt(sdu);
		stats.sdMarked.push(sdm.toFixed(2));
		stats.sdUnmarked.push(sdu.toFixed(2));
		stats.sepScore.push(((mm - mu)/d3.max([sdu + sdm, 0.002])).toFixed(2));
	}

	var topStats = {geneName: [], meanMarked: [], sdMarked: [], meanUnmarked: [], sdUnmarked: [], sepScore: []},
		order = d3.range(data.geneNames.length).sort((a, b) => Math.abs(stats.sepScore[b]) - Math.abs(stats.sepScore[a]));

	for(var col in topStats){
		topStats[col].push(col);
		for(var i = 0; i < nrow; i++)
			topStats[col].push(stats[col][order[i]]);
	}

	return topStats;	
}

function makeTable() {
	var stats = topGenes();

	var rows = d3.select("#fullApp")
		.select("#table")
			.select("table")
				.selectAll("tr")
					.data(d3.range(d3.min([nrow, stats.geneName.length])));
	rows.exit()
		.remove();
	rows.enter()
		.append("tr");

	var cells = d3.select("#fullApp")
		.select("#table")
			.select("table")
				.selectAll("tr")
					.selectAll("td")
						.data(d => colOrder.map(el => [d, el]));
	cells.exit()
		.remove();
	cells.enter()
		.append("td")
		.style("padding", "1px 1px 1px 1px")
		.style("font-size", "10px")
		.merge(cells)
			.text(d => stats[d[1]][d[0]]);

}