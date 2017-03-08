<?php
class scriptDao extends abstractDao {

	protected $campos = array(
		'nome' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'jogo' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'arquivo_original' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'scripts');
	}
}