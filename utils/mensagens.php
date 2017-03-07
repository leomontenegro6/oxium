<?php
class mensagens{

	public static function dataExtenso(){
		putenv("LANG=pt_BR.UTF-8");
		$oldlocale = setlocale(LC_ALL, NULL);
        setlocale(LC_ALL, 'pt_BR');
        return ucfirst(strftime(" &nbsp;&nbsp; %d/%m/%Y, %A", strtotime(date('Y/m/d'))));
        setlocale(LC_ALL, $oldlocale);
    }

	public static function capitaliza($inputString){
		$retorno = array();
		$outputString    = utf8_decode($inputString);
		$outputString    = strtolower($outputString);
		$outputString    = utf8_encode($outputString);
		$table = array(
			'À'=>'à', 'Á'=>'á', 'Â'=>'â', 'Ã'=>'ã', 'Ä'=>'ä', 'Ç'=>'ç', 'È'=>'è', 'É'=>'é', 'Ê'=>'ê', 'Ë'=>'ë',
			'Ì'=>'ì', 'Í'=>'í', 'Î'=>'î', 'Ï'=>'ï', 'Ñ'=>'ñ', 'Ò'=>'ò', 'Ó'=>'ó', 'Ô'=>'ô', 'Õ'=>'õ', 'Ö'=>'ö',
			'Ù'=>'ù', 'Ú'=>'ú', 'Û'=>'û', 'Ỳ'=>'ỳ', 'Ý'=>'ý', 'Ÿ'=>'ÿ', 'Ŕ'=>'ŕ',
		);
		$outputString = strtr($outputString, $table);
		$string = strtolower(trim(preg_replace("/\s+/", " ", $outputString)));
		$palavras = explode(" ", $string);

		$retorno[] = ucfirst($palavras[0]);
		unset($palavras[0]);

		foreach ($palavras as $palavra){
			if (preg_match("/^([ivx]?[xiv][xiv][xiv]?[xiv]?[:]?[.]?)$/i", $palavra)){ // Verifica se a palavra possui número(s) em algarismo romano seguido ou não de ':' ou '.'
				$palavra = strtoupper($palavra);
			}else if (!preg_match("/^([dn]?[aeou][s]?|em|para|ao|aos|sobre|com|por|que)$/i", $palavra)){ // Verifica se a palavra não possui preposições
				$palavra = ucfirst($palavra);
			}
			$retorno[] = $palavra;
		}
		return implode(" ", $retorno);
	}

	public static function capitalizaParagrafo($inputString){
		$outputString    = utf8_decode($inputString);
		$outputString    = strtolower($outputString);
		$primLetra       = substr($outputString, 0, 1);
		$primLetra       = strtoupper($primLetra);
		$outputString    = substr($outputString, 1);
		$outputString    = mensagens::lower(utf8_encode($outputString));
		$outputString    = $primLetra.$outputString;
		return $outputString;
	}

	public static function upper($inputString){
		$outputString    = utf8_decode($inputString);
		$outputString    = strtoupper($outputString);
		$outputString    = utf8_encode($outputString);
		$table = array(
			'à'=>'À', 'á'=>'Á', 'â'=>'Â', 'ã'=>'Ã', 'ä'=>'Ä', 'ç'=>'Ç', 'è'=>'È', 'é'=>'É', 'ê'=>'Ê', 'ë'=>'Ë',
			'ì'=>'Ì', 'í'=>'Í', 'î'=>'Î', 'ï'=>'Ï', 'ñ'=>'Ñ', 'ò'=>'Ò', 'ó'=>'Ó', 'ô'=>'Ô', 'õ'=>'Õ', 'ö'=>'Ö',
			'ù'=>'Ù', 'ú'=>'Ú', 'û'=>'Û', 'ỳ'=>'Ỳ', 'ý'=>'Ý', 'ÿ'=>'Ÿ', 'ŕ'=>'Ŕ',
		);
		$outputString = strtr($outputString, $table);
		return $outputString;
	}

	public static function lower($inputString){
		$outputString    = utf8_decode($inputString);
		$outputString    = strtolower($outputString);
		$outputString    = utf8_encode($outputString);
		$table = array(
			'À'=>'à', 'Á'=>'á', 'Â'=>'â', 'Ã'=>'ã', 'Ä'=>'ä', 'Ç'=>'ç', 'È'=>'è', 'É'=>'é', 'Ê'=>'ê', 'Ë'=>'ë',
			'Ì'=>'ì', 'Í'=>'í', 'Î'=>'î', 'Ï'=>'ï', 'Ñ'=>'ñ', 'Ò'=>'ò', 'Ó'=>'ó', 'Ô'=>'ô', 'Õ'=>'õ', 'Ö'=>'ö',
			'Ù'=>'ù', 'Ú'=>'ú', 'Û'=>'û', 'Ỳ'=>'ỳ', 'Ý'=>'ý', 'Ÿ'=>'ÿ', 'Ŕ'=>'ŕ',
		);
		$outputString = strtr($outputString, $table);
		return $outputString;
	}

