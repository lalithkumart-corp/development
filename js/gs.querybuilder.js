if(typeof gs == 'undefined'){
    var gs = {};
}
gs.querybuilder = {
	executeQuery: function(query, callback){
		var obj = {
			aQuery: query
		}
		$.ajax({
            url: 'executequery.php',
            type: 'POST',
            data: obj,
            success: function(data, textStatus, jqXHR)
            {
               response = JSON.parse(data);
               if(typeof callback != 'undefined' && callback != ""){
                  var skipCall = true;
                  callback(response, skipCall);
                }
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
               console.log("Ajax Error..");
            }
        });	
	}
}