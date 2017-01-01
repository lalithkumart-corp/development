if(typeof gs == 'undefined'){
    var gs = {};
}
gs.pledgeBook = {
    viewMode: 'all',
    editingBillNo: '',
    updatedBillNo: '',
    editingBillStatus: '',
    reRenderPledgeBook: false,
	init : function(){
        gs.pledgeBook.viewMode = 'allBills';
		gs.pledgeBook.bindEvents();
		gs.pledgeBook.getPledgeBook();
	},
	bindEvents : function(){
        function bindBillClick(){
            $('.pledgeBillNo').off().on('click', function(e){
                gs.pledgeBook.editingBillNo = $(this).text() || '';
                gs.pledgeBook.editingBillStatus = $(this).parent().find('td:eq(1)').text();
                $('#modalContainer').modal('show');
            });
        }
        bindBillClick();
        $('#modalContainer').on('shown.bs.modal', function () {
            var aBillNo = gs.pledgeBook.editingBillNo;
              if(typeof aBillNo != 'undefined' && !_.isEmpty(aBillNo)){
                gs.pledgeBook.modalPopupInit();
              }
        });
        
        $('#modalContainer').on('hidden.bs.modal', function () {
            if(gs.pledgeBook.reRenderPledgeBook){
                gs.pledgeBook.getPledgeBook();
                gs.pledgeBook.reRenderPledgeBook = false;
            }
        });
        return bindBillClick;
	},
    bindPopupEvents: function(viewing){
        if(viewing == 'viewingOpenBill'){
            $('#popup-ModifyBill').off().on('click', function(e){
                if($(this).hasClass('popup-editBill')){
                    gs.pledgeBook.enablePopup();
                    $(this).html('Update');
                    $(this).removeClass('popup-editBill');
                    $(this).addClass('popup-updateBill');
                }else if($(this).hasClass('popup-updateBill')){
                    gs.pledgeBook.modalPopupUpdateBill();
                }
            });
            $('#popup-closeBill').off().on('click', function(e){
                $('#confirmationModal').modal('show');
                gs.pledgeBook.bindConfirmationEvents('close');
            });
        }else{
            $('#popup-ModifyBill').off().on('click', function(e){
                if($(this).hasClass('popup-editBill')){
                    gs.billClosing.enableControls();
                    $(this).html('Update');
                    $(this).removeClass('popup-editBill');
                    $(this).addClass('popup-updateBill');
                }else if($(this).hasClass('popup-updateBill')){
                    gs.pledgeBook.updateBillClosingDetails();
                }
            });
            $('#popup-openBill').off().on('click', function(e){
                $('#confirmationModal').modal('show');
                gs.pledgeBook.bindConfirmationEvents('open');
            });
        } 
    },
    bindConfirmationEvents: function(status){
        $('#confirmationModal').on('shown.bs.modal', function () {
            $("#confirmationModal .modal-body").html('Are you sure to <b>'+ status + '</b> the Bill No <b>'+ gs.pledgeBook.editingBillNo + '</b>');
            $('.confirmClose').off().on('click', function(e){
                var aDate = new Date();
                var todayDate = aDate.getDate() + '/'+ (aDate.getMonth()+1) + '/' + aDate.getUTCFullYear();
                var principal = Number($('#ammout').val());
                var ornType = application.bill.creation.getOrnType();
                var int_details = gs.billClosing.getCalculationDatas(principal, ornType , 'book');
                var pledgeDate = $('#date').val();

                //START:: update in 'pledgeBook' Table in DB
                var obj = {
                    aQuery: "UPDATE "+gs.database.schema+".pledgebook SET status='closed', billClosedDate='"+todayDate+"' WHERE billNo='"+gs.pledgeBook.editingBillNo+"'"
                }
                var callBackObj = application.core.getCallbackObject();
                var request = application.core.getRequestData('executequery.php', obj , 'POST');
                callBackObj.bind('api_response', function(event, response){
                  
                });
                application.core.call(request, callBackObj);
                //END:: update in 'pledgeBook' Table in DB

                //START:: update in 'billClosingDetail' Table in DB
                var obj = {
                    aQuery: "INSERT INTO "+gs.database.schema+".billclosingdetail (billNo, pledgedDate, closedDate, pledge_amt, no_of_month, rate_of_interest, int_rupee_per_month, interest_amt, actual_estimated_amt, discount_amt, paid_amt, payment_mode) VALUES ('"+gs.pledgeBook.editingBillNo+"', '"+pledgeDate+"', '"+ todayDate +"','"+ principal +"', '"+ int_details.no_of_month +"', '"+ int_details.int_rate +"', '"+ int_details.int_rupee_per_month+"', '"+ int_details.interest_amt +"', '"+ int_details.actual_estimated_amt + "', '"+ int_details.discount_amt +"', '"+ int_details.paid_amt +"', '"+ int_details.payment_mode +"')"
                }
                var callBackObject = application.core.getCallbackObject();
                var request = application.core.getRequestData('executequery.php', obj , 'POST');
                callBackObject.bind('api_response', function(event, response){
                  gs.pledgeBook.onBillStatusUpdated(JSON.parse(response), 'closed');
                  gs.pledgeBook.reRenderPledgeBook = true;
                });
                application.core.call(request, callBackObject);
                //END:: update in 'billClosingDetail' Table in DB

            });
            $('.confirmOpen').off().on('click', function(e){
                //START:: update in 'pledgeBook' Table in DB
                var obj = {
                    aQuery: "UPDATE "+gs.database.schema+".pledgebook SET status='open', billClosedDate='' WHERE billNo='"+gs.pledgeBook.editingBillNo+"'"
                }
                var callBackObj = application.core.getCallbackObject();
                var request = application.core.getRequestData('executequery.php', obj , 'POST');
                callBackObj.bind('api_response', function(event, response){
                  //TODO
                });
                application.core.call(request, callBackObj);
                //END:: update in 'pledgeBook' Table in DB

                //START:: update in 'billClosingDetail' Table in DB
                var obj = {
                    aQuery: "DELETE FROM "+gs.database.schema+".billclosingdetail WHERE billNo='"+gs.pledgeBook.editingBillNo+"'"
                }
                var callBackObj = application.core.getCallbackObject();
                var request = application.core.getRequestData('executequery.php', obj , 'POST');
                callBackObj.bind('api_response', function(event, response){
                  gs.pledgeBook.reRenderPledgeBook = true;
                  gs.pledgeBook.onBillStatusUpdated(JSON.parse(response), 'open');
                });
                application.core.call(request, callBackObj);
                //END:: update in 'billClosingDetail' Table in DB
            });
        });
    },
	getPledgeBook : function(){
        gs.spinner.show();  
		var obj = {};
		$.ajax({
            url: 'getPledgebook.php',
            type: 'POST',
            data: obj,
            success: function(data, textStatus, jqXHR)
            {
                response = JSON.parse(data);
               gs.pledgeBook.renderDetails(response);
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
               console.log("Ajax Error..");
            }
        });
	},
	renderDetails : function(response){
			var property = {};
			var template = _.template($('#pledgeBookTemplate').html(), response);
			$('.mainContent').html(template);
			gs.pledgeBook.asDataTable();
			$('.mainContent').addClass('book');
            gs.pledgeBook.bindEvents();
	},
	
    asDataTable : function(){
		$('#pendingDetails thead tr#filterInput th').not(":eq(3)").each( function () {
        	var title = $('#pendingDetails thead tr#filterInput th').eq( $(this).index() ).text();
        	$(this).html( '<input type="text" class="'+title+'" onclick="event.stopPropagation();" placeholder="'+title+'" />' );
    	});
    	$('#pendingDetails thead tr#filterInput th:eq(3)').html('<div><input type = "text" id = "minDateFilter" placeholder= "StartDate"/><input type = "text" id = "maxDateFilter" placeholder="EndDate"/></div>');

        var tokenPopover = '<div class="tokenCreater" data-toggle="tokenPopover" data-placement="right" data-html="'+gs.pledgeBook.getTokenPopover() +'" data-content="'+ gs.pledgeBook.getTokenPopover() +'" data-title="Token" data-class="exportToken"></div>';
        $('#pendingDetails thead tr#filterInput th:eq(0)').html(tokenPopover);

        var optionsPopover = '<div class="pledgeBookOptions" data-toggle="optionsPopover" data-placement="right" data-html="'+gs.pledgeBook.getOptionsPopover() +'" data-content="'+ gs.pledgeBook.getOptionsPopover() +'" data-title="Options" data-class="viewModePopover"></div>'
        $('#pendingDetails thead tr#filterInput th:eq(1)').html(optionsPopover);

        $('#minDateFilter').datepicker();
        $('#maxDateFilter').datepicker();

    	$("[data-toggle = 'item-popover']").popover({trigger: "click"});
        $("[data-toggle = 'optionsPopover']").popover({trigger: "click"});
        $("[data-toggle = 'tokenPopover']").popover({trigger: "click"});
    	$("#pendingDetails thead input[type='text']:not('.hasDatepicker')").on( 'keyup change', function () {
	        table
	            .column( $(this).parent().index()+':visible' )
	            .search( this.value )
	            .draw();
	    });
		var table = $("#pendingDetails").on( 'init.dt', function () {
               gs.pledgeBook.initComplete();
            }).DataTable({
            	fixedColumns: true,
            	orderCellsTop: true,
                "bPaginate": false
        	});
    	gs.pledgeBook.table = table;

    	$("#minDateFilter").keyup ( function() { table.draw(); } );
		$("#minDateFilter").change( function() { table.draw(); } );
		$("#maxDateFilter").keyup ( function() { table.draw(); } );
		$("#maxDateFilter").change( function() { table.draw(); } );

        $('[data-toggle="optionsPopover"]').on('show.bs.popover', function(e) {
            setTimeout(function(){
                $("input[value='"+gs.pledgeBook.viewMode+"']").attr('checked', true);
                $(".viewModePopover  input").off().on('change' , function(e){
                    gs.pledgeBook.viewMode = $(this).attr('value');
                    gs.pledgeBook.table.draw();
                    var bindBillClick = gs.pledgeBook.bindEvents();
                    bindBillClick();
                });
            },200);
        });

        $('[data-toggle="tokenPopover"]').on('show.bs.popover', function(e) {
            setTimeout(function(){
                $(".exportToken  button").off().on('click' , function(e){
                    gs.pledgeBook.exportToken();
                });
            },200);
        });


        $('#pendingDetails tbody').on( 'click', 'td.sorting_1', function () {
                $(this).parent().toggleClass('selected');
        });

    $.fn.dataTableExt.afnFiltering.push(
        function(oSettings, aData, iDataIndex){
            var validRow = false;
            var minValue = $("#minDateFilter").val();
            var maxValue = $("#maxDateFilter").val();
            if(gs.pledgeBook.viewMode != 'allBills'){
                if(gs.pledgeBook.viewMode == 'closedBills'){
                    if(aData[1] == 'closed')
                        validRow = true;
                }else if(gs.pledgeBook.viewMode == 'pendingBills'){
                    if(aData[1] == 'open')
                        validRow = true;
                }
            }else{
                validRow = true;
            }
            if(validRow && (!_.isEmpty(minValue) || !_.isEmpty(maxValue))){
                var dateStart = gs.pledgeBook.parseDateValue(minValue);
                var dateEnd = gs.pledgeBook.parseDateValue(maxValue);
                var evalDate= gs.pledgeBook.parseDateValue(aData[3]);
                
                if (evalDate >= dateStart && evalDate <= dateEnd)
                    return true;
                else
                    return false;
            }else
                return validRow;
            
        });

        $('#pendingDetails_wrapper').prepend('<input type="button" value="" title="Export" id="exportPledgeBook"/>');
        gs.pledgeBook.bindExport();
        gs.spinner.hide();
	},
	
    getDetails : function(value){
        var totalOrnWt = value.netwt ? value.netwt : '-';
	    	var htmlContent = "<div><table class='ornDesc'> <colgroup><col style='width: 15px'><col style='width: 70px'><col style='width: 70px'><col style='width: 20px'></colgroup><thead><th>S.No</th><th>Item <span id='totalOrnWt'>( "+totalOrnWt+" gm )</span></th><th>Sepc</th><th>Nos</th></thead><tbody>"
    		if(value.ornaments != ''){
                var totalOrns = value.ornaments.split(',');
    			_.each(totalOrns , function(ornValue, ornKey){
    				var aOrn = ornValue.split(':');	
    				htmlContent += "<tr><td>"+ (ornKey+1) +"</td>";
    				 _.each(aOrn , function(values, keys){ 
    					htmlContent +="<td>"+values+"</td>";
    				 }); 
    				htmlContent += "</tr>";
    			})
            } 
			htmlContent += "</tbody></table></div>" ; 
			return htmlContent;
	},
	
    parseDateValue : function(rawDate) {
        var dateArray= rawDate.split("/");
        var parsedDate= dateArray[2] + dateArray[1] + dateArray[0];
        return parsedDate;
    },

    getOptionsPopover: function(){
        var optionsPopover = "<div class='popoverContainer'><label><input type = 'radio' value='pendingBills' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>Pending Bills</label></br><label><input type = 'radio' value='closedBills' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>Closed Bills</label></br><label><input type = 'radio' value='allBills' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>All Bills</label></div>";

        return optionsPopover;
    },

    getTokenPopover: function(){
        var popoverContent = "<div class='popoverContainer'><button type='button' class=''>Create Token</button></div>";
        return popoverContent;
    },
    
    exportToken: function(){     
        var selectedRows = $('#pendingDetails tbody tr.selected');
        _.each($(selectedRows) ,function(value , index){
            var aRow = $(value)[0];
            console.log($(aRow).find('.pledgeBillNo').html());
        })
    },

    initComplete: function(){
        if(typeof gs.pledgeBook.table != 'undefined' && !_.isEmpty(gs.pledgeBook.table)){
            gs.pledgeBook.table.draw();
        }else{
            setTimeout(function(){
                gs.pledgeBook.initComplete();
            },200);
        }
    },
    
    modalPopupInit: function(){
        var aBillNo = gs.pledgeBook.editingBillNo;
        if(gs.pledgeBook.editingBillStatus == 'open'){
            gs.pledgeBook.loadBillCreationTemplate(aBillNo);
        }else{
            gs.pledgeBook.loadBillClosingTemplate(aBillNo);
        }
    },
    
    loadBillCreationTemplate: function(aBillNo){
        var property = {};
        var template = _.template($('#newBillCreationTemplate').html(), property);
        $("#modalContainer .modal-body").html(template);
        $('.printBill').hide();
        $('.submitBtn').hide();
        if(gs.pledgeBook.editingBillStatus == 'open'){
            $('#popup-openBill').hide();
            $('#popup-closeBill').show();
            $('#confirmationSuccess').addClass('confirmClose');
            $('#confirmationSuccess').removeClass('confirmOpen');
        }else{
           /* $('#popup-closeBill').hide();
            $('#popup-openBill').show();
            $('#confirmationSuccess').addClass('confirmOpen');
            $('#confirmationSuccess').removeClass('confirmClose');*/
        }
        gs.autocompleter.init('billCreation');
        gs.pledgeBook.getBillDetails(aBillNo);
        gs.pledgeBook.disablePopup();
        gs.pledgeBook.bindPopupEvents('viewingOpenBill');
        application.bill.creation.bindImageRelations();
        application.bill.creation.bindCustIdCreations();
        application.bill.creation.bindTraverseEvents();
        $('.imageControls .takeSelfie').hide();

        //bind amount field
        $('#ammout').blur(function(e){
            if($(this).val() == ''){
                $('.largeAmtDisplay input').val('Rs: 0.00');
            }else{
                var formatted = application.bill.creation.commaSeparateNumber($(this).val());
                $('.largeAmtDisplay input').val('Rs: '+ formatted +'.00');
            }
        });

        application.bill.creation.current_int_rate = '';
    },

    loadBillClosingTemplate: function(aBillNo){
        var property = {};
        var template = _.template($('#billClosingTemplate').html(), property);
        $("#modalContainer .modal-body").html(template);
        
        if(gs.pledgeBook.editingBillStatus == 'closed'){
            $('#popup-closeBill').hide();
            $('#popup-openBill').show();
            $('#confirmationSuccess').addClass('confirmOpen');
            $('#confirmationSuccess').removeClass('confirmClose');
        }
        gs.autocompleter.bindEvents('billClosing');
        gs.billClosing.onBillSelect(aBillNo , 'book');
        gs.billClosing.disableControls();
        gs.pledgeBook.bindPopupEvents('viewingClosedBill');
    },

    getBillDetails: function(aBillNo){
        var aQuery = "select * from "+gs.database.schema+".pledgebook where billNo='"+aBillNo+"'";
        gs.querybuilder.executeQuery(aQuery, gs.pledgeBook.fillDetails);
    },
    
    fillDetails: function(data){
        gs.pledgeBook.rawEditBillResponse = data;
        var data = data[0];
        var billNo = data.billNo;
        var billSeries = billNo.substring(0,billNo.indexOf('.'));
        var billNumber = billNo.substring(billNo.indexOf('.')+1);
        $('#date').datepicker().datepicker("setDate", data.dates);
        $('#billSeries').val(billSeries);
        $('#billNo').val(billNumber);
        $('#ammout').val(data.amount);
        $('#custId').val(data.custid);
        $('#customerName').val(data.cname);
        $('#fatherGaurdianName').val(data.fgname);
        $('#address').val(data.address);
        $('#address2').val(data.address2);
        $('#place').val(data.place);
        $('#pincode').val(data.pincode);
        $('#mobNo').val(data.mobile);
        //$('#teleNo').val(data.telephone);
        $('#ornNett').val(data.netwt);
        $('#ornWeight').val(data.grossWt);
        gs.pledgeBook.fillOrnTable(data);
        if(data.profilepicpath !== '')
            $(".item-image img").attr('src', data.profilepicpath);

        $(".largeAmtDisplay input").val('Rs: '+ data.amount +'.00');
    },

    fillOrnTable: function(data){
        var lastDataIndex = 13;
        var htmlContent = '';
        var totalOrns = data.ornaments.split(',');
            _.each(totalOrns , function(ornValue, ornKey){
                var aOrn = ornValue.split(':'); 
                htmlContent += "<tr><td><input type='text' class='serialNo' value='"+ (ornKey+1) +"' disabled/></td>";
                 _.each(aOrn , function(values, keys){ 
                    lastDataIndex = lastDataIndex +1;
                    htmlContent +="<td><input type='text' data-index='"+lastDataIndex+"' value='"+values+"'/></td>";
                 }); 
                htmlContent += "</tr>";
            });
        $('.ornamentDetails table tbody').html(htmlContent);

        var rowCount = $(".ornamentDetails tbody tr").length;
        $(".ornamentDetails tbody tr:eq("+(rowCount-1)+") td:eq(1) input").addClass('newItem');
        $(".ornamentDetails tbody tr:eq("+(rowCount-1)+") td:eq(3) input").addClass('appendRow');

        $(document).off('keypress', '.appendRow');
        $(document).off('keypress', '.newItem');
        //START: Bind Events with respect to Ornaments Table
         $(document).on('keypress', '.appendRow', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            if(key == 13){
                var newRow = '<tr><td><input type="text" value="'+ $(".ornamentDetails table tr").length +'" disabled /></td><td><input type="text" class="newItem" /></td><td><input type="text" /></td><td><input type="text" class="appendRow"/></td></tr>';
                $(this).removeClass('appendRow');
                $(".ornamentDetails tbody").find('.newItem').removeClass('newItem');
                $(".ornamentDetails tbody").append(newRow);
                $(".ornamentDetails tbody").find('.newItem').focus();
            }
        });
        $(document).on('keypress', '.newItem', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            var indexVal = $(".newItem").parent().parent().index();
            if(key == 13 && _.isEmpty($(".newItem").val())){
                if(indexVal > 0){
                    $(".ornamentDetails tbody tr:eq("+ indexVal +")").remove();
                    $(".ornamentDetails tbody tr:eq("+ (indexVal-1) +") td:eq(3) input").addClass('appendRow');
                    $('.popup-updateBill').focus();
                }
            }else if(key == 13 && !_.isEmpty($(".newItem").val())){
                    $(".ornamentDetails tbody tr:eq("+ indexVal +") td:eq(2) input").focus();
                }
        });
        //END: Bind Events with respect to Ornaments Table

        gs.pledgeBook.disableOrnTable();
    },
    
    disablePopup: function(){
        $('#date').prop("disabled",true);
        $('#billSeries').prop("disabled",true);
        $('#billNo').prop("disabled",true);
        $('#ammout').prop("disabled",true);
        $('#customerName').prop("disabled",true);
        $('#fatherGaurdianName').prop("disabled",true);
        $('#address').prop("disabled",true);
        $('#address2').prop("disabled",true);
        $('#place').prop("disabled",true);
        $('#pincode').prop("disabled",true);
        $('#mobNo').prop("disabled",true);
        //$('#teleNo').prop("disabled",true);
        $('#ornNett').prop("disabled",true);
        $('#ornWeight').prop("disabled",true);
        $('.editImg').prop("disabled",true);
        
        $('#popup-ModifyBill').html('Edit');
        $('#popup-ModifyBill').addClass('popup-editBill');
        $('#popup-ModifyBill').removeClass('popup-updateBill');
    },

    disableOrnTable: function(){
        //disable table editing control
        _.each($('.ornamentDetails table tbody tr td input'), function(inputField, key){
            if(!$(inputField).hasClass('serialNo')){
                $(inputField).prop("disabled",true);
            }
        });
    },
    
    enablePopup: function(){
        $('#date').prop("disabled",false);
        $('#billSeries').prop("disabled",false);
        $('#billNo').prop("disabled",false);
        $('#ammout').prop("disabled",false);
        $('#customerName').prop("disabled",false);
        $('#fatherGaurdianName').prop("disabled",false);
        $('#address').prop("disabled",false);
        $('#address2').prop("disabled",false);
        $('#place').prop("disabled",false);
        $('#pincode').prop("disabled",false);
        $('#mobNo').prop("disabled",false);
        //$('#teleNo').prop("disabled",false);
        $('#ornNett').prop("disabled",false);
        $('#ornWeight').prop("disabled",false);
        $('.editImg').prop("disabled",false);

        _.each($('.ornamentDetails table tbody tr td input'), function(inputField, key){
            if(!$(inputField).hasClass('serialNo')){
                $(inputField).prop("disabled",false);
            }
        });
        application.bill.creation.bindBillDetailsPopover();
    },
        
    modalPopupUpdateBill: function(){
        var billSeries = $('#billSeries').val() || '';
        var billNo = $('#billNo').val() || '';
        var aBillNo = billSeries != '' ? (billSeries + '.' + billNo) : billNo;  
        //var aBillNo = $('#billSeries').val() +'.'+ $('#billNo').val();
        var aQuery = "select * from "+gs.database.schema+".pledgebook where billNo='"+aBillNo+"'";
        gs.querybuilder.executeQuery(aQuery, gs.pledgeBook.updateBill);      
        gs.pledgeBook.reRenderPledgeBook = true;
    },

    updateBill: function(data){
        var billSeries = $('#billSeries').val() || '';
        var billNo = $('#billNo').val() || '';
        var aBillNo = billSeries != '' ? (billSeries + '.' + billNo) : billNo;  
        //var aBillNo = $('#billSeries').val() +'.'+ $('#billNo').val();
        if(!_.isEmpty(data)){
            var entry = application.bill.creation.getEntries();
            var aQuery = "UPDATE "+gs.database.schema+".pledgebook SET dates='"+entry.adate+"', amount='"+entry.aAmt+"', cname='"+entry.aCustName+"', fgname='"+entry.aFGName+"', address='"+entry.aAddress+"', place='"+entry.aPlace+"', pincode='"+entry.aPincode+"', mobile='"+entry.aMobNo+"', telephone='"+entry.aTeleNo+"', ornaments='"+entry.ornaments+"', netwt='"+entry.aNett+"', grossWt='"+entry.awt+"', ornType='"+entry.ornType+"', interest='"+entry.intRate+"', interest_amt='"+entry.intAmount+"', given_amt='"+entry.givenAmt+"', profilepicpath='"+entry.profilepicpath+"', status='"+entry.status+"', custid='"+entry.custid+"'  WHERE billNo='"+aBillNo+"'";
            gs.querybuilder.executeQuery(aQuery, gs.pledgeBook.updateComplete);
            gs.pledgeBook.updatedBillNo = aBillNo;
        }else{
            alert("Enter Valid Bill Number !");
            return false;
        }
    },

    //After bill updation complete action callback
    updateComplete: function(data){
        var updated = false;
        if(data[0].status == true){
            updated = true;
        }
        $('#alertMsgModal').on('shown.bs.modal', function () {
            $('#alertMsgModal').off('shown.bs.modal');
            if(updated){
                $("#alertMsgModal .modal-body").html(gs.pledgeBook.updatedBillNo + ' has been Updated SuccessFully.');
                if(gs.pledgeBook.editingBillStatus == 'open'){
                    gs.pledgeBook.disablePopup();
                    gs.pledgeBook.disableOrnTable();
                }else if(gs.pledgeBook.editingBillStatus == 'closed'){
                    gs.billClosing.disableControls();
                }
            }else
                $("#alertMsgModal .modal-body").html('ERROR ! - '+gs.pledgeBook.updatedBillNo + ' not Updated !.');
        });
        $('#alertMsgModal').modal('show');
    },

    //updating closed Bill.
    updateBillClosingDetails: function(){
        gs.pledgeBook.reRenderPledgeBook = true;
        var bill_to_update = $('#billToBeClosed').val();
        var datas = gs.billClosing.getEntries();
        var obj = {
            aQuery: "UPDATE "+gs.database.schema+".pledgebook SET status='closed', billClosedDate='"+ datas.closingDate +"' WHERE billNo='"+bill_to_update+"'"
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
        });
        application.core.call(request, callBackObj);

        var obj = {
            aQuery: "UPDATE "+gs.database.schema+".billclosingdetail SET pledgedDate='"+datas.pledgedDate+"', closedDate='"+datas.closingDate+"', pledge_amt='"+datas.pledgedAmt+"', no_of_month='"+datas.no_of_month+"', rate_of_interest='"+datas.int_rate+"', int_rupee_per_month='"+datas.int_rupee_per_month+"', interest_amt='"+datas.interest_amt+"', actual_estimated_amt='"+datas.actual_estimated_amt+"', discount_amt='"+datas.discount_amt+"', paid_amt='"+datas.paid_amt+"', payment_mode='"+datas.payment_mode+"' WHERE billNo='"+bill_to_update+"'"
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
            gs.pledgeBook.updateComplete(JSON.parse(response));
        });
        application.core.call(request, callBackObj);
        gs.pledgeBook.updatedBillNo = bill_to_update;
    },

    //On Closing/Opening bill complete action callback
    onBillStatusUpdated: function(data, status){
        var updated = false;
        if(data[0].status == true){
            updated = true;
        }
        
        $('#alertMsgModal').on('shown.bs.modal', function () {
            $('#alertMsgModal').off('shown.bs.modal');
            if(updated){
                gs.pledgeBook.editingBillStatus = status;
                $("#alertMsgModal .modal-body").html(gs.pledgeBook.editingBillNo + ' has been Updated SuccessFully.');
                $('#popup-closeBill').toggle();
                $('#popup-openBill').toggle();
                $('#confirmationSuccess').toggleClass("confirmClose confirmOpen");
                if(status == 'open')
                    gs.pledgeBook.loadBillCreationTemplate(gs.pledgeBook.editingBillNo);
                else if(status == 'closed')
                    gs.pledgeBook.loadBillClosingTemplate(gs.pledgeBook.editingBillNo);

            }else{
                $("#alertMsgModal .modal-body").html('<b> ERROR !</b> '+gs.pledgeBook.editingBillNo+' has not Updated properly.');
            }
        });

        $('#alertMsgModal').on('show.bs.modal', function(){
            $('#confirmationModal').modal('hide');
        });

        $('#alertMsgModal').modal('show');
    },

    bindExport: function(){
        $('#exportPledgeBook').on('click', function(e){
            gs.export.exportFile();
        });
    }
}
