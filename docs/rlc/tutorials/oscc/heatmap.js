var xSample = 0, ySample = 1;

lc.heatmap()
	.nrows(hData.sampleNames.length)
	.ncols(hData.sampleNames.length)
	.value((i, j) => hData.corrMat[i][j])
	.rowLabel(i => hData.sampleNames[i])
	.colLabel(i => hData.sampleNames[i])
	.width(340)
	.height(340)
	.paddings({top: 30, left: 30, right: 5, bottom: 5})
	.on_click(function(row, col) {
		xSample = row;
		ySample = col;
		sch.update();
	})
	.place(d3.select("#heatmap-scatter").select("#heatmap"));

var sch = lc.scatter()
	.x(i => Math.log10(hData.countMatrix[i][xSample] + 1))
	.y(i => Math.log10(hData.countMatrix[i][ySample] + 1))
	.size(0.3)
	.width(340)
	.height(340)
	.opacity(0.7)
	.place(d3.select("#heatmap-scatter").select("#scatter"));

