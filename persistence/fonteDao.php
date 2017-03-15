<?php
class fonteDao extends abstractDao {

	protected $campos = array(
		'jogo' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'arquivo_fonte' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'arquivo_fonte_transparente' => array('tipo' => 'texto', 'normalizar'=>false),
		'arquivo_dialogo' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'cor_chave' => array('tipo' => 'cor', 'obrigatorio' => true)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'fontes');
	}
}