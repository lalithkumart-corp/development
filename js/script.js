/*
$link = mysqli_connect("172.30.1.2:3306", "lalith", "Vine@2015", "knovel_test");

$servername = "localhost";
$username = "lalith";
$password = "vine@2016";
$conn = new PDO("mysql:host=sysvines002.sysvine.local;port=3306;", $username, $password); 

$servername = 'sysvines002.sysvine.local';
$username = 'lalith';
$password = 'vine@2016';
$conn = mysqli_connect($servername, $username, $password);
*/
$(function()
{
    $(".saveEntries").on('click', function(e){
        debugger;
        var i = 0;
        var obj = {};
        _.each($("table tbody tr") , function(row){
             var secObj = {};
             secObj.name = $(row).find('td:eq(1)').text();
             secObj.serialNo = $(row).find('td:eq(0)').text();
             i = i+1;
            obj[i] = secObj;
        });
        console.log(obj);
         mydata = {
            "name" : "lalith",
        }
        console.log(mydata);
        $.ajax({
            url: 'submit.php',
            type: 'POST',
            data: obj,
            success: function(data, textStatus, jqXHR)
            {debugger;
                alert("Suceess :)");
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                alert("Error!!");
            }
        });
    })
	// Variable to store your files
	var files;

	// Add events
	$('input[type=file]').on('change', prepareUpload);
	$('form').on('submit', uploadFiles);

	// Grab the files and set them to our variable
	function prepareUpload(event)
	{
		files = event.target.files;
	}

	// Catch the form submit and upload the files
	function uploadFiles(event)
	{debugger;
		event.stopPropagation(); // Stop stuff happening
        event.preventDefault(); // Totally stop stuff happening

        // START A LOADING SPINNER HERE

        // Create a formdata object and add the files
		var data = new FormData();
		$.each(files, function(key, value)
		{
			data.append(key, value);
		});
        mydata = {
            "name" : "lalith",
        }
        console.log(mydata);
        $.ajax({
            url: 'submit.php',
            type: 'POST',
            data: mydata,
            success: function(data, textStatus, jqXHR)
            {
            	
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
            	
            }
        });
    }

    function submitForm(event, data)
	{debugger;
		// Create a jQuery object from the form
		$form = $(event.target);
		
		// Serialize the form data
		var formData = $form.serialize();
		
		// You should sterilise the file names
		$.each(data.files, function(key, value)
		{
			formData = formData + '&filenames[]=' + value;
		});

		$.ajax({
			url: 'submit.php',
            type: 'POST',
            data: formData,
            cache: false,
            dataType: 'json',
            success: function(data, textStatus, jqXHR)
            {
            	if(typeof data.error === 'undefined')
            	{
            		// Success so call function to process the form
            		console.log('SUCCESS: ' + data.success);
            	}
            	else
            	{
            		// Handle errors here
            		console.log('ERRORS: ' + data.error);
            	}
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
            	// Handle errors here
            	console.log('ERRORS: ' + textStatus);
            },
            complete: function()
            {
            	// STOP LOADING SPINNER
            }
		});
	}
});