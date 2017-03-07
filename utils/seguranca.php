<?php
class seguranca{	
	public static function antiInjection($array){
		while($valor = current($array)){
			if(is_array($valor)){
				self::antiInjection($valor);
				next($array);
			} else {
				$chave = key($array);
				//$valor = preg_replace("/(from|select|insert|delete|union|drop|drop table|show tables|#|--|\\\\)/i","",$valor);
				//$valor = preg_replace("/(FROM|SELECT|INSERT|DELETE|UNION|DROP|DROP TABLE|SHOW TABLES|#|--|\\\\)/i","",$valor);
				$valor = trim($valor);
				$array[$chave] = addslashes($valor);
				next($array);
			}
		}
		return $array;
	}
	
	public static function validaSessao(){
		$chave = $_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR'];
		if (array_key_exists('validador', $_SESSION)){
			if ($_SESSION['validador'] != md5($chave)){
				 exit;
			 }
		}else{
			$_SESSION['validador'] = md5($chave);
		}
	}
	
	public static function checkServer($servidor,$retorno){
		$fs = fsockopen($servidor,80);
		if($fs){
			header("Location: ".$retorno);
			fclose($fs);
		}else{
		   header("Location: login.php");
	   }
	}

	public static function NTLMHash($password) {
		$password=iconv('UTF-8','UTF-16LE',$password);
		$MD4Hash=bin2hex(mhash(MHASH_MD4,$password));
		$NTLMHash=strtoupper($MD4Hash);
		return $NTLMHash;
	}

	public static function LMhash($password){
		$password = strtoupper(substr($password,0,14));
		$p1 = self::LMhash_DESencrypt(substr($password, 0, 7));
		$p2 = self::LMhash_DESencrypt(substr($password, 7, 7));
		return strtoupper($p1.$p2);
	}

	private static function LMhash_DESencrypt($password){
		$key = array();
		$tmp = array();
		$len = strlen($password);
		for ($i=0; $i<7; ++$i)
			$tmp[] = $i < $len ? ord($password[$i]) : 0;

		$key[] = $tmp[0] & 254;
		$key[] = ($tmp[0] << 7) | ($tmp[1] >> 1);
		$key[] = ($tmp[1] << 6) | ($tmp[2] >> 2);
		$key[] = ($tmp[2] << 5) | ($tmp[3] >> 3);
		$key[] = ($tmp[3] << 4) | ($tmp[4] >> 4);
		$key[] = ($tmp[4] << 3) | ($tmp[5] >> 5);
		$key[] = ($tmp[5] << 2) | ($tmp[6] >> 6);
		$key[] = $tmp[6] << 1;

		$is = mcrypt_get_iv_size(MCRYPT_DES, MCRYPT_MODE_ECB);
		$iv = mcrypt_create_iv($is, MCRYPT_RAND);
		$key0 = "";

		foreach ($key as $k)
			$key0 .= chr($k);
		$crypt = mcrypt_encrypt(MCRYPT_DES, $key0, "KGS!@#$%", MCRYPT_MODE_ECB, $iv);

		return bin2hex($crypt);
	}

	public static function ldapMd5($password){
		return '{MD5}' . base64_encode(pack('H*',md5($password)));
	}

	public static function unixPassword($password){
		// create a salt that ensures crypt creates an md5 hash
		$base64_alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
						.'abcdefghijklmnopqrstuvwxyz0123456789+/';
		$salt='$1$';
		for($i=0; $i<9; $i++){
			$salt.=$base64_alphabet[rand(0,63)];
		}
		// return the crypt md5 password
		return crypt($password,$salt.'$');
	}
}