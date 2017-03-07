<?php
include('cabecalho_externo.php');

$expirou = (isset($_GET['expirou']) && $_GET['expirou'] == '1');
?>
<div class="container">
	<br class="hidden-xs" />
	<br class="hidden-xs" />
	<br class="hidden-xs" />
	<?php if($expirou){ ?>
		<div class="alert alert-danger alert-dismissible" role="alert">
			<button type="button" class="close" data-dismiss="alert" aria-label="Fechar"><span aria-hidden="true">&times;</span></button>
			Sua sessão expirou!
		</div>
	<?php } ?>
	<div class="row">
		<div class="col-md-3"></div>
		<div class="col-md-6 col-xs-12">
			<form name="form" id="form" method="post" action="login.php" onsubmit="return validaLogin(this)">
				<div class="panel panel-inverse">
					<div class="panel-heading">
						<h3 class="panel-title">
							<img src="../common/images/brand.png" width="32" />

							<span class="hidden-xs">
								&nbsp;Oxium Scriptsium v0.1
							</span>
							<span class="visible-xs-inline">
								Oxium v0.1
							</span>
						</h3>
					</div>
					<div class="panel-body">
						<div class="form-group">
							<div class="input-group">
								<div class="input-group-addon" title="Login">
									<i class="fa fa-user fa-lg"></i>
								</div>
								<input type="text" class="form-control" id="login" name="login" placeholder="Login" autofocus required />
							</div>
						</div>
						<div class="form-group">
							<div class="input-group">
								<div class="input-group-addon" title="Senha">
									<i class="fa fa-lock fa-lg"></i>
								</div>
								<input type="password" class="form-control" id="senha" name="senha" placeholder="Senha" required />
							</div>
						</div>
					</div>
					<div class="panel-footer">
						<button type="submit" class="btn btn-default">
							<i class="fa fa-sign-in fa-lg"></i>
							Logar
						</button>
					</div>
				</div>
			</form>
		</div>
		<div class="col-md-3"></div>
	</div>
</div>
<?php include('rodape_externo.php'); ?>