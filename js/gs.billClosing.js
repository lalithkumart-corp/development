if(typeof gs == 'undefined'){
    var gs = {};
}
gs.billClosing = {
	init: function(){
		if($('.mainContent').hasClass('book'))
            $('.mainContent').removeClass('book');
		gs.billClosing.bindEvents();
		$('#billToBeClosed').focus();
	},
	bindEvents: function(){
		var aSelf = gs.billClosing;
		$("input[type='text']").on('click', function () {
   			$(this).select();
		});
			
		$(document).on('mouseover', '.autocomplete-suggestion', function(e){
			gs.billClosing.onBillHover($(this).text());
		});
		$('#billToBeClosed').on('keyup', function(e){
			var key = 'which' in e ? e.which : e.keyCode;
			if(key == 40 || key == 38){
				var bill = $('.autocomplete-selected').text();
				console.log($('.autocomplete-selected').text());	
				gs.billClosing.onBillHover(bill);
				return;
			}else{

			}		
		});
		$('#billToBeClosed').on('keyup', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
            	$('#discount_amt').focus();
            }
        });
        $('#discount_amt').on('keyup', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
            	$('#paid_amt').focus();
            }
        });
        $('#paid_amt').on('keyup', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
            	$('.closeBillButton').focus();
            }
        });

		$('#billToBeClosed').on('blur', function(e){
			setTimeout(function(){
				if($('#billToBeClosed').val() == "")
					gs.billClosing.clearEntries();	
			}, 500)
			
		});
		$('.closeBillButton').on('click', function(e){
			$('#billCloseConfirmationModel').modal('show');
			gs.billClosing.bindConfirmationEvents();		
		});

		$('#int_rate').on('keyup', function(e){
		    gs.billClosing.updateDetailsOnChange();
		});
		$('#discount_amt').on('keyup', function(e){
			gs.billClosing.updateDetailsOnChange();
		});
		$('#int_month').on('keyup', function(e){
			gs.billClosing.updateDetailsOnChange();
		});
		
		gs.autocompleter.init('billClosing');
	},
	bindConfirmationEvents: function(){
		var aSelf = gs.billClosing;
		$('#billCloseConfirmationModel').on('shown.bs.modal', function () {
			$('#confirmBillClose').focus();
			var billNumber = $('#closingBillNo').text();
			$("#billCloseConfirmationModel .modal-body").html('Are you sure to <b>CLOSE</b> the Bill No <b>'+ billNumber  + '?</b>');
			$('#confirmBillClose').off().on('click', function(e){
					$('#billCloseConfirmationModel').modal('hide');
					if(billNumber == "" || ($('.closeBillButton.active').length == 0))
						return;
					else{
						var datas = aSelf.getEntries();
						var obj = {
							aQuery: "UPDATE "+gs.database.schema+".pledgebook SET status='closed', billClosedDate='"+ datas.closingDate +"' WHERE billNo='"+billNumber+"'"
						}
						var callBackObj = application.core.getCallbackObject();
				        var request = application.core.getRequestData('../php/executequery.php', obj , 'POST');
				        callBackObj.bind('api_response', function(event, response){
		        			var obj = {
		        				aQuery: "INSERT INTO "+gs.database.schema+".billclosingdetail (billNo, pledgedDate, closedDate, pledge_amt, no_of_month, rate_of_interest, int_rupee_per_month, interest_amt, actual_estimated_amt, discount_amt, paid_amt, payment_mode) VALUES ('"+datas.billNo+"', '"+datas.pledgedDate+"', '"+ datas.closingDate +"','"+ datas.pledgedAmt +"', '"+ datas.no_of_month +"', '"+ datas.int_rate +"', '"+ datas.int_rupee_per_month+ "','"+ datas.interest_amt +"', '"+ datas.actual_estimated_amt + "', '"+ datas.discount_amt +"', '"+ datas.paid_amt +"', '"+ datas.payment_mode+"')"
		        			}
		        			var callBackObj2 = application.core.getCallbackObject();
		        	        var request = application.core.getRequestData('../php/executequery.php', obj , 'POST');
		        	        callBackObj2.bind('api_response', function(event, response){
		        	         	gs.billClosing.clearEntries();
						        gs.autocompleter.setAutoCompleter('billClosing');						        
		        	        });
		        	        application.core.call(request, callBackObj2);
				        });
				        application.core.call(request, callBackObj);

						
					}
			});
		});
	},

	//In Closing bill page, on selecting bill No.
	onBillSelect: function(billNo, pageName){
		if(typeof pageName == 'undefined' || pageName == '')
			pageName = 'billClosingPage';
		var obj = {};
		if(pageName == 'book')
			obj.aQuery = "SELECT * FROM "+gs.database.schema+".pledgebook where billNo='"+billNo+"' and status='closed'";
		else
        	obj.aQuery = "SELECT * FROM "+gs.database.schema+".pledgebook where billNo='"+billNo+"' and status='open'";
        
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('../php/executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
          gs.billClosing.fillDetails(JSON.parse(response), pageName);
        });
        application.core.call(request, callBackObj);
	},

	onBillHover: function(billNo){
		gs.billClosing.onBillSelect(billNo);
	},

	fillDetails: function(response, pageName){
		var aSelf = gs.billClosing;
		aData = response[0];
		if(typeof aData == "undefined"){
			aSelf.clearEntries();
			$('#billToBeClosed').focus();
			return;
		}
		var pledgeAmount = Number(aData.amount);
		$("#closingBillNo").html(aData.billNo);
		$('#closingBillPledgeDate').html(aData.dates);
		$('#closingCustomerName').html(aData.cname);
		$('#closingBillCareName').html(aData.fgname);
		$('#closingBillAddress').html(aData.address);
		$('#closingBillLocation').html(aData.place + aData.pincode);
		$('#closingOrnWeight').html(aData.netwt + ' gm');
		$('#closingPledgeAmt').html(pledgeAmount);
		$('#closingCustomerPic').attr('src', aData.profilepicpath);

		if(pageName == 'book')
			$('#date').datepicker().datepicker("setDate", aData.billClosedDate);

		$('.pledgeDate').text(aData.dates);
		$('.redeemDate').text($('#date').val());
		

		//START:: Orn Table
		$("#closingOrnDetails tbody tr").remove();
		var ornList = aData.ornaments;
		var totalOrns = ornList.split(',');
		_.each(totalOrns , function(ornValue, ornKey){
			var aOrn = ornValue.split(':');	
			htmlContent = "<tr><td>"+ (ornKey+1) +"</td>";
			 _.each(aOrn , function(values, keys){
				htmlContent +="<td>"+values+"</td>";
			 }); 
			htmlContent += "</tr>";
			$('#closingOrnDetails tbody').append(htmlContent);
		}); 
		//END :: Orn table
		
		//START:: Calculation Table//
		aSelf.fillCalculationTable(pledgeAmount, aData.ornType, pageName);
		//END:: Calculation Table//

		$('.closeBillButton').addClass('active');
	},

	fillCalculationTable: function(pledgeAmount, ornType, pageName){
		var aSelf = gs.billClosing;
		var date1 = $('.pledgeDate').text();
		var date2 = $('.redeemDate').text();
		var monthCount = aSelf.calDiff(date1, date2);

		if(pageName == 'billClosingPage'){
			var interestData = localStorage.getItem('interestData');
			var intRate = application.bill.creation.findInterestRate(pledgeAmount, ornType, JSON.parse(interestData));
			var int_per_month = Number(aSelf.calculateIntPerMonth(pledgeAmount, intRate, 1));			
			//var monthCount = Number($('#int_month').val() || 0);
			var int_total_month = int_per_month * monthCount;
			var discount_amt = Number($('#discount_amt').val() || 0);
			var total_amt = pledgeAmount + int_total_month - discount_amt;
			$('#principal_amt').val(pledgeAmount);
			$('#int_rate').val(intRate);
			$('#int_month').val(monthCount);
			$('#int_amt_month').val(int_per_month);
			$('#int_amt_total').val(int_total_month);
			$('#total_amt').val(total_amt);
			$('#discount_amt').val(discount_amt);
			$('#paid_amt').val(total_amt);
		}
		if(pageName == 'book'){
			var billNo = $("#closingBillNo").text();
			$('#billToBeClosed').val(billNo);
			var obj = {};
			obj.aQuery = "SELECT * FROM "+gs.database.schema+".billclosingdetail where billNo='"+billNo+"'";
			var callBackObj = application.core.getCallbackObject();
			var request = application.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
			  response = JSON.parse(response);
			  response = response[0];
			  $('#principal_amt').val(response.pledge_amt);
			  $('#int_rate').val(response.rate_of_interest);
			  $('#int_month').val(response.no_of_month);
			  $('#int_amt_month').val(response.int_rupee_per_month);
			  $('#int_amt_total').val(response.interest_amt);
			  $('#total_amt').val(response.actual_estimated_amt);
			  $('#discount_amt').val(response.discount_amt);
			  $('#paid_amt').val(response.paid_amt);
			  switch(response.payment_mode){
			  	case 'Cash':
			  		$('.payment_mode').val(0);
			  		break;
			  	case 'Cheque':
			  		$('.payment_mode').val(2);
			  		break;
			  	case 'Card':
			  		$('.payment_mode').val(1);
			  		break;
			  	default:
			  		$('.payment_mode').val(0);
			  }
			});
			application.core.call(request, callBackObj);
		}
		
	},

	getCalculationDatas: function(pledgeAmount, ornType, pageName){
		var aSelf = gs.billClosing;
		var interestData = localStorage.getItem('interestData');
		var intRate = application.bill.creation.findInterestRate(pledgeAmount, ornType, JSON.parse(interestData));
		var int_per_month = Number(aSelf.calculateIntPerMonth(pledgeAmount, intRate, 1));
		var monthCount = Number($('#int_month').val() || 0);
		var int_total_month = int_per_month * monthCount;
		var discount_amt = Number($('#discount_amt').val() || 0);
		var total_amt = pledgeAmount + int_total_month - discount_amt;
		if(pageName == 'book'){
			var obj = {};
			obj.no_of_month = monthCount;
			obj.int_rate = intRate;
			obj.interest_amt = int_total_month;
			obj.int_rupee_per_month = int_per_month;
			obj.actual_estimated_amt = total_amt;
			obj.discount_amt = discount_amt;
			obj.paid_amt = total_amt;
			obj.payment_mode = 'cash';
			return obj;
		}
	},

	calculateIntPerMonth: function(amt, int_rate, month){
		var amt = Number(amt);
		var int_rate = Number(int_rate);
		var perMonth = Number(amt * int_rate)/100;
		return perMonth;
	},

	clearEntries: function(){
		$('#billToBeClosed').val('');
		$("#closingBillNo").html('');
		$('#closingBillPledgeDate').html('');
		$('#closingCustomerName').html('');
		$('#closingBillCareName').html('');
		$('#closingBillAddress').html('');
		$('#closingBillLocation').html('');
		$('#closingOrnWeight').html('');
		$('#closingPledgeAmt').html('');
		$('#closingCustomerPic').attr('src', '/uploads/default.jpg');
		$("#closingOrnDetails tbody tr").remove();
		$('.closeBillButton').removeClass('active');
		$('.pledgeDate').text('DD/MM/YYYY');
		$('.redeemDate').text('DD/MM/YYYY');
		$('#principal_amt').val(0);
		$('#int_rate').val(0);
		$('#int_amt_month').val(0);
		$('#int_month').val(0)
		$('#int_amt_total').val(0);
		$('#total_amt').val(0);
		$('#discount_amt').val(0);
		$('#paid_amt').val(0);
	},

	getEntries: function(){
		var obj = {};
		obj.billNo = $('#closingBillNo').text();
		obj.pledgedDate = $('#closingBillPledgeDate').text();
		obj.closingDate = $('#date').val();
		obj.pledgedAmt = $('#closingPledgeAmt').text();
		obj.int_rate = $('#int_rate').val();
		obj.no_of_month = $('#int_month').val();
		obj.int_rupee_per_month = $('#int_amt_month').val();
		obj.interest_amt = $('#int_amt_total').val();
		obj.actual_estimated_amt = $('#total_amt').val();
		obj.discount_amt = $('#discount_amt').val();
		obj.paid_amt = $('#paid_amt').val();
		var temp = $('.payment_mode').val()
		obj.payment_mode = $('.payment_mode option[value='+ temp +']').text() || 'cash';	
		return obj;
	},

	updateDetailsOnChange: function(){
		var principal = Number($('#principal_amt').val());
		var intRate = Number($('#int_rate').val());
		var simpleIntPerMonth = (principal * intRate)/100;
		var totalMonthCount = Number($('#int_month').val());
		$('#int_amt_month').val(simpleIntPerMonth);

		var interestRupees = simpleIntPerMonth * totalMonthCount;
		$('#int_amt_total').val(interestRupees);

		var totalEstimate = principal + interestRupees;
		$('#total_amt').val(totalEstimate);

		var discount = Number($('#discount_amt').val());
		$('#paid_amt').val(totalEstimate - discount);
	},

	disableControls: function(){
		$('#date').prop('disabled' , true);
		$('.billClosingCalcDetails input').prop('disabled', true);
		$('#billToBeClosed').prop('disabled',true);
		$('.payment_mode').prop('disabled', true)
		$('.closeBillButton').hide();
		$('#popup-ModifyBill').html('Edit');
        $('#popup-ModifyBill').addClass('popup-editBill');
        $('#popup-ModifyBill').removeClass('popup-updateBill');
	},
	enableControls: function(){
		$('#date').prop('disabled' , false);
		$('.payment_mode').prop('disabled', false);
		$('.billClosingCalcDetails input').prop('disabled', false);
		$('#principal_amt').prop('disabled', true);
	},

	calDiff: function(date1, date2){
		var y1 = date1.substring(date1.lastIndexOf('/') + 1);
		var y2 = date2.substring(date2.lastIndexOf('/') + 1);

		var m1 = date1.substring(date1.indexOf('/') + 1 ,  date1.lastIndexOf('/'));
		var m2 = date2.substring(date2.indexOf('/') + 1 ,  date2.lastIndexOf('/'));

		var d1 = date1.substring(0,date1.indexOf('/'));
		var d2 = date2.substring(0,date2.indexOf('/'));

		y1 = Number(y1);
		y2 = Number(y2);
		m1 = Number(m1);
		m2 = Number(m2);
		d1 = Number(d1);
		d2 = Number(d2);

		yDiff = y2-y1;
		var temp = yDiff*12;

		mDiff = m2-m1;
		temp = temp + mDiff;

		if(d2 <= d1 && temp > 0)
			temp = temp-1;

		return temp;
	}
}