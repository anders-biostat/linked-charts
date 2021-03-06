var selGene = 0;

lc.scatter()
	.x(i => maData.pvals[i].AveExpr)
	.y(i => maData.pvals[i].tissuetumour)
	.nelements(hData.geneNames.length)
	.colour(i => maData.pvals[i]["adj.P.Val"] < 0.1 ? "red" : "black")
	.label(i => hData.geneNames[i])
	.size(1.3)
	.on_click(i => {selGene = i; exprPlot.update();})
	.width(340)
	.height(340)
	.set_paddings({left: 15})
	.place(d3.select("#ma-expr").select("#ma"));

var exprPlot = lc.scatter()
	.x(i => maData.patients[i])
	.y(i => hData.countMatrix[selGene][i]/maData.countSums[i] * 1e6 + .1)
	.logScaleY(10)
	.colourValue(i => maData.tissue[i])
	.title(function() {return hData.geneNames[selGene]})
	.axisTitleY("counts per million (CPM)")
	.ticksRotateX(45)
	.width(340)
	.height(340)
	.place(d3.select("#ma-expr").select("#expr"));
