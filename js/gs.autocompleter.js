if(typeof gs == 'undefined'){
    var gs = {};
}
gs.autocompleter = {
	pendingCustomers: [],
	pendingGuardians: [],
	address: [],
	address: [],
	closedCustomers: [],
	closedGuardians: [],
	pendingBillNos: [],
	place: [],
	pincode: [],
	mobileNos: [],
	ornList: [],
	init: function(page){
		gs.autocompleter.bindEvents(page);
	},
	bindEvents: function(page){
		var aSelf = gs.autocompleter;
		if(page == 'billCreation'){
			aSelf.getPendingCustomers();
			aSelf.getPendingGaurdians();
			aSelf.getAddress();
			aSelf.getAddress2();
			aSelf.getPlace();
			aSelf.getPincode();
			aSelf.getMobileNos();
			aSelf.getOrnList();
			aSelf.billCreation();
			aSelf.billOrnList();
		}else if(page == 'billClosing'){
			aSelf.getPendingBillNo();
			aSelf.bindBillNo(); //binds autocompleter with pending bill numbers
		}
	},
	billCreation: function(){
		var aSelf = gs.autocompleter;
		//setTimeout(function(){
			if(!_.isEmpty(aSelf.pendingCustomers) && !_.isEmpty(aSelf.pendingGuardians) && !_.isEmpty(aSelf.address) && !_.isEmpty(aSelf.address2)){
				var cname = $.map(aSelf.pendingCustomers, function (listItem) { return { value: listItem, data: { category: 'customer' }}; });
		        var fname = $.map(aSelf.pendingGuardians, function (listItem) { return { value: listItem, data: { category: 'Care of' }}; });
		        var address = $.map(aSelf.address, function (listItem) { return { value: listItem, data: { category: 'Address' }}; });
		        var address2 = $.map(aSelf.address2, function (listItem) { return { value: listItem, data: { category: 'Address2' }}; });
		        var place = $.map(aSelf.place, function (listItem) { return { value: listItem, data: { category: 'Place' }}; });
		        var pincode = $.map(aSelf.pincode, function (listItem) { return { value: listItem, data: { category: 'Pincode' }}; });
		        var mobileNos = $.map(aSelf.mobileNos, function(listItem){ return { value: listItem, data: { category: 'MobileNo'}}; });

		        //var list = cname.concat(fname);
		        
		        $('#customerName').devbridgeAutocomplete({
		            lookup: cname,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#fatherGaurdianName').devbridgeAutocomplete({
		        	lookup: fname,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#address').devbridgeAutocomplete({
		        	lookup: address,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#address2').devbridgeAutocomplete({
		        	lookup: address2,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#place').devbridgeAutocomplete({
		        	lookup: place,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#pincode').devbridgeAutocomplete({
		        	lookup: pincode,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		        $('#mobNo').devbridgeAutocomplete({
		        	lookup: mobileNos,
		            minChars: 0,
		            onSelect: function (suggestion) {
		                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
		            },
		            showNoSuggestionNotice: true,
		            noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category'
		        });
		    }else{
				setTimeout(function(){ //since API response might delay
					aSelf.billCreation();
				},100)
			}
		//},1);
			
       
	},
	bindBillNo: function(){
		var aSelf = gs.autocompleter;
		if(!_.isEmpty(aSelf.pendingBillNos)){
				//remove existing suggestion container
				$('.closingBillAutoSuggestions').remove();

				var pendingBillNos = $.map(aSelf.pendingBillNos, function (listItem) { return { value: listItem, data: { category: 'Bill No' }}; });
				$('#billToBeClosed').devbridgeAutocomplete({
		        	lookup: pendingBillNos,
		            minChars: 0,
		            onSelect: function (suggestion) {
		               gs.billClosing.onBillSelect(suggestion.value);
		            },
		            showNoSuggestionNotice: true,
		            //noSuggestionNotice: 'Sorry, no matching results',
		            groupBy: 'category',
		            customCallback: 'gs.billClosing.clearEntries',
		            secondaryClass: 'closingBillAutoSuggestions'
		        });
		}else{
				setTimeout(function(){ //since API response might delay
					aSelf.bindBillNo();
				},100)
			}
	},
	billOrnList: function(){
		var aSelf = gs.autocompleter;
		if(!_.isEmpty(aSelf.ornList)){
			var ornList = $.map(aSelf.ornList, function (listItem) { return { value: listItem, data: { category: 'OrnList' }}; });
			$('.newItem').devbridgeAutocomplete({
	        	lookup: ornList,
	            minChars: 0,
	            onSelect: function (suggestion) {
	                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
	            },
	            showNoSuggestionNotice: true,
	            noSuggestionNotice: 'Sorry, no matching results',
	            groupBy: 'category',
	            secondaryClass: 'ornListAutoSuggestions'
	        });
         }else{
			setTimeout(function(){ //since API response might delay
				aSelf.billOrnList();
				},100)
			}
	},
	billClosing: function(){

	},
	
	getPendingCustomers: function(){
		var query = "SELECT cname FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storePendingCustomerLists);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storePendingCustomerLists(response);
		});
		application.core.call(request, callBackObj);
	},
	getPendingGaurdians: function(){
		var query = "SELECT fgname FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storePendingGuardianLists);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storePendingGuardianLists(response);
		});
		application.core.call(request, callBackObj);
	},
	getAddress: function(){
		var query = "SELECT address FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storeAddress);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storeAddress(response);
		});
		application.core.call(request, callBackObj);
	},
	getAddress2: function(){
		var query = "SELECT address2 FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storeAddress2);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storeAddress2(response);
		});
		application.core.call(request, callBackObj);
	},
	getPlace: function(){
		var query = "SELECT place FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storePlace);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storePlace(response);
		});
		application.core.call(request, callBackObj);
	},
	getPincode: function(){
		var query = "SELECT pincode FROM "+gs.database.schema+".pledgebook";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storePincode);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storePincode(response);
		});
		application.core.call(request, callBackObj);
	},
	getMobileNos: function(){
		var query = "SELECT mobile FROM "+gs.database.schema+".pledgebook";
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storeMobileNos(response);
		});
		application.core.call(request, callBackObj);
	},

	getOrnList: function(){
		var query = "SELECT ornament_name FROM "+gs.database.schema+".ornament_list";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storeOrnList);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storeOrnList(response);
		});
		application.core.call(request, callBackObj);
	},
	getPendingBillNo: function(){
		var query = "SELECT billNo FROM "+gs.database.schema+".pledgebook where status = 'open'";
		//gs.querybuilder.executeQuery(query, gs.autocompleter.storePendingBillNos);
		var obj = {
			aQuery: query
		}
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.storePendingBillNos(response);
		});
		application.core.call(request, callBackObj);
	},
	storePendingCustomerLists: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'cname');
		aSelf.pendingCustomers = [];
		_.each(data , function(value, key){
			aSelf.pendingCustomers.push(value.cname);
		});
	},

	storePendingGuardianLists: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'fgname');
		aSelf.pendingGuardians = [];
		_.each(data , function(value, key){
			aSelf.pendingGuardians.push(value.fgname);
		});
	},
	storeAddress: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'address');
		aSelf.address = [];
		_.each(data , function(value, key){
			aSelf.address.push(value.address);
		});
	},
	storeAddress2: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'address2');
		aSelf.address2 = [];
		_.each(data , function(value, key){
			if(!_.isEmpty(value.address2))
				aSelf.address2.push(value.address2);
		});
	},
	storePlace: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'place');
		aSelf.place = [];
		_.each(data , function(value, key){
			aSelf.place.push(value.place);
		});
	},
	storePincode: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'pincode');
		aSelf.pincode = [];
		_.each(data , function(value, key){
			aSelf.pincode.push(value.pincode);
		});
	},
	storeMobileNos: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'mobile');
		aSelf.mobileNos = [];
		_.each(data , function(value, key){
			aSelf.mobileNos.push(value.mobile);
		});
	},
	storeOrnList: function(data){
		var aSelf = gs.autocompleter;
		aSelf.ornList = [];
		_.each(data , function(value, key){
			aSelf.ornList.push(value.ornament_name);
		});
	},
	storePendingBillNos: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'billNo');
		aSelf.pendingBillNos = [];
		_.each(data , function(value , key){
			aSelf.pendingBillNos.push(value.billNo);
		})
	},
	getUniqueList: function(data, param){
		var data = _.uniq(data, function(aData) { 
                            return aData[param];
                        });
		return data;
	}
}