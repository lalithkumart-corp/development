if(typeof gs == 'undefined'){
    var gs = {};
}
gs.export = {
	init: function(){

	},
	exportFile: function(){
		 gs.spinner.show();
        setTimeout(function(){
               var content = gs.export.getExportContent();
               gs.export.doExport(content);
        }, 100);
	},
	getExportContent: function(){
		var data= '';
		var rowLength = $('#pendingDetails tbody tr').length;
		for(i=0; i< rowLength; i++){
			var newRowData = true;
			data += i+1 + ',';
			for(j=1; j<8; j++){
				data += '"'+ $('#pendingDetails tbody tr:eq('+ i +') td:eq('+ j +')').text() + '"';
				data += ',';
			}
			var ornList = $('#pendingDetails tbody tr:eq('+ i +') td:eq(8) div').attr('data-content');
			var ornListCount = $(ornList).find('tbody tr').length;
			for(orn = 0; orn< ornListCount ; orn++){
				if(newRowData)
					newRowData = false;			
				else
					data += '@@';
				data += $(ornList).find('tbody tr:eq('+ orn +') td:eq(1)').text() + ':' + $(ornList).find('tbody tr:eq('+ orn +') td:eq(3)').text();
			}
			data += '\n';
		}
		return data;
	},

	doExport: function(data){
		var content = data;
 		var encodedUri = encodeURIComponent(content);
        var link = document.createElement("a");
        var filename = 'my_file';
        link.setAttribute("href", 'data:attachment/csv,' + encodedUri);
        link.setAttribute("download", filename+".csv");
        link.setAttribute("target","_blank");
        document.body.appendChild(link);
        link.click();
        gs.spinner.hide();
	}
}


