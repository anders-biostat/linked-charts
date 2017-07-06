//require('./iris_temp')
///random generator
function createGround(width, height){
    var result = new Array(width);
    for (var i = 0 ; i < width; i++) {
        result[i] = new Array(height);
        for (var j = 0; j < height; j++) {
            result[i][j] = Math.random() * 10;
        }
    }
    return result;
}


var transpose = function(data)
{
    return Object.keys(data[0]).map(function (c) {
    return data.map(function (r) {
        return r[c];
    });
});
}

var calculate_euclidean = function(d1, d2)
{
	var sum = 0;
	for(var i = 0; i < d1.length; i++)
		sum += Math.pow((d1[i] - d2[i]), 2)
	return Math.sqrt(sum);
}

var calc_dist = function(data, method)
{
	method = method || 'euclidean'
	var keys = Object.keys(data);
	var dist = new Array(keys.length);
	for(var i = 0; i < keys.length; i++)
		dist[i] = new Array(keys.length);
	if(method == 'euclidean')
	{
		for(var i = 0; i < keys.length; i++)
		{
			for(var j = i; j < keys.length; j++)
			{
				var d = calculate_euclidean(data[keys[i]], data[keys[j]])
				dist[i][j] = d;
				dist[j][i] = d;
			}
		}
	}
	return(dist);
}

//var data = createGround(10,20);


var hcluster = function(data)
{
	this.bucket = []
	var keys = Object.keys(data)
	//Initialisation
	for(var i = 0; i < keys.length; i++)
		this.bucket[i]  = new Node(i, data[keys[i]]);	
	var bucket_dist = function(el1_inds, el2_inds, dist_mat)
	{
		var max_dist = dist_mat[el1_inds[0]][el2_inds[0]];
		for(var i = 0; i < el1_inds.length; i++)
		{
			for(var j = 0; j < el2_inds.length; j++)	
				{
					var dis = dist_mat[el1_inds[i]][el2_inds[j]];
					if(dis > max_dist)
						max_dist = dis;
				}
		}
		return max_dist;
	}
	
	var merge = function(dist_mat)
	{
		var cur_count = this.bucket.length;
		var bucket_copy = JSON.parse(JSON.stringify(this.bucket));
		while(bucket_copy.length >  1)
		{
			var to_clus = [bucket_copy[0], bucket_copy[1]];
			var min_dis = bucket_dist(bucket_copy[0].val_inds, bucket_copy[1].val_inds, dist_mat);	
			var to_rem = [0,1];
			for(var i = 0; i < bucket_copy.length; i++)
			{
				for(var j = i+1;  j < bucket_copy.length; j++)
				{
					 var dis = bucket_dist(bucket_copy[i].val_inds, bucket_copy[j].val_inds, dist_mat);
					 if(dis < min_dis)
					 {
					 	min_dis = dis;
					 	to_clus = [bucket_copy[i], bucket_copy[j]];
					 	to_rem = [i,j];
					 }
				}
			}
			//console.log(min_dis);
			var new_node = new Node(cur_count+1, null);
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
	var dist_mat = calc_dist(data);
	//console.log(dist_mat[0])
	return merge(dist_mat);
}
//console.log(data);
