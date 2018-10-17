import { layerChart } from "./layerChart";
import { check } from "./additionalFunctions"

export function axesChart() {
	
	var chart = layerChart();
	
	chart.add_property("singleScaleX", true)//not active now
		.add_property("singleScaleY", true)//not active now
		.add_property("domainX", undefined, check("array", "domainX"))
		.add_property("domainY", undefined, check("array", "domainY"))
		.add_property("aspectRatio", undefined, check("number_nonneg", "aspectRatio"))
		.add_property("axisTitleX", "")
		.add_property("axisTitleY", "")
		.add_property("ticksX", undefined)
		.add_property("ticksY", undefined)
		.add_property("logScaleX", false)
		.add_property("logScaleY", false);

	chart.axes = {};
	
	//default getter for domain
	//tries to make domain fit data from all layers
	//for axis capital letters a supposed to be used
	var get_domain = function(axis) {
		return function() {
			var domain;
			//TODO: add possibility of adding several axises
			//(one for each plot.layer)
			if(chart["get_singleScale" + axis]()){
				//if all the layers use continuous scale, make the scale continuous
				//otherwise make it categorical
				var contScale = true;
				for(var k in chart.layers)
					contScale = contScale && chart.get_layer(k)["get_contScale" + axis]();

				if(contScale){//if resulting scale is continous, find minimun and maximum values
					for(var k in chart.layers)
						//some of the layers may not have domains at all (such as legends)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else {
								domain[0] = d3.min([domain[0], chart.get_layer(k)["get_layerDomain" + axis]()[0]]);
								domain[1] = d3.max([domain[1], chart.get_layer(k)["get_layerDomain" + axis]()[1]]);
							}
				} else { //if scale is categorical, find unique values from each layer
					for(var k in chart.layers)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else 
								domain = domain.concat(chart.get_layer(k)["get_layerDomain" + axis]()
									.filter(function(e){
										return domain.indexOf(e) < 0;
									}));
				}
			}
			if(domain === undefined) domain = [0, 1];
			if(contScale) 
				if(chart["logScale" + axis]()) {
					domain[1] = domain[1] * 2;
					domain[0] = domain[0] / 2;
				} else {
					domain[1] = domain[1] + 0.03 * (domain[1] - domain[0]);
					domain[0] = domain[0] - 0.03 * (domain[1] - domain[0]);
				} 
			
			return domain;
		}
	}

	chart.get_domainX = get_domain("X");
	chart.get_domainY = get_domain("Y");

	//redefine setters for axis domains
	chart.domainX = function(domain){
		//set default getter
		if(domain == "reset"){
			chart.domainX(chart.origDomainX);
			return chart;
		}
		//if user provided function, use this function
		if(typeof domain === "function")
			chart.get_domainX = domain;
		if(domain.splice)
			chart.get_domainX = function() {
				return domain;
			};
			
		return chart;
	}
	chart.domainY = function(domain){
		if(domain == "reset"){
			chart.domainY(chart.origDomainY);
			return chart;
		}
		if(typeof domain === "function")
			chart.get_domainY = domain;
		if(domain.splice)
			chart.get_domainY = function() {
				return domain;
			};
		
		return chart;
	}

	chart.get_position = function(id){
		return chart.get_layer(id[0]).get_position(id[1]);
	}

	chart.zoom = function(lu, rb){
		if(lu[0] == rb[0] || lu[1] == rb[1])
			return;
    if(chart.axes.scale_x.invert)
    	chart.domainX([chart.axes.scale_x.invert(lu[0]), 
      	             chart.axes.scale_x.invert(rb[0])])
    else {
    	var newDomainX = [], domainX = chart.get_domainX(),
    		i = 0;
    	while(chart.axes.scale_x(domainX[i]) <= rb[0]){
				if(chart.axes.scale_x(domainX[i]) >= lu[0])
					newDomainX.push(domainX[i]);
				i++;    	
    	}
    	if(newDomainX.length > 0)
    		chart.domainX(newDomainX);
    }

    if(chart.axes.scale_y.invert)
	    chart.domainY([chart.axes.scale_y.invert(rb[1]),
                    chart.axes.scale_y.invert(lu[1])]);
    else {
    	var newDomainY = [], domainY = chart.get_domainY(),
    		i = 0;
    	while(chart.axes.scale_y(domainY[i]) <= rb[1]){
				if(chart.axes.scale_y(domainY[i]) >= lu[1])
					newDomainY.push(domainY[i]);
				i++;    	
    	}
    	if(newDomainY.length > 0)
    		chart.domainY(newDomainY);
    }

    chart.updateAxes();
  }
  chart.resetDomain = function(){
    chart.domainX("reset");
    chart.domainY("reset");
    chart.updateAxes();
  }

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content( element );
		
		var g = chart.svg.append("g")
			.attr("class", "axes_g");

    chart.axes.x_g = g.append( "g" )
      .attr( "class", "x axis" );
    chart.axes.x_label = chart.axes.x_g.append( "text" )
      .attr( "class", "label" )
      .attr( "y", -6 )
      .style( "text-anchor", "end" );

    chart.axes.y_g = g.append( "g" )
      .attr( "class", "y axis" )
    chart.axes.y_label = chart.axes.y_g.append( "text" )
      .attr( "class", "label" )
      .attr( "transform", "rotate(-90)" )
      .attr( "y", 6 )
      .attr( "dy", ".71em" )
      .style( "text-anchor", "end" );

		chart.origDomainY = chart.get_domainY;
		chart.origDomainX = chart.get_domainX;

		if(chart.showPanel()) {
			chart.panel.add_button("Zoom in", "#zoomIn", function(chart){
				var xDomain = chart.axes.scale_x.domain(),
					yDomain = chart.axes.scale_y.domain();
				if(xDomain.length == 2 && typeof xDomain[0] == "number" && typeof xDomain[1])
					chart.domainX([(xDomain[0] * 4 + xDomain[1])/5, 
												(xDomain[0] + xDomain[1] * 4)/5])
				else {
					var removeElements = Math.ceil(xDomain.length * 0.1);
					xDomain.splice(0, removeElements);
					xDomain.splice(xDomain.length - removeElements);
					if(xDomain.length > 0)
						chart.domainX(xDomain);
				}
				if(yDomain.length == 2 && typeof yDomain[0] == "number" && typeof yDomain[1])
					chart.domainY([(yDomain[0] * 4 + yDomain[1])/5, 
												(yDomain[0] + yDomain[1] * 4)/5]);
				else {
					var removeElements = Math.ceil(yDomain.length * 0.1);
					yDomain.splice(0, removeElements);
					yDomain.splice(yDomain.length - removeElements );
					if(yDomain.length > 0)
						chart.domainY(yDomain);
				}
				chart.updateAxes();

			}, "Double click to return to original scales");
			chart.panel.add_button("Zoom out", "#zoomOut", function(chart){
				var xDomain = chart.axes.scale_x.domain(),
					yDomain = chart.axes.scale_y.domain();
				if(xDomain.length == 2 && typeof xDomain[0] == "number" && typeof xDomain[1])
					chart.domainX([(xDomain[0] * 6 - xDomain[1])/5, 
												(-xDomain[0] + xDomain[1] * 6)/5])
				else{
					var addElements = Math.ceil(xDomain.length * 0.1),
						origDomainX = chart.origDomainX(),
						start = origDomainX.indexOf(xDomain[0]),
						end = origDomainX.indexOf(xDomain[xDomain.length - 1]);
					for(var i = start - 1; i >= d3.max([0, start - addElements]); i--)
						xDomain.unshift(origDomainX[i]);
					for(var i = end + 1; i < d3.min([origDomainX.length, end + addElements + 1]); i++)
						xDomain.push(origDomainX[i]);
					chart.domainX(xDomain);
				}
				if(yDomain.length == 2 && typeof yDomain[0] == "number" && typeof yDomain[1])
					chart.domainY([(yDomain[0] * 6 - yDomain[1])/5, 
												(-yDomain[0] + yDomain[1] * 6)/5])
				else{
					var addElements = Math.ceil(yDomain.length * 0.1),
						origDomainY = chart.origDomainY(),
						start = origDomainY.indexOf(yDomain[0]),
						end = origDomainY.indexOf(yDomain[yDomain.length - 1]);
					for(var i = origDomainY[start - 1]; i >= d3.max([0, start - addElements]); i--)
						yDomain.unshift(origDomainY[i]);
					for(var i = end + 1; i < d3.min([origDomainY.length, end + addElements + 1]); i++)
						yDomain.push(origDomainY[i]);

					chart.domainY(yDomain);
				}
				chart.updateAxes();			
			}, "Double click to return to original scales");
		}
  }	
	
	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function() {
		inherited_updateSize();

		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("size")
				.duration(chart.transitionDuration());
			chart.svg.selectAll(".axes_g").transition(t)
				.attr("transform", "translate(" + chart.margins().left + 
								", " + chart.margins().top + ")");
			chart.axes.x_g.transition(t)
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label.transition(t)
				.attr("x", chart.get_plotWidth());

		}	else {
			chart.svg.selectAll(".axes_g")
				.attr("transform", "translate(" + chart.margins().left + 
								", " + chart.margins().top + ")");
			chart.axes.x_g
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label
				.attr("x", chart.get_plotWidth());
		}

		chart.updateAxes();

		return chart;
	};

	// This function takes two linear scales, and extends the domain of one of them to get  
	// the desired x:y aspect ratio 'asp'. 
	function fix_aspect_ratio( scaleX, scaleY, asp ) { 
	   var xfactor = ( scaleX.range()[1] - scaleX.range()[0] ) /  
	      ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	   var yfactor = ( scaleY.range()[1] - scaleY.range()[0] ) /  
	      ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	   var curasp = Math.abs( xfactor / yfactor )  // current aspect ratio 
	   if( curasp > asp ) {  // x domain has to be expanded 
	      var cur_dom_length = ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	      var extension = cur_dom_length * ( curasp/asp - 1 ) / 2 
	      scaleX.domain( [ scaleX.domain()[0] - extension, scaleX.domain()[1] + extension ] )       
	   } else { // y domain has to be expanded 
	      var cur_dom_length = ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	      var extension = cur_dom_length * ( asp/curasp - 1 ) / 2 
	      scaleY.domain( [ scaleY.domain()[0] - extension, scaleY.domain()[1] + extension ] )             
	   } 
	} 

	var get_ticks = function(axis){
		var ticks = {tickValues: null, tickFormat: null},
			tickArray = chart["ticks" + axis]();
		
		if(tickArray){
			//check if the ticks are set correctly
			if(typeof tickArray.splice === "undefined")
				throw "Error in 'get_ticks': new tick values and labels should be passed " +
							"as an array";
			if(typeof tickArray[0].splice === "undefined")
				tickArray = [tickArray];
			for(var i = 1; i < tickArray.length; i++)
				if(tickArray[0].length != tickArray[i].length)
					throw "Error in 'get_ticks': the amount of tick labels must be equal to the " +
								"amount of tick values";

			//if only tick values (not tick labels) then return 					
			ticks.tickValues = tickArray[0];
			if(tickArray.length == 1)
				return ticks;

			//if all the labels sets are identical, leave only one of them
			var ident = tickArray.length > 2, j = 1, i;
			while(ident && j < tickArray.length - 1){
				i = 0;
				while(ident && i < tickArray[j].length){
					ident = (tickArray[j][i] == tickArray[j + 1][i]);
					i++;
				}
				j++;
			}
			if(ident)
				tickArray.splice(2);
			
			//if we have several label sets, transform the labels into <tspan> blocks
			var tickLabels = [], value;
			if(tickArray.length > 2){
				for(var i = 0; i < tickArray[0].length; i++){
					value = "";
					for(var j = 1; j < tickArray.length; j++){
						//location
						value += "<tspan x = 0.5 dy = " + 1.1 + "em";
						//colour if any
						if(tickArray.colour) 
							value += " fill = '" + tickArray.colour[j - 1] + "'>"
						else
							value += ">";
						value += tickArray[j][i] + "</tspan>";
					}
					tickLabels.push(value);
				}
			} else {
				tickLabels = tickArray[1];
			}
			ticks.tickFormat = function(d) {return tickLabels[ticks.tickValues.indexOf(d)];};
		}
		
		return ticks;
	}

	chart.panMove = function(p){
		var domainX = chart.axes.scale_x.domain(),
			domainY = chart.axes.scale_y.domain();
		
		if(chart.axes.scale_x.invert){
			//x-scale is continuous
			var invPx = chart.axes.scale_x.invert(p[0]),
				moveX = invPx - chart.axes.scale_x.invert(chart.pan("down")[0]);
			chart.pan("down")[0] = p[0];
			var newDomainX = [domainX[0] - moveX, domainX[1] - moveX];
			if(chart.logScaleX()){
				if(newDomainX[0] <= 0) newDomainX[0] = domainX[0];
				if(newDomainX[1] <= 0) newDomainX[1] = domainX[1]; 
			}
			chart.domainX(newDomainX);
		} else {
			//x-scale is categorical
			var moveX = p[0] - chart.pan("down")[0],
				steps = Math.floor(Math.abs(moveX) / chart.axes.scale_x.step() * 2);
			if(steps > 0){
				chart.pan("down")[0] += Math.sign(moveX) * steps * chart.axes.scale_x.step() /2;
				var origDomainX = chart.origDomainX(),
					start = origDomainX.indexOf(domainX[0]),
					end = origDomainX.indexOf(domainX[domainX.length - 1]);
				if(moveX < 0){
					domainX.splice(0, steps);
					domainX = domainX.concat(origDomainX.slice(end + 1, d3.min([origDomainX.length, end + steps + 1])));
				} else {
					domainX.splice(domainX.length - steps);
					domainX = origDomainX.slice(d3.max([0, start - steps]), start).concat(domainX);
				}
				if(domainX.length > 0) chart.domainX(domainX);
			}
		}

		if(chart.axes.scale_y.invert){
			//y-scale is continuous
			var invPy = chart.axes.scale_y.invert(p[1]),
				moveY = invPy - chart.axes.scale_y.invert(chart.pan("down")[1]);
			chart.pan("down")[1] = p[1];
			var newDomainY = [domainY[0] - moveY, domainY[1] - moveY];
			if(chart.logScaleY()){
				if(newDomainY[0] <= 0) newDomainY[0] = domainY[0];
				if(newDomainY[1] <= 0) newDomainY[1] = domainY[1]; 
			}
			chart.domainY(newDomainY);
		} else {
			//y-scale is categorical
			var moveY = p[1] - chart.pan("down")[1],
				steps = Math.floor(Math.abs(moveY) / chart.axes.scale_y.step() * 2);
			if(steps > 0){
				chart.pan("down")[1] += Math.sign(moveY) * steps * chart.axes.scale_y.step() / 2;
				var origDomainY = chart.origDomainY(),
					start = origDomainY.indexOf(domainY[0]),
					end = origDomainY.indexOf(domainY[domainY.length - 1]);
				if(moveY > 0){
					domainY.splice(0, steps);
					domainY = domainY.concat(origDomainY.slice(end + 1, d3.min([origDomainY.length, end + steps + 1])));
				} else {
					domainY.splice(domainY.length - steps);
					domainY = origDomainY.slice(d3.max([0, start - steps]), start).concat(domainY);
				}
				if(domainY.length > 0) chart.domainY(domainY);
			}
		}

		chart.updateAxes();
	}

	var checkType = function(type) {
		var domain = chart["get_domain" + type]();
		
		if(chart.axes["scale_" + type.toLowerCase()] === undefined)
			chart.axes["scale_" + type.toLowerCase()] = {};

		if(domain.length == 2 && typeof (domain[0] + domain[1]) === "number"){
			var logBase = chart["logScale" + type]();
			if(logBase && logBase > 0 && logBase != 1){
				if(chart.axes["scale_" + type.toLowerCase()].base === undefined)
					chart.axes["scale_" + type.toLowerCase()] = d3.scaleLog();
				chart.axes["scale_" + type.toLowerCase()].base(logBase);
			} else {
				if(chart.axes["scale_" + type.toLowerCase()].clamp === undefined || 
					chart.axes["scale_" + type.toLowerCase()].base != undefined)
				chart.axes["scale_" + type.toLowerCase()] = d3.scaleLinear(); 
			}
			chart.axes["scale_" + type.toLowerCase()].nice();
		} else {
			if(chart.axes["scale_" + type.toLowerCase()].padding === undefined)
				chart.axes["scale_" + type.toLowerCase()] = d3.scalePoint()
					.padding(0.3);
		}
	}

	var checkDomain = function(type) {
		var domain = chart["get_domain" + type]();
		if(domain.length == 2 && typeof domain[0] === "number" && typeof domain[1] === "number") {
			if(domain[0] == domain[1]) {
				domain[0] = domain[0] - 0.5;
				domain[1] = domain[1] + 0.5;
			}
			//if(chart["logScale" + type]()){
			//	domain = [d3.max([domain[0], 0.00000000001]), d3.max([domain[1], 0.1])];
			//}
			
		}
		return domain;
	}

	chart.updateAxes = function(){

		checkType("X");
		checkType("Y");

		chart.axes.scale_x.range([0, chart.get_plotWidth()]);
		chart.axes.scale_y.range([chart.get_plotHeight(), 0]);

    chart.axes.x_label
    	.text( chart.axisTitleX());
		chart.axes.y_label
   		.text( chart.axisTitleY() );

    chart.axes.scale_x.domain(checkDomain("X"));
    chart.axes.scale_y.domain(checkDomain("Y"));
		if(chart.aspectRatio())
			fix_aspect_ratio(chart.axes.scale_x, chart.axes.scale_y, chart.get_aspectRatio());

		var ticksX = get_ticks("X"),
			ticksY = get_ticks("Y");

    if(chart.transitionDuration() > 0 && !chart.transitionOff) {
	    var t = d3.transition("axes")
	    	.duration(chart.transitionDuration());
	    d3.axisBottom()
	      .scale( chart.axes.scale_x )
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      ( chart.axes.x_g.transition(t) );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat)
	      ( chart.axes.y_g.transition(t) );	
    } else {
	    d3.axisBottom()
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      .scale( chart.axes.scale_x )
	      ( chart.axes.x_g );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat) 
	      ( chart.axes.y_g );    	
    }

    var updateX = function() {
    	chart.axes.x_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksX.tickFormat)
    	if(chart.transitionDuration() > 0 && !chart.transitionOff)
    		setTimeout(updateX, chart.transitionDuration())
    	else
    		updateX();

    var updateY = function() {
    	chart.axes.y_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksY.tickFormat)
    	if(chart.transitionDuration() > 0 && !chart.transitionOff)
    		setTimeout(updateY, chart.transitionDuration())
    	else
    		updateY();

    for(var k in chart.layers)
    	chart.get_layer(k).updateElementPosition();

    return chart;
	}

	return chart;
}