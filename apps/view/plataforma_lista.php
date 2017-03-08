<?php
require_once("cabecalho.php");
require_once("menu.php");

$nome_lista = (isset($_GET['nome_lista'])) ? ($_GET['nome_lista']) : ('');
?>
<div id="corpo" class="container-fluid">
	<form id="form" name="form" class="form-horizontal" onsubmit="return tabela.pesquisar(this, 'tabela')">
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title">Listar Plataformas</h3>
			</div>
			<div class="panel-body form">
				
				<div class="form-group">
					<label for="nome_lista" class="col-sm-2 col-sm-offset-2 control-label">Nome:</label>
					<div class="col-sm-6">
						<input type="text" id="nome_lista" name="nome_lista" class="form-control" value="<?php echo $nome_lista ?>" />
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
	tabela::instanciar('plataforma_tabela.php', "nome_lista=$nome_lista", false, 'tabela');
	?>
</div>
<?php include('rodape.php');?>