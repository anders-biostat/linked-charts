var chartBaseProps = [{
	name: "width",
	type: "property",
	defaultValue: 500,
	valueType: "number > 0",
	description: "Width of the chart in pixels."
}, {
	name: "height",
	type: "property",
	defaultValue: 500,
	valueType: "number > 0",
	description: "Height of the chart in pixels."
}, {
	name: "margins",
	type: "property",
	defaultValue: "{top: 15, right: 10, bottom: 50, left:50}",
	valueType: "Object",
	description: "Margins that are used for various additional elements " + 
		"such as axes, labels, titles, legend etc. Supposed to be set to an" +
		"object with four fields: 'top', 'right', 'bottom' and 'left', each of" +
		"them is a positive number",
}, {
	name: "title",
	type: "property",
	defaultValue: "''",
	description: "Title of the chart."
}, {
	name: "titleX",
	type: "property",
	defaultValue: "function() {return chart.width() / 2;}",
	description: "X coordinate of the chart title."
}, {
	name: "titleY",
	type: "property",
	defaultValue: "function() {return d3.min([17, chart.margins().top * 0.9]);}",
	description: "Y coordinate of the chart title."
}, {
	name: "plotWidth",
	type: "property",
	defaultValue: 440,
	description: "Width of the area occupied by plot (width - margins).",
	recomUse: "no"
}, {
	name: "plotHeight",
	type: "property",
	defaultValue: 435,
	description: "Height of the area occupied by plot (height - margins).",
	recomUse: "no"
}];