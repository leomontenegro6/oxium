<?php
require_once("cabecalho.php");
require_once("menu.php");

$jogo = new jogo();

if(isset($_POST['acao'])){
	if ($_POST['acao'] == "cadastrar"){
		$retorno = $jogo->set($_POST);
		if($retorno === true){
			modal::retornar('Jogo cadastrado com sucesso!', 'jogo_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'jogo_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "editar"){
		$retorno = $jogo->update($_POST, $_POST['id']);
		if($retorno === true){
			modal::retornar('Jogo editado com sucesso!', 'jogo_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'jogo_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "excluir"){
		$retorno = $jogo->delete($_POST['id']);
		if($retorno === true){
			modal::retornar('Jogo excluído com sucesso!', 'jogo_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'jogo_lista.php', 'erro', $ajax);
		}
	}
}