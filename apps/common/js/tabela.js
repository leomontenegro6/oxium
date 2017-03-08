/* Plugin de tabelas de listagem de registros
 * 
 * Baseado no componente "jQuery Datatables" (https://www.datatables.net/),
 * em conjunto com estilizações nos padrões do Bootstrap.
 * 
 * Componentes Bootstrap utilizados em conjunto:
 * - Modal;
 * - Button Groups;
 * - Button Dropdowns
 * 
 * Dependências:
 * - dataTables.bootstrap.min.css
 * - responsive.bootstrap.min.css
 * - buttons.dataTables.min.css
 * - dataTables.bootstrap.min.js
 * - dataTables.responsive.min.js
 * - dataTables.buttons.min.js
 * - buttons.print.min.js
 * - Plugin de implementação de paginação sem elipse, incluso no final deste arquivo
 *		(http://www.gyrocode.com/articles/jquery-datatables-pagination-without-ellipses)
 * 
 * Funções adicionadas:
 *	tabela.instanciar( [ seletor_tabela ] , [ escopo ] )
 *	tabela.pesquisar( form , [ seletor_tabela ] )
 *	tabela.atualizar( [ seletor_tabela ] )
 *	tabela.removerLinhaById( id , [ seletor_tabela ] )
 *	tabela.imprimir( [ seletor_tabela ] )
 */

function tabela(){}

