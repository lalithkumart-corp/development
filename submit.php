<?php
$servername = "127.0.0.1";
$username = "root";
$password = "root";
$myDb = "dev";

$link = mysqli_connect("localhost:3306",'root','root', $myDb);

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}

$row1 = $_POST['name'];
print_r($row1);
//$row2 = $_POST['2'];
// 	$vals = array(
//         $row1['name'], $row2['name']
//     );
//     echo json_encode($vals);
// $sql = "INSERT INTO test.mytable1 (mySerailNo, myNames) VALUES ('".$row1['serialNo']."', '".$row1['name']."')";

// if ($link->query($sql) === TRUE) {
//     echo "New record created successfully";
// } else {
//     echo "Error: " . $sql . "<br>" . $conn->error;
// }
mysqli_close($link);
?>