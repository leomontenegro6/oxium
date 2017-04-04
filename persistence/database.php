<?php
class database {

    private $pdo;
    private $dsn;
    private $username;
    private $password;
    private $dbname;
	private $showError = 't';
	private $timeout = 2;
	
    public function __construct($dbname='oxium'){
		if(file_exists('dbconfig.php')){
			include_once('dbconfig.php');
		}
		if(!isset($dbconfig)){
			$dbconfig = array(
				'dsn'=>'mysql:host=localhost;port=3306;dbname=' . $dbname,
				'username'=>'root',
				'password'=>'123456'
			);
		}
		
		$this->dbname = $dbname;
		$this->dsn = $dbconfig['dsn'];
		$this->username = $dbconfig['username'];
		$this->password = $dbconfig['password'];
        
        $this->options = array(
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_CASE => PDO::CASE_LOWER,
            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8',
            PDO::ATTR_TIMEOUT=>$this->timeout,
            PDO::MYSQL_ATTR_DIRECT_QUERY=>TRUE
		);
    }

	private function connect(){
		try {
			$this->pdo = new PDO($this->dsn, $this->username, $this->password, $this->options);
			//$this->pdo->query('set search_path='. $this->dbname);
		} catch (PDOException $e) {
			$this->trataException($e);
		}
    }

    private function disconnect() {
		unset($this->pdo);
		if(isset($this->pdo)){
			return false;
		}else{
			return true;
		}
    }

	/** Retorna os campos especificados, com base nos parametros passados.
	 * Os valores são inseridos pela função 'bindValue'.
		* @param String $tabela
		* @param String $campos
		* @param String $parametros
		* @param Array  $valores
		* @return Matriz/false Matriz com result set ou false em caso de erro.
	 */
	public function get($tabela, $campos, $parametros, $valores) {
		
		if(empty($campos)) {
			$campos = '*';
		}
		try {
			$sql = "SELECT $campos FROM $tabela $parametros";

			$this->connect();

			$stmt = $this->pdo->prepare($sql);

			foreach($valores as $valor) {
				$campo = $valor['campo'];
				$val   = $valor['valor'];
				$tipo  = $valor['tipo'];
				
				$stmt->bindValue(":$campo",	$val, $this->getPdoType($tipo, $val));
			}

			$stmt->execute();

			$this->disconnect();

			return $stmt;
			
		} catch (PDOException $e) {
			$this->trataException($e);
			$this->disconnect();
			
			return false;
		}
	}
	
	/** 
	 * Executa prepareStatment para inserts.
		* @param Array $dados
		* @param String $dbname
	    * @param String $tabela
	 */		
	private function preparaStatementInsert($dados, $dbname, $tabela) {
		
		$campos_str = $valores_str = '';
		
		foreach($dados as $campo => $informacoes) {
			$campos_str  .= ($campos_str  == '') ? $campo	 : ", $campo";
			
			if($informacoes['currval']) {
				$valores_str .= ($valores_str == '') ? $informacoes['valor'] : ", {$informacoes['valor']}";
				unset($dados[$campo]);
			} else {
				$valores_str .= ($valores_str == '') ? ":$campo" : ", :$campo";
			}
		}

		$sql = "INSERT INTO $dbname.$tabela ($campos_str) VALUES ($valores_str)";

		$stmt = $this->pdo->prepare($sql);

		foreach($dados as $campo => $informacoes) {
			$tipo  = $informacoes['tipo'];
			$valor = $informacoes['valor'];

			$stmt->bindValue(":$campo", $valor, $this->getPdoType($tipo, $valor));
		}

		$retorno = $stmt->execute();
		
		$id = $this->pdo->lastInsertId("{$tabela}_id_seq");
		
		transacoes::setUltimoIdInserido($tabela, $id);
		
		return $retorno;
	}
	
	private function preparaParametro($parametro, $parametro_valores) {
		
		$parametro_com_campos_formatados = array();
		
		foreach($parametro_valores as $campo => $informacoes) {
			
			$__campo__pr = "__{$campo}__pr";
			$parametro = str_replace(":$campo", ":$__campo__pr", $parametro);
			
			$parametro_com_campos_formatados[$__campo__pr] = $informacoes;
		}
		
		$retorna = array('parametro' => $parametro, 'parametro_valores' => $parametro_com_campos_formatados);
		
		return $retorna;
	}
	
	private function adicionaValoresComBindValues(&$stmt, $valores_rs) {

		foreach ($valores_rs as $campo => $informacoes) {
			$tipo  = $informacoes['tipo'];
			$valor = $informacoes['valor'];
			
			$retorno = $stmt->bindValue(":$campo", $valor, $this->getPdoType($tipo, $valor));
		}		
	}
	
