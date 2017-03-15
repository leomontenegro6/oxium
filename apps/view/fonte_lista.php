<?php
require_once("cabecalho.php");
require_once("menu.php");

$jogo = new jogo();

$jogo_lista = (isset($_GET['jogo_lista'])) ? ($_GET['jogo_lista']) : ('all');

$jogo_rs = $jogo->getForSelect();
?>
<div id="corpo" class="container-fluid">
	<form id="form" name="form" class="form-horizontal" onsubmit="return validaForm(this)">
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title">Listar Fontes</h3>
			</div>
			<div class="panel-body form">
				
				<div class="form-group">
					<label for="jogo_lista" class="col-sm-2 col-sm-offset-2 control-label">Jogo:</label>
					<div class="col-sm-6">
						<select id="jogo_lista" name="jogo_lista" class="form-control select" autofocus>
							<option value="all">Todos</option>
							<?php foreach($jogo_rs as $jogo_row){
								if($jogo_row['id'] == $jogo_lista){
									$selected = 'selected';
								} else {
									$selected = '';
								}
								?>
								<option value="<?php echo $jogo_row['id'] ?>" <?php echo $selected ?>><?php echo $jogo_row['descricao'] ?></option>
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
	tabela::instanciar('fonte_tabela.php', "jogo_lista=$jogo_lista", false, 'tabela');
	?>
</div>
<?php include('rodape.php');?>