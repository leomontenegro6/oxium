/* Plugin de campos Select e Autocomplete
 * 
 * Baseado no componente "Select2" (https://select2.github.io/),
 * em conjunto com estilizações nos padrões do Bootstrap.
 * 
 * Dependências:
 * - select2.min.css
 * - select2.min.js
 * 
 * Funções adicionadas:
 *	select.instanciar( [ seletor_campo ] , [ escopo ] )
 *	select.setarFoco( campo_select )
 *	select.limpar( campo_select )
 *	select.sessaoExpirada(  )
 *	select.erro( msg_erro )
 */

function select(){}

select.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).filter(':visible').not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("select.select").filter(':visible').not("[data-instanciado='true']");
	}
	var dispositivo = getDispositivo();
	busca.each(function(){
		var $select = $(this);
		var temPaginaAjax, pagina, limite_registros, temFiltro, temTags, campoMultiplo, limite_caracteres, naoTemLimite;
		
		// Obtenção da página ao qual o componente fará requisições Ajax, para obter registros.
		// Se não existir, o componente utilizará as próprias opções como fonte de dados.
		if(($select.is("[data-pagina]") && ($.trim( $select.attr('data-pagina') ) != ''))){
			temPaginaAjax = true;
			pagina = $select.attr('data-pagina');
		} else {
			temPaginaAjax = false;
			pagina = '';
		}
		
		// Obtenção do limite de registros a ser exibidos na tabela
		if(($select.is("[data-limite]") && ($.trim( $select.attr('data-limite') ) != ''))){
			limite_registros = $select.attr('data-limite');
			if(limite_registros == '-1'){
				naoTemLimite = true;
			} else {
				naoTemLimite = false;
			}
		} else {
			limite_registros = 50;
			naoTemLimite = false;
		}
		
		// Obtenção do parâmetro de filtro de busca
		if(($select.is("[data-filtro]"))){
			if($select.attr('data-filtro') == 'true'){
				temFiltro = true;
			} else if($select.attr('data-filtro') == 'false'){
				temFiltro = false;
			} else {
				temFiltro = undefined;
			}
		} else {
			temFiltro = undefined;
		}
		
		// Verificando se o campo é múltiplo
		if($select.is('[multiple]')){
			campoMultiplo = true;
		} else {
			campoMultiplo = false;
		}
		
		// Obtenção do parâmetro de ativação de tags
		if($select.is("[data-tags]") && ($.trim( $select.attr("data-tags") ) == 'true')){
			temTags = true;
		} else {
			temTags = false;
		}
		
		// Obtenção do parâmetro de limite de caracteres (apenas para campos com página ajax)
		if(temPaginaAjax && ($select.is("[data-limite-caracteres]") && !isNaN($select.attr("data-limite-caracteres")))){
			limite_caracteres = $select.attr('data-limite-caracteres');
		} else {
			limite_caracteres = 3;
		}
		
		// Se o campo for múltiplo, inserir colchetes no atributo 'name',
		// para que os valores sejam enviados corretamente ao servidor
		if(campoMultiplo){
			var nome = ( $select.attr('name') ).replace(/\[.*\]/g,'');
			$select.attr('name', nome + '[]');
		}
		
		// Definindo se haverá ou não delay de busca, ao digitar caracteres em um campo com filtro
		var delay_digitacao_caracteres;
		if((temPaginaAjax && (temFiltro !== false)) || (temPaginaAjax && temTags) || (temPaginaAjax && campoMultiplo)){
			delay_digitacao_caracteres = (1 * 1000);
		} else {
			delay_digitacao_caracteres = 0;
		}
		
		// Definindo atributo 'id' para o campo, caso não exista
		var id_campo;
		if( $select.is("[id]") ){
			id_campo = $select.attr('id');
		} else {
			id_campo = gerarIdAleatorio($select[0]);
			$select.attr('id', id_campo);
		}
		
		// Verificando se o campo possui rótulo associado a este
		var $rotulo = $("label[for='" + id_campo + "']");
		var temRotulo = ($rotulo.length > 0);
		
		// Parâmetros de instanciação do campo select
		var parametros = {
			// Tema padrão
			'theme': 'default',
			// Strings de tradução do componente para português
			'language': {
				errorLoading: function () {
					return 'Os resultados não puderam ser carregados.';
				},
				inputTooLong: function (args) {
					var overChars = args.input.length - args.maximum;
					var message = 'Apague ' + overChars + ' caracter';
					if (overChars != 1) {
						message += 'es';
					}
					return message;
				},
				inputTooShort: function (args) {
					var remainingChars = args.minimum - args.input.length;
					var message = 'Digite ' + remainingChars + ' ou mais caracteres';
					return message;
				},
				loadingMore: function () {
					return '<span class="loadingwheel"></span>';
				},
				maximumSelected: function (args) {
					var message = 'Você só pode selecionar ' + args.maximum + ' ite';
					if (args.maximum == 1) {
						message += 'm';
					} else {
						message += 'ns';
					}
					return message;
				},
				noResults: function () {
					return 'Nenhum resultado encontrado';
				},
				searching: function () {
					return '<span class="loadingwheel"></span>';
				}
			}
		}
		
		// Se o campo tiver página ajax, utilizá-la como fonte de dados
		if(temPaginaAjax){
			if(!temTags){
				// Em campos com página ajax, inserir opção nula, se não existir nenhuma
				var $primeiraOpcao;
				if($select.find('option').length == 0){
					if( $select.is('[required]') ){
						$primeiraOpcao = $('<option />').attr('value', '').html('Escolha uma opção');
					} else {
						$primeiraOpcao = $('<option />').attr('value', 'all').html('Todas');
					}

					$select.html($primeiraOpcao);
				} else {
					$primeiraOpcao = $select.find('option').first();
				}
				
				// Em campos com página ajax, se tiver uma opção já preselecionada, alterar valor do campo
				var $opcaoSelecionada = $select.find('option[selected]').first();
				var checkExisteOpcaoSelecionada = ($opcaoSelecionada.length > 0);
				if(checkExisteOpcaoSelecionada){
					var valor = $opcaoSelecionada.val();
					var texto = $opcaoSelecionada.text();
					
					$select.append(
						$("<option />").val(valor).text(texto)
					).val(valor).trigger('estiliza');
				}
			}
			
			// Parâmetros da requisição Ajax
			parametros.ajax = {
				// Página e tipo de dados a serem retornados.
				// É usado uma função anônima ao invés da página, para que
				// seja possível alterar seu valor dinamicamente depois.
				'url': function(){
					// Verificando se há parâmetros na página.
					// Parâmetros são IDs de campos de formulário, entre chaves.
					// Se houver, obter o valor do campo e trocá-lo.
					var busca = new RegExp('\\{(.*?)\\}', 'g');
					var resultado;
					var pagina_trocada = pagina;
					
					while(resultado = busca.exec(pagina)){
						var id_campo_formulario = resultado[1];
						var $campoFormulario = $('#'+id_campo_formulario);
						var valor_campo = $campoFormulario.val();
						if(typeof valor_campo != 'undefined'){
							pagina_trocada = pagina_trocada.replace(new RegExp('{' + id_campo_formulario + '}', 'g'), valor_campo);
						} else {
							pagina_trocada = pagina_trocada.replace(new RegExp('\\{(.*?)\\}', 'g'), '');
						}
					}
					
					return pagina_trocada;
				},
				'dataType': 'json',
				// Tempo entre a digitação de um caractere e a execução da busca
				'delay': delay_digitacao_caracteres,
				// Cacheando requisição
				'cache': true,
				// Dados a serem enviados na requisição
				'data': function (params) {
					return {
						// Texto digitado no campo de busca, se houver
						'q': params.term,
						// Limite de resultados por página
						'page_limit': limite_registros,
						// Número da página, usado na paginação do scrolling infinito
						'page': params.page
					};
				},
				// Tratamento de erros ajax
				'timeout': (60 * 1000), // Expirar requisição em 60 segundos
                'error': function (jqXHR, status, error) {
					$select.data()['select2']['$results'].html( select.erro(status) );
				},
				// Definição da paginação, em função dos resultados e do total geral de itens retornados
				'processResults': function (data, params) {
					if(typeof data.error != 'undefined'){
						// Tem erro
						if(data.error == 'expired'){
							// Sessão expirada
							return {
								results: [{
									'label': select.sessaoExpirada(),
									'disabled': true
								}]
							}
						}
					} else {
						// Página carregada normalmente
						var pagina_atual = (params.page || 1);
						// Se estiver na primeira página, o campo não for obrigatório e não tiver tags, inserir primeira opção na listagem
						if(pagina_atual == 1 && !temTags){
							data.items.unshift({
								'id': $primeiraOpcao.attr('value'),
								'label': $primeiraOpcao.html(),
								'value': $primeiraOpcao.html()
							});
						}
						
						if(naoTemLimite){
							limite_registros = data.items.length;
						}
						
						return {
							results: data.items,
							pagination: {
								more: (pagina_atual * limite_registros) < data.total
							}
						};
					}
				}
			};
			parametros.escapeMarkup = function(markup){
				return markup;
			};

			// Template de retorno de resultados
			parametros.templateResult = function(repo){
				if (repo.loading){
					return parametros['language']['searching'];
				}
				// TODO: Resolver bug de exibição de opções duplicadas, se o campo tiver tags
				var markup;
				if(temTags && typeof repo.text != 'undefined'){
					markup = upper(repo.text);
				} else if(typeof repo.label != 'undefined'){
					markup = repo.label;
				} else {
					markup = repo.value;
				}
				return markup;
			};

			// Texto que vai pro campo select, após escolher uma opção
			parametros.templateSelection = function(repo){
				var texto_campo;
				if(temTags && repo.text != ''){
					texto_campo = upper(repo.text);
				} else if(typeof repo.value != 'undefined'){
					texto_campo = repo.value;
				} else if(typeof repo.text != 'undefined'){
					texto_campo = repo.text;
				} else {
					var $opcao_vazia = $select.find('option').first();
					texto_campo = $opcao_vazia.html();
				}
				return texto_campo;
			};
			
			// Definindo regras de exibição do filtro de busca para campos
			// com página ajax, em função do parâmetro "data-filtro".
			if(temFiltro == true){
				// Sempre exibir
				parametros.minimumResultsForSearch = 1;
				parametros.minimumInputLength = limite_caracteres;
			} else if(temFiltro == false){
				// Nunca exibir (Para ajax, ocultar o campo via adição da classe "sem_filtro" ao campo)
				parametros.minimumResultsForSearch = Infinity;
				parametros.theme += " sem_filtro";
			} else {
				// Se o parâmetro não tiver sido passado, exibir filtro apenas
				// para dispositivos maiores que um celular, ou que tenham tags
				if(dispositivo != 'xs' || temTags){
					// Sempre exibir
					parametros.minimumResultsForSearch = 1;
					parametros.minimumInputLength = limite_caracteres;
				} else {
					// Nunca exibir (Para ajax, ocultar o campo via adição da classe "sem_filtro" ao campo)
					parametros.minimumResultsForSearch = Infinity;
					parametros.theme += " sem_filtro";
				}
			}
		} else {
			// Definindo regras de exibição do filtro de busca para campos
			// sem página ajax, em função do parâmetro "data-filtro".
			if(temFiltro == true){
				// Sempre exibir
				parametros.minimumResultsForSearch = 1;
			} else if(temFiltro == false){
				// Nunca exibir
				parametros.minimumResultsForSearch = Infinity;
			} else {
				// Se o parâmetro não tiver sido passado, seguir o fluxo:
				// 1. Se usuário estiver acessando por um celular, nunca exibir
				// 2. Se usuário estiver acessando por um dispositivo maior que um celular,
				//	  exibir apenas se o campo tiver pelo menos 10 opções
				if(dispositivo != 'xs'){
					parametros.minimumResultsForSearch = 10;
				} else {
					parametros.minimumResultsForSearch = Infinity;
				}
			}
		}
		
		// Definir largura do campo via tags style, para
		// apoiar design responsivo.
		$select.css('width', '100%');
		
		// Inserindo eventos adicionais
		$select.on({
			// Close: Chamado após o campo ser fechado
			'select2:close': function(){
				if(temPaginaAjax){
					// Se o campo tiver página ajax, limpar manualmente o contêiner
					// de listagem de opções, para evitar bug onde as opções da
					// busca anterior são listadas antes da busca de fato ocorrer.
					var $results = $select.data()['select2']['$results'];
					$results.html('');
				}
			},
			// Estiliza: Evento customizado, usado para atualizar valor do campo
			// sem precisar chamar o evento "onchange", o que em alguns contextos
			// pode gerar erro de encadeamento infinito de eventos (stack overflow)
			'estiliza': function(){
				var objeto = $select.data()['select2'];
				objeto.dataAdapter.current(function (data) {
					objeto.trigger('selection:update', {
						data: data
					});
				});
			}
		});
		
		// Instanciação do componente
		$select.select2(parametros);
		
		// Adicionando animação fadein via CSS
		$select.data()['select2']['$dropdown'].children().addClass('fadein');
		
		// Associando evento de clique ao rótulo do campo, se houver.
		if(temRotulo){
			$rotulo.removeAttr('for').css('cursor', 'pointer').on('click', function(){
				select.setarFoco( $select );
			})
		}
		
		// Adicionando suporte a atributo "autofocus"
		if($select.is('[autofocus]')){
			$select.removeAttr('autofocus');
			setTimeout(function(){
				select.setarFoco($select);
			}, 25);
		}
		
		// Inserir atributo que impede desta função atuar sobre o campo select
		// duas vezes, de modo a evitar bugs.
		$select.attr('data-instanciado', 'true');
	});
}

