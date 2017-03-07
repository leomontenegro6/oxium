<?php
session_start();
require_once '../../utils/autoload.php';

$ambiente = mensagens::getAmbienteDesenvolvimento();
if($ambiente == 'D' || $ambiente == 'H'){
	depuracao::mostrarConsultasSessao();
	depuracao::limparConsultasSessao();
}
?>