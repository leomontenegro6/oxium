<?php
class backgroundDao extends abstractDao {

	protected $campos = array(
		'fonte' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'arquivo' => array('tipo' => 'texto', 'normalizar'=>false),
		'coordenada_x' => array('tipo' => 'inteiro', 'obrigatorio' => true, 'padrao'=>0),
		'coordenada_y' => array('tipo' => 'inteiro', 'obrigatorio' => true, 'padrao'=>0)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'backgrounds');
	}
}