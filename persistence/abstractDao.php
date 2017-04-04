<?php
error_reporting(~E_STRICT);

abstract class abstractDao{
	
	protected $database;
	protected $schema;
	protected $tabela;
	protected $dbname;
	protected $transacoes;
	protected $campos;
	protected $campos_traduzido;

	protected $traducoes = array(
		'tipo'			=> array('type'),		
		'tipos'			=> array(
			'inteiro'		=> array('int', 'integer'),
			'texto'			=> array('text', 'string'),
			'cor'			=> array('color', 'colour'),
			'booleano'		=> array('bool', 'boolean'),
			'data'			=> array('date'),
			'decimal'		=> array('float', 'double'),
			'cep'			=> array('CEP'),
			'cpf'			=> array('CPF')
		),
		'padrao'		=> array('default'),		 		
		'unico'			=> array('unic'),		
		'requerido'		=> array('obrigatorio', 'required'),
		'normaliza'	    => array('normalize', 'normalizado', 'normalizar'),
		'validacao'		=> array('validation'),
		'formata_set'	=> array('set_format'),
		'formata_get'	=> array('get_format')
	);
	
		
	function __autoload($class_name) {
		if(file_exists($class_name . '.php')) {
			require_once $class_name . '.php';
		} elseif(file_exists('../utils/'. $class_name . '.php')) {
			require_once '../utils/'. $class_name . '.php';
		} else {
			require_once '../'.$class_name . '.php';
		}
	}

	public function __construct($dbname, $tabela) {
		$this->dbname		= $dbname;
		$this->tabela		= $tabela;
		$this->transacoes	= array();
		$this->database		= new database($this->dbname);
	}
	
	/*
	 * Esta função traduz o array $campos, baseado nos valores do array $traducoes
	 */
	private function traduzCampos() {
		
		$campos = $this->campos;
		$campos_traduzidos = array();
		
		$traducoes_metadados = $this->traducoes;
		$traducoes_tipos = $traducoes_metadados['tipos'];
		
		unset($traducoes_metadados['tipos']);
		
		foreach($campos as $campo => $metadados) {			
			foreach($metadados as $metadado => $valor) {
				$metadado_traduzido = $this->traduzMetadado($metadado, $traducoes_metadados);
				
				if($metadado_traduzido == 'tipo') {
					$campos_traduzidos[$campo][$metadado_traduzido] = $this->traduzMetadado($valor, $traducoes_tipos);
				} else {
					$campos_traduzidos[$campo][$metadado_traduzido] = $valor;
				}
			}
		}
		
		return $campos_traduzidos;
	}
	
	public function getSchema() {
		return $this->schema;
	}	
	
	public function getTabela() {
		return $this->tabela;
	}
	
	/*
	 * Esta função é usada apenas na função 'traduzCampos()',
	 * ela recebe um metadado e retorna a sua tradução (o nome do metadado conhecido pelo Business)
	 */
	private function traduzMetadado($metadado, $traducoes_metadados) {
		
		foreach($traducoes_metadados as $chave => $traducoes) {
			if($metadado == $chave || in_array($metadado, $traducoes)) {
				return $chave;
			}
		}
		
		return null;
	}
	
    /**
	* Retorna os ids dos inserts na tabela passada, inseridos na ultima transação
		* @param String $tabela
		* @return Array com os ids
	*/		
	public function getIdsInseridos($tabela = nul) {
		if(empty($tabela)) {
			$tabela = $this->tabela;
		}
		
		return transacoes::getIdsInseridos($tabela);		
	}

    /**
	* Retorna o id do ultimo insert realizado na tabela passada
		* @param String $tabela
		* @return Int - ultimo id inserido
	*/
	public function getUltimoIdInserido($tabela = null) {
		if(empty($tabela)) {
			$tabela = $this->tabela;
		}		
		
		return transacoes::getUltimoIdInserido($tabela);
	}	
	
	function getCamposTraduzido() {
		if($this->campos_traduzido === null) {
			$this->campos_traduzido = $this->traduzCampos();
		}
		
		return $this->campos_traduzido;
	}	
		
	function getCampos() {
		return $this->campos;
	}

