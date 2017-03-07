<?php
error_reporting(~E_STRICT);

abstract class abstractBusiness {
		
	protected $dao;
	protected $dadosSet = array();

	/** Função que realiza o auto carregamento da classe
     * @param String $class_name Nome da classe atual
     */
	function __autoload($class_name) {
        if(file_exists($class_name . '.php')) {
            require_once $class_name . '.php';
        }elseif(file_exists('../utils/'. $class_name . '.php')) {
            require_once '../utils/'. $class_name . '.php';
        }else{
            require_once '../'.$class_name . '.php';
        }
    }
	
	/** Construtor da classe*/
	public function __construct($classe = null) {
		
		if(empty($classe)) {
			$classe = get_class($this);
		}
		$classeDao = $classe . 'Dao';
		$this->dao = new $classeDao();
    }
	
	/** Função usada para criação de métodos mágicos
	 */
	public function __call($funcao, $parametros) {		
		if(isset($parametros) && !empty($parametros) && (count($parametros > 0))) {
			$metodo  = substr($funcao, 0, 3);
			$campo = strtolower(substr($funcao, 3));
			if($metodo == 'get'){
				$id = $parametros[0];
				$formatoTexto = (isset($parametros[1])) ? ($parametros[1]) : ('');
				$retorno = $this->dao->get($campo, 'WHERE  id = '.$id)->fetch(PDO::FETCH_ASSOC);
				if($retorno){
					if(is_string($retorno[$campo])) {
						if(empty($formatoTexto)) {
							$formatoTexto = 'u';
						}						
						if($formatoTexto == 'c') {
							return mensagens::capitaliza($retorno[$campo]);
						} elseif($formatoTexto == 'u') {
							return mensagens::upper($retorno[$campo]);
						} else {
							return $retorno[$campo];
						}
					} else {
						return $retorno[$campo];
					}
				} else {
					return '';
				}
			} elseif(($metodo == 'set') && (count($parametros) > 1)) {
				$valor = $parametros[0];
				$id = $parametros[1];
				
				$retorno = $this->update(array($campo => $valor), $id);
				
				if ($retorno === true) {
					return true;
				} else {
					return 'Erro ao inserir! ' . $retorno;
				}
			} else {
				throw new Exception('Erro de Sintaxe: O método "' . $funcao . '" não existe ou os parâmetros não foram informados!');
			}
		} else {
			throw new Exception('Erro de Sintaxe: Parâmetros inválidos ou não informados!');
		}
	}
	
