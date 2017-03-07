<?php
require_once("cabecalho.php");
require_once("menu.php");

$usuario = new usuario();

if(isset($_POST['acao'])){
	if ($_POST['acao'] == "cadastrar"){
		$retorno = $usuario->set($_POST);
		if($retorno === true){
			modal::retornar('Usuário cadastrado com sucesso!', 'usuario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'usuario_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "editar"){
		$retorno = $usuario->update($_POST, $_POST['id']);
		if($retorno === true){
			modal::retornar('Usuário editado com sucesso!', 'usuario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'usuario_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "excluir"){
		$retorno = $usuario->delete($_POST['id']);
		if($retorno === true){
			modal::retornar('Usuário excluído com sucesso!', 'usuario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'usuario_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "resetar_senha"){
		$retorno = $usuario->resetarSenha($_POST['id']);
		if($retorno === true){
			modal::retornar('Senha resetada com sucesso para 123456!', 'usuario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'usuario_lista.php', 'erro', $ajax);
		}
	}
}

?>