<?php
class fonteDao extends abstractDao {

	protected $campos = array(
		'id' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'jogo' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'arquivo_configuracao' => array('tipo' => 'texto', 'normalizar'=>false),
		'arquivo_fonte' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'arquivo_fonte_transparente' => array('tipo' => 'texto', 'normalizar'=>false),
		'cor_chave' => array('tipo' => 'cor', 'obrigatorio' => true),
		'arquivo_dialogo' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'coordenada_x' => array('tipo' => 'inteiro', 'obrigatorio' => true, 'padrao'=>0),
		'coordenada_y' => array('tipo' => 'inteiro', 'obrigatorio' => true, 'padrao'=>0),
		'data_modificacao_fonte' => array('tipo' => 'data', 'padrao'=>'NOW()'),
		'data_modificacao_dialogo' => array('tipo' => 'data', 'padrao'=>'NOW()')
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'fontes');
	}
}