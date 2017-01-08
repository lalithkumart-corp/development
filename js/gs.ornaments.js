if(typeof gs == 'undefined'){
    var gs = {};
}
gs.ornaments = {
	init: function(){
		this.renderTable();
	},
	storage: [],
	temp: {
		currentId: '',
		currentName: ''
	},
	renderTable: function(){
		var aSelf = gs.ornaments;
		gs.spinner.show();
		function getActionsHtml(){
			var aRow = '<div class="ornament-actions-bar">';
			aRow += '<input type="checkbox" title="Select" class="select-deselect-Orn"/>';
			aRow += '<input type="checkbox" title="Disable this ornament" class="ornState" id="ornStatus"/><label for="ornStatus"></label>';
			aRow += '<img class="edit-icon" src="/images/edit-icon.png" title="Edit this Ornament Name"></img>';
			aRow += '<img class="delete-icon" src="/images/delete-icon.png" title="Delete this Ornament"></img>';
			aRow += '</div>';
			return aRow;
		}
		var obj = {};
		obj.aQuery= "SELECT * from "+gs.database.schema+".ornament_list";
		var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
			data = JSON.parse(response);
			$('#ornManagementTable tbody').html('');
			var sno = 1;
			_.each(data, function(value, index){
				aSelf.storage.push(value.ornament_name);
				var aRow = '<tr class="enabledOrn"><td>'+sno+'</td><td id="'+value.ornament_id+'" class="ornName">'+value.ornament_name+'</td><td class= "actionsCol">'+getActionsHtml()+'</td></tr>';
				$('#ornManagementTable tbody').append(aRow);
				sno= sno + 1;
			});
			aSelf.bindEvents();
			gs.spinner.hide();
        });
        application.core.call(request, callBackObj);
	},
	bindEvents: function(){
		var aSelf = gs.ornaments;
		$('#addNewOrn').on('click', function(e){

		});
		$('.ornState').off().on('change', function(e){
			$(this).closest('tr').toggleClass('enabledOrn disabledOrn');
		});
		$('#ornManagementTable tbody').delegate('tr', 'mouseover', function(e) {
			$(this).find('.ornament-actions-bar').show();
		}).delegate('tr', 'mouseout', function(e) {		    
		    $(this).find('.ornament-actions-bar').hide()
		});
		$('.delete-icon').off().on('click', function(e){
			function afterPopupHidden(){
				aSelf.temp.currentId = '';
				aSelf.temp.currentName = '';
			}
			aSelf.temp.currentName = $(this).closest('tr').find('.ornName').text();
			aSelf.temp.currentId = $(this).closest('tr').find('.ornName').attr('id');
			gs.popup.init({
				title: 'Confirmation',
				desc: 'Are you Sure to delete the Ornament <b>'+ aSelf.temp.currentName+ '</b>',
				buttons: ['Yes'],
				callbacks: [aSelf.confirmDelete],
				dismissBtnText: 'No',
				onHiddenCallback: afterPopupHidden
			});
		});
		$('.edit-icon').off().on('click', function(e){
			function afterPopupHidden(){
				aSelf.temp.currentId = '';
				aSelf.temp.currentName = '';
			}
			function afterPopupShown(){
				$('#ornEditedValue').on('focus', function(e){
					$(this).select();
				})
				$('#ornEditedValue').focus();
			}
			aSelf.temp.currentName = $(this).closest('tr').find('.ornName').text();
			aSelf.temp.currentId = $(this).closest('tr').find('.ornName').attr('id');
	        gs.popup.init({
	           	title: 'Edit',
				desc: '<input type="text" placeholder="Ornament Name" id="ornEditedValue" value="'+aSelf.temp.currentName+'"/>',
				buttons: ['Update'],
				callbacks: [aSelf.editOrnament],
				dismissBtnText: 'Cancel',
				onShownCallback: afterPopupShown
	        });
		});
		$('.delete-selected-orn').off().on('click', function(e){
			var selectedRowsCount = $('#ornManagementTable tr.selected').length;
			if(selectedRowsCount < 1)
				return;
			gs.popup.init({
	           	title: 'Confirmation',
				desc: 'Do you want to Delete the selected Ornaments ?',
				buttons: ['Yes'],
				callbacks: [aSelf.confirmDeleteAll],
				dismissBtnText: 'No'
	        });
		});
		$('.select-deselect-Orn').off().on('change', function(e){
			$(this).closest('tr').toggleClass('selected');
		});
		$('#addNewOrn').off().on('click', function(e){
			function setInputFocus(){
				$('.ornInputField').focus();
			}
			var newOrnName = $('.ornInputField').val();
			if(newOrnName == ''){
				gs.popup.init({
		           	title: 'Alert',
					desc: 'Please Enter Ornament Name in the Input',
					dismissBtnText: 'OK',
					onHiddenCallback: setInputFocus
		        });
			}else{
				gs.popup.init({
		           	title: 'Confirmation',
					desc: 'Do you really want to add '+ newOrnName + ' in Ornaments ? ',
					buttons: ['Yes'],
					callbacks: [aSelf.addNewOrn],
					dismissBtnText: 'No'
		        });
			}
		});
	},
	confirmDelete: function(){
		var aSelf = gs.ornaments;
		var currentName = aSelf.temp.currentName;
		var ornId = aSelf.temp.currentId;
		gs.spinner.show();
		gs.popup.hide();
		var obj = {};
        obj.aQuery= 'DELETE FROM '+gs.database.schema+'.ornament_list WHERE ornament_id = "'+ornId+'"';
		var request = application.core.getRequestData('executequery.php', obj , 'POST');
		var callBackObj = application.core.getCallbackObject();
        callBackObj.bind('api_response', function(event, response){
        	response = JSON.parse(response);
            if(response[0].status == true){
                gs.popup.init({
	               	title: 'Success !',
	   				desc: 'The Ornament <b>'+currentName+'</b> has been Deleted',
	   				dismissBtnText: 'Ok'
	            });
	            aSelf.renderTable();
            }
            else{
            	gs.popup.init({
	               	title: 'Error !',
	   				desc: 'The Ornament <b>'+currentName+'</b> could not be Deleted.',
	   				dismissBtnText: 'Ok',
	            });	            
            }    
            gs.spinner.hide();       
        });
        application.core.call(request, callBackObj);
	},
	confirmDeleteAll: function(){
		var aSelf = gs.ornaments;
		gs.popup.hide();
		var rows = $('#ornManagementTable tr.selected');
		var obj = {};
        query= 'DELETE FROM '+gs.database.schema+'.ornament_list WHERE ornament_id IN (';
		_.each(rows, function(row, index){
			var temp = $(row).find('td.ornName');
			var ornId = $(temp).attr('id');
			query += ' "'+ornId+'",';
		});
		query = query.substring(0, query.length-1);
		query += ')';
		obj.aQuery = query;
		var request = application.core.getRequestData('executequery.php', obj , 'POST');
		var callBackObj = application.core.getCallbackObject();
        callBackObj.bind('api_response', function(event, response){
        	response = JSON.parse(response);
            gs.spinner.hide();
            if(response[0].status == true){
			    gs.popup.init({
		           	title: 'Success',
					desc: 'The Seledted Ornaments have been Deleted Successfully !',
					dismissBtnText: 'Ok'
			    });
	            aSelf.renderTable();
	        }else{
			    gs.popup.init({
		           	title: 'Error !',
					desc: 'The Seledted Ornaments could not be Deleted !',
					dismissBtnText: 'Ok'
			    });
	        }
        });
        application.core.call(request, callBackObj);
	},
	editOrnament: function(){
		var aSelf = gs.ornaments;   
		var newVal= $('#ornEditedValue').val();
		if(newVal == '')
			return;
		var currentName = aSelf.temp.currentName;
		var ornId = aSelf.temp.currentId;
		gs.spinner.show();
		gs.popup.hide();
		var obj = {};
        obj.aQuery= 'UPDATE '+gs.database.schema+'.ornament_list SET ornament_name = "'+newVal+'" WHERE ornament_id = "'+ornId+'"';
		var request = application.core.getRequestData('executequery.php', obj , 'POST');
		var callBackObj = application.core.getCallbackObject();
        callBackObj.bind('api_response', function(event, response){
        	response = JSON.parse(response);
            if(response[0].status == true){
                gs.popup.init({
	               	title: 'Success !',
	   				desc: 'The Ornament has been changed from <b>'+currentName+'</b> to <b>'+newVal+'</b>',
	   				dismissBtnText: 'Ok'
	            });
	            aSelf.renderTable();
            }
            else{
            	gs.popup.init({
	               	title: 'Error !',
	   				desc: 'The Ornament <b>'+currentName+'</b> could not be Updated.',
	   				dismissBtnText: 'Ok'
	            });
            }    
            gs.spinner.hide();       
        });
        application.core.call(request, callBackObj);
	},
	addNewOrn: function(){
		var aSelf = gs.ornaments;
		gs.popup.hide();
		gs.spinner.show();
		var newOrnName = $('.ornInputField').val();
		var obj = {};
        obj.aQuery= 'INSERT into '+gs.database.schema+'.ornament_list (ornament_id, ornament_name, ornament_status) VALUES ("'+$.now()+'", "'+newOrnName+'", "active")';
		var request = application.core.getRequestData('executequery.php', obj , 'POST');
		var callBackObj = application.core.getCallbackObject();
        callBackObj.bind('api_response', function(event, response){
        	response = JSON.parse(response);
            if(response[0].status == true){
                gs.popup.init({
	               	title: 'Success',
	   				desc: 'The Ornament <b>'+newOrnName+'</b> has been inserted Successfully !',
	   				dismissBtnText: 'Ok'
	            });
	            aSelf.renderTable();
            }else{
            	gs.popup.init({
	               	title: 'Error',
	   				desc: 'The Ornament <b>'+newOrnName+'</b> could not be Added into Ornament list !',
	   				dismissBtnText: 'Ok'
	            });
            }
            gs.spinner.hide();
        });
        application.core.call(request, callBackObj);
	}
}