<?php
include 'app.php';
$servername = "127.0.0.1";
$username = "root";
$password = "root";

$link = mysqli_connect("localhost:3306",'root','root', $myDb);

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}
$sno = $_POST['s_no'];
$dates = $_POST['adate'];
$billno = $_POST['aBillNo'];
$amt = $_POST['aAmt'];
$cname = $_POST['aCustName'];
$fgName = $_POST['aFGName'];
$addr = $_POST['aAddress'];
$addr2 = $_POST['aAddress2'];
$place = $_POST['aPlace'];
$pin = $_POST['aPincode'];
$mob = $_POST['aMobNo'];
//$tele = $_POST['aTeleNo'];
$nett = $_POST['aNett'];
$wt = $_POST['awt'];
$orn = $_POST['ornaments'];
$pic = $_POST['profilepicpath'];
$status = $_POST['status'];
$ornType = $_POST['ornType'];
$intRate = $_POST['intRate'];
$intAmount = $_POST['intAmount'];
$givenAmt = $_POST['givenAmt'];
$custid = $_POST['custid'];

$sql = "INSERT INTO ".$myDb.".pledgebook (sno, dates, billNo, amount, cname, fgname, address, address2, place, pincode, mobile, ornaments, grossWt, netwt, ornType , interest, interest_amt, given_amt, profilepicpath, status, custid ) VALUES ('".$sno."', '".$dates."', '".$billno."','".$amt."','".$cname."','".$fgName."','".$addr."','".$addr2."','".$place."','".$pin."','".$mob."','".$orn."','".$wt."','".$nett."', '".$ornType."', '".$intRate."', '".$intAmount."', '".$givenAmt."', '".$pic."', '".$status."', '".$custid."')";

$stack = array();
$obj = new stdClass();

if ($link->query($sql) === TRUE) {
	$obj->status = 'success';
	$obj->status_msg = 'New record created successfully';
	$obj->options = $_POST;
	array_push($stack, $obj);
} else {
	$obj->status = 'error';
	$obj->status_msg = $link->error;
	$obj->options = $_POST;
	array_push($stack, $obj);
    //echo "Error: " . $sql . "<br>" . $link->error;
}
echo json_encode($stack);
mysqli_close($link);
?>