tabela.instanciar = function(seletor_tabela, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_tabela){
		busca = $(escopo).find(seletor_tabela).not("[data-instanciado='true']").not('.oculta');
	} else {
		busca = $(escopo).find("div.tabelaaberta").not("[data-instanciado='true']").not('.oculta');
	}
	var dispositivo = getDispositivo();
	busca.each(function(){
		var $conteiner_tabela = $(this);
		var $tabela = $conteiner_tabela.children('table');
		var temPaginaAjax, pagina, parametros_pagina, pagina_com_parametros, ordenacao, filtragem, limite_registros, temPaginacao;
		var relatorio, ordenarPorPadrao = true;
		var eventos = [];
		var temColunaAcoes = ( $tabela.children('thead').children('tr').children('th').last().hasClass('acoes') );
		
		// Obtenção da página ao qual o componente fará requisições Ajax, para obter registros
		if(($conteiner_tabela.is("[data-pagina]") && ($.trim( $conteiner_tabela.attr('data-pagina') ) != ''))){
			temPaginaAjax = true;
			pagina = $conteiner_tabela.attr('data-pagina');
		} else {
			temPaginaAjax = false;
			pagina = '';
		}
		// Obtenção dos parâmetros que o componente enviará na requisição, via método GET
		if((temPaginaAjax) && ($conteiner_tabela.is("[data-parametros]") && ($.trim( $conteiner_tabela.attr('data-parametros') ) != ''))){
			parametros_pagina = $conteiner_tabela.attr('data-parametros');
			pagina_com_parametros = encodeURI(pagina + '?' + parametros_pagina);
		} else {
			parametros_pagina = '';
			pagina_com_parametros = '';
		}

		// Obtenção da ordenação padrão do componente, que pode ser o nome ou o número da coluna
		if(($conteiner_tabela.is("[data-ordenacao]") && ($.trim( $conteiner_tabela.attr('data-ordenacao') ) != ''))){
			if($conteiner_tabela.attr('data-ordenacao') == 'false'){
				ordenarPorPadrao = false;
			}
			ordenacao = ( $conteiner_tabela.attr('data-ordenacao') ).split(',');
		} else {
			ordenacao = ['1'];
		}

		// Obtenção da filtragem padrão do componente, que pode ser ascendente (asc) ou descendente (desc)
		if(($conteiner_tabela.is("[data-filtragem]") && ($.trim( $conteiner_tabela.attr('data-filtragem') ) != ''))){
			filtragem = ( $conteiner_tabela.attr('data-filtragem') ).split(',');
		} else {
			filtragem = ['asc'];
		}
		
		// Criação de objeto contendo as opções de ordenação e filtragem combinados.
		var ordenacao_filtragem = [];
		var total_ordenacao = ordenacao.length;
		for(var i=0; i<total_ordenacao; i++){
			var o = ordenacao[i];
			var f;
			if(typeof filtragem[i] != 'undefined'){
				f = filtragem[i];
			} else {
				f = filtragem[i - 1];
			}
			ordenacao_filtragem.push({
				'ordenacao': o,
				'filtragem': $.trim( lower(f) )
			});
		}
		
		// Obtenção do limite de registros a ser exibidos na tabela
		if(($conteiner_tabela.is("[data-limite]") && ($.trim( $conteiner_tabela.attr('data-limite') ) != ''))){
			limite_registros = $conteiner_tabela.attr('data-limite');
		} else {
			limite_registros = 15;
		}
		
		// Obtenção do limite de registros a ser exibidos na tabela
		if(($conteiner_tabela.is("[data-paginacao]") && ($.trim( $conteiner_tabela.attr('data-paginacao') ) == 'true'))){
			temPaginacao = true;
		} else {
			temPaginacao = false;
		}
		
		// Obtenção do parâmetro que determina se a tabela é específica de relatório ou não
		if(($conteiner_tabela.is("[data-relatorio]") && ($.trim( $conteiner_tabela.attr('data-relatorio') ) == 'true'))){
			relatorio = true;
		} else {
			relatorio = false;
		}
		
		// Obtenção do parâmetro referente ao evento "drawCallback", chamado a cada busca na tabela
		if(($conteiner_tabela.is("[data-ondraw]") && ($.trim( $conteiner_tabela.attr('data-ondraw') ) != ''))){
			eventos['ondraw'] = $.trim( $conteiner_tabela.attr('data-ondraw') );
		} else {
			eventos['ondraw'] = '';
		}
		
		// Montagem das opções padrão do campo "Exibir"
		var opcoes_exibir = [ [1, 2, 3, 5, 7, 10, 15, 25, 50, 100, -1], [1, 2, 3, 5, 7, 10, 15, 25, 50, 100, 'Todos'] ];
		
		// Variáveis necessárias para implementar a solicitaçao de confirmação, quando o usuario tentar exibir todos os registros
		var pesquisou = true;
		var pagina_original = 0;
		var limite_registros_original = limite_registros;
		
		// Adição de classes específicas do Bootstrap na tabela, de modo a deixá-la com bordas e efeitos de zebra e hover
		$tabela.addClass('table table-striped table-hover table-bordered');
		
		// Parâmetros de instanciação do jQuery Datatables
		var parametros = {
			// Define se a tabela tera paginação ou não
			'paging': temPaginacao,
			// Desativa campo de busca do próprio componente, dentro da paginação
			'searching': false,
			// Torna a tabela com layout responsivo
			'responsive': true,
			// Desativa cálculo automático de largura das colunas
			'autoWidth': false
		}
		
		// Se for relatório, exibir botão de imprimir nativo do jQuery DataTables
		if(relatorio){
			// Inserção de botões de exportação da tabela para formatos PDF, XLS e CSV
			parametros['buttons'] = ['print'];
		} else {
			parametros['buttons'] = [];
		}
		
		// Alterando parâmetros em função da existência da paginação ou não
		if(temPaginacao){
			// Fazer paginação exibir todos os botões, inclusive o "Primeiro" e "Último", porém excluindo as elipses
			parametros['pagingType'] = 'full_numbers_no_ellipses';
			// Personalizar itens do campo "Exibir", na paginação
			parametros['lengthMenu'] = opcoes_exibir;
			// Define o limite de registros exibidos na tabela, caso o total de registros da tabela ultrapasse este valor
			parametros['pageLength'] = limite_registros;
		} else {
			parametros['dom'] = 'B';
			// Desativa exibição de informações, na paginação
			parametros['info'] = false;
			
			// Inserir classe para arredondar tabela
			$tabela.addClass('table-curved');
		}
		
		// Número de botões exibidos na paginação (desconsiderando botões "Primeiro", "Anterior", "Próximo" e "Último)
		var numero_botoes_paginacao;
		if(dispositivo == 'xs'){
			numero_botoes_paginacao = 3;
		} else {
			numero_botoes_paginacao = 10;
		}
		$.fn.DataTable.ext.pager.numbers_length = numero_botoes_paginacao;
		
		// Diz ao componente que os registros serão obtidos via Ajax, através da página fornecida no atributo "data-pagina"
		if(temPaginaAjax){
			parametros['processing'] = true;
			parametros['serverSide'] = true;
			parametros['ajax'] = {
				'url': pagina_com_parametros,
				'method': 'GET',
				'timeout': (60 * 1000) // Expirar requisição em 60 segundos
			};
		}
		
		// Obtendo informações das colunas da tabela, a partir de seu cabeçalho
		var colunas = [], ordem = [];
		$tabela.children('thead').children('tr').children('th').each(function(i){
			var $th = $(this);
			var coluna = {};
			
			// Obtendo colspan da coluna, para realizar a devida inserção do número
			// de colunas na instanciação do componente
			var colspan;
			if($th.is('[colspan]')){
				colspan = parseInt($th.attr('colspan'), 10);
			} else {
				colspan = 0;
			}
			
			// Definindo nomes das colunas, caso o atributo "data-coluna" não exista.
			// A definição é feita adicionando o numero das colunas
			if(!$th.is('[data-coluna]')){
				$th.attr('data-coluna', (i+1));
			}
			// Obtendo nomes das colunas, em função do atributo "data-coluna"
			var nome_coluna;
			if($th.hasClass('acoes')){
				nome_coluna = 'acoes';
				// Adicionando classe para tornar a coluna de ações sempre visível,
				// mesmo em dispositivos de pouca largura
				$th.addClass('all');
				
				// Se estiver em dispositivos com pouca largura de tela,
				// remover nome "Ações" e diminuir largura da célula do cabecalho
				if(dispositivo == 'xs'){
					$th.html('&nbsp;');
					coluna.width = '5%';
				}
			} else {
				nome_coluna = ( $th.attr('data-coluna') ).toString();
			}
			coluna.data = nome_coluna;
			
			// Desativando ordenação na coluna, se esta tiver o atributo 
			// "data-ordenavel" definido como false
			if($th.is('[data-ordenavel]') && $th.attr('data-ordenavel') == 'false'){
				coluna.orderable = false;
			}
			
			// Aplicar formatação de textos nas colunas da tabela, se existir
			// o atributo "data-formato" na coluna <th> do cabeçalho
			if($th.is('[data-formato]') && $.trim( $th.attr('data-formato') ) != ''){
				var formato = $th.attr('data-formato');
				if(typeof window[formato] == 'function'){
					coluna.render = function(texto){
						return new Function('return ' + formato + "('" + texto + "')")();
					}
				}
			}
			
			// Adicionando informações da coluna ao array de parâmetros
			if(colspan > 1){
				for(var i = 0; i < colspan; i++){
					if(i > 0){
						delete coluna.data;
					}
					colunas.push(coluna);
				}
			} else {
				colunas.push(coluna);
			}
			
			
			// Obtendo coluna da tabela para ser usada como base na ordenação,
			// em função do nome da coluna, e da variável "ordenacao_filtragem".
			// Se não existir, será usado por padrão a primeira coluna da tabela,
			// em direção ascendente.
			for(var i in ordenacao_filtragem){
				if($th.attr('data-coluna') == ordenacao_filtragem[i]['ordenacao']){
					var numero_ordem = $th.index();
					var direcao_ordem = ordenacao_filtragem[i]['filtragem'];
					ordem.push([numero_ordem, direcao_ordem]);
				}
			}
			
			// Removendo atributos desnecessários
			$th.removeAttr('data-coluna data-ordenavel');
		});
		
		// Se não foi possível obter a ordenação a partir das colunas, defini-la
		// como padrão para usar a primeira coluna da tabela, em ordem ascendente
		if(ordem.length == 0){
			ordem = [[0, 'asc']];
		}
		if(!ordenarPorPadrao){
			ordem = [];
		}
		
		parametros['columns'] = colunas;
		parametros['order'] = ordem;
		
		// Desativa ordenação para a última coluna da tabela (para ações)
		if(temColunaAcoes){
			parametros['columnDefs'] = [
				{
					'orderable': false,
					'targets': -1
				}
			];
			if(temPaginaAjax){
				parametros['columnDefs'][0]['data'] = null;
				parametros['columnDefs'][0]['defaultContent'] = '';
			}
		}
		
		// Anulando totais, para tabelas com página Ajax
		if(temPaginaAjax){
			$tabela.find('span.total_consulta, span.total_geral').html('...');
		}
		
		// Chamada de eventos e callbacks do componente
		$tabela.on({
			// PreInit: Chamado antes do componente ser instanciado pela primeira vez
			'preInit.dt': function(e, s){
				// Ocultar elementos da paginação em dispositivos com pouca largura de tela
				// Dessa maneira, em celulares a paginação exibirá apenas os botões
				if(temPaginacao){
					$conteiner_tabela.find('div.dataTables_info, div.dataTables_length').addClass('hidden-xs');
				}
			},
			// Init: Chamado após o componente ser instanciado pela primeira vez
			'init.dt': function(){
				if(temPaginacao){
					select.instanciar( $conteiner_tabela.find("select[name='DataTables_Table_0_length']") );
				}
			},
			// Processing: Chamado quando o componente está processando algo
			// (ex.: carregando dados da tabela)
			'processing.dt': function(e, s, processando){
				if(processando == true){
					var $div_processando = $conteiner_tabela.find('div.dataTables_processing');
					var $caption = $conteiner_tabela.children('div.caption');
					
					// Estilizando modal de carregando
					if(!$div_processando.is("[data-estilizado='true']")){
						var texto_processando = $div_processando.html();
						var $modal_carregando = $("<div />").addClass('modal_carregando').prepend(
							$("<i />").addClass('fa fa-circle-o-notch fa-spin fa-3x fa-fw').html('') // Imagem de loadingwheel
						).append(
							$("<div />").html(texto_processando) // Texto de "processando"
						).append(
							$("<button />", {'type': 'button'}).addClass('btn btn-xs cancelar preto').html('Cancelar') // Botão "Cancelar"
						);
						var $modal_carregando_baixo = $modal_carregando.clone().addClass('baixo').hide();
						$div_processando.html( $modal_carregando ).append( $modal_carregando_baixo ).find('button.cancelar').click(function(){
							// Abortar requisição ajax, se o botão "Cancelar" for clicado
							var ajax_tabela = s['jqXHR'];
							ajax_tabela.abort();
						});
						$div_processando.attr('data-estilizado', 'true');
					}
					
					// Exibindo modal de carregando no topo e rodapé da tabela
					var $modal_carregando = $div_processando.children('div.modal_carregando');
					if($conteiner_tabela.height() > getAltura()){
						$modal_carregando.first().addClass('cima');
						$modal_carregando.last().show();
					} else {
						$modal_carregando.first().removeClass('cima');
						$modal_carregando.last().hide();
					}
					
					// Definindo altura do modal, de modo a ocupar toda a área da tabela
					var altura_modal = $conteiner_tabela.outerHeight() - $caption.outerHeight();
					$div_processando.css('height', altura_modal);
				}
			},
			// Page: Chamado quando é alterada a página da paginação
			'page.dt': function(){
				// Ocultar todos os tooltips dos botões da paginação
				if(temPaginacao){
					$('body>div.tooltip').tooltip('hide');
				}
			},
			// Length: Chamado quando o valor do campo "Exibir" é alterado
			'length.dt': function(e, s){
				if(temPaginacao){
					var limite_registros_campo = s._iDisplayLength;
					var total_consulta = s['_iRecordsDisplay'];
					var $campo_exibir = $conteiner_tabela.find('div.dataTables_length select');

					// Atualizando valor de ambos os campos <select>, ao alterar o valor de um deles
					$campo_exibir.each(function(){
						var $campo = $(this);
						if($campo.hasClass('select2-hidden-accessible')){
							$campo.val(limite_registros_campo).trigger('change.select2');
						}
					})

					// Se a tabela for via Ajax, a consulta retornar mais de 1000 resultados, e o usuário tentar exibir todos os registros,
					// perguntar ao usuário se ele realmente deseja realizar esta operação.
					if(temPaginaAjax && total_consulta > 1000 && s._iDisplayLength == -1){
						pesquisou = false;
						jConfirmSimNao('Esta consulta retornará muitos registros e pode demorar um pouco. Deseja continuar?', '', function(r){
							pesquisou = true;
							if(r){
								pagina_original = s._iDisplayStart;
								limite_registros_original = limite_registros_campo;
								objeto_tabela.page.len(-1).draw();
							} else {
								// Resetar a página e tamanho atuais da paginação
								s._iDisplayStart = pagina_original;
								s._iDisplayLength = limite_registros_original;
								$campo_exibir.val(limite_registros_original).each(function(){
									$(this).trigger('change');
								});
							}
						})
					}
				}
			}
		});
		// initComplete: Chamado após a tabela ter sido completamente inicializada
		parametros['initComplete'] = function(){
			// Verificando se, dentre as colunas com ordenação, o texto está sobre o ícone de ordenação ou não.
			// Se estiver, aumentar a largura da coluna.
			if(dispositivo != 'xs'){
				$tabela.children('thead').children('tr').children('th').filter('.sorting, .sorting_asc, .sorting_desc').each(function(){
					var $th = $(this);
					$th.wrapInner('<span />');
					var $span = $th.children('span');
					var largura_coluna = $th.width();
					var largura_texto = $span.width();
					var largura_icone_ordenacao = 14;
					var padding_icone_ordenacao = 8;
					if(largura_texto > 0){
						var distancia_texto_icone = ((largura_coluna - largura_texto) / 2);
						if(distancia_texto_icone < largura_icone_ordenacao){
							$th.width( $th.width() + largura_icone_ordenacao + (padding_icone_ordenacao * 2) );
						}
					}
				});
			}
		}
		// preDrawCallback: Chamado antes do componente ter concluído uma pesquisa
		parametros['preDrawCallback'] = function(){
			var info_paginacao = $tabela.DataTable().page.info();
			
			// Cancelar pesquisa, se a variável "pesquisou" for alterada para falso
			if(!pesquisou){
				pesquisou = true;
				return false; // Cancela pesquisa
			}
			
			// Efetuar customizações nos campos <select> da tabela, se tiver paginação
			if(temPaginacao){
				// Obtenção dos dois campos <select>
				var $campo_exibir = $conteiner_tabela.find('div.dataTables_length select');

				// Desativar filtro de busca, para campos estilizados com o componente Select2
				$campo_exibir.attr('data-filtro', 'false');

				// Montagem das opções customizadas do campo "Exibir", em função do total da consulta
				var total_consulta = info_paginacao.recordsDisplay;
				var limite_registros_pesquisa = info_paginacao.length;
				var temResultados = (total_consulta > 0);
				if(temResultados){
					var opcoes_exibir_customizado = opcoes_exibir[0].slice(0, -1);
					var ultima_opcao = opcoes_exibir_customizado.slice().pop();
					if((total_consulta < limite_registros) || (total_consulta < ultima_opcao)){
						opcoes_exibir_customizado.push(total_consulta);
						opcoes_exibir_customizado = sortNumber(opcoes_exibir_customizado);
						var posicao = opcoes_exibir_customizado.indexOf(total_consulta);
						opcoes_exibir_customizado = opcoes_exibir_customizado.slice(0, posicao+1);
						opcoes_exibir_customizado = removeDuplicates(opcoes_exibir_customizado);
					}
					ultima_opcao = opcoes_exibir_customizado.slice().pop();
					var total_opcoes = opcoes_exibir_customizado.length;
					if(total_opcoes > 0){
						$campo_exibir.html('');
						var tem_selecionado = false;
						for(var i=0; i<total_opcoes; i++){
							var opcao = opcoes_exibir_customizado[i];
							var selected;
							if((!tem_selecionado) && ( ((i+1) == total_opcoes) || (opcao == limite_registros_pesquisa) )){
								selected = 'selected';
								tem_selecionado = true;
							} else {
								selected = '';
							}
							$campo_exibir.append('<option value="' + opcao + '" ' + selected + '>' + opcao + '</option>');
						}
						if(ultima_opcao < 100){
							$campo_exibir.each(function(){
								var $campo = $(this);
								$campo.children('option').last().attr('value', '-1').html('Todos');
							})
						} else {
							$campo_exibir.append('<option value="-1">Todos</option>');
						}
					}
				}
			}
			
			// Remover foco de todos os botões da tabela, antes de exibir o modal de carregamento sobre a mesma
			$conteiner_tabela.find(':focus').blur();
		}
		// drawCallback: Chamado após o componente ter concluído uma pesquisa
		parametros['drawCallback'] = function(){
			var info_paginacao = $tabela.DataTable().page.info();
			// Obtendo totais;
			var total_geral = info_paginacao.recordsTotal;
			var total_consulta = info_paginacao.recordsDisplay;
			var temResultados = (total_consulta > 0);
			
			var atualizadoProgramaticamente;
			if($conteiner_tabela.is("[data-atualizacao-programatica='true']")){
				atualizadoProgramaticamente = true;
			} else {
				atualizadoProgramaticamente = false;
			}
			
			if(!atualizadoProgramaticamente){
				// Ocultando janelas modais, se existirem
				jModalRemove();

				// Scrollando página até a tabela, se for a primeira pesquisa
				if(temPaginaAjax && getDispositivo() == 'xs'){
					scrollarElemento($conteiner_tabela);
				}
			}

			// Inserir atributos "title" e regular largura dos botões da paginação
			if(temPaginacao){
				$conteiner_tabela.find('div.dataTables_paginate>ul>li.paginate_button').each(function(){
					var $li = $(this);
					var $a = $li.children('a');
					if($li.hasClass('first')){
						if(!$li.hasClass('disabled')) $a.attr('title', 'Primeira página');
					} else if($li.hasClass('previous')){
						if(!$li.hasClass('disabled')) $a.attr('title', 'Página anterior');
					} else if($li.hasClass('next')){
						if(!$li.hasClass('disabled')) $a.attr('title', 'Página seguinte');
					} else if($li.hasClass('last')){
						if(!$li.hasClass('disabled')) $a.attr('title', 'Última página');
					} else {
						var numero = $a.html();
						if(!$li.hasClass('disabled')) $a.attr('title', 'Página ' + numero);

						// Desativar botão atual
						if($li.hasClass('active')){
							$a.removeAttr('title').addBack().off().click(function(e){
								e.preventDefault();
							});
						}

						// Diminuir padding do botão em dispositivos de pouca largura,
						// para botões equivalentes às páginas 100 em diante
						if(dispositivo == 'xs' && numero > 99){
							$a.css('padding', '6px');
						}
					}
					$a.tooltip({'container': 'body'});
				});
			}
			
			// Se a consulta retornar resultados, prosseguir com a formatação da tabela
			if(temResultados){
				// Exibir os botões de ações na sua respectiva célula, para tabelas
				// com página Ajax e pelo menos um resultado.
				// Isso é feito com base no elemento <div class="acoes"> fora da tabela,
				// de modo a substituir os índices entre chaves, por seus respectivos
				// valores, conforme retornado pela propriedade "DT_RowData"
				if(temColunaAcoes){
					if(temPaginaAjax){
						var $conteiner_acoes = $conteiner_tabela.children('div.acoes');
						
						$tabela.children('tbody').children('tr').each(function(){
							var $tr = $(this);
							var dados_coluna = $tr.data();
							var $coluna_acoes = $tr.children('td:last-child').addClass('acoes');

							var $conteiner_acoes_clonado = $conteiner_acoes.clone();
							$conteiner_acoes_clonado.removeClass('acoes').addClass('btn-group');

							tabela.instanciarConteinerAcoes($conteiner_acoes_clonado, dispositivo);
							$conteiner_acoes_clonado.children('button').not('.dropdown-toggle').each(function(){
								var $acao = $(this);
								if($acao.is('[data-pagina]')){
									var pagina = $acao.attr('data-pagina');
									var parametros, target;
									if($acao.is('[data-parametros]')){
										parametros = $acao.attr('data-parametros');
									} else {
										parametros = '';
									}
									if($acao.is('[data-target]')){
										target = $acao.attr('data-target');
									} else {
										target = '';
									}

									// Substituição dos índices pelos valores
									pagina = tabela.substituirIndiceValor(pagina, dados_coluna);
									parametros = tabela.substituirIndiceValor(parametros, dados_coluna);
									
									// Criação do evento de clique, em função dos parâmetros acima
									onclick = function(){
										abrirPagina(pagina, parametros, target);
									};
								} else if( $acao.is('[data-onclick]') ){
									var onclick = $acao.attr('data-onclick');

									onclick = tabela.substituirIndiceValor(onclick, dados_coluna);
									
									// Criação do evento de clique, em função do atributo "data-onclick"
									onclick = new Function('return ' + onclick);							
								}
								
								tabela.estilizarAcao($acao, dispositivo, onclick, temPaginaAjax);
							});
							$conteiner_acoes_clonado.appendTo($coluna_acoes);
						});
					} else {
						$tabela.children('tbody').children('tr').each(function(){
							var $tr = $(this);
							var $coluna_acoes = $tr.children('td:last-child').addClass('acoes');
							
							$coluna_acoes.children('button').wrapAll( $('<div />').addClass('acoes') );
							
							$conteiner_acoes = $coluna_acoes.children('div.acoes');
							$conteiner_acoes.removeClass('acoes').addClass('btn-group');
							
							tabela.instanciarConteinerAcoes($conteiner_acoes, dispositivo);
							$conteiner_acoes.children('button').not('.dropdown-toggle').each(function(){
								var $acao = $(this);
								var onclick = new Function('return ' + $acao.attr('onclick'));
								tabela.estilizarAcao($acao, dispositivo, onclick, temPaginaAjax);
							});
						});
					}
				}
			}

			// Exibindo totais no rodapé da tabela, se tiver página Ajax
			if(temPaginaAjax){
				$tabela.find('span.total_consulta').html(total_consulta);
				$tabela.find('span.total_geral').html(total_geral);
			}
			
			// Executando evento ondraw, se fornecido com atributo
			if(eventos['ondraw'] != ''){
				new Function('return ' + eventos['ondraw'])();
			}
		}
		// Ajax Error: Chamado quando há erros na requisição Ajax, seja do cliente ou do servidor
		if(temPaginaAjax){
			parametros['ajax']['error'] = function(jqXHR, textStatus, err){
				var $div_processando = $conteiner_tabela.find('div.dataTables_processing');
				$div_processando.hide();
				jAlert('Erro: ' + textStatus);
			}
		}
		// Error: Chamado quando o componente em si retorna erro
		$.fn.dataTable.ext.errMode = 'throw';
		$tabela.on('error.dt', function(e, s, t, m){
			// Checando se o erro retornado corresponde a sessão expirada
			if(m.indexOf('expired') > -1){
				var $div_processando = $conteiner_tabela.find('div.dataTables_processing');
				$div_processando.hide();

				// Chamando modal de sessão expirada
				modal.sessaoExpirada();
			} else {
				jAlert('Erro: ' + m);
			}
		});
		
		// Strings de tradução do componente para português
		parametros['language'] = {
			'sEmptyTable': 'Nenhum registro encontrado',
			'sInfo': '(_PAGE_ de _PAGES_)',
			'sInfoEmpty': '(Sem resultados)',
			'sInfoFiltered': '',
			'sInfoPostFix': '',
			'sInfoThousands': '.',
			'sLengthMenu': 'Exibir: _MENU_',
			'sLoadingRecords': 'Carregando...<br />Por favor, aguarde!',
			'sProcessing': 'Processando...<br />Por favor, aguarde!',
			'sZeroRecords': 'Nenhum registro encontrado',
			'sSearch': 'Pesquisar',
			'oPaginate': {
				'sFirst': '<span class="glyphicon glyphicon-step-backward"></span>',
				'sPrevious': '<span class="glyphicon glyphicon-backward"></span>',
				'sNext': '<span class="glyphicon glyphicon-forward"></span>',
				'sLast': '<span class="glyphicon glyphicon-step-forward"></span>'
			},
			'oAria': {
				'sSortAscending': ': Ordenar colunas de forma ascendente',
				'sSortDescending': ': Ordenar colunas de forma descendente'
			},
			'buttons': {
				'print': 'Imprimir'
			}
		};
		
		// Instanciação do componente
		var objeto_tabela = $tabela.DataTable(parametros);
		
		// Setando evento de controle de estados de histórico
		if(temPaginaAjax){
			window.addEventListener("popstate", function (e) {
				if(e.state != null){
					$conteiner_tabela.removeClass('oculta');
					var pagina_com_parametros = pagina + '?' + e.state;
					objeto_tabela.page.len(15).ajax.url(pagina_com_parametros).load();
				} else {
					$conteiner_tabela.addClass('oculta');
				}
			});
		}
		
		// Inserir atributo que impede desta função atuar sobre esta tabela
		// duas vezes, de modo a evitar bugs.
		$conteiner_tabela.attr('data-instanciado', 'true');
	});
}

