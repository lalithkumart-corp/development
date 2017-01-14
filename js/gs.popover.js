if(typeof gs == 'undefined'){
    var gs = {};
}
gs.popover = {
	init: function(){

	},

	bindPopover: function(container, callback){
		var self = gs.popover;
		$(container).popover({
			'html' : true,
			'trigger' : 'manual',
			'content' : function(){
				return self.getContent(callback);
			},
			placement : function(){
				return self.getPlacement();
			}
		}).click(function(event) { // Trigger popover on click
			event.stopPropagation();
			$(container).popover("toggle");
		}).keyup(function (event) {
	    	if (event.which === 13)// Trigger popover on "Enter" key pressed
	    		$(container).popover("toggle");
		}); 
	},

	getContent: function(callback){
		var self = gs.popover;
		var tmpContainer = $.now();
		var callBackObj = application.core.getCallbackObject();
		var request = application.core.getRequestData('../php/interest.php', '' , 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
		   callback(response, tmpContainer);
		});
		application.core.call(request, callBackObj);
		return '<div id="'+ tmpContainer +'" >Loading...</div>';
	},

	getPlacement: function(){
		var placement = 'top';
		var isPledgeBookPage = $('.mainContent').hasClass('book');
		if(isPledgeBookPage)
			return 'right';
		else
			return placement;
	}
}