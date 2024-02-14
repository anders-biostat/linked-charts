import { heatmap } from "./heatmap";
import { check } from "./additionalFunctions";

export function sequenceViewer() {
    const chart = heatmap()
        .add_property("seq", undefined, check("array_fun", "seq"))
        .add_property("reverseComplement", false)
        .add_property("startPos", 0, check(("array_fun", "seq")));
    
    //number of rows is defined by heatmap logic
    //number of cols must be defined based on all the sequences and start postions

    chart
        .value((i, j) => chart.get_seq(i)[j - chart.get_startPos(i)])
        .ncols(function() {
            var ncol = 0;
            for(let i = 0; i < chart.nrows(); i++) {
                ncol = d3.max([ncol, chart.get_startPos(i) + chart.get_seq(i).length]);
            }
            return ncol;
        })
        .showLegend(false)
        .showValue(true)
        .plotHeight(() => chart.nrows() * 30)
        .informText(function(rowId, colId) {
			var value = chart.get_value(rowId, colId);
            console.log(chart.get_startPos(rowId))
			return "Sequence: <b>" + chart.get_rowLabel(rowId) + "</b>;<br>" + 
					    "Position: <b>" + (colId - chart.get_startPos(rowId) + 1) + "</b>;<br>" + 
						"nucleotide = " + value;
			})
    
    return chart;
}