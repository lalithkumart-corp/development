var imgSettings = {
    previousImgIndex : null,
    currentImgIndex : 1,
    nextImgIndex : null,
    totalImg : null
}
var currImage = 'default';
var imgPaths = [];
var imgUpload = '';
var uploadedFileName;
 //START:: AJAX FILE UPLOAD CODE
 var options = { 
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
        success: function() 
        {
            imgUpload = 'success';
            debugger;
            uploadedFileName = getFileName($('.fileChooser').val());
            $('.item-image img').attr('src', '/uploads/'+uploadedFileName);
            $("#bar").width('100%');
            $("#percent").html('100%');

        },
        complete: function(response) 
        {
            $("#message").html("<font color='green'>"+response.responseText+"</font>");
        },
        error: function()
        {   
            imgUpload = 'error';
            $("#message").html("<font color='red'> ERROR: unable to upload files</font>");
        } 
    };
$(document).on('ready',function(){
    bindEvents();
})
    function bindEvents(){
        $(".saveEntries").on('click', function(e){
            var i = 0;
            var obj = {};
            _.each($("table tbody tr") , function(row){
                 var secObj = {};
                 secObj.name = $(row).find('td:eq(1)').text();
                 secObj.serialNo = $(row).find('td:eq(0)').text();
                 i = i+1;
                obj[i] = secObj;
            });
           // console.log(obj);
            $.ajax({
                url: 'submit.php',
                type: 'POST',
                data: obj,
                success: function(data, textStatus, jqXHR)
                {
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    alert("Error!!");
                }
            });
        });
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
        debugger;
        if(key == 13 && _.isEmpty($(".newItem").val())){
            var indexVal = $(".newItem").parent().parent().index();
            if(indexVal > 0){
                $(".ornamentDetails tbody tr:eq("+ indexVal +")").remove();
                $(".ornamentDetails tbody tr:eq("+ (indexVal-1) +") td:eq(3) input").addClass('appendRow');
            }
        }
    });
    $('.submitBtn').on('click', function(e){
        //saveEntry();
        var entryList = {};
        entryList = saveEntry();
       
        //entryList.name = 'nameexample';
        console.log(entryList);
         $.ajax({
                url: 'createbill.php',
                type: 'POST',
                data: entryList,
                success: function(data, textStatus, jqXHR)
                {
                    alert('success');
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    alert("Error!!");
                }
            });
    });
    //GET IMAGE PATH FRO SQL
    $('#customerName').blur(function(e){
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
                   setImage(response);
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                   console.log("Ajax Error..");
                }
            });
        }

    });
    $('.img_navigator_next').on('click', function(){
        imgSettings.nextImgIndex += 1;
        imgSettings.previousImgIndex += 1;
        imgSettings.currentImgIndex += 1;
        $('.currLimit').html(imgSettings.currentImgIndex);
        console.log("Next Clicked " ,imgSettings);
        if(imgSettings.nextImgIndex > imgPaths.length)
            disableNextButton();
        else
            enableNextButton();
        //TODO: check condition and enable
        enablePrevButton();
        var path = imgPaths[imgSettings.currentImgIndex - 1];
        $(".item-image img").attr('src', path);
    });
    $('.img_navigator_prev').on('click', function(){
        imgSettings.nextImgIndex -= 1;
        imgSettings.previousImgIndex -= 1;
        imgSettings.currentImgIndex -= 1;
        $('.currLimit').html(imgSettings.currentImgIndex);
        console.log("Prev Clicked " ,imgSettings);
        if(imgSettings.previousImgIndex == null || imgSettings.previousImgIndex == 0){
            disablePrevButton();
        }else{
            enablePrevButton();
        }
        //TODO: check condition and enable
        enableNextButton();

        var path = imgPaths[imgSettings.currentImgIndex - 1];
        $(".item-image img").attr('src', path);
    });
    // $('.img_navigator_start').on('click', function(){
    //     imgSettings.previousImgIndex = null;
    //     imgSettings.nextImgIndex = 
    //     imgSettings.currentImgIndex = 1;
    // });
    // $('.img_navigator_end').on('click', function(){
    //     imgSettings.previousImgIndex = 
    //     imgSettings.nextImgIndex = 
    //     imgSettings.currentImgIndex = 
    // });
    
    $('.editImg').on('click', function(){
        $('#myForm').show();
        $('.confirmImg').show();
        $('.clearImg').show();
        $('#progress').show();
        $(this).hide();
    });

    $('.confirmImg').on('click', function(){
        $('#myForm').hide();
        $(this).hide();
        $('.clearImg').hide();
        $('#progress').hide();
        $('.editImg').show(); 
    });

    $('.clearImg').on('click', function(){
        $('.item-image img').attr('src', '/uploads/default.gif');

    });

    $('.printBill').off('click').on('click', function(){
        printBill();
    });

    $("#myForm").ajaxForm(options);


}
$(function(){
     /* var myCal = new Calendar({ customDate : 'd/m/Y' });
     $(".saveEntries").on('click', function(e){
            var i = 0;
            var obj = {};
            _.each($("table tbody tr") , function(row){
                 var secObj = {};
                 secObj.name = $(row).find('td:eq(1)').text();
                 secObj.serialNo = $(row).find('td:eq(0)').text();
                 i = i+1;
                obj[i] = secObj;
            });
           // console.log(obj);
            $.ajax({
                url: 'submit.php',
                type: 'POST',
                data: obj,
                success: function(data, textStatus, jqXHR)
                {
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    alert("Error!!");
                }
            });
        });
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
        debugger;
        if(key == 13 && _.isEmpty($(".newItem").val())){
            var indexVal = $(".newItem").parent().parent().index();
            if(indexVal > 0){
                $(".ornamentDetails tbody tr:eq("+ indexVal +")").remove();
                $(".ornamentDetails tbody tr:eq("+ (indexVal-1) +") td:eq(3) input").addClass('appendRow');
            }
        }
    });
    $('.submitBtn').on('click', function(e){
        //saveEntry();
        var entryList = {};
        entryList = saveEntry();
       
        //entryList.name = 'nameexample';
        console.log(entryList);
         $.ajax({
                url: 'createbill.php',
                type: 'POST',
                data: entryList,
                success: function(data, textStatus, jqXHR)
                {
                    alert('success');
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    alert("Error!!");
                }
            });
    });
    //GET IMAGE PATH FRO SQL
    $('#customerName').blur(function(e){
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
                   setImage(response);
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                   console.log("Ajax Error..");
                }
            });
        }

    });
    $('.img_navigator_next').on('click', function(){debugger;
        imgSettings.nextImgIndex += 1;
        imgSettings.previousImgIndex += 1;
        imgSettings.currentImgIndex += 1;
        $('.currLimit').html(imgSettings.currentImgIndex);
        console.log("Next Clicked " ,imgSettings);
        if(imgSettings.nextImgIndex > imgPaths.length)
            disableNextButton();
        else
            enableNextButton();
        //TODO: check condition and enable
        enablePrevButton();
        var path = imgPaths[imgSettings.currentImgIndex - 1];
        $(".item-image img").attr('src', path);
    });
    $('.img_navigator_prev').on('click', function(){debugger;
        imgSettings.nextImgIndex -= 1;
        imgSettings.previousImgIndex -= 1;
        imgSettings.currentImgIndex -= 1;
        $('.currLimit').html(imgSettings.currentImgIndex);
        console.log("Prev Clicked " ,imgSettings);
        if(imgSettings.previousImgIndex == null || imgSettings.previousImgIndex == 0){
            disablePrevButton();
        }else{
            enablePrevButton();
        }
        //TODO: check condition and enable
        enableNextButton();

        var path = imgPaths[imgSettings.currentImgIndex - 1];
        $(".item-image img").attr('src', path);
    });
    // $('.img_navigator_start').on('click', function(){
    //     imgSettings.previousImgIndex = null;
    //     imgSettings.nextImgIndex = 
    //     imgSettings.currentImgIndex = 1;
    // });
    // $('.img_navigator_end').on('click', function(){
    //     imgSettings.previousImgIndex = 
    //     imgSettings.nextImgIndex = 
    //     imgSettings.currentImgIndex = 
    // });
    
    $('.editImg').on('click', function(){
        $('#myForm').show();
        $('.confirmImg').show();
        $('.clearImg').show();
        $('#progress').show();
        $(this).hide();
    });

    $('.confirmImg').on('click', function(){
        $('#myForm').hide();
        $(this).hide();
        $('.clearImg').hide();
        $('#progress').hide();
        $('.editImg').show(); 
    });

    $('.clearImg').on('click', function(){
        $('.item-image img').attr('src', '/uploads/default.gif');

    });

    $('.printBill').off('click').on('click', function(){
        printBill();
    });

    $("#myForm").ajaxForm(options);*/
});