	private function verificaSeTemWhere($sql) {
		return (strripos($sql, ' where ') !== false);
	}
	
	/** 
	 * Executa prepareStatment para updates.
		* @param Array $dados
		* @param String $dbname
	    * @param String $tabela
	 */		
	private function preparaStatementUpdate($dados, $parametro, $parametro_valores, $dbname, $tabela) {
		
		$valores_str = '';
						
		foreach($dados as $campo => $informacoes) {
			if($informacoes['currval']) {
				$currval = $informacoes['valor'];
				$valores_str .= ($valores_str == '') ? "$campo = $currval" : ", $campo = $currval";
				unset($dados[$campo]);
			} else {
				$valores_str .= ($valores_str == '') ? "$campo = :$campo" : ", $campo = :$campo";
			}
		}
		
		$paramentros_formatados = $this->preparaParametro($parametro, $parametro_valores);
		
		$parametro			= $paramentros_formatados['parametro'];
		$parametro_valores  = $paramentros_formatados['parametro_valores'];		
				
		$sql = "UPDATE $dbname.$tabela SET $valores_str $parametro";
		
		$checkTemWhere = $this->verificaSeTemWhere($sql);
		
		if(!$checkTemWhere) {
			return 'Não é possível fazer atualização sem especificar quais registros serão alterados!';
		}
		
		$stmt = $this->pdo->prepare($sql);
		
		$this->adicionaValoresComBindValues($stmt, $parametro_valores);
		
		$this->adicionaValoresComBindValues($stmt, $dados);

		return $stmt->execute();
	}	

	/** 
	 * Executa prepareStatment para deletes.
		* @param Array $dados
		* @param String $dbname
	    * @param String $tabela
	 */		
	private function preparaStatementDelete($dados, $dbname, $tabela) {
		
		$campo = $dados['campo'];
		$valor = $dados['valor'];
		$tipo  = $dados['tipo'];
		
		if(empty($valor) || empty($campo)) {
			return false;
		}
		
		$comparador = ($tipo == 'booleano') ? 'IS' : '=';
		
		$sql = "DELETE FROM $dbname.$tabela WHERE $campo $comparador :$campo";
		
		$stmt = $this->pdo->prepare($sql);
		
		$stmt->bindValue(":$campo", $valor, $this->getPdoType($tipo, $valor));
		
		return $stmt->execute();		
	}
	
	public function preparaStatement($acao, $dados, $parametro, $parametro_valores, $dbname, $tabela) {
		if($acao == 'INSERT') {
			return $this->preparaStatementInsert($dados, $dbname, $tabela);
		}
		elseif($acao == 'UPDATE') {
			return $this->preparaStatementUpdate($dados, $parametro, $parametro_valores, $dbname, $tabela);
		}
		elseif($acao == 'DELETE') {
			return $this->preparaStatementDelete($dados, $dbname, $tabela);
		}	
		
		return false;
	}
	
	/** 
	 * Executa a transação com as ações contidas no array $transacao_rs.
		* @param Array $transacao_rs
		* @return Boolean True ou uma string com a mensagem de erro
	 */		
	public function commit() {
		
		$transacao_rs = transacoes::get();
		depuracao::limparConsultasSessao();
		
		try {
			$this->connect();

			$this->pdo->beginTransaction();
			
			transacoes::limparLastInsertIds();
			
			foreach ($transacao_rs as $transacao_row) {
				$dbname				= $transacao_row['dbname'];
				$tabela				= $transacao_row['tabela'];
				$acao				= $transacao_row['acao'];
				$dados				= $transacao_row['dados'];
				$parametro			= $transacao_row['parametro'];
				$parametro_valores	= $transacao_row['parametro_valores'];
								
				$retorno = $this->preparaStatement($acao, $dados, $parametro, $parametro_valores, $dbname, $tabela);
				
				if($retorno !== true) {
					transacoes::limpar();
					$this->pdo->rollBack();
					return 'Ocorreu um erro, nenhuma informação foi salva! <br>' . $retorno;
				}
			}
			
			$retorno = $this->pdo->commit();
			
			if(!$retorno) {
				$this->pdo->rollBack();
			}
			
			$this->disconnect();
			
			transacoes::limpar();
			
			if(!$retorno) {
				$this->pdo->rollBack();
				return 'Ocorreu um erro, nenhuma informação foi salva!';
			}			
		} catch(PDOException $e) {
			$this->pdo->rollBack();
			
			$this->trataException($e);		
			$this->disconnect();
			
			transacoes::limpar();
			
			return $this->getErro($e->getCode());			
		}

		return true;
	}
	
