<?php
require_once("cabecalho.php");
require_once("menu.php");

$login_lista = (isset($_GET['login_lista'])) ? ($_GET['login_lista']) : ('');
?>
<div id="corpo" class="container-fluid">
	<form id="form" name="form" class="form-horizontal" onsubmit="return tabela.pesquisar(this, 'tabela')">
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title">Listar Usuários</h3>
			</div>
			<div class="panel-body form">
				
				<div class="form-group">
					<label for="login_lista" class="col-sm-2 col-sm-offset-2 control-label"><i>Login</i>:</label>
					<div class="col-sm-6">
						<input type="text" id="login_lista" name="login_lista" class="form-control" autofocus value="<?php echo $login_lista ?>" />
					</div>
				</div>
				
			</div>
			<div class="panel-footer botoes">
				<a href="inicio.php" class="btn btn-default">
					<i class="fa fa-arrow-left fa-lg"></i>
					Voltar
				</a>
				<button type="reset" class="btn btn-default">
					<i class="fa fa-recycle fa-lg"></i>
					Limpar
				</button>
				<button type="submit" class="btn btn-default">
					<i class="fa fa-search-plus fa-lg"></i>
					Pesquisar
				</button>
			</div>
		</div>
	</form>
	
	<?php
	// Tabela de listagem
	tabela::instanciar('usuario_tabela.php', "login_lista=$login_lista", false, 'tabela');
	?>
</div>
<?php include('rodape.php');?>