	public static function normalize($string){ //Substitui os caracteres especiais por seus respectivos caracteres normais equivalentes ou remove-os
		$table = array(
			'Š'=>'S', 'š'=>'s', 'Đ'=>'Dj', 'đ'=>'dj', 'Ž'=>'Z', 'ž'=>'z', 'Č'=>'C', 'č'=>'c', 'Ć'=>'C', 'ć'=>'c',
			'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E',
			'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O',
			'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U', 'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss',
			'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a', 'ç'=>'c', 'è'=>'e', 'é'=>'e',
			'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o',
			'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'ý'=>'y', 'þ'=>'b',
			'ÿ'=>'y', 'Ŕ'=>'R', 'ŕ'=>'r', '*'=>'', ';'=>'', '.'=>'', '\''=>'', '´'=>'', '_'=>' ',
		);
		return strtr($string, $table);
	}
	
	public static function formataDiaSemana($dia){ //recebe dia em valor numérico e retorna por extenso
		switch ($dia){
			case "1":
				$extenso = "Dom";
				break;
			case "2":
				$extenso = "Seg";
				break;
			case "3":
				$extenso = "Ter";
				break;
			case "4":
				$extenso = "Qua";
				break;
			case "5":
				$extenso = "Qui";
				break;
			case "6":
				$extenso = "Sex";
				break;
			case "7":
				$extenso = "Sab";
				break;
		}
		return $extenso;
	}

	public static function formataDiaSemanaCompleto($dia){ //recebe dia em valor numérico e retorna por extenso
		switch ($dia){
			case "1":
				$extenso = "Domingo";
				break;
			case "2":
				$extenso = "Segunda";
				break;
			case "3":
				$extenso = "Terça";
				break;
			case "4":
				$extenso = "Quarta";
				break;
			case "5":
				$extenso = "Quinta";
				break;
			case "6":
				$extenso = "Sexta";
				break;
			case "7":
				$extenso = "Sábado";
				break;
		}
		return $extenso;
	}
	
	public static function formataTamanho($tamanho){
		if($tamanho < 1024){
			$tamanho_formatado = str_replace(".", ",", $tamanho) . " Kbytes";
		} else {
			$tamanho = number_format($tamanho / 1024, 2);
			$tamanho_formatado = str_replace(".", ",", $tamanho) . " Mbytes";
		}
		return $tamanho_formatado;
	}
	
	public static function dataSistemas(){
		$dd = date("d");
		$dia = date("D");
		$mes = date("m");
		$ano = date("Y");
		$mesext = array(1 =>"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro");
		$diaext = array("Sun" => "Domingo", "Mon" => "Segunda-Feira", "Tue" => "Terça-Feira", "Wed" => "Quarta-Feira", "Thu" => "Quinta-Feira", "Fri" => "Sexta-Feira", "Sat" => "Sábado");
		$dataSistema = $dd . "/" . $mes . "/" . $ano . ",&nbsp;" . $diaext[$dia];
		return $dataSistema;
	}	

	public static function encodeData($data){
        $data_encode = $data;
		if(!empty ($data)){
			$d = explode("-",$data);
			$data_encode = $d[2]."/". $d[1] ."/".$d[0];
		}
		return $data_encode;
	}
	
	public static function encodeDataHora($data_hora){
        $d = explode("-",$data_hora);
        $data_encode = substr($d[2], 0, 2)."/". $d[1] ."/".$d[0];
		$hora = substr($d[2], 3);
		$h = explode(":", $hora);
		$hora_encode = $h[0].":".$h[1];
		$data_hora_encode = $data_encode." - ".$hora_encode;
		return $data_hora_encode;
	}
	
	public static function decodeData($data){
		$data_decode = $data;
		if(!empty ($data)){
			$d = explode("/",$data);
			$data_decode = $d[2]."-". $d[1] ."-".$d[0];
		}
		return $data_decode;
	}
	
	public static function decodeDataHora($data_hora){
		$data_hora_decode = $data_hora;
		if(!empty ($data_hora)){
			$dh = explode(' ',$data_hora);
			$d = explode('/', $dh[0]);
			$h = explode(':', $dh[1]);
			
			$ano = $d[2];
			$mes = $d[1];
			$dia = $d[0];
			$hora = $h[0];
			$minuto = $h[1];
			if(isset($h[2])){
				$segundo = $h[2];
			} else {
				$segundo = '00';
			}
			
			$data_decode = $ano . '-' . $mes . '-' . $dia;
			$hora_decode = $hora . ':' . $minuto . ':' . $segundo;
			$data_hora_decode = $data_decode . ' ' . $hora_decode;
		}
		return $data_hora_decode;
	}

