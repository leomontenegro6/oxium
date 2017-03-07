<?php
include('cabecalho_externo.php');

$usuario = new usuario();

/*
$configuracao = new configuracao();

$configuracao_row = $configuracao->get();
if(count($configuracao_row) > 0){
	// Rotina que remove arquivos temporários gerados pelo "fileUploader.js",
	// que se acumularam na pasta /tmp/. Esta rotina é chamada no primeiro acesso
	// do dia, e só é chamada novamente no dia seguinte.
	$data_hoje = date('Y-m-d');
	if($data_hoje != $configuracao_row['ultimo_acesso']){
		mensagens::removerArquivosTemporarios();
		$configuracao->updateUltimoAcesso($data_hoje);
	}
}
*/

session_start();

if(isset($_POST['login']) && isset($_POST['senha'])){
	$usuario_row = $usuario->getLogin($_POST['login'], $_POST['senha']);
	if($ajax === true){
		if(count($usuario_row) > 0){
			echo 'true';
		} else {
			echo 'false';
		}
		exit;
	}
} else {
	header("Location: logoff.php");
}

if($usuario_row != false){
	$_SESSION['iduser'] = $usuario_row['id'];
	$_SESSION['login'] = $usuario_row['login'];
	$_SESSION['nome'] = $usuario_row['nome'];
	
	setcookie('auth', $usuario_row['login']);
	session_regenerate_id();
	header("Location: inicio.php");
} else {
	modal::retornar('Usuário e/ou senha incorreta!', 'logoff.php', 'aviso');
}
?>