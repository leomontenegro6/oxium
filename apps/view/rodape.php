<?php if(!$ajax){ ?>
			<?php // Rodapé ?>
			<div id="rodape">
				<?php
				$ano_criacao = '2017';
				$ano_atual = date('Y');
				if($ano_criacao == $ano_atual){
					$anos = $ano_atual;
				} else {
					$anos = $ano_criacao . ' - ' . $ano_atual;
				}
				?>
				<div class="container">
					<p class="copyright text-muted"><br /><br />&copy; <?php echo $anos ?> Ox, Scripts!</p>
				</div>
			</div>
		</body>
	</html>
<?php } ?>