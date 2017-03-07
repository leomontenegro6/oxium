/* Plugin de menus
 * 
 * Baseado nos componentes "navbar" e "dropdown", do Bootstrap, em conjunto
 * com as seguintes bibliotecas externas: 
 * 
 * - bootstrap-submenus (http://vsn4ik.github.io/bootstrap-submenu/);
 * - bootstrap-hover-dropdown (https://cameronspear.com/demos/bootstrap-hover-dropdown/);
 * 
 * Em desktops, os menus instanciados através deste componente possuem
 * o layout padrão de uma barra de menus horizontal, com os menus aparecendo
 * ao posicionar o mouse sobre estes.
 * 
 * Em celulares e tablets, a barra de menus é substituída por um botão "Menu",
 * que quando clicado, exibe o menu em um layout vertical.
 * 
 * Funções adicionadas:
 *	menu.instanciar( array_barra_menus )
 */

function menu(){}

menu.instanciar = function(barra_menus){
	var $conteiner_barra_menus = $('#barra_menus');
	var dispositivo = getDispositivo();
	// Criação do botão "Menu"
	$conteiner_barra_menus.html('').append(
		$("<div />").addClass('navbar-header').append(
			$("<button />").addClass('navbar-toggle').attr({
				"type": "button",
				"data-toggle": "collapse",
				"data-target": ".barra-menus"
			}).append(
				$("<span />").addClass('sr-only').html('Ativar navegação')
			).append("<span class='icon-bar'></span><span class='icon-bar'></span><span class='icon-bar'></span>").append(
				$("<span />").addClass('texto').html('Menu')
			).append("<span class='caret'></span>")
		)
	).append(
		$("<div />").addClass('collapse navbar-collapse barra-menus').append(
			$("<ul />").addClass('itens nav navbar-nav')	
		)
	);

	// Criação dos itens de menu que popularão o menu mobile
	var criarMenu = function(itens_menu, conteiner, nivel){
		if(typeof nivel == 'undefined') nivel = 0;
		for(var i=0; i<itens_menu.length; i++){
			var item_menu = itens_menu[i];
			
			var icone = item_menu[0];
			var nome = item_menu[1];
			var pagina = item_menu[2];
			var target = item_menu[3];
			var titulo = item_menu[4];

			var tem_submenus = (item_menu.length > 5);
			if(tem_submenus){
				nivel++;
				var item_submenu = [];
				var ul_subitens_menu = $("<ul />").addClass('dropdown-menu fadein');
				for(var j in item_menu){
					if(j >= 5){
						item_submenu.push(item_menu[j]);
					}
				}
				var $li = $("<li />").html(
					$("<a />").attr({
						"tabindex": '0',
						"data-toggle": "dropdown",
						"title": titulo
					}).append(icone).append(
						$("<span />").addClass('alinhadoVertical').html(nome)
					)
				).append(ul_subitens_menu);
				if(nivel > 1){
					$li.addClass('dropdown-submenu');
				} else {
					$li.addClass('dropdown').children('a').append('<span class="caret"></span>');
					if(dispositivo != 'xs'){
						$li.children('a').attr("data-hover", "dropdown");
					}
					ul_subitens_menu.attr('role', 'menu');
				}
				conteiner.append( $li );
				// Chamada recursiva para instanciação de submenus em múltiplos níveis
				criarMenu(item_submenu, ul_subitens_menu, nivel);
				nivel--;
			} else {
				var $li = $("<li />").addClass('link').html(
					$("<a />").attr({
						"href": '#',
						"title": titulo,
						"onclick": "event.preventDefault(); abrirPagina('" + pagina + "', '', '" + target + "')"}).append(icone).append(
						$("<span />").addClass('alinhadoVertical').html(nome)
					)
				);
				if(nivel == 0 && dispositivo != 'xs'){
					$li.children('a').attr("data-hover", "dropdown");
				}
				conteiner.append($li);
			}
		}
	}
	var ul_itens_menu = $conteiner_barra_menus.find('ul.itens');
	criarMenu(barra_menus, ul_itens_menu);

	// Instanciação dos submenus com dois ou mais níveis de profundidade
	$conteiner_barra_menus.find('.dropdown-submenu>a').submenupicker();
}