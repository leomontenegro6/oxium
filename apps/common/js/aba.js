/* Plugin que instancia o componente de abas
 * 
 * Funções adicionadas:
 *	aba.instanciar( [ seletor_campo ] , [ escopo ] )
 */

function aba(){}

aba.instanciar = function(seletor, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor){
		busca = $(escopo).find(seletor).not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("ul.nav-tabs").not("[data-instanciado='true']");
	}
	busca.each(function(){
		// Obtendo menu de abas
		var $menu_aba = $(this);
		
		// Obtendo parâmetros de carregamento de páginas ajax, se houver
		var checkTemPaginaAjaxGeral = ($menu_aba.is('[data-pagina]'));
		var pagina_menu_aba, pagina_argumentos_menu_aba;
		if(checkTemPaginaAjaxGeral){
			pagina_menu_aba = $menu_aba.attr('data-pagina');
			pagina_argumentos_menu_aba = $menu_aba.attr('data-pagina-argumentos');
		} else {
			pagina_menu_aba = pagina_argumentos_menu_aba = '';
		}
		
		// Criação de elementos adicionais à estrutura de abas (<fieldset class='caixa_abas' /> envolvendo tudo, e <div class='abas' /> englobando todas as abas)
		var $container_abas;
		if (checkTemPaginaAjaxGeral) {
			// Conteúdo carregado via ajax, logo criar <div class='abas' />
			if( $menu_aba.next().is('div.tab-content') ){
				$menu_aba.next().remove();
			}
			$container_abas = $("<div />").addClass('tab-content');
			$menu_aba.after($container_abas);
		} else {
			$container_abas = $menu_aba.siblings().filter('div.tab-content');
		}
		
		// Percorrendo botões de abas para adicionar ações de clique
		var $itens_abas = $menu_aba.children('li').not('.nao_aba, .acoes_abas');
		$itens_abas.each(function(i){
			var $item_aba = $(this);
			var $link_aba = $item_aba.find('a').not('.nao_aba, .botao_aba').first();
			
			// Parametros de cada aba, obtido a partir dos atributos customizados
			var checkTemPaginaAjaxAbaAtual = ($item_aba.is('[data-pagina]'));
			var pagina_aba = '';
			if(checkTemPaginaAjaxAbaAtual){
				pagina_aba = $item_aba.attr('data-pagina');
			}
			var pagina_argumentos_aba = $item_aba.attr('data-pagina-argumentos');
			var callback_aba = $item_aba.attr('data-callback');
			
			// Obtendo divs de abas dentro de <div class='conteiners' />. Criar, se não existir.
			var $aba;
			if(checkTemPaginaAjaxGeral){
				// Conteúdo carregado via ajax
				// Criar <div>s dentro de <div class='conteiners' />
				$container_abas.append(
					$("<div />").attr('role', 'tabpanel').addClass('tab-pane')
				);
				$aba = $container_abas.children('div').last();
			} else {
				$aba = $container_abas.children('div').eq(i);
			}
			
			// Definindo ação ao clicar em cada item de aba
			$link_aba.click(function(e){
				if(!$item_aba.hasClass('active')){
					$item_aba.addClass("active").siblings().removeClass("active");
					$aba.addClass('active').siblings().removeClass('active');
					if (checkTemPaginaAjaxGeral || checkTemPaginaAjaxAbaAtual) {
						// Conteúdo carregado via ajax
						// Carregar página especificada via ajax e em seguida atualizar e exibir a aba
						var pagina;
						if (checkTemPaginaAjaxAbaAtual) {
							pagina = pagina_aba;
						} else {
							pagina = pagina_menu_aba;
						}
						var argumentos = "aba=" + (i + 1);
						if (typeof pagina_argumentos_menu_aba != 'undefined')
							argumentos += "&" + pagina_argumentos_menu_aba;
						if (typeof pagina_argumentos_aba != 'undefined')
							argumentos += "&" + pagina_argumentos_aba;
						
						$aba.html("<br/>Aguarde...<br/><img src='../common/images/processando.gif'/><br/><br/>");
						chamarPagina(pagina + '?' + argumentos, '', function(r) {
							$aba.html(r);
							
							// Instanciando componentes dentro do conteúdo da aba
							instanciarComponentes(null, $aba);
							
							// Executando callback da aba, se houver
							if(callback_aba != ''){
								new Function('return ' + callback_aba)();
							}
						}, function(erro){
							$aba.html('<strong style="font-size: #FF0000">Erro ao carregar página.<br />' + erro + '</strong>');
						});
					} else {
						// Instanciando componentes das abas ocultas
						instanciarComponentes(null, $aba);
					}
				}
			});
		});
		
		// Exibir primeira aba
		$itens_abas.first().removeClass('active').children('a').trigger('click');
		
		// Adicionando classe 'instanciado', para sinalizar que o componente já foi instanciado.
		$menu_aba.attr('data-instanciado', 'true');
	});
}