var selGeneHA = 0;

lc.scatter()
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
		selGeneHA = i;
		exprHA.update();
	})
	.place(d3.select("#halfApp").select("#mean-var"));

var exprHA = lc.scatter()
	.x(i => data.sf[i])
	.y(i => data.countMatrix[selGeneHA][i])
	.label(i => data.cellNames[i])
	.logScaleX(10)
	.title(() => data.geneNames[selGeneHA])
	.opacity(0.2)
	.width(340)
	.height(340)
	.set_paddings({left:25})
	.place(d3.select("#halfApp").select("#expr"));
