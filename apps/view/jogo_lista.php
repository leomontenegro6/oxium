<?php
require_once("cabecalho.php");
require_once("menu.php");

$plataforma = new plataforma();

$nome_lista = (isset($_GET['nome_lista'])) ? ($_GET['nome_lista']) : ('');
$plataforma_lista = (isset($_GET['plataforma_lista'])) ? ($_GET['plataforma_lista']) : ('all');

$plataforma_rs = $plataforma->getAll();
?>
<div id="corpo" class="container-fluid">
	<form id="form" name="form" class="form-horizontal" onsubmit="return tabela.pesquisar(this, 'tabela')">
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title">Listar Jogos</h3>
			</div>
			<div class="panel-body form">
				
				<div class="form-group">
					<label for="nome_lista" class="col-sm-2 col-sm-offset-2 control-label">Nome:</label>
					<div class="col-sm-6">
						<input type="text" id="nome_lista" name="nome_lista" class="form-control" value="<?php echo $nome_lista ?>" />
					</div>
				</div>
				<div class="form-group">
					<label for="plataforma_lista" class="col-sm-2 col-sm-offset-2 control-label">Plataforma:</label>
					<div class="col-sm-6">
						<select id="plataforma_lista" name="plataforma_lista" class="form-control select">
							<option value="all">Todas</option>
							<?php foreach($plataforma_rs as $plataforma_row){
								if($plataforma_row['id'] == $plataforma_lista){
									$selected = 'selected';
								} else {
									$selected = '';
								}
								?>
								<option value="<?php echo $plataforma_row['id'] ?>" <?php echo $selected ?>><?php echo $plataforma_row['descricao'] ?></option>
							<?php } ?>
						</select>
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
	tabela::instanciar('jogo_tabela.php', "nome_lista=$nome_lista&plataforma_lista=$plataforma_lista", false, 'tabela');
	?>
</div>
<?php include('rodape.php');?>