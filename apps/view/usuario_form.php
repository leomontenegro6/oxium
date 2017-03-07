<?php
$_GET['ajax'] = true;
require_once("cabecalho.php");

$usuario = new usuario();

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$usuario_row = $usuario->get($id);
	
	$nome = $usuario_row['nome'];
	$login = $usuario_row['login'];
} else {
	$acao = 'cadastrar';
	$id = $nome = $login = '';
}

$checkUsuarioAtual = ($id == $iduser);
?>
<form id="form_cadastro" name="form" class="form-horizontal" method="post" action="usuario_crud.php" onsubmit="return validaForm(this)" data-ajax="true" novalidate>
	<div class="caixa_modal panel panel-default">
		<div class="legenda panel-heading">
			<h3 class="panel-title"><?php echo mensagens::capitaliza($acao); ?> Usuário</h3>
		</div>
		<div class="panel-body form">

			<div class="form-group">
				<label for="nome" class="col-sm-3 col-sm-offset-1 control-label">Nome Completo*:</label>
				<div class="col-sm-6">
					<input type="text" id="nome" name="nome" class="form-control" required value="<?php echo $nome ?>" />
				</div>
			</div>
			<div class="form-group">
				<label for="login_usuario_form" class="col-sm-3 col-sm-offset-1 control-label"><i>Login</i>*:</label>
				<div class="col-sm-6">
					<input type="text" id="login_usuario_form" name="login" class="form-control" required value="<?php echo $login ?>" />
				</div>
			</div>
			<?php if($acao == 'cadastrar' || ($checkUsuarioAtual)){ ?>
				<div class="form-group">
					<label for="senha" class="col-sm-3 col-sm-offset-1 control-label">Senha*:</label>
					<div class="col-sm-5">
						<?php if($checkUsuarioAtual){ ?>
							<div class="input-group">
								<input type="password" id="senha" name="senha" class="form-control" value="******" disabled
									onfocus="exibeForcaSenha(this)" onkeyup="atualizaForcaSenha(this)" onblur="ocultaForcaSenha(this)" />
								<span class="input-group-btn">
									<button class="btn btn-default" type="button" title="Editar senha" onclick="destravarCampoSenha(this)">
										<i class='fa fa-unlock fa-lg'></i>
									</button>
								</span>
							</div>
						<?php } else { ?>
							<input type="password" id="senha" name="senha" class="form-control" required
								onfocus="exibeForcaSenha(this)" onkeyup="atualizaForcaSenha(this)" onblur="ocultaForcaSenha(this)" />
						<?php } ?>
						
						<input type="hidden" id="forca_senha" name="forca_senha" />
						<input type="hidden" id="entropia_senha" name="entropia_senha" />
					</div>
				</div>
			<?php } ?>

			<div class="aviso_obrigatorio">* Campos Obrigatórios</div>
		</div>
		<div class="panel-footer botoes">
			<input type="hidden" name="acao" value="<?php echo $acao ?>" />
			<input type="hidden" name="id" value="<?php echo $id ?>" />

			<button type="button" class="btn btn-default" onclick="limparCampos('form_cadastro')">
				<i class="fa fa-recycle fa-lg"></i>
				Limpar
			</button>
			<button type="submit" class="btn btn-primary">
				<i class="fa fa-save fa-lg"></i>
				Salvar
			</button>
		</div>
	</div>
</form>