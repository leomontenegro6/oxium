<?php
function __autoload($class_name) {
	if(file_exists("../../persistence/". $class_name . '.php')){
		require_once "../../persistence/". $class_name . '.php';
	}elseif(file_exists("../../business/". $class_name . '.php')){
		require_once "../../business/". $class_name . '.php';
	}elseif(file_exists("../../utils/". $class_name . '.php')){
		require_once "../../utils/". $class_name . '.php';
	}else{
		require_once $class_name . '.php';
	}
}

session_start();
session_destroy();
setcookie('auth');
header("Location: index.php");
?>