tabela.pesquisar = function(form, seletor_tabela){
	if(validaForm(form, false) == true){
		var $conteiner_tabela;
		if(typeof seletor_tabela == 'undefined'){
			$conteiner_tabela = $('div.tabelaaberta');
		} else {
			$conteiner_tabela = $('#' + seletor_tabela);
		}
		var temPaginaAjax;
		if(($conteiner_tabela.is("[data-pagina]") && ($.trim( $conteiner_tabela.attr('data-pagina') ) != ''))){
			temPaginaAjax = true;
		} else {
			temPaginaAjax = false;
		}
		var objeto_tabela = $conteiner_tabela.find('table.dataTable').DataTable();
		var $form = $(form);
		var pagina = $conteiner_tabela.attr('data-pagina').split('?').shift();
		var parametros_formulario = $form.serialize();
		$conteiner_tabela.removeClass('oculta').attr({
			'data-pagina': pagina,
			'data-parametros': parametros_formulario
		});
		var tabelaInstanciada = $conteiner_tabela.is("[data-instanciado='true']");
		if(tabelaInstanciada){
			var pagina_com_parametros;
			if($.trim(parametros_formulario) != ''){
				pagina_com_parametros = pagina + '?' + parametros_formulario;
			} else {
				pagina_com_parametros = pagina;
			}
			objeto_tabela.page.len(15).ajax.url(pagina_com_parametros).load();
		} else {
			tabela.instanciar($conteiner_tabela);
		}
		
		// Inserindo estado da página no histórico, para ser possível avançar e voltar devidamente no navegador
		if(temPaginaAjax){
			history.pushState(parametros_formulario, '', '?' + parametros_formulario);
		}
		
		// Removendo foco dos botões e campos do formulário
		$form.find('input, button, textarea, select').blur();
		
		// Scrollando até a tabela
		if(getDispositivo() == 'xs') scrollarElemento($conteiner_tabela);
	}
	return false; 
}

