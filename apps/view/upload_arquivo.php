<?php
session_start();
if(isset($_SESSION['login'])){
	if(isset($_POST['name']) && isset($_POST['tamanho_limite'])){
		if(isset($_FILES[$_POST['name']])){
			$tamanho_arquivo_transferido = $_FILES[$_POST['name']]['size'];
			$tamanho_limite = $_POST['tamanho_limite'];

			if($tamanho_arquivo_transferido > 0){
				if($tamanho_arquivo_transferido <= $tamanho_limite || $tamanho_limite == 0){
					$origem_arquivo_transferido = $_FILES[$_POST['name']]['tmp_name'];
					$destino_arquivo_transferido = $_FILES[$_POST['name']]['tmp_name'] . '_oxium_tmp';
					if(move_uploaded_file($origem_arquivo_transferido, $destino_arquivo_transferido)){
						$nome_servidor = base64_encode($_FILES[$_POST['name']]['name']);
						$caminho_servidor = base64_encode($destino_arquivo_transferido);
						echo '[{"error": "0", "name": "'.$nome_servidor.'", "tmp_name": "'.$caminho_servidor.'", "size": "'.$tamanho_arquivo_transferido.'"}]';	
					} else {
						echo '[{"error": "1", "error_msg": "Não foi possível salvar arquivo no servidor!"}]';
					}
				} else {
					echo '[{"error": "1", "error_msg": "Tamanho do arquivo ultrapassa limite!"}]';
				}
			} else {
				echo '[{"error": "1", "error_msg": "Arquivo não pode ser nulo!"}]';
			}
		} else {
			echo '[{"error": "1", "error_msg": "Não foi possível enviar arquivo ao servidor!"}]';
		}
	} else {
		echo '[{"error": "1", "error_msg": "Não foi possível obter as informações do arquivo enviado!"}]';
	}
} else {
	echo '[{"error": "1", "error_msg": "Acesso negado!"}]';
}
?>