    /**
	* Retorna o id do ultimo insert realizado na tabela passada
		* @param String $campo
		* @return Array - array com os metadados traduzidos do campo passado
	*/	
	function getCampoMetadados($campo) {
		
		$campos_traduzido = $this->getCamposTraduzido();
		if(isset($campos_traduzido[$campo])) {
			return $campos_traduzido[$campo];
		} else {
			return false;
		}
	}
	
	function getCampoTipo($campo) {
		$metadados = $this->getCampoMetadados($campo);
		return isset($metadados['tipo']) ? $metadados['tipo'] : null;
	}
	
	/** 
	 * Retorna os campos especificados, com base nos parametros passados.
	 * Os valores são inseridos pela função 'bindValue'.
		* @param Array $campos - Vetor com o nome dos campos desejados.
		* @param Array $parametro - Vetor com o nome dos parâmetros da busca.
	    * @param Array $dados - Vetor com os valores e classes de cada campo.
		* @return Matriz/false Matriz com result set ou false em caso de erro.
	 */	
	function get($campos_str, $parametros, $dados) {
		$valores = array();
		
		$traducoes_metadados = $this->traducoes;
		$traducoes_tipos = $traducoes_metadados['tipos'];
		
		foreach($dados as $campo => $valor) {
	
			if(is_array($valor)) {
				$tipo  = $this->traduzMetadado($valor['tipo'], $traducoes_tipos);
				$valor = $valor['valor'];
			} else {
				$tipo = $this->getCampoTipo($campo);
			}
			
			$valores[] = array('campo' => $campo, 'valor' => $valor, 'tipo' => $tipo);
		}
		
		return $this->database->get($this->tabela, $campos_str, $parametros, $valores);
	}
	
	/** 
	 * Retorna o total de registros, com base nos parametros passados.
	 * Feito para agilizar a performance das primeiras consultas das paginações.
	 * @param Array $parametro - Vetor com o nome dos parâmetros da busca.
	 * @param Array $valores - Vetor com os valores e classes de cada campo.
	 * @return total ou false em caso de erro.
	 */
	function getTotal($parametros='', $dados=array()) {
		$valores = array();
		
		$traducoes_metadados = $this->traducoes;
		$traducoes_tipos = $traducoes_metadados['tipos'];
		
		foreach($dados as $campo => $valor) {
	
			if(is_array($valor)) {
				$tipo  = $this->traduzMetadado($valor['tipo'], $traducoes_tipos);
				$valor = $valor['valor'];
			} else {
				$tipo = $this->getCampoTipo($campo);
			}
			
			$valores[] = array('campo' => $campo, 'valor' => $valor, 'tipo' => $tipo);
		}
		
		return $this->database->get($this->tabela, 'COUNT(*) AS total', $parametros, $valores);
	}
	
	/**
	 * Atualiza um só campo.
	 * Utilizado no método mágico do abstract business quando o método de chamada for set.
	 * Não foi utilizado o método update abaixo pois o mesmo às vezes é sobrescrito.
	 */
	function setCampo($parametro, $id) {
		return $this->database->update($parametro, $this->tabela, $id);
	}
	
	/** Formata os dados e insere no array $this->transacoes
		* @param String $acao
		* @param Array $dados
		* @param String $schema
		* @param String $tabela
		* @param Array $campos
	 */
	private function setInTransacoes($acao, $dados, $parametro = null, $parametro_valores = null, $schema = null, $tabela = null, $campos = null) {
		
		if($schema === null) {
			$schema = $this->schema;
		}
		
		if($tabela === null) {
			$tabela = $this->tabela;
		}
		
		if($campos === null) {
			$campos = $this->campos;
		}
		
		if(!empty($parametro_valores)) {
			$traducoes_metadados = $this->traducoes;
			$traducoes_tipos = $traducoes_metadados['tipos'];
	
			$parametro_valores_formatado = array();
			foreach($parametro_valores as $campo => $valor) {

				if(is_array($valor)) {
					$tipo = $this->traduzMetadado($valor['tipo'], $traducoes_tipos);
					$valor = $valor['valor'];
				} else {
					$tipo = $this->getCampoTipo($campo);
				}
				
				$parametro_valores_formatado[$campo] = array('valor' => $valor, 'tipo' => $tipo);
			}
			
			$parametro_valores = $parametro_valores_formatado;
		}
		
		transacoes::set($acao, $dados, $parametro, $parametro_valores, $schema, $tabela, $campos);
	}
	
