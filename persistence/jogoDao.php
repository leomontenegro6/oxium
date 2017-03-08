<?php
class jogoDao extends abstractDao {

	protected $campos = array(
		'nome' => array('tipo' => 'texto', 'obrigatorio' => true),
		'sigla' => array('tipo' => 'texto', 'obrigatorio' => true, 'unico'=>true),
		'icone' => array('tipo' => 'texto', 'normalizar'=>false),
		'plataforma' => array('tipo' => 'inteiro')
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'jogos');
	}
}