	/** Retorna todos os campos da tabela.
     * @return Matriz Result set.
     */
	public function getAll() {
        return $this->dao->get('','')->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Retorna linhas da tabela de acordo com os parâmetros especificados.
     * @param Array $parametro Parâmetros da busca.
     * @return Matriz Result set.
     */
	public function getByParameter($parametro, $dados = array()) {
        return $this->dao->get('', $parametro, $dados)->fetchAll(PDO::FETCH_ASSOC);
    }
	
    /** Retorna campos da tabela de acordo com os campos e parâmetros
     * especificados, fazendo uso de prepared statements.
     * @param Array $campos Campos desejados no retorno.
     * @param Array $parametro Parâmetros da busca.
	 * @param Array $dados com os valores e informações dos campos.
     * @return Matriz Result set.
     */
	public function getFieldsByParameter($campos, $parametro, $dados = array()) {
        return $this->dao->get($campos, $parametro, $dados)->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Retorna linhas da tabela de acordo com os parâmetros especificados.
     * @param Array $parametro Parâmetros da busca.
     * @return Matriz Result set.
     */	
	public function get($id) {
		$dados = array('id' => $id);
		
		return $this->dao->get('', 'WHERE id = :id', $dados)->fetch(PDO::FETCH_ASSOC);
	}

	/** Retorna o total de registros, com base nos parametros passados.
	 * Feito para agilizar a performance das primeiras consultas das paginações.
	 * Declarada no abstractDao.
	 * @param Array $parametro - Vetor com o nome dos parâmetros da busca.
	 * @param Array $valores - Vetor com os valores e classes de cada campo.
	 * @return total ou false em caso de erro.
	 */
	function getTotal($parametros, $valores) {
		$total_row = $this->dao->getTotal($parametros, $valores)->fetch(PDO::FETCH_ASSOC);
		return $total_row['total'];
	}

	public function getUltimoIdInserido() {
		return $this->dao->getUltimoIdInserido();
	}
	
    /**
	* Insere registros na tabela.
	* @param Array $post - Vetor de parâmetros para inserção.
	* @param Boolean $commit - Define se a consulta será imediatamente executada, ou se esta fará parte de uma transação.
	* @return Boolean True ou uma string com a mensagem de erro
	*/
	public function set($post, $commit = true) {
		
		$campos = $this->dao->getCamposTraduzido();
		$dados  = array();
		
		foreach($campos as $campo => $metadados) {								// Percorre o array 'campos'
			$valor = isset($post[$campo]) ? $post[$campo] : null;
			
			$is_currval = validacoesBusiness::currval($valor, $metadados['tipo']);
			if($is_currval) {
				$validado = true;
			} else {
				if(empty($valor)) {
					if(isset($metadados['padrao'])) {
						$valor = $metadados['padrao'];
					}
				}
				
				$validado = $this->validaCampo($campo, $valor, $post);			// Valida o valor enviado
			}			
			
			if($validado !== true) {
				transacoes::limpar();
				return $validado;
			}
			
			$dados[$campo] = ($is_currval) ? $valor : $this->formataCampoSet($campo, $valor);
		}
		
		array_push($this->dadosSet, $dados);									// Insere os dados no array 'dadosSet'
		$dados_sets;

		if($commit) {															// Se o commit deve ser execultado nessa chamada do método
			$dados_sets = $this->dadosSet;										// Pega o array de dados
			if(count($dados_sets) == 1) {										// Verifica se a quantidade de arrays no 'dadosSet' é igual a um	
				$dados_sets = $dados_sets[0];									// Se verdadeiro, seleciona o primeiro array de dados
			}		
			$this->beforeInsert($dados_sets);									// Chama o 'beforeInsert' com o array de dados
		}
		
		$retorno = $this->dao->set($dados, $commit);
		
		if($retorno === true) {													// Verifica se o insert foi realizado com sucesso
			if(method_exists($this, 'afterInsert')) {							// Verifica se o commit foi realizado nessa chamada do método
				$id = $this->dao->getUltimoIdInserido();							
				$this->afterInsert($dados_sets, $id);	  					    // Se as duas condições acima forem satisfeitas chama o método 'afterInsert'
			}
		}
		return $retorno;		
	}
	
	private function validaParametrosUpdate($parametro, $parametro_valores) {

		if(!is_string($parametro) || !is_array($parametro_valores)) {
			return 'Parâmetros no formato incorreto!';
		}	
		
		if(empty($parametro) || empty($parametro_valores)) {
			return 'Os parâmetros para atualização não foram informados!';
		}	
		
		return true;
	}	
	
	public function updateByParameter($array_valores, $parametro, $parametro_valores, $commit = true) {
		
		$check_parametros_validos = $this->validaParametrosUpdate($parametro, $parametro_valores);
		
		if($check_parametros_validos !== true) {
			return $check_parametros_validos;
		}
		
		$campos = $this->dao->getCampos();
		$dados  = array();
		
		foreach($array_valores as $campo => $valor) {							// Percorre o array com os valores submetidos
			if(isset($campos[$campo])) {										// Verifica se a chave existe no array 'campo' do mapeamento
				
				$is_currval = validacoesBusiness::currval($valor, $this->dao->getCampoTipo($campo));
				if($is_currval) {
					$validado = true;
				} else {				
					$validado = $this->validaCampo($campo, $valor, $array_valores);		// Valida o valor enviado
				}
				
				if($validado !== true) {
					transacoes::limpar();
					return $validado;
				}
				
				$dados[$campo] = ($is_currval) ? $valor : $this->formataCampoSet($campo, $valor);			
			}
		}
		
		if(isset($parametro_valores['id']) && count($parametro_valores) == 1) {
			$this->beforeUpdate($parametro_valores['id'], $dados);
		} else {
			$parametros = array('parametro' => $parametro, 'parametros_valores' => $parametro_valores);
			$this->beforeUpdate($parametros, $dados);
		}
		
		$retorno = $this->dao->updateByParameter($dados, $parametro, $parametro_valores, $commit);
		
		if($retorno === true) {
			$this->afterUpdate($dados);
		}
		
		return $retorno;		
	}
	
	public function update($post, $id, $commit = true) {
		
		if(empty($id)) {
			return 'O registro que deve ser alterado não foi informado!';
		}
		
		$parametro = 'WHERE id = :id';
		$parametro_valores['id'] = $id;
		
		return $this->updateByParameter($post, $parametro, $parametro_valores, $commit);
	}
	
	/* Método chamando antes do método 'set()' executar o insert */
	public function beforeInsert($dados) {
		
	}
	
	/* Método chamando antes do método 'update()' executar o update */
	public function beforeUpdate($id, $dados) {
		
	}
	
	/* Método chamando após o método 'update' executar o update, caso tenha retornado sucesso */
	public function afterUpdate($dados) {
		
	}
	
	/* Método chamando antes do método 'delete()' executar o delete */
	public function beforeDelete($id) {
		
	}
	
	/* Método chamando após o método 'delete' executar o delete, caso tenha retornado sucesso */
	public function afterDelete($id) {
		
	}
	
    /**
	* Valida valor de um campo
	* @param String $campo - nome do campo
	* @param $valor - valor que será validado
	* @return Boolean True ou uma string com a mensagem de erro
	*/	
	private function validaCampo($campo, $valor, $post) {
		
		$metadados = $this->dao->getCampoMetadados($campo);
		
		if($metadados === false) {
			return 'Campo Inexistente';
		}
		
		$checkObrigatorio = (isset($metadados['requerido']) && $metadados['requerido'] === true);
		
		$id = isset($post['id']) ? $post['id'] : null;
		
		if(isset($metadados['unico']) && $metadados['unico'] === true) {		 //Verifica se o valor deve ser único
			$valor_unico = $this->validaUnico($campo, $valor, $id);

			if($valor_unico !== true) {
				return $valor_unico;
			}	
		}

		if(!isset($metadados['tipo'])) {										 //Verifica se o tipo informado existe no array de traduções
			return "O tipo dado '{$metadados['tipo']}' é desconhecido!";
		}
		
		$tipo = $metadados['tipo'];
		
		$funcao_validacao = $tipo;											     //Nome do método que valida o tipo de dado
	
		$valificacoesBusiness = new validacoesBusiness();
		if(!method_exists($valificacoesBusiness, $funcao_validacao)) {			 //Verifica se o método de validação existe
			return "O método '{$funcao_validacao}()' não existe";
		}
				
		$validado = validacoesBusiness::$funcao_validacao($campo, $valor, $checkObrigatorio); //Executa o método de validação

		if($validado !== true) {
			return $validado;
		}
		
		if(isset($metadados['validacao'])) {
			$funcao_validacao_customizada = $metadados['validacao'];
			
			if(method_exists($this, $funcao_validacao_customizada)) {
				return $this->$funcao_validacao_customizada($valor, $post);
			} else {
				if(method_exists($valificacoesBusiness, $funcao_validacao_customizada)) {
					return validacoesBusiness::$funcao_validacao_customizada($valor, $post);
				}
			}
		}
		
		return true;
	}
			
    /**
	* Atualiza registros na tabela.
	* @param String $campo - nome do campo
	* @param $valor - valor que será formatado
	* @param String $acao - ação em que o valor será utilizado ('Set', 'Get')
	* @return Valor formatado
	*/	
	private function formataCampo($campo, $valor, $acao) {
		
		$metadados = $this->dao->getCampoMetadados($campo);
		
		$metodo_formatacao = $metadados['tipo'];
		
		if($acao == 'Set') {
			
			if(isset($metadados['padrao'])) {
				if(empty($valor)) {
					return $metadados['padrao'];
				}
			}
			
			if($metodo_formatacao == 'texto') {	
				$normalizar = (isset($metadados['normaliza']) && $metadados['normaliza'] === true);
				
				if(is_string($valor) && ($normalizar === true)) {
					$valor = mensagens::upper($valor);
				}
			}
			
			if(isset($metadados['formata_set'])) {
				$metodo_formatacao = $metadados['formata_set'];
				return $this->$metodo_formatacao($valor);
			}
			
			$metodo_formatacao .= 'Set';
		} else {
			if(isset($metadados['formata_get'])) {
				$metodo_formatacao = $metadados['formata_get'];
				return $this->$metodo_formatacao($valor);
			}

			$metodo_formatacao .= 'Get';
		}
		
		$formatacoesBusiness = new formatacoesBusiness();
		if(method_exists($formatacoesBusiness, $metodo_formatacao)) {
			$valor = formatacoesBusiness::$metodo_formatacao($valor);
		}
		return $valor;		
	}
	
	/* Esta função é uma interface para facilitar o uso da função 'formataCampo' em inserts e updates */
	private function formataCampoSet($campo, $valor) {
		if($valor === null) {
			return 'null';
		}
		return $this->formataCampo($campo, $valor, 'Set');
	}

	/* Esta função é uma interface para facilitar o uso da função 'formataCampo' em selects	*/
	private function formataCampoGet($campo, $valor) {
		return $this->formataCampo($campo, $valor, 'Get');
	}

    /**
	* Valida um dado que deve ser valor único.
	* @param String $campo - nome do campo
	* @param $valor - valor que será formatado
	* @param Int $id da tupla em caso de update
	* @return Boolean True ou uma string com a mensagem de erro
	*/		
	protected function validaUnico($campo, $valor, $id) {
		
		$id = (int) $id;
		$valor_formatado = $this->formataCampoSet($campo, $valor);
		
		if($valor_formatado == '' || $valor_formatado == 'null') {
			return true;
		}
		
		$metadados = $this->dao->getCampoMetadados($campo);
				
		if(!isset($metadados['tipo'])) {
			return "O tipo de dado '{$metadados['tipo']}' é desconhecido!";
		}
		
		$tipo = $metadados['tipo'];
		
		$operador_atrib = '=';
		if($tipo == 'booleano') {
			$operador_atrib = 'IS';
		}
		elseif($tipo == 'texto') {
			$operador_atrib = 'ILIKE';
		}
		
		$retorno;
		$array_valor = array($campo => $valor);
		if(empty($id)) {
			$retorno = $this->getFieldsByParameter('id', "WHERE $campo $operador_atrib :$campo LIMIT 1", $array_valor);
		} else {
			$retorno = $this->getFieldsByParameter('id', "WHERE $campo $operador_atrib :$campo AND id != $id LIMIT 1", $array_valor);
		}
		
		$valor_unico = empty($retorno);
		
		if($valor_unico) {
			return true;
		} else {
			return "Já existe um registro com o valor '$valor'!";
		}
	}
	
	public function deleteByCampo($campo, $valor, $commit = true) {
		
		$array = array('campo' => $campo, 'valor' => $valor);
		$this->beforeDelete($array);
		
		if(empty($campo) || empty($valor)) {
			return 'Os dados informados para a deleção não foram informados!';
		}
		$retorno = $this->dao->deleteByCampo($campo, $valor, $commit);
		
		if($retorno === true) {
			$this->afterDelete($array);
		}
		
		return $retorno;
	}
	
	/** Exclui linha da tabela.
		* @param Inteiro $id - identificador da objeto tupla a ser excluído.
		* @param Boolean $commit - flag que indica se a transação será executada imediatamente ou não
		* @return Boolean True ou uma string com a mensagem de erro
	 */	
	public function delete($id, $commit = true) {
		$this->beforeDelete($id);
		
        $retorno = $this->dao->delete($id, $commit);
		
		if($retorno === true) {
			$this->afterDelete($id);
		}
		
		return $retorno;
    }
	
	public function commit($commit = true) {
		if($commit) {
			return $this->dao->commit();
		} else {
			return true;
		}
	}
	
	/** Retorna todas as consultas adicionadas através do método "addConsulta".
    *  O método funciona apenas no ambiente de desenvolvimento, retornando um array
    *  vazio caso chamado a partir de outros ambientes.
	* @return Array contendo todas as consultas SQL
	*/
	public function getTransactionsForDebug(){
		return $this->dao->getTransactionsForDebug();
	}
}