tabela.atualizar = function(seletor_tabela){
	var $conteineres_tabela;
	if(typeof seletor_tabela == 'undefined'){
		$conteineres_tabela = $('div.tabelaaberta');
	} else {
		$conteineres_tabela = $('#' + seletor_tabela);
	}
	$conteineres_tabela.each(function(){
		var $conteiner_tabela = $(this);
		var temPaginaAjax;
		if(($conteiner_tabela.is("[data-pagina]") && ($.trim( $conteiner_tabela.attr('data-pagina') ) != ''))){
			temPaginaAjax = true;
		} else {
			temPaginaAjax = false;
		}
		var $tabela = $conteiner_tabela.find('table.dataTable');
		var objeto_tabela = $tabela.DataTable();
		if(temPaginaAjax){
			$conteiner_tabela.attr('data-atualizacao-programatica', 'true');
			objeto_tabela.ajax.reload(function(){
				//var info_paginacao = objeto_tabela.page.info();
				//var total_consulta = info_paginacao.recordsDisplay;
				//var temResultados = (total_consulta > 0);
				
				$conteiner_tabela.removeAttr('data-atualizacao-programatica');
			}, false);
		} else {
			var ordenacao, filtragem;
			if($conteiner_tabela.is('[data-ordenacao]')){
				ordenacao = $conteiner_tabela.attr('data-ordenacao') - 1;
			} else {
				ordenacao = '1';
			}
			if($conteiner_tabela.is('[data-filtragem]')){
				filtragem = $conteiner_tabela.attr('data-filtragem');
			} else {
				filtragem = 'asc';
			}
			objeto_tabela.order([ordenacao, filtragem]).draw(false);
		}
	});
}

