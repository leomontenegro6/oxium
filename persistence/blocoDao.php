<?php
class blocoDao extends abstractDao {

	protected $campos = array(
		'script' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'pos_data' => array('tipo' => 'texto', 'normalizar'=>false),
		'ponteiros' => array('tipo' => 'texto', 'normalizar'=>false)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'blocos');
	}
}