	public static function decodeInteger($inputString){
		$table = array(
			'.'=>'', '('=>'', ')'=>'', ' '=>'', '-'=>'', '/'=>'',
		);
		$outputInteger = strtr($inputString, $table);
		$outputInteger = (int)$outputInteger;
		return $outputInteger;
	}

	public static function file_upload_error_message($error_code) {
		switch ($error_code) {
			case UPLOAD_ERR_INI_SIZE:
				return 'O tamanho da imagem ultrapassa o limite permitido. Limite menor que 3Mb';
			case UPLOAD_ERR_FORM_SIZE:
				return 'O arquivo enviado excede o tamanho máximo permitido';
			case UPLOAD_ERR_PARTIAL:
				return 'O arquivo foi apenas parcialmente carregado';
			case UPLOAD_ERR_NO_FILE:
				return 'Nenhum arquivo foi enviado';
			case UPLOAD_ERR_NO_TMP_DIR:
				return 'Faltando uma pasta temporária';
			case UPLOAD_ERR_CANT_WRITE:
				return 'Falha ao gravar arquivo em disco';
			case UPLOAD_ERR_EXTENSION:
				return 'Arquivo de upload parou por extensão';
			default:
				return 'Erro de upload Desconhecido';
		}
	}
	
	public static function formataNomeArquivo($nome_completo){
		$quebra_arquivo = explode(".",$nome_completo);
		$nome_inicio = $quebra_arquivo[0];
		$outputString    = utf8_decode($nome_inicio);
		$outputString    = strtolower($outputString);
		$outputString    = utf8_encode($outputString);
		$table = array(
			'À'=>'a', 'Á'=>'a', 'Â'=>'a', 'Ã'=>'a', 'Ä'=>'a',
			'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a',
			'È'=>'e', 'É'=>'e', 'Ê'=>'e', 'Ë'=>'e',
			'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e',
			'Ì'=>'i', 'Í'=>'i', 'Î'=>'i', 'Ï'=>'i',
			'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i',
			'Ò'=>'o', 'Ó'=>'o', 'Ô'=>'o', 'Õ'=>'o', 'Ö'=>'o',
			'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o',
			'Ù'=>'u', 'Ú'=>'u', 'Û'=>'u',
			'ù'=>'u', 'ú'=>'u', 'û'=>'u',
			'Ç'=>'c', 'ç'=>'c',
			'ª'=>'', 'º'=>'', '\''=>'', '\"'=>'', '´'=>'', '`'=>'', '-'=>'', '+'=>'', '*'=>'',
			'?'=>'', '!'=>'', '@'=>'', '#'=>'', '$'=>'', '%'=>'', '&'=>'', '('=>'', ')'=>'', '{'=>'', '}'=>'',
			'['=>'', ']'=>'', ','=>'', ':'=>'', ';'=>'', '<'=>'', '>'=>'', '-'=>'', ' '=>'',
		);
		$outputString = strtr($outputString, $table);
		$nome = mensagens::lower($outputString);
		return $nome;
	}
	
	public static function getExtensaoByNomeArquivo($nome_completo){
		$quebra_nome = explode(".", $nome_completo);
		$posicao_extensao = count($quebra_nome) - 1;
		$extensao = $quebra_nome[$posicao_extensao];
		return $extensao;
	}
	
	public static function renomearArquivo($nome,$extensao){
		$timestamp = time();
		$nomear = $nome.$timestamp;
		$renomear =  md5($nomear).".".$extensao;
		return $renomear;
	}
	
	public static function removerArquivosTemporarios(){
		$data_atual = strtotime('now');
		// Laço que percorrerá todos os arquivos da pasta /tmp cujo nome terminam com "_oxium_tmp",
		// e que lá se acumularam por conta de uploads incompletos. Estes arquivos serão removidos,
		// caso sejam antigos.
		foreach (glob("/tmp/*_oxium_tmp") as $nome_arquivo) {
			$data_arquivo = filemtime($nome_arquivo);
			$diferenca = $data_atual - $data_arquivo;
			$duracao_sessao = ini_get('session.gc_maxlifetime');
			if($diferenca > $duracao_sessao){
				// Se o arquivo percorrido form mais antigo que a duração da sessão, o mesmo será removido.
				unlink($nome_arquivo);
			}
		}
	}
	
	/*
	 * Função que retorna o ambiente em que o sistema está sendo executado.
	 */
	public static function getAmbienteDesenvolvimento(){
		$http_host = $_SERVER['HTTP_HOST'];
		if ($http_host == 'localhost') {
			$ambiente = 'D'; // Desenvolvimento
		} elseif ($http_host == 'http://romhacking.net.br/oxium/') {
			$ambiente = 'H'; // Homologação
		} else {
			$ambiente = 'P'; // Produção
		}
		return $ambiente;
	}
	
	public static function getEnderecoPagina(){
		$endereco = $_SERVER['SCRIPT_NAME'];
		$barra = substr_count($endereco, '/');
		$endereco = explode('/',$endereco);
		return $endereco[$barra];
	}
}