function saveEntry(){
    return getEntries();
}
function getEntries() {
    var obj = {}, tempObj = {};
    obj.adate = $('.inputValDate').val() || '';
    obj.aBillNo = $('#billNo').val() || '';
    obj.aAmt = $('#ammout').val() || '';
    obj.aCustName= $('#customerName').val() || '';
    obj.aFGName = $('#fatherGaurdianName').val() || '';
    obj.aAddress = $('#address').val() || '';
    obj.aPlace = $('#place').val() || '';
    obj.aPincode = $('#pincode').val() || '';
    obj.aMobNo = $('#mobNo').val() || '';
    obj.aTeleNo = $('#teleNo').val() || '';
    obj.awt = $('#ornWeight').val() || '';
    obj.aNett = $('#ornNett').val() || '';
    
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
    return obj;
}
   
function setImage(response){
    imgPaths = [];
    if(response.length > 0){
        imgSettings.total = response.length;
        _.each(response, function(value, index){
            imgPaths.push(value.profilepicpath);
         });
        $(".item-image img").attr('src', response[0].profilepicpath);
        currImage = 'custom';
    }else{
        $(".item-image img").attr('src', '/uploads/default.gif');
        currImage = 'default';
    }
    imgSettings.currentImgIndex = 1;
    $('.currLimit').html(imgSettings.currentImgIndex);
    $('.currLimit').html(imgSettings.currentImgIndex);
    $('.maxLimit').html(imgSettings.total);
    resetNavigationBtn();
}
function setDefaultPic(){
      
}

function resetNavigationBtn() {
    if(currImage == 'default' || imgPaths.length == 1){
        disablePrevButton();
        disableNextButton();
        imgSettings.nextImgIndex = null;
    }else if( currImage == 'custom'){
        if(imgPaths.length > 1){
            disablePrevButton();
            enableNextButton();
            imgSettings.nextImgIndex = 2;
        }
    }

}
function disableNextButton(){
    $('.img_navigator_next').prop('disabled', 'true');
    $('.secondaryNextBtn').addClass('disabled');
}

function disablePrevButton(){
    $('.img_navigator_prev').prop('disabled', 'true');
    $('.secondaryPrevBtn').addClass('disabled');
}
function enableNextButton(){
    $('.img_navigator_next').removeAttr('disabled');
    $('.secondaryNextBtn').removeClass('disabled');
}

function enablePrevButton(){
    $('.img_navigator_prev').removeAttr('disabled');
    $('.secondaryPrevBtn').removeClass('disabled');
}
function getFileName(fullPath){
    if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
        return filename;
    }
}
function printBill(){
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
}