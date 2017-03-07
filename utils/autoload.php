<?php
function __autoload($class_name) {
	$pastas = array('persistence', 'business', 'utils');
	$prefixo = '../';
	for($i=0; $i<3; $i++){
		if($i > 0){
			$prefixo .= '../';
		}
		$raiz = false;
		foreach($pastas as $pasta){
			if(file_exists($prefixo . $pasta . '/'. $class_name . '.php')){
				if(file_exists("../".$prefixo . $pasta . '/'. $class_name . '.php')){
					$raiz = true;
				}
				require_once $prefixo . $pasta . '/'. $class_name . '.php';
			}
		}
		if ($raiz) {
			break;
		}
	}
}