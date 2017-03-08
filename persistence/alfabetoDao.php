<?php
class alfabetoDao extends abstractDao {

	protected $campos = array(
		'fonte' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'caractere' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'coordenada_x' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'coordenada_y' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'largura' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'altura' => array('tipo' => 'inteiro', 'obrigatorio' => true)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'alfabetos');
	}
}