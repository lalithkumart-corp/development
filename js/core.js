var application = {};
$(document).on('ready',function(){
    application.core.bindHomeEvents();
})
application.core ={
	autocompleter : {
		billClosing : false
	},

	bindHomeEvents : function(){
		var aSelf = application.core;
		$("#renderingTemplate").on('click', function(e){
	        var property = {};
	        var template = _.template($("#myTemplate").html(), property);
	        $('.mainContent').html(template);	       
	    });

	    
	    $('.leftMenus li').mouseover(function(e){
	        $(this).find('.dropdownLabel').show();
	        $(this).find('.dropdown').show();
	    });
	    
	    $('.leftMenus li').mouseout(function(e){
	        $(this).find('.dropdownLabel').hide();
	        $(this).find('.dropdown').hide();
	    });

	    $('li.home').on('click', function(e){
	    	$('.mainContent').html('');
	    });

		$('#createNewBill').on('click', function(e){
			aSelf.updatePageName('billCreationPage');
			var property = {};
			var template = _.template($('#newBillCreationTemplate').html(), property);
			$('.mainContent').html(template);
			$('.autocomplete-suggestions').remove();
			application.bill.creation.init();
			application.bill.customDate.bindEvents('billCreation');
		});
		$('#getPledgeBook').on('click', function(e){
			aSelf.updatePageName('book');
			gs.pledgeBook.init();
		});

		$('#closeABill').on('click', function(e){
			aSelf.updatePageName('billClosingPage');
			var property = {};
			var template = _.template($('#billClosingTemplate').html(), property);
			$('.mainContent').html(template);
			$('.autocomplete-suggestions').remove();
			gs.billClosing.init();
			application.bill.customDate.bindEvents('billClosingPage');
		});

		$('#tallyGenerator').on('click', function(e){
			aSelf.updatePageName('tallyPage');
			var property = {};
			var template = _.template($('#tallyGeneratorTemplate').html(), property);
			$('.mainContent').html(template);
			$('.autocomplete-suggestions').remove();
			application.bill.customDate.bindEvents('tallyGenerator');
		});
		

		$('#tokenGenerator').on('click', function(e){
			aSelf.updatePageName('');
			var property = {};
			var template = _.template($('#tokenGeneratorTemplate').html(), property);
			$('.mainContent').html(template);
			$('.autocomplete-suggestions').remove();
			gs.generateToken.init();
		});

		this.getNecessaryDatas();
	},

	getNecessaryDatas: function(){
		var aSelf = this;
		var callBackObj = aSelf.getCallbackObject();
        var request = application.core.getRequestData('interest.php', '' , 'POST');
        callBackObj.bind('api_response', function(event, response){
           aSelf.setInterestDetailsInStorage(response);
        });
        application.core.call(request, callBackObj);
	},

	setInterestDetailsInStorage: function(response){
		localStorage.setItem('interestData', response);
	},

	getCallbackObject : function() {
		callback = $({});

		/**
		 * Event is used to perform pre operations before accessing the API. (Ex Setting flag values for SEO.)
		 */
		callback.bind("api_request", function(){
			console.log('ÁPI REQUEST Clla binded');
		});

		callback.bind("invalid_credentials", function(event, response) {
			//console.log('ÁPI REQUEST Clla binded');
		});

		//Binding API Error Event.
		callback.bind("api_error", function(event, error) {
			//
		});

		callback.bind("server_error", function(event, theErrorThrown) {
			//
		});
		callback.bind("post_response", function(){
			//
		});

	    callback.bind("domain_error", function(){  //Binding the domain error when the user domain mismatched
	     //
	    });

		return callback;
	},
	call: function(request, callBackObj){
		$.ajax({
		       url: request.method.name,
		       type: request.type,
		       data: request.params,
		       success: function(data, textStatus, jqXHR){
		          application.core.apiSuccessCallback(data, textStatus, jqXHR, callBackObj, request);
		       },
		       error: function(jqXHR, textStatus, errorThrown){
		          application.core.apiErrorCallback(data, textStatus, jqXHR, callBackObj, request);
		       }
		   });
	},
	apiSuccessCallback: function(response, textStatus, jqXHR, callBackObj, request){
		callBackObj.trigger("api_response", response, request);
	},
	apiErrorCallback: function(jqXHR, textStatus, errorThrown, callBackObj, request){
		alert('API ERROR, Check console for more Details ');
		console.log('API Error is = ', textStatus);
	},
	getRequestData: function(methName , data , reqType ){
		var request = {
			method:{
				name : methName,
			},
			params: data,
			type : reqType
		};
		return request;
	},

	//this will remove the class which is set for PageName Identification
	removePageName: function(){
		var pageNames = ['book', 'billCreationPage', 'billClosingPage', 'tallyPage'];
		var classes = $('.mainContent').attr('class');
		classList = classes.split(' ');
		_.each(pageNames, function(value, index){
			if(classList.indexOf(value) >= 0){
				$('.mainContent').removeClass(value);
			}
		});
	},

	//updates the class list with the current page name
	updatePageName: function(currentPageName){
		this.removePageName();
		$('.mainContent').addClass(currentPageName);
	},

	getCurrentPageName: function(){

	},
};
