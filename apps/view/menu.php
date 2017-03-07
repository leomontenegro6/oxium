<?php if($ajax === false){ ?>
	<body id="pagina">
		<?php // Precacheando gif do AjaxLoadingWheel para evitar que a tela de carregamento deixe de exibir a imagem por ter que carregá-la ?>
		<div class="precache">
			<img src="../common/images/processando_fundo.gif" />
		</div>
		
		<nav class="navbar navbar-default navbar-inverse navbar-fixed-top">
			<div class="container-fluid">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#dados-usuario" aria-expanded="false">
						<span class="sr-only">Ativar Navegação</span>
						<i class="fa fa-user fa-lg" style="color: #ddd"></i>
					</button>
					<a class="navbar-brand" href="#" style="padding: 0;">
						<img src="../common/images/brand.png" />
					</a>
					<p class="navbar-text">Oxium Scriptsium v0.1</p>
				</div>
				<div class="collapse navbar-collapse" id="dados-usuario">
					<p class="navbar-text navbar-right">Usuario: <br class="visible-xs" /><?php echo $login ?></p>
				</div>
			</div>
		</nav>
		
		<?php // Barra de menus ?>
		<nav id="barra_menus" class="navbar navbar-default"></nav>
		<script language="JavaScript" type="text/javascript">
			<!--
			menu.instanciar(
				[
					['<i class="fa fa-home fa-lg"></i>', 'Início', 'inicio.php', '_self',null],
					['<i class="fa fa-table fa-lg"></i>', 'Cadastros', '', '',null,
						['<i class="fa fa-desktop fa-lg"></i>', 'Plataforma', 'plataforma_lista.php', '_self',null],
						['<i class="fa fa-gamepad fa-lg"></i>', 'Jogos', 'jogo_lista.php', '_self',null],
						['<i class="fa fa-book fa-lg"></i>', 'Termos de Dicionário', 'termo_dicionario_lista.php', '_self',null]
					],
					['<i class="fa fa-gears fa-lg"></i>', 'Processos', '', '',null],
					['<i class="fa fa-wrench fa-lg"></i>', 'Configurações', '', '',null,
						['<i class="fa fa-users fa-lg"></i>', 'Usuários', 'usuario_lista.php', '_self',null]
					],
					['<i class="fa fa-sign-out fa-lg"></i>', 'Sair', 'logoff.php', '_self',null]
				]
			);
			-->
		</script>
<?php } ?>