tabela.removerLinhaById = function(id, seletor_tabela){
	var $conteiner_tabela;
	if(typeof seletor_tabela == 'undefined'){
		$conteiner_tabela = $('div.tabelaaberta');
	} else {
		$conteiner_tabela = $('#' + seletor_tabela);
	}
	$conteiner_tabela.find('table.dataTable').each(function(){
		var $tabela = $(this);
		var removeu = false;
		$tabela.children('tbody').children('tr').each(function(){
			var $tr = $(this);
			var dados_coluna = $tr.data();
			if(id == dados_coluna['id']){
				var $tr_seguinte = $tr.next();
				
				// Se a linha seguinte for uma extensão da atual (comum em celulares), removê-la também
				if($tr_seguinte.hasClass('child') && !$tr_seguinte.is("[role='row']")){
					$tr_seguinte.remove();
				}
				
				// Removendo linha propriamente dita
				$tr.remove();
				
				// Atualizando flag de remoção de linha da tabela
				removeu = true;
				return false; // Sair do $.each
			}
		});
		if(removeu){
			$tabela.find('span.total_consulta, span.total_geral').each(function(){
				var $span = $(this);
				var total = parseInt($span.html(), 10);
				$span.html(total - 1);
			});
		}
	});
}

// Função que instancia contêiner de ações, em função do dispositivo
// usado (desktop ou mobile). Se for mobile, o componente do Bootstrap
// "Button Dropdown" é utilizado. Do contrário, é usado o componente
// Bootstrap "Button Group"
tabela.instanciarConteinerAcoes = function(conteiner_acoes, dispositivo){
	if(typeof dispositivo == 'undefined') dispositivo = getDispositivo();
	var $conteiner_acoes_instanciado = $(conteiner_acoes);
	if(dispositivo == 'xs'){
		var $botao_dropdown = $('<button />', {'type': 'button'}).addClass('btn btn-default dropdown-toggle').attr({
			'data-toggle': 'dropdown',
			'aria-haspopup': 'true',
			'aria-expanded': 'false'
		}).html(
			$('<span />').addClass('glyphicon glyphicon-option-vertical')
		);
		var $conteiner_dropdown = $('<ul />').addClass('acoes_mobile dropdown-menu dropdown-menu-right fadein').append(
			$("<li />").addClass('dropdown-header').html('Ações')
		).append(
			$("<li />").attr('role', 'separator').addClass('divider')
		);
		$conteiner_acoes_instanciado.prepend( $botao_dropdown.add($conteiner_dropdown) );
	} else {
		$conteiner_acoes_instanciado.addClass('btn-group').attr({
			"role": "group",
			"aria-label": "Ações"
		}).children('button').addClass('btn btn-default');
	}
	return $conteiner_acoes_instanciado;
}

