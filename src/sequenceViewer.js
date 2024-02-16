import { heatmap } from "./heatmap";
import { check } from "./additionalFunctions";

export function sequenceViewer() {
    const chart = heatmap()
        .add_property("seq", undefined, check("array_fun", "seq"))
        .add_property("reverseComplement", false)
        .add_property("startPos", 0, check("array_fun", "startPos"))
        .add_property("highlightMatches", true)
        .add_property("reversed", false, check("array_fun", "reversed"))
        .add_property("matchComplementary", x => x);     

    //number of rows is defined by heatmap logic
    //number of cols must be defined based on all the sequences and start postions

    chart
        .value(function(i, j) {
            if(chart.get_reversed(i)) {
                let seq = chart.get_seq(i),
                    len = seq.length;  
                return seq[len + chart.get_startPos(i) - 1 - j]
            } else {
                return chart.get_seq(i)[j - chart.get_startPos(i)]
            }
        })
        .ncols(function() {
            var ncol = 0,
                rowIds = chart.rowIds();
            for(let i = 0; i < rowIds.length; i++) {
                ncol = d3.max([ncol, chart.get_startPos(rowIds[i]) + chart.get_seq(rowIds[i]).length]);
            }
            return ncol;
        })
        //.showLegend(false)
        .showValue(true)
        .plotHeight(() => chart.nrows() * 30)
        .informText(function(rowId, colId) {
			var value = chart.get_value(rowId, colId);
			return "Sequence: <b>" + chart.get_rowLabel(rowId) + "</b>;<br>" + 
					    "Position: <b>" + (colId - chart.get_startPos(rowId) + 1) + "</b>;<br>" + 
						"nucleotide = " + value;
			})
        .set_paddings({"top": 60});
    
    var inherited_updateCellColour = chart.updateCellColour;
    chart.updateCellColour = function() {
        inherited_updateCellColour();
        if(chart.highlightMatches()) {
            chart.g.selectAll(".data_element")
                .attr("stroke", "black");
            chart.updateCellStroke();
        }
        return chart;
    }
    var inherited_updateCanvas = chart.updateCanvas;
    chart.updateCanvas = function() {
        inherited_updateCanvas();
        if (chart.highlightMatches())
            addCellStrokesCanvas();

        return chart;
    }

    function addCellStrokesCanvas() {
        var ctx = chart.canvas.node().getContext("2d");
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        var rowIds = chart.dispRowIds(),
            colIds = chart.dispColIds(),
            ncols = colIds.length, nrows = rowIds.length;
        for(let j = 0; j < ncols; j++) 
            if(isMatching(colIds[j])) {
                var x = chart.axes.scale_x(chart.get_heatmapCol(colIds[j]));
                for(let i = 0; i < nrows; i++)
                    if(chart.get_value(rowIds[i], colIds[j]) !== undefined) {
                        var y = chart.axes.scale_y(chart.get_heatmapRow(rowIds[i]))
                        ctx.strokeRect(x, y, chart.cellSize.width, chart.cellSize.height);
                    }
            }
    }

    chart.updateCellStroke = function(){
        if(!chart.checkMode())
            return chart;
        if(get_mode() == "svg") {
            if(chart.transitionDuration() > 0 && !chart.transitionOff)
                chart.g.selectAll(".data_element").transition("cellStroke").duration(chart.transitionDuration())
                    .attr("stroke-width", function(d) {
                        let val = chart.get_value(d[0], d[1]),
                            matching = isMatching(d[1]);
                        d3.select(this)
                            .classed("matching", matching);
                        return val !== undefined && matching ? 2 : 0;
                    })
            else
                chart.g.selectAll(".data_element")
                    .attr("stroke-width", function(d) {
                        let val = chart.get_value(d[0], d[1]),
                            matching = isMatching(d[1]);
                        d3.select(this)
                            .classed("matching", matching);
                        return val !== undefined && matching ? 2 : 0;
                    })
            // chart.g
            //     .selectAll(".data_element.matching")
            //     .raise();                    
        }
        return chart;
    }

	function get_mode() {
		if(chart.mode() == "default")
			return chart.dispColIds().length * chart.dispRowIds().length > 2500 ? "canvas" : "svg";
		return chart.mode();
	}
    function isMatching(colId) {
        var matching = true,
            rowIds = chart.rowIds(),
            i = 0, count = 1,
            val, newVal;
        while (matching && i < rowIds.length){
            if(val === undefined) {
                val = chart.get_value(rowIds[i], colId);
            } else {
                newVal = chart.get_value(rowIds[i], colId);
                if(newVal !== undefined) {
                    count++;
                    matching = val == chart.get_matchComplementary(newVal)
                }
            }
            i++;
        }
        return matching && count > 1;
    };
    
    return chart;
}