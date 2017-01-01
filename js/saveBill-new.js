if(typeof application == 'undefined'){
    var application = {};
}
if(typeof application.bill == 'undefined'){
    application.bill = {};
}
application.bill.creation = {
    imgSettings : {
        previousImgIndex : null,
        currentImgIndex : 1,
        nextImgIndex : null,
        totalImg : null
    },
    imgUrl : '',
    currImage : 'default',
    imgPaths : [],
    imgUpload : '',
    uploadedFileName : '',
    current_s_no : '', //serial number used to store in DB on creating a new bill
    current_int_rate: '',
    current_int_amt : '',
    current_given_amt : '',
     //START:: AJAX FILE UPLOAD CODE
    options : {
        beforeSend: function() 
        {
            $("#progress").show();
            //clear everything
            $("#bar").width('0%');
            $("#message").html("");
            $("#percent").html("0%");
        },
        uploadProgress: function(event, position, total, percentComplete) 
        {
            $("#bar").width(percentComplete+'%');
            $("#percent").html(percentComplete+'%');
        },
        success: function(response) 
        {
            var fileName = response;
            var self = application.bill.creation;
            self.imgUpload = 'success';
            self.uploadedFileName = self.getFileName($('.fileChooser').val());
            $('.item-image img').attr('src', '/uploads/'+ fileName);
            $("#bar").width('100%');
            $("#percent").html('100%');

        },
        complete: function(response) 
        {
            $("#message").html("<font color='green'>"+response.responseText+"</font>");
        },
        error: function()
        {   
            var self = application.bill.creation;
            self.imgUpload = 'error';
            $("#message").html("<font color='red'> ERROR: unable to upload files</font>");
        } 
    },
    init : function(){
        application.bill.creation.bindEvents();
        if($('.mainContent').hasClass('book'))
            $('.mainContent').removeClass('book');
        gs.autocompleter.init('billCreation');
        application.bill.creation.setDefaults();
        application.bill.creation.bindBillDetailsPopover();
    },
    
    bindEvents : function(){
        var self = application.bill.creation;
        $(document).off('keypress', '.appendRow');
        $(document).off('keypress', '.newItem');
        $(document).on('keypress', '.appendRow', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            if(key == 13){
                var lastDataIndex = Number($(this).attr('data-index'));
                var arr = [lastDataIndex+1 , lastDataIndex+2 , lastDataIndex+3];
                var newRow = '<tr><td><input type="text" class="serialNo" value="'+ $(".ornamentDetails table tr").length +'" disabled /></td><td><input type="text" class="newItem" data-index = "'+arr[0]+'"/></td><td><input type="text" data-index="'+arr[1]+'" /></td><td><input type="text" class="appendRow" data-index="'+arr[2]+'"/></td></tr>';
                $(this).removeClass('appendRow');
                $(".ornamentDetails tbody").find('.newItem').removeClass('newItem');
                $(".ornamentDetails tbody").append(newRow);
                $(".ornamentDetails tbody").find('.newItem').focus();
                gs.autocompleter.getOrnList();
            }


        });
        $(document).on('keypress', '.newItem', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            var indexVal = $(".newItem").parent().parent().index();
            if(key == 13 && _.isEmpty($(".newItem").val())){
                if(indexVal > 0){
                    $(".ornamentDetails tbody tr:eq("+ indexVal +")").remove();
                    $(".ornamentDetails tbody tr:eq("+ (indexVal-1) +") td:eq(3) input").addClass('appendRow');
                    $('#submitBill').focus();
                }
            }else if(key == 13 && !_.isEmpty($(".newItem").val())){
                    $(".ornamentDetails tbody tr:eq("+ indexVal +") td:eq(2) input").focus();
                }
        });
        $('.submitBtn').on('click', function(e){
           application.bill.creation.saveEntry();
        });
        $('.submitBtn').on('keydown', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            if(key == 13){
                application.bill.creation.saveEntry();
            }           
        });
        

        $('#ammout').blur(function(e){
            if($(this).val() == ''){
                $('.largeAmtDisplay input').val('Rs: 0.00');
            }else{
                var formatted = application.bill.creation.commaSeparateNumber($(this).val());
                $('.largeAmtDisplay input').val('Rs: '+ formatted +'.00');
            }
        });

        $('input:text').focus(function(){
            $(this).select(); 
        });

        self.bindQRFunctions();
        self.bindImageRelations();
        self.bindCustIdCreations();
        self.bindTraverseEvents();
        self.initHistoryPanel();
        
        $('.printBill').off('click').on('click', function(){
            self.printBill();
        });
        
    },

    bindTraverseEvents: function(){
        $('.billCreation').on('keydown', 'input', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
                if($this.hasClass('newItem') || $this.hasClass('appendRow')){
                    return;
                }else{
                    event.preventDefault();
                }
                var dataIndex = $this.attr('data-index');
                if(typeof dataIndex != 'undefined'){
                    var index = parseFloat(dataIndex);
                    if($this[0].id == 'ammout'){
                        var amountVal = $this.val();
                        if(amountVal == '')
                            return;
                    }
                    $('[data-index="' + (index + 1).toString() + '"]').focus();
                    //set same weight in another weight field for effeciency
                    if($this[0].id == 'ornNett'){
                        var grossWt = $this.val();
                        $('#ornWeight').val(grossWt);
                    }
                }
            }
        });
    },

    bindQRFunctions: function(){
        var self = application.bill.creation;
        self.qrcode = new QRCode(document.getElementById("qrCodeImg"), {
            width : 50,
            height : 50
        });
        $('#billSeries , #billNo').blur(function(e){
            self.createQrcode('billNumber');
        });       
    },

    setDefaults: function(){
        var obj = {};
        obj.aQuery= 'SELECT * FROM '+gs.database.schema+'.billseries';
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
          response = JSON.parse(response);
          application.bill.creation.updateDefaults(response);
          gs.autocompleter.setAutoCompleter('billCreation');
        });
        application.core.call(request, callBackObj);
    },

    updateDefaults: function(data){
        var self = application.bill.creation;
        $('#billSeries').val(data[0].bill_series);
        var billNumber = Number(data[0].last_created_bill) + 1;
        $('#billNo').val(billNumber);
        self.createQrcode('billNumber');        
        application.bill.creation.current_s_no = Number(data[0].pledgebook_sno) + 1;
        console.log('Updating Defaults ..');
        console.info('CurrentSerialNumber is = ', application.bill.creation.current_s_no);  
        $('#address2').val('KATTUPPAKKAM');
        $('#place').val('CHENNAI');
        $('#pincode').val('600056');
        $('#ammout').focus();
    },

    commaSeparateNumber: function(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
    },

    bindImageRelations: function(){
        var self = application.bill.creation;
        //GET IMAGE PATH FRO SQL
        $('#customerName').blur(function(e){
            
            if($('.item-image img').hasClass('selfieImage'))
                return;

            if($(this).val() != ""){
                var obj = {
                    fname : $(this).val(),
                }
                $.ajax({
                    url: 'getimage.php',
                    type: 'POST',
                    data: obj,
                    success: function(data, textStatus, jqXHR)
                    {
                        response = JSON.parse(data);
                        var response = _.uniq(response, function(response) { 
                            if(response.profilepicpath != '')
                                return response.profilepicpath;
                        });
                        self.setImage(response);
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                       console.log("Ajax Error..");
                    }
                });
            }

        });
        $('.img_navigator_next').on('click', function(){
            self.imgSettings.nextImgIndex += 1;
            self.imgSettings.previousImgIndex += 1;
            self.imgSettings.currentImgIndex += 1;
            $('.currLimit').html(self.imgSettings.currentImgIndex);
            console.log("Next Clicked " ,self.imgSettings);
            if(self.imgSettings.nextImgIndex > self.imgPaths.length)
                self.disableNextButton();
            else
                self.enableNextButton();
            //TODO: check condition and enable
            self.enablePrevButton();
            var path = self.imgPaths[self.imgSettings.currentImgIndex - 1];
            $(".item-image img").attr('src', path);
        });
        $('.img_navigator_prev').on('click', function(){
            self.imgSettings.nextImgIndex -= 1;
            self.imgSettings.previousImgIndex -= 1;
            self.imgSettings.currentImgIndex -= 1;
            $('.currLimit').html(self.imgSettings.currentImgIndex);
            console.log("Prev Clicked " ,self.imgSettings);
            if(self.imgSettings.previousImgIndex == null || self.imgSettings.previousImgIndex == 0){
                self.disablePrevButton();
            }else{
                self.enablePrevButton();
            }
            //TODO: check condition and enable
            self.enableNextButton();

            var path = self.imgPaths[self.imgSettings.currentImgIndex - 1];
            $(".item-image img").attr('src', path);
        });
                
        $('.editImg').on('click', function(){
            $('.imageControls').fadeIn();
            $(this).hide();
            $('.confirmImg').show();
            /*$('#myForm').show();
            $('.clearImg').show();
            $('#progress').show();
            $('.takeSelfie').show();*/
        });

        $('.confirmImg').on('click', function(){
            $('.imageControls').fadeOut();
            $(this).hide();
            $('.editImg').show();
            /*$('#myForm').hide();
            $('.clearImg').hide();
            $('#progress').hide();
            $('.takeSelfie').hide();
             */
        });

        $('.clearImg').on('click', function(){
            if($('.item-image img').hasClass('selfieImage')){
                var temp = $('.item-image img').attr('src').indexOf('/');
                var imageName = $('.item-image img').attr('src').substring(temp+1);
                $.ajax({
                        url: 'uploads/deleteFile.php',
                        type: 'POST',
                        data: {
                                delete_file : imageName
                            },
                        success: function(data, textStatus, jqXHR)
                        {},
                        error: function(jqXHR, textStatus, errorThrown)
                        {console.log("Ajax Error..");}
                });
                $('.item-image img').removeClass('selfieImage');
            }
            $('.item-image img').attr('src', '/uploads/default.jpg');
        });

        $("#myForm").ajaxForm(self.options);

        $('.takeSelfie').on('click', function(e){
            $('#webModalContainer').modal('show');
             $('#webModalContainer').on('shown.bs.modal', function () {
                  var obj = {};
                  $('#webModalContainer .modal-body').html(_.template($('#webCammTemplate').html(), obj));
                  gs.webcamModel.init();
            });
            $('#webModalContainer').on('hidden.bs.modal', function () {
            });
        });
    },

    bindCustIdCreations: function(){
        var self = application.bill.creation;
        $('#customerName').blur(function(e){
            self.checkCustId($(this).val());
        });
        $('#fatherGaurdianName').blur(function(e){
            self.checkCustId($('#customerName').val(), $(this).val());
        });
        $('#address').blur(function(e){
            self.checkCustId($('#customerName').val(),$('#fatherGaurdianName').val(), $(this).val());
        });
     },

    initHistoryPanel: function(){
        var aSelf = application.bill.creation;
        $('#fatherGaurdianName').blur(function(e){
            if($(this).val() == '')
                return;

            var customer_name = $('#customerName').val();
            var father_name = $(this).val();
            aSelf.getCustomerPendingBills(customer_name, father_name);
        });

         $('#address').blur(function(e){
            if($(this).val() == '')
                return;
            var customer_name = $('#customerName').val();
            var father_name = $('#fatherGaurdianName').val();
            var address = $(this).val();
            aSelf.getCustomerPendingBills(customer_name, father_name, address);
        });
    },

    saveEntry : function(){
        if($('#ammout').val().trim() == ''){
            $('#ammout').focus();
            alert('Amount Should not be Empty !');
            return;
        }

        var self = application.bill.creation;
        var entryList = {};
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('interest.php', '' , 'POST');
        callBackObj.bind('api_response', function(event, response){
            debugger;
           entryList = self.getEntries(response);
           saveIntoDB();
        });
        //if(self.current_int_rate != '')
            application.core.call(request, callBackObj);
        /*else
            callBackObj.trigger('api_response', {})*/
        
        function saveIntoDB(){
            var callBackObj = application.core.getCallbackObject();
            var request = application.core.getRequestData('createbill.php', entryList, 'POST');
            callBackObj.bind('api_response', function(event, response){
                var responseData = JSON.parse(response)[0];
                if(responseData.status == 'success'){                
                    self.updateLastBillNumber();
                    self.updateLastSerialNumber();          
                    setTimeout(function(){
                        self.clearFields();
                        self.bindNecessaryEvents();
                    },300);
                    alert('success '+ responseData.status_msg);                
                }else{
                    alert('Error '+ responseData.status_msg);
                }
            });
            application.core.call(request, callBackObj);
        };

    },

    updateLastBillNumber: function(){
        var currentBillNo = $('#billNo').val();
        var aQuery1 = "UPDATE "+gs.database.schema+".billseries SET last_created_bill='"+currentBillNo+"' WHERE s_no='1'";
        //gs.querybuilder.executeQuery(aQuery, '');
        var qObj1 = {
            aQuery: aQuery1
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', qObj1, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            response = JSON.parse(response);
            if(response[0].status == true)
                console.info('Updated the  Last Created Bill Number');
            else
                console.info('Failure in Update of Last Bill Number');
        });
        application.core.call(request, callBackObj);
    },

    updateLastSerialNumber: function(){
        var aQuery2 = "UPDATE "+gs.database.schema+".billseries SET pledgebook_sno ='"+application.bill.creation.current_s_no +"' WHERE s_no = '1' ";
        //gs.querybuilder.executeQuery(aQuery, '');
        var qObj2 = {
            aQuery: aQuery2
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', qObj2, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            response = JSON.parse(response);
            if(response[0].status == true)
                console.info('Updated the serial Number');
            else
                console.info('Failure in Update of Serial number');
        });

        application.core.call(request, callBackObj);
    },

    bindNecessaryEvents: function(){
        gs.autocompleter.getOrnList();
    },

    getEntries : function(intDatas) {
        var self = application.bill.creation;
        var obj = {}, tempObj = {};
        obj.s_no = application.bill.creation.current_s_no || '';
        obj.adate = $('.inputValDate').val() || '';
        var billSeries = $('#billSeries').val() || '';
        var billNo = $('#billNo').val() || '';
        obj.aBillNo = billSeries != '' ? (billSeries + '.' + billNo) : billNo;  
        //obj.aBillNo = ($('#billSeries').val() + '.' + $('#billNo').val()) || '';
        obj.aAmt = $('#ammout').val() || '';
        obj.custid = $('#custId').val();
        obj.aCustName= $('#customerName').val() || '';
        obj.aFGName = $('#fatherGaurdianName').val() || '';
        obj.aAddress = $('#address').val() || '';
        obj.aAddress2 = $('#address2').val() || '';
        obj.aPlace = $('#place').val() || '';
        obj.aPincode = $('#pincode').val() || '';
        obj.aMobNo = $('#mobNo').val() || '';
        obj.aNett = $('#ornNett').val() || '';
        obj.awt = $('#ornWeight').val() || '';
        
        var ornaments= '';
        tempObj.tableRows = $(".ornamentDetails tbody tr")
        _.each(tempObj.tableRows, function(aRow){
          _.each($(aRow).find('td'), function(aCol){
            var inputBox = $(aCol).find('input');
            var disabled = $(inputBox).is(':disabled');
              if(!disabled){
                ornaments += $(inputBox).val();
                ornaments += ':';
              }
          });
          ornaments = ornaments.substr(0, ornaments.length-1);
          ornaments += ',';
        });
        ornaments = ornaments.substr(0, ornaments.length-1);
        obj.ornaments = ornaments;
        obj.profilepicpath = $('.item-image img').attr('src');
        obj.status = 'open';

        obj = self.getCalcDetails(obj, intDatas);
       
        return obj;
    },
       
    setImage : function(response){
        var self = application.bill.creation;
        self.imgPaths = [];
        if(response.length > 0){
            if(response[0].profilepicpath != ''){
                self.imgSettings.total = response.length;
                _.each(response, function(value, index){
                    self.imgPaths.push(value.profilepicpath);
                 });
                $(".item-image img").attr('src', response[0].profilepicpath);
                self.currImage = 'custom';
            }
        }else{
            self.imgSettings.total = 1;
            $(".item-image img").attr('src', '/uploads/default.jpg');
            self.currImage = 'default';
        }
        self.imgSettings.currentImgIndex = 1;
        $('.currLimit').html(self.imgSettings.currentImgIndex);
        $('.maxLimit').html(self.imgSettings.total);
        self.resetNavigationBtn();
    },
    setPicUrl : function(picUrl){
          $(".item-image img").attr('src', picUrl);
    },

    resetNavigationBtn : function() {
        var self = application.bill.creation;
        if(self.currImage == 'default' || self.imgPaths.length == 1){
            self.disablePrevButton();
            self.disableNextButton();
            self.imgSettings.nextImgIndex = null;
        }else if( self.currImage == 'custom'){
            if(self.imgPaths.length > 1){
                self.disablePrevButton();
                self.enableNextButton();
                self.imgSettings.nextImgIndex = 2;
            }
        }

    },
    disableNextButton : function(){
        $('.img_navigator_next').prop('disabled', 'true');
        $('.secondaryNextBtn').addClass('disabled');
    },

    disablePrevButton : function(){
        $('.img_navigator_prev').prop('disabled', 'true');
        $('.secondaryPrevBtn').addClass('disabled');
    },
    enableNextButton : function(){
        $('.img_navigator_next').removeAttr('disabled');
        $('.secondaryNextBtn').removeClass('disabled');
    },

    enablePrevButton : function(){
        $('.img_navigator_prev').removeAttr('disabled');
        $('.secondaryPrevBtn').removeClass('disabled');
    },
    getFileName : function(fullPath){
        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
            return filename;
        }
    },
    clearFields: function(){
        application.bill.creation.setDefaults();
        $('#ammout').val('');
        $('#custId').val('');
        $('#custId').hasClass('new')? $('#custId').removeClass('new'): '';
        $('#customerName').val('');
        $('#fatherGaurdianName').val('');
        $('#address').val('');
        $('#place').val('');
        $('#pincode').val('');
        $('#mobNo').val('');
        $('#teleNo').val('');
        $('#ornNett').val('');
        $('#ornWeight').val('');
        $('.item-image img').attr('src', '/uploads/default.jpg');
        $('.item-image img').removeClass('selfieImage');
        $('.largeAmtDisplay input').val('Rs: 0.00');
        var aRow = '<tr>'+
                        '<td><input type="text" value="1" disabled=""></td>'+
                        '<td><input type="text" class="newItem" data-index="14" ></td>'+
                        '<td><input type="text" data-index="15"></td>'+
                        '<td><input type="text" class="appendRow" data-index="16"></td>'+
                    '</tr>';
        $(".ornamentDetails tbody").html(aRow);
        $('.pendingBillListContainer tbody').html('');
        this.current_int_rate = '';
        this.setImage([]);
    },

    printBill : function(){
         var mode = 'iframe';
            var close = false;
            var extraCss = '';
            var print = "";
            print = "div.billCreation";
            var keepAttr = ["class", "id", "style", "on"];
            var keepAttr = [];
            var headElements = '<meta charset="utf-8" />,<meta http-equiv="X-UA-Compatible" content="IE=edge"/>';
            var printTitle = "sampleTitle ";
            var print_options = { mode : mode, popClose : close, extraCss : extraCss, retainAttr : keepAttr, extraHead : headElements, popTitle : printTitle };
            $( print ).printArea( print_options );
    },

    getBillDetails: function(response, tmpContainer){
        var self = application.bill.creation;
        var isPledgeBookPage = $('.mainContent').hasClass('book');
        var principal = $('#ammout').val();
        var popoveContent= '', temp = '', intRate = 0, intAmount = 0, ornTypes = {} ;
        if(!_.isEmpty(principal)){
            if(isPledgeBookPage){
                var response = gs.pledgeBook.rawEditBillResponse[0];
                principal = response.amount;
                if(self.current_int_rate !== '')
                    intRate = self.current_int_rate;
                else
                    intRate = Number(response.interest || 0);
                intAmount = Number(response.interest_amt || 0);
                if(!_.isEmpty(response.ornType))
                    ornTypes.short = ((response.ornType).charAt('0')).toUpperCase();
            }else{
                ornTypes = self.getOrnType('double');
                if(self.current_int_rate !== '')
                    intRate = self.current_int_rate;
                else
                    intRate = self.findInterestRate(principal, ornTypes.long, response);
                intAmount = self.findIntAmount(principal, intRate);
            }
        
            temp += '<div>';
                temp += '<div>';
                    temp += '<label class="col-md-6">Principal:</label>';
                    temp += '<input type="text" class="currentBillAmountDetail col-md-6" value="'+ principal +'" disabled/><p style="padding-top: 10px;">'+ (ornTypes.short || '') +'</span>';
                temp += '</div>';
                temp += '<div>';
                    temp += '<label class="col-md-6">Rate Of Int:</label>';
                    temp += '<input type="text" class="currentBillIntDetail col-md-6" value="'+ intRate +'"/>';
                temp += '</div>';
                temp += '<div>';
                    temp += '<label class="col-md-6">Interest Amt:</label>';
                    temp += '<input type="text" class="currentBillIntAmtDetail col-md-6" value="'+ intAmount +'"  disabled/>';
                temp += '</div>';
                temp += '<div>';
                    temp += '<label class="col-md-6">Total:</label>';
                    temp += '<input type="text" class="currentBillFinalAmt col-md-6" value="'+ (principal - intAmount) +'"  disabled/>';
                temp += '</div>';
                temp += '<input type="button" value="Ok" id="confirmBillDetails"/>'
            temp += '</div>';
        }else{
            temp += '<p>Please Enter Principal amount to check with Interest !!</p>';
        }
               
        popoveContent = temp;
        $('#'+tmpContainer).html(popoveContent);
        self.bindPopoverActions();
        $('.currentBillIntDetail').focus();
    },

    findInterestRate: function(thePrincipal, ornType, data){
        if(_.isEmpty(ornType))
            ornType = 'gold';
        var intRate = '1';
        _.each(data, function(value, index){
            var amount_from = Number(value.amount_from);
            var amount_to = Number(value.amount_to);
            var principal = Number(thePrincipal);
            if(principal >= amount_from && principal <= amount_to && ornType == value.ornType){
                intRate = Number(value.rate_of_interest);                
            }
        });
        return intRate;
    },

    findIntAmount: function(principal, intRate){
        try{
            return Number(principal * intRate)/100 ;
        }catch(e){
            console.error('Error in Getting Interest amount');
        }
    },

    getOrnType: function(format){
        if(typeof format == 'undefined' ||  format == '')
            format = 'single';

        var ornType = '';
        var char = $($('.ornamentDetails tbody tr:eq(0) td:eq(1) input')[0]).val().charAt(0) || 'G';
        char = char.toUpperCase();
        switch(char){
            case 'G':
                ornType = 'gold';
                break;
            case 'S':
                ornType = 'silver';
                break;
            case 'B':
                ornType = 'brass';
                break;
            default:
                ornType = 'gold';
        }
        if(format == 'single')
            return ornType;
        else{
            var ornTypes = {};
                ornTypes.short = char;
                ornTypes.long = ornType;
            return ornTypes;
        }

    },

    bindPopoverActions: function(){
        var self = application.bill.creation;
        $('.currentBillIntDetail').on('keyup', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            var principal = Number($('.currentBillAmountDetail').val());
            var intRate = $(this).val();
            self.current_int_rate = intRate;
            var intAmount = Number(self.findIntAmount(principal, intRate));
            $('.currentBillIntAmtDetail').val(intAmount);
            $('.currentBillFinalAmt').val(principal - intAmount);    
        });
        $('#confirmBillDetails').on('click', function(e){
            $('.viewBillDetails').popover('toggle');
        });
    },

    getCalcDetails: function(obj, data){
        var self = application.bill.creation;
        var principal = $('#ammout').val();
        if(typeof data != 'undefined' && data !== '')
            data = JSON.parse(data);
        obj.ornType = self.getOrnType();
        if(self.current_int_rate == '')
            obj.intRate = self.findInterestRate(principal, obj.ornType, data);
        else
            obj.intRate = Number(self.current_int_rate);
        obj.intAmount = self.findIntAmount(principal, obj.intRate);
        obj.givenAmt = Number(principal) - Number(obj.intAmount);
        return obj;
    },

 /*   setBillDetails_inPopover: function(details){
        $('.viewBillDetails').attr('data-content', details);
        $('.viewBillDetails').attr('data-html', details);
    },
*/
    bindBillDetailsPopover: function(){
        var self = application.bill.creation;
        gs.popover.bindPopover('.viewBillDetails', self.getBillDetails);
    },

    getCustomerPendingBills: function(customer_name, father_name, address){
        var self = application.bill.creation;
        var obj = {};
        if(typeof address == 'undefined')
            obj.aQuery= "SELECT * FROM "+gs.database.schema+".pledgebook where cname = '"+customer_name+"' and fgname = '"+father_name+"'";
        else if(typeof address !== 'undefined')
            obj.aQuery= "SELECT * FROM "+gs.database.schema+".pledgebook where cname = '"+customer_name+"' and fgname = '"+father_name+"' and address='"+address+"'";
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            response = JSON.parse(response);
            self.fillPendingBillTable(response);            
        });
        application.core.call(request, callBackObj);
    },

    fillPendingBillTable: function(response){
        if(response.length == 0){
            $('.pendingBillListContainer').hide();
            return;
        }
        $('.pendingBillListContainer').show();
        $('.pendingBillListContainer table tbody').html('');
        function getMonthInterval(date1, todayDate){
            var aDate = new Date();
            if(typeof todayDate == 'undefined' || todayDate == '')
                todayDate = aDate.getDate() + '/'+ (aDate.getMonth()+1) + '/' + aDate.getUTCFullYear();
            var monthInterval = gs.billClosing.calDiff(date1, todayDate);
            return monthInterval;
        }
        function bindTriggerEvent(popoverClass){
            $("[data-toggle = '"+popoverClass+"']").popover({trigger: "click"});
        }

        function getOrnamentColumns(value){
            var totalOrnWt = value.netwt ? value.netwt : '-';
                var htmlContent = "<div><table class='ornDesc'> <colgroup><col style='width: 15px'><col style='width: 50px'><col style='width: 20px'></colgroup><thead><th>S.No</th><th>Item <span id='totalOrnWt'>( "+totalOrnWt+" gm )</span></th><th>Nos</th></thead><tbody>"
                if(value.ornaments != ''){
                    var totalOrns = value.ornaments.split(',');
                    _.each(totalOrns , function(ornValue, ornKey){
                        var aOrn = ornValue.split(':'); 
                        htmlContent += "<tr><td>"+ (ornKey+1) +"</td>";
                        var column = 1; 
                         _.each(aOrn , function(values, keys){ 
                            if(column == 2){
                                //Do Nothing
                            }
                            else
                                htmlContent +="<td>"+values+"</td>";

                            column += 1;
                         }); 
                        htmlContent += "</tr>";
                    })
                } 
                htmlContent += "</tbody></table></div>" ; 
                return htmlContent;
        }

        _.each(response, function(value, index){
            var htmlCont = '';
            htmlCont += '<tr>';
                htmlCont += '<td>' + (index+1) + '</td>';
                htmlCont += '<td>' + value.billNo + '</td>';
                htmlCont += '<td>' + value.dates + '</td>';
                htmlCont += '<td>' + value.amount + '</td>';
                htmlCont += '<td>' + getMonthInterval(value.dates)  + '</td>';
                htmlCont += '<td><div class="pendingBillList" data-toggle="pendingBillListPopover" data-title="Ornaments" data-class="pendingBillOrnPopover" data-content="'+ getOrnamentColumns(value) +'" data-html="'+getOrnamentColumns(value)+'" data-placement = "top">Orn</div></td>';
            htmlCont += '</tr>';
            $('.pendingBillListContainer table tbody').append(htmlCont);
        });
        bindTriggerEvent('pendingBillListPopover');
       // removeSpecificColumn();

    },

    createQrcode: function(category){
        var self = application.bill.creation;
        switch(category){
            case 'billNumber' : 
                var content = $('#billSeries').val() + "."+ $('#billNo').val();
                self.qrcode.makeCode(content);
                break;
            default: 
                break;
        }
    },
    /* START: custId */
    checkCustId: function(cname, fgname, addr){
        var self = application.bill.creation;
        if(typeof cname == 'undefined')
            cname = '';
        if(typeof fgname == 'undefined')
            fgname = '';
        if(typeof addr == 'undefined')
            addr = '';
        var obj = {};
        var currFocus = 'cname'
       
        if(cname !== ''){
            currFocus = 'cname';
            obj.aQuery = "SELECT distinct custid from "+gs.database.schema+".pledgebook where cname= '"+cname+"'";
        }
        if(fgname !== ''){
            currFocus = 'fgname';
            obj.aQuery = obj.aQuery + " and fgname= '"+fgname+"'";
        }
        if(addr !== ''){
            currFocus = 'addr';
            obj.aQuery = obj.aQuery + " and address= '"+addr+"'";
        }

        obj.aQuery = obj.aQuery + " and custid IS NOT NULL";

        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            data = JSON.parse(response);
            if(!_.isEmpty(data) && !_.isEmpty(data[0].custid)){
                var id= data[0].custid;
                self.autoFillDetails(id);
            }else{
                var options={};
                options.currFocus = currFocus;
                self.generateNewCustId(options);
            }
            $('#custId').val(id);
        });
        application.core.call(request, callBackObj);
    },
    generateNewCustId: function(options){
        var self = application.bill.creation;
        self.clearAutoFill(options);
        var cName = $("#customerName").val();
        var fName = $('#fatherGaurdianName').val();
        if(cName !=='')
            cName = cName.substring(0,1);
        if(fName != '')
            fName = fName.substring(0,1);
        var idPrefix = cName + fName;
        idPrefix = idPrefix.toUpperCase();
        var idSuffix = 1;
        var id = idPrefix + idSuffix;
        var obj = {
            aQuery : "SELECT distinct custid from "+gs.database.schema+".pledgebook where custid like '"+idPrefix+"%'"
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            if(response == null)
                return;
            response = JSON.parse(response);
            data = self.getUniqueList(response, 'custid');
            if(!_.isEmpty(data) && !_.isEmpty(data[0].custid)){
                _.each(data, function(value, index){
                    var existingId = value.custid;
                    existingId = existingId.toUpperCase();
                    if(existingId.indexOf(id) !== -1){
                        idSuffix = idSuffix+1;
                        id= idPrefix + idSuffix;
                    }
                });
            }
            $('#custId').val(id);
            $('#custId').addClass('new');
            
        });
        application.core.call(request, callBackObj);
    },
    autoFillDetails: function(id){  
         var obj = {
            aQuery : "SELECT distinct * from "+gs.database.schema+".pledgebook where custid= '"+id+"'"
        }
        var callBackObj = application.core.getCallbackObject();
        var request = application.core.getRequestData('executeQuery.php', obj, 'POST');
        callBackObj.bind('api_response', function(event, response, request){
            if(response == null)
                return;
            response = JSON.parse(response);
            data = response[0];
            $('#fatherGaurdianName').val(data.fgname);
            $('#address').val(data.address);
            $('#address2').val(data.address2 || application.core.defaults.address2);
            $('#place').val(data.place || application.core.defaults.place);
            $('#pincode').val(data.pincode || application.core.defaults.pincode);
            $('#mobNo').val(data.mobile);
            $('#custId').hasClass('new')? $('#custId').removeClass('new'): '';
        });
        application.core.call(request, callBackObj);
    },
    clearAutoFill: function(options){
        if(options.currFocus == 'cname'){
            $('#fatherGaurdianName').val('');
        }
        if(options.currFocus == 'cname' || options.currFocus == 'fgname'){
            $('#address').val('');
        }
        $('#address2').val(application.core.defaults.address2);
        $('#place').val(application.core.defaults.place);
        $('#pincode').val(application.core.defaults.pincode);
        $('#mobNo').val('');
    },
    /* END: custId */

    getUniqueList: function(data, param){
        var data = _.uniq(data, function(aData) { 
                            return aData[param];
                        });
        return data;
    }

}