// Função que estiliza os botões do contêiner de ações, em função do dispositivo
// usado (desktop ou mobile).
tabela.estilizarAcao = function(acao, dispositivo, onclick, temPaginaAjax){
	var $acao_estilizada = $(acao);
	var temOnclick = (typeof onclick == 'function');
	var $conteiner_dropdown = $acao_estilizada.siblings('ul');
	if(dispositivo == 'xs'){
		var titulo = $acao_estilizada.attr('title');
		var $icone = $acao_estilizada.children('i');
		var cor_acao;
		if($acao_estilizada.hasClass('btn-success')){
			cor_acao = 'mobile-success';
		} else if($acao_estilizada.hasClass('btn-primary')){
			cor_acao = 'mobile-primary';
		} else if($acao_estilizada.hasClass('btn-danger')){
			cor_acao = 'mobile-danger';
		} else {
			cor_acao = 'mobile-default';
		}
		
		var $li = $('<li />').append(
			$("<a />").attr('href', '#').addClass(cor_acao).prepend($icone).append(
				$('<span />').addClass('alinhadoVertical').html(titulo)
			)
		);
		if(temOnclick){
			$li.click(function(e){
				e.preventDefault();
				onclick();
			});
		}
		$conteiner_dropdown.append($li);

		$acao_estilizada.remove();
	} else {
		$acao_estilizada.removeAttr('data-pagina data-parametros data-target data-onclick');
		if(temOnclick && temPaginaAjax) $acao_estilizada.click(onclick);
	}
	return $acao_estilizada;
}

