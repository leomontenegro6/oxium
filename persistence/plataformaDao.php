<?php
class usuarioDao extends abstractDao {

	protected $campos = array(
		'nome' => array('tipo' => 'texto', 'obrigatorio' => true),
		'sigla' => array('tipo' => 'texto', 'obrigatorio' => true, 'unico'=>true),
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'plataformas');
	}
}