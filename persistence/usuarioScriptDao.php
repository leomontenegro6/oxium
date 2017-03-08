<?php
class usuarioScriptDao extends abstractDao {

	protected $campos = array(
		'usuario' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'script' => array('tipo' => 'inteiro', 'obrigatorio' => true)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'usuarios_scripts');
	}
}