// Função que recebe a variável string "texto", e substitui índices entre chaves pelos valores inclusos no array "dados_coluna"
tabela.substituirIndiceValor = function(texto, dados_coluna){
	if(typeof texto == 'string'){
		var busca = new RegExp('\\{(.*?)\\}', 'g');
		var resultado;
		while(resultado = busca.exec(texto)){
			var coluna = resultado[1];
			$.each(dados_coluna, function(c, v){
				if(c == coluna){
					texto = texto.replace(new RegExp('{' + c + '}', 'g'), v);
					return false; // Sair do $.each
				}
			})
		}
		// Se, após a substituição, ainda existir índices não substituídos, removê-los do texto
		texto = texto.replace(new RegExp('\\{(.*?)\\}', 'g'), '');

		// Retorna texto com valores atualizados
		return texto;
	} else {
		return null;
	}
}

tabela.exportar = function(seletor_tabela, formato){
	var $conteiner_tabela;
	if(typeof seletor_tabela == 'undefined'){
		$conteiner_tabela = $('div.tabelaaberta');
	} else {
		$conteiner_tabela = $('#' + seletor_tabela);
	}
	mostraCarregando();
	$conteiner_tabela.first().find('table.dataTable').each(function(){
		var $tabela = $(this);
		var objeto_tabela = $tabela.DataTable();
		objeto_tabela.button(formato).trigger();
	});
	setTimeout(ocultaCarregando, 1000);
}

