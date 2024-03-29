import { base } from "./base";

var intersect = function(ar1, ar2)
{
	var ar_int = []
	var ar = [ar1, ar2]
	var l = [ar1.length, ar2.length];
	var ind = l.indexOf(Math.min.apply(null,l))
	var ind_large = ind == 0 ? 1:0
	for(var i = 0; i < ar[ind].length; i++)
	{
		if(ar[ind_large].indexOf(ar[ind][i]) != -1)
			ar_int.push(ar[ind][i])
	}
	return ar_int
}

function List(){
	this.start = null;
	this.end = null;
	this.makeNode = function()
	{
		return {data:null, next:null};
	};
	this.add=function (data)
	{
	 if(this.start===null)
	 { 
	   this.start = this.makeNode(); 
	   this.end = this.start;
 	 }
 	 else
 	 {
 	 	this.end.next = this.makeNode();
 	 	this.end = this.end.next;
 	 }
 	 this.end.data = data;
 	}	
}


function Node(id, val)
{
  this.id = id;
  this.val = val;
  this.left = null;
  this.right = null;
  //this.left_height = null;
  //this.right_height = null;
  this.parent = null;
  this.height = 0;
  this.x = null;
  this.val_inds = [id];

  var traverse = function()
	{
		//console.log(node.id);
		//if(node == null)
		//	return;
		if(this.left == null && this.right == null)
			console.log(this.id, this.height);
		var children = [this.left, this.right];
		for(var i = 0; i < children.length; i++	)
		{
			if(children[i] != null)
					traverse(children[i]);
		}
		return;
	};
}
     
function Tree(id)
{
	this.root = new Node(id);
	this.curNode = null;
	if(this.curNode == null)
		this.curNode = this.root;
	this.add_right = function(id, right_height)
	{
		this.curNode.right = new Node(id);
		this.curNode.right.height = right_height;
		this.curNode.right.parent = this.curNode;
		//this.curNode.right.cum_height = this.curNode.cum_height + this.curNode.right_height
	}
	this.add_left = function(id, left_height)
	{
		this.curNode.left = new Node(id);
		this.curNode.left.height = left_height;
		this.curNode.left.parent = this.curNode;
		//this.curNode.left.cum_height = this.curNode.cum_height + this.curNode.left_height
	}
	this.move = function(node)
	{
		this.curNode = node;
	}


}

