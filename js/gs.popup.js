if(typeof gs == 'undefined'){
    var gs = {};
}
gs.popup = {
	selectors: {
		overlay : '.msgModal_overlay',
		container: '.msgModalContainer',
		title: '#msgHeaderText',
		msgBody: '#msgBodyText'
	},
	defaults: {
		text 	: '',
		header 	: ''
	},
	onShownCallback: this.shown,
	dismissButtonId: 'msgDismissButton',
	init: function(options){
		if(_.isUndefined(options))
			var options = {};
		this.msgDescription = options.desc || '';
		this.msgHeader = options.title || '';
		this.buttons = options.buttons || '';
		this.callbacks = options.callbacks;
		this.onHiddenCallback = options.onHiddenCallback || this.onHidden;
		this.onShownCallback = options.onShownCallback || this.onShown;
		this.dismissBtnText = options.dismissBtnText || 'Cancel';
		this.enableHtml = !_.isUndefined(options.enableHtml)?options.enableHtml:true;
		var property = {};
		var template = _.template($('#messageTemplate').html(), property);
		$('body').append(template);
		this.addTitle();
		this.addDescription();
		this.createButtons();		
		this.show();
		this.bindEvents();
	},
	addTitle: function(){
		if(this.enableHtml)
			$(this.selectors.title).html(this.msgHeader);
		else
			$(this.selectors.title).text(this.msgHeader);
	},
	addDescription: function(){
		if(this.enableHtml)
			$(this.selectors.msgBody).html(this.msgDescription);
		else
			$(this.selectors.msgBody).text(this.msgDescription);
	},
	createButtons: function(){
		var aSelf = this;
		if(!_.isUndefined(aSelf.buttons)){
			_.each(aSelf.buttons, function(value, index){
				var aButtonHtml = '<input type="button" id="btn'+index+value+'" value= "'+value+'"/>'
				$('#msgFooterDiv').append(aButtonHtml);
			});
		}

		//add default cancel button
		var dismissBtn = '<input type="button" id="'+this.dismissButtonId+'" value="'+aSelf.dismissBtnText+'"/>';
		$('#msgFooterDiv').append(dismissBtn);
	},
	bindEvents: function(){
		var aSelf = this;
		if(!_.isUndefined(aSelf.buttons)){
			_.each(aSelf.buttons, function(value, index){
				$('#btn'+index+value).on('click', function(event){
					var callBackMeth = aSelf.callbacks[index];
					if(!_.isUndefined(callBackMeth))
						callBackMeth();
				});
			});
		}
		

		$('#'+this.dismissButtonId).off().on('click', function(){
			aSelf.hide();
		});
	},
	show: function(callback){
		$(this.selectors.overlay).show();
		$(this.selectors.container).show();
		this.onShown();
	},
	onShown: function(){
		var aSelf = this;
		$('#'+this.dismissButtonId).focus();
		if(!_.isUndefined(aSelf.onShownCallback)){
			var callBackMeth = aSelf.onShownCallback;
			callBackMeth();
		}
	},
	hide: function(){
		if($(this.selectors.container).length != -1){			
			$(this.selectors.container).remove();
			$(this.selectors.overlay).remove();
			this.onHidden();
		}
	},
	onHidden: function(){
		var aSelf = this;
		if(!_.isUndefined(aSelf.onHiddenCallback)){
			var callBackMeth = aSelf.onHiddenCallback;
			callBackMeth();
		}
	}
}