tabela.imprimir = function(seletor_tabela){
	tabela.exportar(seletor_tabela, 0);
}

/**
 *  Plug-in offers the same functionality as `full_numbers` pagination type 
 *  (see `pagingType` option) but without ellipses.
 *
 *  See [example](http://www.gyrocode.com/articles/jquery-datatables-pagination-without-ellipses) for demonstration.
 *
 *  @name Full Numbers - No Ellipses
 *  @summary Same pagination as 'full_numbers' but without ellipses
 *  @author [Michael Ryvkin](http://www.gyrocode.com)
 *
 *  @example
 *    $(document).ready(function() {
 *        $('#example').dataTable( {
 *            "pagingType": "full_numbers_no_ellipses"
 *        } );
 *    } );
 */

$.fn.DataTable.ext.pager.full_numbers_no_ellipses = function(page, pages){
	var numbers = [];
	var buttons = $.fn.DataTable.ext.pager.numbers_length;
	var half = Math.floor( buttons / 2 );
	var _range = function ( len, start ){
		var end;
		if ( typeof start === "undefined" ){ 
			start = 0;
			end = len;
		} else {
			end = start;
			start = len;
		}
		var out = []; 
		for ( var i = start ; i < end; i++ ){ out.push(i); }
		return out;
	};
	if ( pages <= buttons ) {
		numbers = _range( 0, pages );
	} else if ( page <= half ) {
		numbers = _range( 0, buttons);
	} else if ( page >= pages - 1 - half ) {
		numbers = _range( pages - buttons, pages );
	} else {
		numbers = _range( page - half, page + half + 1);
	}
	numbers.DT_el = 'span';
	return [ 'first', 'previous', numbers, 'next', 'last' ];
};