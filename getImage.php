<?php
$servername = "localhost";
$username = "root";
$password = "root";
$link = mysqli_connect("localhost:3306", "root", "root", "test");

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}

$fname = $_POST['fname'];
//$sql = "SELECT profilepicpath FROM test.mytable1 WHERE myNames = '" .$fname. "'";
$sql = "SELECT profilepicpath FROM test.pledgebook WHERE cname = '" .$fname. "'";

$result = $link->query($sql);

$stack = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($stack, $row);
    }
} else {
    //echo "empty";
}

echo json_encode($stack);
mysqli_close($link);
?>