if(typeof application.bill == "undefined")
	application.bill = {};
application.bill.customDate = {
	bindEvents : function(page){
		/*$('#datetimepicker').datetimepicker({
	        format: 'dd/MM/yyyy',
	        language: 'en'
		});*/
		switch(page){
			case 'billCreation' : 
				$('#date').datepicker().datepicker("setDate", new Date());
			case 'tallyGenerator' :
				$('#date').datepicker().datepicker("setDate", new Date());
			case 'billClosingPage' :
				$('#date').datepicker().datepicker("setDate", new Date());
		}
	
	}
}