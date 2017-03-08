<?php
class backgroundDao extends abstractDao {

	protected $campos = array(
		'fonte' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'arquivo' => array('tipo' => 'texto', 'normalizar'=>false)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'backgrounds');
	}
}