export function dendogram(heatmap)
{
	var dendogram = base()
		.add_property("orientation", "horizontal")
		.add_property("height", 300)
		.add_property("width", 500)
		.add_property("nelements") //nlabels
		.add_property("elementIds", function(){return undefined}) //labIds
		.add_property("paddings", {left: 20, top: 20, bottom: 20, right: 20}) //padding
		.add_property("distance", function(a, b){
			return lc.getEuclideanDistance(a, b);			
		})
		.add_property("data")
		.add_property("lineColours", ['black', 'red'])
		.add_property("on_click", function() {});


	//if number of elements is set, define their IDs
	dendogram.wrapSetter("nelements", function(oldSetter){
		return function() {
			dendogram.get_elementIds = function(){
				return d3.range(oldSetter());
			};
			return oldSetter.apply(dendogram, arguments);
		}
	});
	//if element IDs are set, define their number
	dendogram.wrapSetter("elementIds", function(oldSetter){
		return function() {
			dendogram.get_nelements = function(){
				return oldSetter().length;
			};
			return oldSetter.apply(dendogram, arguments);
		}
	});

	dendogram.heatmap = heatmap;
	dendogram.clusters = undefined;

   dendogram.set_paddings = function(paddings){
  	   if(typeof paddings.top === "undefined")
  			paddings.top = dendogram.paddings().top;
  		if(typeof paddings.bottom === "undefined")
  			paddings.bottom = dendogram.paddings().bottom;
  		if(typeof paddings.left === "undefined")
  			paddings.left = dendogram.paddings().left;
  		if(typeof paddings.right === "undefined")
  			paddings.right = dendogram.paddings().right;
  	
  		dendogram.paddings(paddings);
  		return dendogram;
  	}
		
	var n_count = 0;		 
	var set_x = function(node)
	{ 
		if(node.right == null && node.left == null)
		{
			node.x = n_count;
			n_count++;
			return;
		}
		if(node.left.x == null)
			set_x(node.left);
		if(node.right.x == null)
			set_x(node.right);
		node.x = (node.right.x + node.left.x)/2 ;
		return;
	}
	var set_scale = function()
	{
		var t = -1;
		var rev_height = 0;
		var padding = dendogram.paddings();
		var n_leaves = dendogram.elementIds().length;
		var box_width = (dendogram.width() - padding.right - padding.left)/n_leaves;
		var xScale = d3.scaleLinear()
					   .domain([0, n_leaves-1])
					   .range([padding.left + box_width/2, 
					   	dendogram.width() - padding.right - box_width/2]);
		if(dendogram.get_orientation() == 'vertical')
		{	rev_height = dendogram.height(); t = 1;}

		var yScale = d3.scaleLinear()			   
						.domain([0, dendogram.clusters.height])
						.range([dendogram.height() + padding.top * t - rev_height,
						 rev_height - padding.bottom * t]);
		return [xScale, yScale];
	}
	var draw_dendo = function(node, g, scales)
	{
		//var height = svg.style()[0][0].getAttribute("height");
		if(node.right != null && node.left != null)
		{
			g.append("line")
			.attr("x1", scales[0](node.left.x))
			.attr("x2", scales[0](node.right.x))
			.attr("y1", scales[1](node.height))
			.attr("y2", scales[1](node.height))
			.attr("stroke-width", 3)
			.attr("id", node.id)	
			.attr("orient", "h")
			.attr("stroke", dendogram.lineColours()[0]);

			var children = [node.left, node.right];
			for(var i = 0; i < children.length; i++)
			{
				g.append("line")
				.attr("x1", scales[0](children[i].x))
				.attr("x2", scales[0](children[i].x))
				.attr("y1",  scales[1](node.height))
				.attr("y2", scales[1](children[i].height))
				.attr("stroke-width", 3)				
				.attr("id", children[i].id)
				.attr("orient", "v")
				.attr("stroke", dendogram.lineColours()[0]);
			}
			
			draw_dendo(node.left, g, scales);
			draw_dendo(node.right, g, scales);

			return;
		}

		if(node.right != null || node.left != null){
			var child = node.right || node.left;
			g.append("line")
				.attr("x1", scales[0](node.x))
				.attr("x2", scales[0](node.x))
				.attr("y1", scales[1](node.height))
				.attr("y2", scales[1](child.height))
				.attr("stroke-width", 3)
				.attr("id", child.id)
				.attr("orient", "v")
				.attr("stroke", dendogram.lineColours()[0]);

			draw_dendo(child, g, scales);
		}

		return;
	}
	var find_node = function(node, id)
	{	
		if(node != null)
		{
			if(node.id == id)
				return node;
			else 
				return find_node(node.left,id) || find_node(node.right, id);
		}
		return null;
	}
	var add_ids = function(node, inds)
	{
		inds.push(node.id);
		if(node.left != null)
			add_ids(node.left, inds);
		if(node.right != null)
			add_ids(node.right, inds);
	}

	var check_ele = function(ele, ind_arr)
	{
		for(var i = 0; i < ind_arr.length; i++)
		{
			if(ind_arr[i] == ele)
				return true;
		}
		return false;
	}

	var set_color = function(g, inds, cla, prop)
	{
		g.selectAll('line').attr("stroke", function(d)
		{
			return check_ele(this.id, inds) ? cla[1]:cla[0];
		});
	}

	//???
	var change_prop = function(root_node, id_and_type, g, cla)
	{
		//console.log(root_node);
		var node_req = find_node(root_node, id_and_type[0]),
			inds = [],
			prop = -1;
		
		add_ids(node_req, inds);
		
		if(id_and_type[1] == 'h')
			prop = id_and_type[0];

		if(dendogram.heatmap != undefined)
		{
			if(dendogram.orientation() == 'horizontal')
			{
				var inds_int = intersect(inds,
					dendogram.heatmap.colIds())
				dendogram.heatmap.cluster('Row', inds_int)
				//TO DO: check if dendogram already exists
				dendogram.heatmap.drawDendogram("Row");
			}
			if(dendogram.orientation() == 'vertical')
			{
				var inds_int = intersect(inds,
					dendogram.heatmap.rowIds())
				dendogram.heatmap.cluster('Col', inds_int)
				dendogram.heatmap.drawDendogram("Col");
			}
			dendogram.heatmap.updateLabelPosition();
		} else {
			dendogram.get_on_click(intersect(inds, dendogram.elementIds()));
		}

		set_color(g, inds, cla, prop);		
	}

	var set_click = function(root, g, cla)
	{
		g.selectAll('line').on('click', function(d){
		change_prop(root, [this.getAttribute('id'), this.getAttribute('orient')], g, cla);});
		return dendogram;
	}

	dendogram.cluster = function(){
		dendogram.get_data("clear");
		var keys = dendogram.elementIds();
		dendogram.bucket = [];

		var elementIds = dendogram.elementIds(); 

		//Initialisation
		for(var i = 0; i < keys.length; i++)
			dendogram.bucket[i]  = new Node(keys[i], dendogram.get_data(keys[i]));	
		var bucket_dist = function(el1_inds, el2_inds)
		{
			var max_dist = dist_mat[elementIds.indexOf(el1_inds[0])][elementIds.indexOf(el2_inds[0])], dis;
			//var max_dist = dendogram.get_distance(dendogram.get_data(el1_inds[0]), dendogram.get_data(el2_inds[0]));
			for(var i = 0; i < el1_inds.length; i++)
			{
				for(var j = 0; j < el2_inds.length; j++)	
					{
						dis = dist_mat[elementIds.indexOf(el1_inds[i])][elementIds.indexOf(el2_inds[j])];
						//dis = dendogram.get_distance(dendogram.get_data(el1_inds[i]), dendogram.get_data(el2_inds[j]));
						if(dis > max_dist)
							max_dist = dis;
					}
			}
			return max_dist;
		}
		
		var merge = function()
		{
			var cur_count = dendogram.bucket.length;
			var bucket_copy = JSON.parse(JSON.stringify(dendogram.bucket));
			while(bucket_copy.length >  1)
			{
				var to_clus = [bucket_copy[0], bucket_copy[1]];
				var min_dis = bucket_dist(bucket_copy[0].val_inds, bucket_copy[1].val_inds);	
				var to_rem = [0,1];
				for(var i = 0; i < bucket_copy.length; i++)
				{
					for(var j = i+1;  j < bucket_copy.length; j++)
					{
						 var dis = bucket_dist(bucket_copy[i].val_inds, bucket_copy[j].val_inds);
						 if(dis < min_dis)
						 {
						 	min_dis = dis;
						 	to_clus = [bucket_copy[i], bucket_copy[j]];
						 	to_rem = [i,j];
						 }
					}
				}
				//console.log(min_dis);
				var new_node = new Node(to_clus[0].id + "_" + to_clus[1].id, null);
				new_node.left = to_clus[0];
				new_node.right = to_clus[1];
				new_node.height = min_dis;
				new_node.val_inds = new_node.left.val_inds.concat(new_node.right.val_inds);
				to_rem.sort(function(a,b){return b-a});
				bucket_copy.splice(to_rem[0],1);
				bucket_copy.splice(to_rem[1],1);
				bucket_copy.push(new_node);
				cur_count += 1;
				//break;
			}
			return bucket_copy[0];
		}
		var dist_mat = calc_dist();
		//console.log(dist_mat[0])
		dendogram.clusters = merge();
	}

	var calc_dist = function(){
		var keys = dendogram.elementIds();
		var dist = new Array(keys.length);
		for(var i = 0; i < keys.length; i++)
			dist[i] = new Array(keys.length);
		for(var i = 0; i < keys.length; i++)
		{
			for(var j = i; j < keys.length; j++)
			{
				var d = dendogram.get_distance(dendogram.get_data(keys[i]), dendogram.get_data(keys[j]));
				dist[i][j] = d;
				dist[j][i] = d;
			}
		}
		return dist;
	}

	dendogram.draw = function()
	{
		set_x(dendogram.clusters);
		n_count = 0;
		
		d3.selectAll(dendogram.g.node().childNodes).remove();

		if(dendogram.orientation() == "vertical"){
			if(dendogram.heatmap){
				dendogram.width(dendogram.heatmap.height())
					.height(dendogram.heatmap.paddings().left)
					.paddings({
						left: dendogram.heatmap.paddings().top,
						top: 0,
						bottom: 0,
						right: dendogram.heatmap.paddings().bottom
					});
				dendogram.svg.select(".row")
					.attr("transform", "translate(" + 
														(dendogram.heatmap.paddings().left + +dendogram.heatmap.plotWidth() + 5) + 
														", " + dendogram.heatmap.paddings().top + ")")
					.selectAll("text")
						.style("text-anchor", "start");
			}
			else
				dendogram.svg
					.attr("width", dendogram.width())
					.attr("height", dendogram.height());
			dendogram.g
				.attr("transform", "rotate(90) translate(0, -" + dendogram.height() + ")");
		} else {
			if(dendogram.heatmap) {
				dendogram.width(dendogram.heatmap.width())
					.height(dendogram.heatmap.paddings().top)
					.paddings({
						top: 0,
						left: dendogram.heatmap.paddings().left,
						right: dendogram.heatmap.paddings().right,
						bottom: 0
					});

				dendogram.svg.select(".col")
					.attr("transform", "translate(" + 
														 + dendogram.paddings().left + 
														", " + (dendogram.heatmap.paddings().top + +dendogram.heatmap.plotHeight() + 5) + ")")
					.selectAll("text")
						.style("text-anchor", "end");
				}
			else
				dendogram.svg
					.attr("width", dendogram.width())
					.attr("height", dendogram.height());
//			dendogram.g
//				.attr("transform", "translate(" + dendogram.paddings().left + 
//																	", " + dendogram.paddings().right + ")");
		}

		var newTree = trimNodes();
		if(newTree === undefined)
			return;
		dendogram.scales = set_scale();
		draw_dendo(newTree, dendogram.g, dendogram.scales )
		set_click(newTree, dendogram.g, dendogram.lineColours())		
		return dendogram;
	}

	var trimNodes = function(){
		var elementIds = dendogram.elementIds(),
			newTree = {
				id: dendogram.clusters.id,
				left: null,
				right: null,
				val_inds: dendogram.clusters.val_inds,
				x: dendogram.clusters.x,
				val: dendogram.clusters.val,
				original: dendogram.clusters,
				height: dendogram.clusters.height,
				parent: null
			};
		
		var copyId = function(node, id){
			if(node.height == 0)
				return;
			if(node.left && node.left.val_inds.indexOf(id) != -1){
				copyId(node.left, id);
				return;
			}
			if(node.right && node.right.val_inds.indexOf(id) != -1){
				copyId(node.right, id);
				return;
			}
			if(node.original.left.val_inds.indexOf(id) != -1){
				node.left = {
					id: node.original.left.id,
					left: null,
					right: null,
					val_inds: node.original.left.val_inds,
					x: node.original.left.x,
					val: node.original.left.val,
					original: node.original.left,
					height: node.original.left.height,
					parent: node
				};
				copyId(node.left, id);
				return;
			}
			node.right = {
				id: node.original.right.id,
				left: null,
				right: null,
				val_inds: node.original.right.val_inds,
				x: node.original.right.x,
				val: node.original.right.val,
				original: node.original.right,
				height: node.original.right.height,
				parent: node				
			}
			copyId(node.right, id);
		}
		
		for(var i = 0; i < elementIds.length; i++){
			if(dendogram.clusters.val_inds.indexOf(elementIds[i]) == -1){
				if(dendogram.heatmap){
					dendogram.remove();
					return undefined;
				}
				dendogram.cluster();
				set_x(dendogram.clusters);
				return dendogram.clusters;
			}
			copyId(newTree, elementIds[i]);
		}
		var currentPosition = 0;
		var cutBranches = function(node) {
			if(node === null) return;
			cutBranches(node.left);
			cutBranches(node.right);
			if(node.height == 0){
				node.x = currentPosition;
				currentPosition++;
				return;
			}
			if(node.left && node.right)
				node.x = (node.left.x + node.right.x)/2;
			if(node.parent == null)
				return;
			if(node.left == null){
				node.x = node.right.x;
				//node.parent.left = node.right.left;
				//node.parent.right = node.right.right;
				//node.right.parent = node.parent;
			}
			if(node.right == null){
				node.x = node.left.x;
				//node.parent.left = node.left.left;
				//node.parent.right = node.left.right;
				//node.left.parent = node.parent;
			}
		}

		cutBranches(newTree);

		var findRoot = function(node){
			if(node.left && node.right)
				return node;
			if(node.left)
				return findRoot(node.left);
			if(node.right)
				return findRoot(node.right);
		}

		return findRoot(newTree);
	}
	
	dendogram.put_static_content = function(element)
	{
		if(dendogram.heatmap){
			dendogram.g = dendogram.heatmap.svg
				.append("g")
					.attr("class", "dendogram");
			dendogram.svg = heatmap.svg;
			dendogram.container = heatmap.container;
		} else {
			dendogram.container = element.append("div")
				.style("position", "relative");
			dendogram.svg = dendogram.container
				.append("svg");
			dendogram.g = dendogram.svg
				.append("g");
		}

		return dendogram;		
	}

	dendogram.remove = function(){
		dendogram.g.remove();
		var type;
		if(dendogram.heatmap){
			var chart = dendogram.heatmap;
			dendogram.orientation() == "horizontal" ? type = "Col" : type = "Row";
			chart.showDendogram(type, false);
			chart["dendogram" + type] = undefined;
			if(chart.transitionDuration() > 0 && !chart.transitionOff){
				var t = d3.transition("remove")
					.duration(chart.transitionDuration())
				chart.svg.selectAll(".label_panel." + type.toLowerCase()).transition(t)
						.attr("transform", "translate(" + chart.paddings().left + ", " +
									chart.paddings().top + ")");
				if(type == "Row")
					chart.svg.select(".row").selectAll("text").transition(t)
						.style("text-anchor", "end")
				else
					chart.svg.select(".col").selectAll("text").transition(t)
						.style("text-anchor", "start");
			}
			else{ 			
				chart.svg.selectAll(".label_panel." + type.toLowerCase())
						.attr("transform", "translate(" + chart.paddings().left + ", " +
									chart.paddings().top + ")");
				if(type == "Row")
					chart.svg.select(".row").selectAll("text")
						.style("text-anchor", "end");
				else	
					chart.svg.select(".col").selectAll("text")
						.style("text-anchor", "start");
			}
		}
	}	
	
  dendogram.update = function(){
  	dendogram.cluster();
  	dendogram.draw();

  	return dendogram;
  }

  dendogram.place = function( element ) {

    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      var node = element;
      element = d3.select( node );
      if( element.size() == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
  	}

		dendogram.put_static_content( element );
    
    if(dendogram.heatmap === undefined)
    	dendogram.update(); 

    return dendogram;
  }

	return dendogram;
}