select.setarFoco = function(select){
	var $select = $(select);
	// Obtenção do parâmetro de ativação de tags
	var temTags = ($select.is("[data-tags]") && ($select.attr("data-tags") == 'true'));
	if(temTags){
		// É campo com tags, abrir normalmente com o método "open"
		$select.select2("open");
	} else {
		// É campo comum, setar foco no contêiner do campo
		var id_campo = $select.attr('id');
		var $campo_instanciado = $select.next().find("span[aria-labelledby='select2-" + id_campo + "-container']");
		$campo_instanciado.focus();
	}
}

select.setarValor = function(select, valor, texto){
	var $select = $(select);
	var checkTemPaginaAjax = (($select.is("[data-pagina]") && ($.trim( $select.attr('data-pagina') ) != '')));
	var checkExisteOpcaoComValor = ($select.find("option[value='" + valor + "']").length > 0);

	if(checkTemPaginaAjax && !checkExisteOpcaoComValor){
		$select.append("<option value='" + valor + "'>" + texto + "</option>");
	}
	
	$select.val(valor).trigger('estiliza');
}

select.atualizar = function(select, callback){
	var $select = $(select);
	$select.trigger('estiliza');
	if(callback) callback();
}

select.limpar = function(select){
	var $select = $(select);
	var $primeiraOpcao = $select.find('option').first();
	var valor_primeira_opcao = $primeiraOpcao.val();

	var checkTemPaginaAjax = (($select.is("[data-pagina]") && ($.trim( $select.attr('data-pagina') ) != '')));
	if(checkTemPaginaAjax){
		$select.find('option').not($primeiraOpcao).remove();
	}

	$select.val(valor_primeira_opcao).trigger('change');
}

select.fechar = function(select){
	var $select = $(select);
	$select.select2('close');
}

select.sessaoExpirada = function(){
	return $('<div />').addClass('sessao_expirada').append(
		$('<h4 />').html('Sessão Expirada.')
	).append(
		$('<p />').html('Por questão de segurança, o tempo de sessão é definido em 10 minutos a partir de sua última ação.')
	);
}

select.erro = function(msg){
	if(typeof msg != 'undefined'){
		msg = 'Erro: ' + msg;
	} else {
		msg = 'Erro';
	}
	return $('<li />').addClass('select2-results__option').attr({
		'role': 'treeitem',
		'aria-disabled': 'true'
	}).html(msg);
}