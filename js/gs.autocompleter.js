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
		gs.autocompleter.setAutoCompleter(page);
	},
	setAutoCompleter: function(page){
		var aSelf = gs.autocompleter;
		if(page == 'billCreation'){
			aSelf.getCNames();
			aSelf.getFGNames();
			aSelf.getAddress();
			aSelf.getAddress2();
			aSelf.getPlace();
			aSelf.getPincode();
			aSelf.getMobileNos();
			aSelf.getOrnList();
		}else if(page == 'billClosing'){
			aSelf.getPendingBillNo();
		}
	},

	/*START:: util Methods*/
	getUniqueList: function(data, param){
		var data = _.uniq(data, function(aData) { 
                            return aData[param];
                        });
		return data;
	},
	/*END:: util Methods*/

	/*START:: getter Methods*/
	getCNames: function(){
		var obj = {};
		obj.aQuery = "SELECT distinct cname FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setCNames(response);
		});
		application.core.call(request, callBackObj);
	},
	getFGNames: function(){
		var obj = {};
		obj.aQuery = "SELECT fgname FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setFGNames(response);
		});
		application.core.call(request, callBackObj);
	},
	getAddress: function(){
		var obj = {};
		obj.aQuery = "SELECT address FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setAddress(response);
		});
		application.core.call(request, callBackObj);
	},
	getAddress2: function(){
		var obj = {};
		obj.aQuery = "SELECT address2 FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setAddress2(response);
		});
		application.core.call(request, callBackObj);
	},
	getPlace: function(){
		var obj = {};
		obj.aQuery = "SELECT place FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setPlace(response);
		});
		application.core.call(request, callBackObj);
	},
	getPincode: function(){
		var obj = {};
		obj.aQuery = "SELECT pincode FROM "+gs.database.schema+".pledgebook";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setPincode(response);
		});
		application.core.call(request, callBackObj);
	},
	getMobileNos: function(){
		var obj = {};
		obj.aQuery = "SELECT mobile FROM "+gs.database.schema+".pledgebook";		
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setMobileNos(response);
		});
		application.core.call(request, callBackObj);
	},
	getOrnList: function(){
		var obj = {};
		obj.aQuery = "SELECT ornament_name FROM "+gs.database.schema+".ornament_list";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setOrnList(response);
		});
		application.core.call(request, callBackObj);
	},
	getPendingBillNo: function(){
		var obj = {};
		obj.aQuery = "SELECT billNo FROM "+gs.database.schema+".pledgebook where status = 'open'";
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/executeQuery.php', obj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   	gs.autocompleter.setPendingBillNos(response);
		});
		application.core.call(request, callBackObj);
	},
	/*END:: getter Methods*/

	/*START:: setter Methods*/
	setCNames: function(data){
		var aSelf = gs.autocompleter;
		//data = aSelf.getUniqueList(data, 'cname');
		aSelf.pendingCustomers = [];
		_.each(data , function(value, key){
			aSelf.pendingCustomers.push(value.cname);
		});
		aSelf.fillCName();
	},
	setFGNames: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'fgname');
		aSelf.pendingGuardians = [];
		_.each(data , function(value, key){
			aSelf.pendingGuardians.push(value.fgname);
		});
		aSelf.fillFGName();
	},
	setAddress: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'address');
		aSelf.address = [];
		_.each(data , function(value, key){
			aSelf.address.push(value.address);			
		});
		aSelf.fillAddress();
	},
	setAddress2: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'address2');
		aSelf.address2 = [];
		_.each(data , function(value, key){
			if(!_.isEmpty(value.address2))
				aSelf.address2.push(value.address2);
		});
		aSelf.fillAddress2();
	},
	setPlace: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'place');
		aSelf.place = [];
		_.each(data , function(value, key){
			aSelf.place.push(value.place);
		});
		aSelf.fillPlace();
	},
	setPincode: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'pincode');
		aSelf.pincode = [];
		_.each(data , function(value, key){
			aSelf.pincode.push(value.pincode);
		});
		aSelf.fillPincode();
	},
	setMobileNos: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'mobile');
		aSelf.mobileNos = [];
		_.each(data , function(value, key){
			aSelf.mobileNos.push(value.mobile);
		});
		aSelf.fillMobileNos();
	},
	setOrnList: function(data){
		var aSelf = gs.autocompleter;
		aSelf.ornList = [];
		_.each(data , function(value, key){
			aSelf.ornList.push(value.ornament_name);
		});
		aSelf.fillOrnList();
	},
	setPendingBillNos: function(data){
		var aSelf = gs.autocompleter;
		data = aSelf.getUniqueList(data, 'billNo');
		aSelf.pendingBillNos = [];
		_.each(data , function(value , key){
			aSelf.pendingBillNos.push(value.billNo);
		});
		aSelf.fillPendingBillNos();
	},
	/*END:: setter Methods*/

	/*START:: filler Methods*/
	fillCName: function(){
		var aSelf = gs.autocompleter;
		var cname = $.map(aSelf.pendingCustomers, function (listItem) { return { value: listItem, data: { category: 'customer' }}; });
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
	},
	fillFGName: function(){
		var aSelf = gs.autocompleter;
		var fname = $.map(aSelf.pendingGuardians, function (listItem) { return { value: listItem, data: { category: 'Care of' }}; });
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
	},
	fillAddress: function(){
		var aSelf = gs.autocompleter;
		var address = $.map(aSelf.address, function (listItem) { return { value: listItem, data: { category: 'Address' }}; });
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
	},
	fillAddress2: function(){
		var aSelf = gs.autocompleter;
		var address2 = $.map(aSelf.address2, function (listItem) { return { value: listItem, data: { category: 'Address2' }}; });
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
	},
	fillPlace: function(){
		var aSelf = gs.autocompleter;
		var place = $.map(aSelf.place, function (listItem) { return { value: listItem, data: { category: 'Place' }}; });
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
	},
	fillPincode: function(){
		var aSelf = gs.autocompleter;
		var pincode = $.map(aSelf.pincode, function (listItem) { return { value: listItem, data: { category: 'Pincode' }}; });
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
	},
	fillMobileNos: function(){
		var aSelf = gs.autocompleter;
		var mobileNos = $.map(aSelf.mobileNos, function(listItem){ return { value: listItem, data: { category: 'MobileNo'}}; });
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
	},
	fillOrnList: function(){
		var aSelf = gs.autocompleter;
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
	},
	fillPendingBillNos: function(){
		var aSelf = gs.autocompleter;
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
        $('#billToBeClosed').focus();
	}
	/*END:: filler Methods*/
}