	/** Função que retorna o parâmetro correto do PDO de acordo com o tipo de dado passado
		* @param String com o tipo de passado
		* @param valor
		* @return Parâmetro do PDO referente ao tipo de dado passado.
	 */	
	private function getPdoType($tipo, $valor) {
		
		if($valor === null || $valor === 'null' || $valor === 'NULL') {
			return PDO::PARAM_NULL;
		}		
		if($tipo === 'booleano') {
			return PDO::PARAM_BOOL;
		}
		elseif($tipo === 'texto' || $tipo === 'data' || $tipo === 'cor') {
			return PDO::PARAM_STR;
		}
		
		return PDO::PARAM_INT;
	}
	
	public function getAutoincrement($dbname, $tabela){
		$this->connect();
		try {
			$query = $this->pdo->query("SELECT AUTO_INCREMENT AS id
				FROM INFORMATION_SCHEMA.TABLES
				WHERE TABLE_SCHEMA = '$dbname' AND TABLE_NAME = '$tabela'");
			$this->disconnect();
			$rs = $query->fetchAll();
			if (count($rs) == 0) {
				return FALSE;
			}
			else {
				return $rs[0]['id'];
			}
		} catch (PDOException $e) {
			$this->trataException($e);
			$this->disconnect();
			return false;
		}
    }

	public function set($parametro, $tabela) {
		$this->connect();
		$select = 'INSERT INTO ' . $tabela . ' ' . $parametro;
		try {
			depuracao::limparConsultasSessao();
			depuracao::salvarConsultaSessao($select);
			
			$stmt = $this->pdo->exec($select);
			if($stmt == 1){
				$this->disconnect();
				return true;
			} else {
				$this->disconnect();
				return false;
			}
			$this->disconnect();
		} catch (PDOException $e) {
			$this->trataException($e);			
			$this->disconnect();
			return $this->getErro($e->getCode());
		}
	}

    public function update($parametro, $tabela, $id) {
		$this->connect();
		try {
			$select = 'UPDATE ' . $tabela . ' SET ' . $parametro . ' WHERE id = '. $id;
			$stmt = $this->pdo->exec($select);
			
			depuracao::limparConsultasSessao();
			depuracao::salvarConsultaSessao($select);
			
			if($stmt > 0) {
				$this->disconnect();
				return true;
			} else {
				$this->disconnect();
				return false;
			}
		} catch (PDOException $e) {
			$this->trataException($e);
			$this->disconnect();
			return $this->getErro($e->getCode());
		}
    }

	public function delete($tabela,$id) {
		$this->connect();
		$select = 'DELETE FROM ' . $tabela . ' WHERE id =' . $id;
		
		depuracao::limparConsultasSessao();
		depuracao::salvarConsultaSessao($select);
		
		try {
			$stmt = $this->pdo->exec($select);
			if($stmt>0){
				$this->disconnect();
				return true;
			}else{
				$this->disconnect();
				return false;
			}
		} catch (PDOException $e) {
			$this->trataException($e);
			$this->disconnect();
			return $this->getErro($e->getCode());
		}
		$this->disconnect();
	}
	
	private function getErro($erro = 0) {
		$ambiente = mensagens::getAmbienteDesenvolvimento();
		
		if ($erro == 23505) {
			return 'Já existe um registro cadastrado com os dados informados!';
		} elseif ($erro == 23503) {
			return 'Esse registro está sendo usado pelo sistema e não pode ser excluído!';
		} elseif ($erro == 23502) {
			return 'Valores nulos não são permitidos!';
		} elseif ($erro == 22007) {
			return 'Formato de data inválido!';
		} elseif ($erro == 42601) {
			return 'Formato do dado incorreto!';
		} elseif ($ambiente == 'D') { 
			if ($erro == 42501) {
				return '(DEV) Permissão negada!';			
			} elseif ($erro == 42703) {
				return '(DEV) Campo de tabela desconhecido ou incorreto!';			
			} elseif ($erro == 22021) {
				return '(DEV) Caractere inválido!';			
			} elseif ($erro == 55000) {
				return '(DEV) Sequencia inválida!';
			} else {
				return 'Erro desconhecido! (' . $erro . ')';
			}
		} else {			
			return 'Erro desconhecido! (' . $erro . ')';
		}
	}
	
	private function trataException($e) {
		if($this->showError == 't'){
			echo 'Erro: '. $e->getMessage() . '<br />';
			//echo "***".$e->getCode()."***";
		}
	}
	
	public function getTransactionsForDebug(){
		$ambiente = mensagens::getAmbienteDesenvolvimento();
		if ($ambiente == 'D') {
			return transacoes::get();
		} else {
			return array();
		}
	}
}