	public function setIntransacoesInsert($dados, $schema = null, $tabela = null, $campos = null) {
		$this->setInTransacoes('INSERT', $dados, null, null, $schema, $tabela, $campos);
	}
	
	public function setInTransacoesUpdate($dados, $id, $schema = null, $tabela = null, $campos = null) {

		$parametro = 'WHERE id = :id';
		$array_valores['id'] = $id;
		
		$this->setInTransacoes('UPDATE', $dados, $parametro, $array_valores, $schema, $tabela, $campos);
	}
	
	public function setInTransacoesDeleteByCampo($campo, $valor, $schema = null, $tabela = null, $campos = null) {
		$this->setInTransacoes('DELETE', array($campo => $valor), null, null, $schema, $tabela, $campos);		
	}	
	
	public function setInTransacoesUpdateByParameter($dados, $parametro, $parametro_valores, $schema = null, $tabela = null, $campos = null) {
		$this->setIntransacoes('UPDATE', $dados, $parametro, $parametro_valores, $schema, $tabela, $campos);
	}
	
	public function setInTransacoesDelete($id, $schema = null, $tabela = null, $campos = null) {
		$this->setInTransacoes('DELETE', array('id' => $id), null, null, $schema, $tabela, $campos);
	}	
	
	public function commit() {
		return $this->database->commit();
	}
	
	/** Retorna o id do próximo elemento a ser inserido na tabela.
	* @return Inteiro $id
	*/
	function getNextid() {
		return $this->database->getAutoincrement($this->dbname, $this->tabela);
	}

	/** Insere dados em uma tabela.
		* @param Array $dados
		* @param Boolean $commit - flag que indica se a transação será executada imediatamente ou não
		* @return Boolean True ou uma string com a mensagem de erro
	 */		
	public function set($dados, $commit) {
		
		$this->setInTransacoesInsert($dados);
		
		if($commit) {
			return $this->database->commit();
		} 
		
		return true;
	}
	
	public function updateByParameter($dados, $parametro, $parametro_valores, $commit = true) {
		
		$this->setInTransacoesUpdateByParameter($dados, $parametro, $parametro_valores);
		
		if($commit) {
			return $this->database->commit();
		} 
		
		return true;		
	}

	/** Atualiza dados numa linha da tabela.
		* @param Array $dados
		* @param Inteiro $id - identificador da tupla a ser excluída.
		* @param Boolean $commit - flag que indica se a transação será executada imediatamente ou não
		* @return Boolean True ou uma string com a mensagem de erro
	 */	
	public function update($dados, $id, $commit = true) {
		
		$this->setInTransacoesUpdate($dados, $id);
		
		if($commit) {
			return $this->database->commit();
		} 
		
		return true;
	}

	public function deleteByCampo($campo, $valor, $commit = true) {
		
		if(empty($campo)) {
			return "Não foi possível realizar a deleção!<br> Campo não informado!";
		}
		elseif(empty($valor)) {
			return "Não foi possível realizar a deleção!<br> Campo '$campo' não informado!";
		}
		
		$this->setInTransacoesDeleteByCampo($campo, $valor);

		if($commit) {
			return $this->database->commit();
		}
		
		return true;		
	}
	
	/** Exclui linha da tabela.
		* @param Inteiro $id - identificador da objeto tupla a ser excluído.
		* @param Boolean $commit - flag que indica se a transação será executada imediatamente ou não
		* @return Boolean True ou uma string com a mensagem de erro
	 */
	public function delete($id, $commit = true) {

		if(empty($id)) {
			return 'Não foi possível realizar a deleção!<br> Campo \'id\' não informado!';
		}
		$this->setInTransacoesDelete($id);

		if($commit) {
			return $this->database->commit();
		}
		
		return true;
	}
	
	/** Retorna todas as consultas adicionadas através do método "addConsulta".
    *  O método funciona apenas no ambiente de desenvolvimento, retornando um array
    *  vazio caso chamado a partir de outros ambientes.
	* @return Array contendo todas as consultas SQL
	*/
	function getTransactionsForDebug(){
		return $this->database->getTransactionsForDebug();
	}
}