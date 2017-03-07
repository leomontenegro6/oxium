<?php
class usuarioDao extends abstractDao {

	protected $campos = array(
		'nome' => array('tipo' => 'texto', 'obrigatorio' => true),
		'login' => array('tipo' => 'texto', 'obrigatorio' => true),
		'senha' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'usuarios');
	}
}