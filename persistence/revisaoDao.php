<?php
class revisaoDao extends abstractDao {

	protected $campos = array(
		'usuario' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'dialogo' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'texto' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'data' => array('tipo' => 'data', 'padrao' => 'NOW()')
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'revisoes');
	}
}