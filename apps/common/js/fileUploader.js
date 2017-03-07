/* Plugin de campos de upload de arquivos
 * 
 * Biblioteca JavaScript (e jQuery) desenvolvida para auxiliar no envio de arquivos
 * em formulários HTML para servidores PHP. Possui suporte a envio de arquivos
 * via Ajax, com suporte a barra de progresso, limitação por tamanho e extensão
 * de arquivos, e eventos diversos que são acionados após determinadas operações.
 * 
 * Em navegadores antigos, principalmente Internet Explorer 7, 8 e 9), o envio
 * é feito através de Iframes. Isso se dá porque estes navegadores não possuem
 * suporte às especificações XmlHttpRequest v2, principais responsáveis por possibilitar
 * o envio de arquivos em formulários via Ajax. Nesses casos, o envio transcorrerá
 * normalmente, exceto pelo fato de não ser possível determinar o progresso do envio,
 * e que os arquivos serão enviados a velocidades inferiores às do novo método de envio
 * adotado por navegadores modernos.
 * 
 * Seu funcionamento é simples: Todo campo de formulário de tipo arquivo (<input type='file' />),
 * que possua classe "fileuploader", é capturado por este plug-in, e tem seu
 * visual reformulado e reprogramado. Sua programação é feita de modo a enviar arquivos
 * ao servidor antes da submissão principal do formulário ao qual está associado.
 * Os arquivos são enviados primeiro, salvos temporariamente no diretório "/tmp" do
 * servidor. Ao fim do envio de cada arquivo, é retornado ao cliente o caminho do
 * arquivo no servidor, na forma de campos de formulário ocultos, que o servidor recebe
 * após a submissão do formulário. Tendo em mãos o caminho do arquivo, é possível
 * obter o arquivo no lado do servidor, e efetuar tratamentos posteriores.
 * 
 * Dependências:
 * - Componente Boostrap Progressbar
 * - Estilizações do campo, nos arquivos CSS
 *
 * Funções adicionadas:
 *	fileUploader.instanciar( [ seletor_tabela ] , [ escopo ] )
 */

function fileUploader(){}

// Propriedades globais
fileUploader.upl = {
	'suporta_xhr2_upload': (new XMLHttpRequest().upload),
	'timeout_iframe': [],
	'dispositivo': '',
	'campos': [{}]
}

// Métodos
fileUploader.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("[type='file']").filter('.fileuploader').not("[data-instanciado='true']");
	}
	
	// Constantes utilizadas pelo componente
	var upl = this.upl;
	upl.dispositivo = getDispositivo();
	
	busca.each(function(i){
		var $campo = $(this);
		
		// Definindo atributo 'id' para o campo, caso não exista
		var id;
		if($campo.is('[id]')){
			id = $campo.attr('id');
		} else {
			id = gerarIdAleatorio($campo);
			$campo.attr('id', id);
		}
		
		// Verificando se o campo possui rótulo associado a este
		var $rotulo = $("label[for='" + id + "']");
		var temRotulo = ($rotulo.length > 0);
		
		// Definindo parâmetros específicos de cada campo
		upl.campos[id] = {
			'nome_campo': $campo.attr("name"),
			'lista_arquivos': [],
			'array_arquivos_bloqueados': false,
			'arquivos_sendo_enviados': 0,
			'multiplos_arquivos': $campo.is("[multiple]"),
			'iniciado_com_valor': false
		};
		
		// Remover atributo "multiple" se estiver acessando em navegador antigo, sem suporte a xhr2
		if (!upl.suporta_xhr2_upload) {
			$campo.removeAttr("multiple");
		}
		
		// Remover atributo "name" do campo, e salvar seu valor para incluir nos inputs ocultos gerados pelo campo
		$campo.removeAttr('name');
		
		if(i == 0){
			// Evitar que o navegador abra o arquivo em drag 'n drop, se o mesmo for arrastado
			// para uma área fora do campo de envio de arquivos
			$(window).on("dragover drop", function(){
				event.preventDefault();
			});
		}

		var $form = $campo.closest("form");
		if( $form.is("[enctype]") ) $form[0].removeAttribute("enctype");
		if( $form.is("[encoding]") ) $form[0].removeAttribute("encoding");
		
		// Alterando visual padrão do campo de tipo arquivo
		if(upl.suporta_xhr2_upload){
			if($campo.next().is("br")) $campo.next().remove();

			$campo.attr('tabindex', '-1').removeAttr("size").wrap(
				$("<div />").addClass("fileuploader")
			).wrap(
				$("<div />").addClass("conteiner_input")
			);
			var $conteiner = $campo.closest("div.fileuploader");
			$conteiner.append(
				$("<div />").addClass("titulo")
			).append(
				$("<div />").addClass("conteudo")
			);
			$conteiner.find(".titulo").html(
				$("<button />", {'type': 'button'}).addClass("btn btn-default escolher_arquivo").html(
					$("<span />").addClass("glyphicon glyphicon-plus")
				).append(
					$("<span />").addClass("rotulo").html("Escolher Arquivo" + ((upl.campos[id].multiplos_arquivos) ? ("s") : ("")))
				).on({
					'click': function(){
						if( !( $campo.is(":disabled") || $campo.is("[readonly]")) ){
							$campo.click();
						} else {
							var $el, msg, pos;
							if( $campo.is("[readonly]") ){
								$el = $conteiner;
								msg = "O campo está em modo somente leitura.";
								pos = 't';
							} else if(upl.campos[id].arquivos_sendo_enviados > 0){
								$el = $conteiner;
								msg = "Um ou mais arquivos estão sendo enviados ao servidor. Por favor, aguarde sua conclusão.";
								pos = 't';
							} else if( $conteiner.find(".conteiner_arquivo tbody tr.arquivo_valido").length > 0 ) {
								$el = $conteiner.find(".conteiner_arquivo tbody tr.arquivo_valido").last().find("button.remover_arquivo");
								msg = "Remova este arquivo antes!";
								if(upl.dispositivo == 'xs'){
									pos = 't';
								} else {
									pos = 'r';
								}
							} else {
								$el = $conteiner;
								msg = "O campo está desativado";
								pos = 't';
							}
							aviso($el, msg, 10, pos);
						}
					},
					'keydown': function(e){
						if($.inArray(e.which, [13, 32]) >= 0){
							var $botao = $(this);
							$botao.addClass('ativo');					
							e.preventDefault();
						}
					},
					'keyup': function(e){
						if($.inArray(e.which, [13, 32]) >= 0){
							var $botao = $(this);
							$botao.removeClass('ativo').click();
							e.preventDefault();
						}
					}
				})
			);
		}

		// Montando estrutura visual de arquivos a serem enviados ao servidor
		$campo.on('change', function(evento){
			if(upl.campos[id].arquivos_sendo_enviados <= 0){
				// Chamando evento "OnUploadStart"
				var callback_onuploadstart = function(upl){
					eval( ($campo.is("[data-onuploadstart]")) ? ($campo.attr("data-onuploadstart")) : ("") );
				};
				callback_onuploadstart(upl);
			}
			fileUploader.guardaArquivo($campo, evento);
		});

		$conteiner.on({
			dragenter: function(e){
				if( !$conteiner.is("[id]") ){
					$conteiner.attr("id", gerarIdAleatorio(this));
				}
				aviso($conteiner.attr("id"), "Solte o arquivo aqui, para inseri-lo.", 10, "t")
				return false;
			},
			dragover: function(e){
				return false;
			},
			drop: function(e){
				removerAviso( $conteiner.attr("id") );
				var files = e.originalEvent.dataTransfer.files;
				fileUploader.guardaArquivoDragDrop(files, $campo);
				return false;
			}
		})

		// Criando estrutura padrão, no caso do campo já possuir um arquivo
		if( $campo.is("[data-value]") && $campo.attr("data-value") != "" ){
			if(!upl.campos[id].multiplos_arquivos) $campo.attr("disabled", "disabled");
			upl.campos[id].iniciado_com_valor = true;
			fileUploader.mostrarArquivosExistentes($campo);
		}
		
		// Associando evento de clique ao rótulo do campo, se houver.
		if(temRotulo){
			$rotulo.removeAttr('for').css('cursor', 'pointer').on('click', function(){
				fileUploader.setarFoco( $campo );
			})
		}
		
		// Inserir atributo que impede desta função atuar sobre o calendario
		// duas vezes, de modo a evitar bugs.
		$campo.attr('data-instanciado', 'true');
	});
}

fileUploader.setarFoco = function(campo){
	var $conteiner = $(campo).closest('div.fileuploader');
	$conteiner.find('button.escolher_arquivo').trigger('focus');
}

fileUploader.limpar = function(campo){
	var $campo = $(campo);
	var $tabela_arquivos;
	$tabela_arquivos = $campo.closest("div.fileuploader").find("table.conteiner_arquivo");
	$tabela_arquivos.find("tbody>tr.arquivo_valido").each(function(){
		var $tr = $(this);
		$tr.children("td.acoes").children("button.remover_arquivo").click();
	})
}

fileUploader.retiraAtributoRequiredCampo = function(campo){
	var $campo = $(campo);
	if(!$campo.is("[data-required-old]")){
		if($campo.is("[required]")){
			$campo.attr("data-required-old", $campo[0].getAttribute("required") ).removeAttr("required")
		}
	}
}

fileUploader.repoeAtributoRequiredCampo = function(campo){
	var $campo = $(campo);
	if($campo.is("[data-required-old]")){
		$campo[0].setAttribute("required", $campo.attr("data-required-old"));
		$campo.removeAttr("data-required-old");
	}
}

fileUploader.obterTamanhoArquivoViaActiveX = function(campo){
	var tamanho;
	try{
		var objetoFS = new ActiveXObject("Scripting.FileSystemObject");
		var arquivo_objeto = objetoFS.getFile(campo[0].value);
		tamanho = arquivo_objeto.size;
	} catch(e){
		tamanho = 0;
	}
	return tamanho;
}

fileUploader.guardaArquivo = function(campo, evento){
	var upl = this.upl;
	var id = $(campo).attr('id');
	if(upl.campos[id].array_arquivos_bloqueados){
		fileUploader.guardaArquivo(campo);
	} else {
		upl.campos[id].array_arquivos_bloqueados = true;
		if(upl.suporta_xhr2_upload){
			$.each(campo[0].files, function(i, f){
				upl.campos[id].lista_arquivos[ upl.campos[id].lista_arquivos.length ] = f;
			})
		} else {
			upl.campos[id].lista_arquivos[ upl.campos[id].lista_arquivos.length ] = evento.target.value;
		}
		upl.campos[id].array_arquivos_bloqueados = false;
		fileUploader.processarArquivo(campo);
	}
}

fileUploader.guardaArquivoDragDrop = function(arquivosArrastados, campo){
	var upl = this.upl;
	var id = $(campo).attr('id');
	if(upl.campos[id].array_arquivos_bloqueados){
		fileUploader.guardaArquivoDragDrop(campo);
	} else {
		upl.campos[id].array_arquivos_bloqueados = true;
		var arquivos_enviados = campo.closest("div.fileuploader").find(".conteiner_arquivo tbody>tr.arquivo_valido");
		$.each(arquivosArrastados, function(i, f){
			if(!upl.campos[id].multiplos_arquivos && arquivos_enviados.length > 0){
				aviso( arquivos_enviados.last().find("td:last-child"), "Remova este arquivo antes!", 10, "r" )
				return false;
			} else {
				upl.campos[id].lista_arquivos[ upl.campos[id].lista_arquivos.length ] = f;
			}
		})
		upl.campos[id].array_arquivos_bloqueados = false;
		fileUploader.processarArquivo(campo);
	}
}

fileUploader.criarBarraProgresso = function(valor, rotulo){
	if(typeof valor == 'undefined') valor = 0;
	if(typeof rotulo == 'undefined') rotulo = valor + '%';
	return $("<div />").addClass("progress").html(
		$("<div />").addClass("progress-bar progress-bar-success").attr({
			'role': 'progressbar',
			'aria-valuenow': valor,
			'aria-valuemin': '0',
			'aria-valuemax': '100',
		}).css('width', valor + '%').html(rotulo)
	)
}

fileUploader.ativarAnimacaoBarraProgresso = function(barraProgresso){
	var $barraProgresso = barraProgresso;
	$barraProgresso.addClass('progress-bar-striped active');
}

fileUploader.desativarAnimacaoBarraProgresso = function(barraProgresso){
	var $barraProgresso = barraProgresso;
	$barraProgresso.removeClass('progress-bar-striped active');
}

fileUploader.atualizarBarraProgresso = function(barraProgresso, valor, rotulo){
	if(typeof valor == 'undefined') valor = 0;
	var porcentagem = valor + '%';
	if(typeof rotulo == 'undefined') rotulo = porcentagem;
	var $barraProgresso = barraProgresso;
	$barraProgresso.attr('aria-valuenow', valor).css('width', porcentagem).html(rotulo);
}

fileUploader.serializarTamanhoArquivo = function(tamanho, abreviar){
	tamanho = parseInt(tamanho, 10);
	var unidade, tamanho_serializado;
	if(tamanho > (1024 * 1024)){
		if(abreviar) unidade = "Mb"; else unidade = "MBytes";
		tamanho_serializado = Math.floor((tamanho / (1024 * 1024)) * 100) / 100;
	} else if(tamanho <= (1024 * 1024)){
		if(abreviar) unidade = "Kb"; else unidade = "KBytes";
		tamanho_serializado = Math.floor((tamanho / (1024)) * 100) / 100;
	} else {
		if(abreviar) unidade = "B"; else unidade = "Bytes";
		tamanho_serializado = Math.floor((tamanho) * 100) / 100;
	}
	return tamanho_serializado + ' ' + unidade;
}

fileUploader.mostrarArquivosExistentes = function(campo){
	var upl = this.upl;
	var $campo = campo;
	var $conteiner = $campo.closest("div.fileuploader");
	var id = $campo.attr('id');
	var nome_arquivo = $campo.attr("data-value");
	var tamanho_arquivo;
	if($campo.is("[data-tamanho-arquivo]")){
		tamanho_arquivo = fileUploader.serializarTamanhoArquivo( (parseFloat($campo.attr("data-tamanho-arquivo")) * 1024), true );
	} else {
		tamanho_arquivo = '---';
	}
	var id = $campo.attr('id');
	if( $('#' + id + "_tabela_arquivo").length == 0 ){
		var tabela = "<table id='"+id+"_tabela_arquivo' class='table table-bordered conteiner_arquivo'><tbody></tbody></table>";
		if(upl.suporta_xhr2_upload){
			$conteiner.find(".conteudo").html(tabela);
		} else {
			$campo.after(tabela);
			$("#"+id+"_tabela_arquivo").css("marginTop", "3px");
		}
	}
	var posicao;
	if($campo.is("[data-posicao-tr]")){
		posicao = parseInt($($campo).attr("data-posicao-tr"), 10) + 1;
	} else {
		posicao = 0;
	}
	$campo.attr("data-posicao-tr", posicao);
	
	var id_tr = id + '_' + $campo.attr("data-posicao-tr");
	var arquivo = nome_arquivo.split("/").pop();
	
	var $botaoEscolherArquivo = $conteiner.children('.titulo').children('button.escolher_arquivo');
	
	var $botaoRemover = $('<button />', {'type': 'button'}).attr({
		"id": id_tr+"_remover",
		"title": "Remover arquivo",
		'tabindex': '0'
	}).addClass('btn btn-default remover_arquivo').html(
		$("<img />", {"src": "../common/icones/cross.png", "alt": "Remover"})
	);
	
	var $tr_arquivo = $("<tr />", {"id": id_tr}).addClass("arquivo_valido fadein").append(
		$("<td />").addClass("tipo")
	).append(
		$("<td />").addClass("dados").append(
			$('<div />').addClass('barra_progresso').html( fileUploader.criarBarraProgresso(100, 'Enviado') )
		).append(
			$('<div />').addClass('nome').attr('title', 'Nome: ' + arquivo).prepend(
				$('<span />').addClass('rotulo').html('Nome:')
			).append(
				$('<span />').addClass('valor').html(arquivo)
			)
		).append(
			$('<div />').addClass('tamanho').attr('title', 'Tamanho: ' + tamanho_arquivo).prepend(
				$('<span />').addClass('rotulo').html('Tamanho:')
			).append(
				$('<span />').addClass('valor').html(tamanho_arquivo)
			)
		)
	).append(
		$("<td />").addClass("acoes").append( $botaoRemover )
	);
	
	$("#" + id + "_tabela_arquivo tbody").append( $tr_arquivo );
	$botaoRemover.on('click', function(){
		$tr_arquivo.fadeOut("fast", function(){
			if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
				fileUploader.repoeAtributoRequiredCampo( $campo );
				if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
				$campo.val("").removeAttr("data-value");
			}
			$tr_arquivo.remove();
			if(upl.suporta_xhr2_upload){
				$botaoEscolherArquivo.focus();
			} else {
				$campo.focus();
			}
		});
	})
	var nome_campo = upl.campos[id]['nome_campo'];
	if(upl.campos[id].multiplos_arquivos){
		nome_campo += '[' + posicao + ']';
	}
	$tr_arquivo.children("td.acoes").append(
		$("<input />", {"type": "hidden", "name": nome_campo + "[acao]", "value": "nenhuma"})
	);
	fileUploader.mostrarTipoArquivo({name: nome_arquivo}, $campo, id_tr);
	var callback_onfileprocess = function(upl, arquivo_tr){
		eval( ($campo.is("[data-onfileprocess]")) ? ($campo.attr("data-onfileprocess")) : ("") );
	};
	callback_onfileprocess(upl, $tr_arquivo );
}

fileUploader.processarArquivo = function(campo){
	var upl = this.upl;
	var $campo = campo;
	var $conteiner = $campo.closest("div.fileuploader");
	var formatos = ($campo.is("[data-formatos]")) ? ($campo.attr("data-formatos").replace(/ /g, "").split(",")) : ("todos");
	var tamanhoLimite = ($campo.is("[data-tamanho-limite]")) ? (parseInt($campo.attr("data-tamanho-limite"), 10)) : (0);
	var id = $campo.attr('id');
	if( $('#' + id + "_tabela_arquivo").length == 0 ){
		var tabela = "<table id='"+id+"_tabela_arquivo' class='table table-bordered conteiner_arquivo'><tbody></tbody></table>";
		if(upl.suporta_xhr2_upload){
			$conteiner.find(".conteudo").html(tabela);
		} else {
			$campo.after(tabela);
		}
	}
	while(upl.campos[id].lista_arquivos.length > 0){
		fileUploader.retiraAtributoRequiredCampo($campo);
		upl.campos[id].arquivos_sendo_enviados++;
		
		var posicao;
		if($campo.is("[data-posicao-tr]")){
			posicao = parseInt($($campo).attr("data-posicao-tr"), 10) + 1;
		} else {
			posicao = 0;
		}
		$campo.attr("data-posicao-tr", posicao);
		var id_tr = id + '_' + $campo.attr("data-posicao-tr");
		var arquivo = upl.campos[id].lista_arquivos[0];
		upl.campos[id].lista_arquivos.shift();
		
		var extensao, erro = false, mensagem_erro = "";
		if(upl.suporta_xhr2_upload){
			extensao = ((arquivo.name).split(".").pop()).toLowerCase();
		} else {
			extensao = (arquivo.split(".").pop()).toLowerCase();
		}
		if(formatos != "todos" && $.inArray(extensao, formatos) < 0){
			erro = true;
			mensagem_erro = "Formato não suportado!";
		} else {
			var tamanho = arquivo.size;
			var tipo = arquivo.type;
			if(upl.suporta_xhr2_upload && tamanho == 0){
				erro = true;
				mensagem_erro = "Arquivo não pode ser nulo!"
			} else if(tamanhoLimite != 0 && tamanho > tamanhoLimite){
				erro = true;
				mensagem_erro = "Tamanho do arquivo ultrapassa limite de " + fileUploader.serializarTamanhoArquivo(tamanhoLimite, true) + "!";
			} else if(!upl.campos[id].multiplos_arquivos && (upl.campos[id].arquivos_sendo_enviados > 1 || $campo.is(":disabled"))){
				erro = true;
				mensagem_erro = "Apenas um arquivo pode ser enviado!";
			} else if(tipo == "" && tamanho > 0 && tamanho % 4096 == 0){
				erro = true;
				mensagem_erro = "Diretórios não são aceitos!";
			}
		}
		if(!upl.campos[id].multiplos_arquivos) $campo.attr("disabled", "disabled");
		var nome_arquivo = (upl.suporta_xhr2_upload) ? (arquivo.name) : ((arquivo.split("\\")).pop());
		var tamanho_arquivo = (tamanho > 0) ? (fileUploader.serializarTamanhoArquivo(tamanho, true)) : ("---");
		
		var $tr_arquivo;
		if(!erro){
			$tr_arquivo = $("<tr />", {"id": id_tr}).addClass("arquivo_valido").attr('data-posicao', posicao).append(
				$("<td />").addClass("tipo")
			).append(
				$("<td />").addClass("dados").append(
					$('<div />').addClass('barra_progresso').html( fileUploader.criarBarraProgresso(0) )
				).append(
					$('<div />').addClass('nome').attr('title', 'Nome: ' + nome_arquivo).prepend(
						$('<span />').addClass('rotulo').html('Nome:')
					).append(
						$('<span />').addClass('valor').html(nome_arquivo)
					)
				).append(
					$('<div />').addClass('tamanho').attr('title', 'Tamanho: ' + tamanho_arquivo).prepend(
						$('<span />').addClass('rotulo').html('Tamanho:')
					).append(
						$('<span />').addClass('valor').html(tamanho_arquivo)
					)
				)
			).append(
				$("<td />").addClass("acoes").append(
					$('<button />', {'type': 'button'}).attr({
						'id': id_tr + "_remover",
						'title': "Remover arquivo",
						'tabindex': '0'
					}).addClass('btn btn-default remover_arquivo').html(
						$("<img />", {"src": "../common/icones/cross.png", "alt": "Remover"})
					)
				)
			)
			
			$("#" + id + "_tabela_arquivo>tbody").append( $tr_arquivo );
			fileUploader.mostrarTipoArquivo(arquivo, $campo, id_tr);
			// Chamando evento "OnFileProcess"
			var callback_onfileprocess = function(upl, arquivo_tr){
				eval( ($campo.is("[data-onfileprocess]")) ? ($campo.attr("data-onfileprocess")) : ("") );
			};
			callback_onfileprocess(upl, $tr_arquivo );
			fileUploader.enviarArquivo(arquivo, campo, id_tr);
		} else {
			if(upl.campos[id].multiplos_arquivos){
				$tr_arquivo = $("<tr />", {"id": id_tr}).addClass("arquivo_invalido").attr('data-posicao', posicao).append(
					$("<td />").addClass('tipo')
				).append(
					$("<td />").addClass('dados').attr('title', nome_arquivo).html("<div class='nome'><span class='valor'>"+nome_arquivo+"</span></div>")
				).append(
					$("<td />", {"align": "center"}).css("color", "red").html(mensagem_erro)
				);
				
				$("#" + id + "_tabela_arquivo>tbody").append( $tr_arquivo );
				$tr_arquivo.children("td").delay(10000).fadeOut("slow", function(){ $(this).remove() })
			} else {
				jAlert(mensagem_erro);
			}
			if(!upl.suporta_xhr2_upload){
				var $campoClone = $campo.clone().removeAttr('id data-instanciado');
				$campo.after($campoClone).remove();
				$campo = $campoClone.attr('id', gerarIdAleatorio($campoClone));
				if(upl.campos[id].multiplos_arquivos) $campo.attr("multiple", "multiple");
				fileUploader.instanciar( $campo.attr('id') );
			} else {
				$campo.val("");
			}
			upl.campos[id].arquivos_sendo_enviados--;
			if(!upl.campos[id].multiplos_arquivos && upl.campos[id].arquivos_sendo_enviados == 0) $campo.removeAttr("disabled");
			if(upl.campos[id].arquivos_sendo_enviados == 0){
				if( $("#" + id + "_tabela_arquivo tbody tr").filter(".arquivo_valido").length == 0 ){
					fileUploader.repoeAtributoRequiredCampo($campo);
				}
			}
			fileUploader.mostrarTipoArquivo({name: nome_arquivo}, $campo, id_tr);
		}
	}
}

fileUploader.enviarArquivo = function(arquivo, campo, id_tr){
	var upl = this.upl;
	var $campo = $(campo);
	var id = $campo.attr('id');
	var nome_campo = upl.campos[id]['nome_campo'];
	var $conteiner = $campo.closest("div.fileuploader");
	var tamanhoLimite = ($campo.is("[data-tamanho-limite]")) ? (parseInt($campo.attr("data-tamanho-limite"), 10)) : (0);
	var callback_onfileremove = function(upl, arquivo_tr){
		eval( ($campo.is("[data-onfileremove]")) ? ($campo.attr("data-onfileremove")) : ("") );
	};
	var callback_onfilecomplete = function(upl, arquivo_tr){
		eval( ($campo.is("[data-onfilecomplete]")) ? ($campo.attr("data-onfilecomplete")) : ("") );
	};
	var callback_onuploadcomplete = function(upl, arquivo_tr){
		eval( ($campo.is("[data-onuploadcomplete]")) ? ($campo.attr("data-onuploadcomplete")) : ("") );
	};
	var $tr_arquivo = $("#"+id_tr);
	var $barraProgresso = $tr_arquivo.find('div.progress-bar');
	var $botaoEscolherArquivo = $conteiner.children('.titulo').children('button.escolher_arquivo');
	var $botaoRemover = $tr_arquivo.find('button.remover_arquivo');
	var posicao = $tr_arquivo.attr('data-posicao');
    if (upl.suporta_xhr2_upload){
		/* Navegador novo. Enviar via XMLHttpRequest v2 */
		var xhr = new XMLHttpRequest();
		$botaoRemover.on({
			'click': function(){
				// Rotina de abortagem do envio do arquivo
				$tr_arquivo.fadeOut("fast", function(){
					if(!(xhr.readyState == 4 && xhr.status == 200)){
						xhr.abort();
						upl.campos[id].arquivos_sendo_enviados--;
					}
					if(upl.campos[id].arquivos_sendo_enviados == 0){
						if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
							fileUploader.repoeAtributoRequiredCampo( $campo );
							if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
							$campo.val("");
						}
					}
					$tr_arquivo.remove();
					$botaoEscolherArquivo.focus();
				});
				// Chamando evento "OnFileRemove"
				callback_onfileremove(upl, $tr_arquivo);
			}
		})
		xhr.upload.onerror = function(e){
			$campo.val("");
			var numero_tds = $tr_arquivo.children("td").length;
			$tr_arquivo.children("td").each(function(i){
				var $td = $(this);
				if(i == 1){
					$td.attr("colspan", numero_tds - 1).css("color", "red").html("Erro ao enviar o arquivo");
				} else if(i > 1){
					$td.remove();
				}
			})
			$tr_arquivo.delay(10000).fadeOut("slow", function(){
				upl.campos[id].arquivos_sendo_enviados--;
				if(upl.campos[id].arquivos_sendo_enviados == 0){
					if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
						fileUploader.repoeAtributoRequiredCampo( $campo );
						if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
					}
				}
				$tr_arquivo.remove();
			});
		}
		xhr.upload.onloadstart = function(e){
			fileUploader.ativarAnimacaoBarraProgresso($barraProgresso);
			fileUploader.atualizarBarraProgresso($barraProgresso, 0);
		}
		xhr.upload.onprogress = function(e){
			var porcentagem = parseInt(e.loaded*100/e.total, 10);
			fileUploader.atualizarBarraProgresso($barraProgresso, porcentagem);
		}
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) {
				// O arquivo da vez foi enviado
				var resposta = xhr.responseText;
				var info_arquivo_servidor;
				try{
					info_arquivo_servidor = $.parseJSON(resposta);
				}catch(e){
					info_arquivo_servidor = [{"error": "1", "error_msg": "Não foi possível obter retorno do servidor!"}];
				}
				var erro_xhr = (info_arquivo_servidor[0]['error'] == "1");
				if(!erro_xhr){
					var nome_servidor = info_arquivo_servidor[0]['name'];
					var caminho_servidor = info_arquivo_servidor[0]['tmp_name'];
					
					var nome_campo_formatado = nome_campo;
					if(upl.campos[id].multiplos_arquivos){
						nome_campo_formatado += '[' + posicao + ']';
					}

					$tr_arquivo.children("td.acoes").append(
						$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[acao]", "value": "cadastrar"})
					).append(
						$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[name]", "value": nome_servidor})
					).append(
						$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[tmp_name]", "value": caminho_servidor})
					)
					fileUploader.atualizarBarraProgresso($barraProgresso, 100);
					fileUploader.desativarAnimacaoBarraProgresso($barraProgresso);

					upl.campos[id].arquivos_sendo_enviados--;
					// Chamando evento "OnFileComplete"
					callback_onfilecomplete(upl, $tr_arquivo);
					// Checando se todos os arquivos foram enviados
					if(upl.campos[id].arquivos_sendo_enviados == 0){
						// Chamando evento "OnUploadComplete"
						callback_onuploadcomplete(upl, $tr_arquivo);
					}
				} else {
					$campo.val("");
					mensagem_erro = info_arquivo_servidor[0]['error_msg'];
					var numero_tds = $tr_arquivo.children("td").length;
					$tr_arquivo.children("td").each(function(i){
						var $td = $(this);
						if(i == 1){
							$td.attr("colspan", numero_tds - 1).css("color", "red").html(mensagem_erro)
						} else if(i > 1){
							$td.remove();
						}
					})
					$tr_arquivo.delay(10000).fadeOut("slow", function(){
						upl.campos[id].arquivos_sendo_enviados--;
						if(upl.campos[id].arquivos_sendo_enviados == 0){
							if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
								fileUploader.repoeAtributoRequiredCampo( $campo );
								if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
							}
						}
						$tr_arquivo.remove();
					});
				}
			}
		}
		xhr.open("POST", "upload_arquivo.php", true);
		var formData = new FormData();
		formData.append(nome_campo, arquivo);
		formData.append("name", nome_campo);
		formData.append("tamanho_limite", tamanhoLimite);
		xhr.send(formData);
	} else {
		/* Navegador antigo. Enviar via iFrame ou algo similar */
		var id_iframe = gerarIdAleatorio();
		
		var iframe;
		try {
			iframe = document.createElement("<iframe id='"+id_iframe+"' name='"+id_iframe+"'>");
		} catch (e) {
			iframe = document.createElement('iframe');
			iframe.id = id_iframe;
			iframe.name = id_iframe;
		}
		iframe = $(iframe);
		iframe.appendTo("body");
		
		var $form_arquivo = $('<form />').css("display", "none").attr({
			"action": "upload_arquivo.php",
			"method": "post",
			"enctype": "multipart/form-data",
			"encoding": "multipart/form-data",
			"target": iframe.attr("name")
		}).append(
			$("<input />", {"type": "hidden", "name": "name", "value": nome_campo})
		).append(
			$("<input />", {"type": "hidden", "name": "tamanho_limite", "value": tamanhoLimite})
		);
		var $campoClone = $campo.clone().removeAttr('id data-instanciado');
		$campo.removeAttr("disabled").after($campoClone).appendTo($form_arquivo);
		var $campo = $campoClone.attr('id', gerarIdAleatorio($campoClone));
		
		fileUploader.ativarAnimacaoBarraProgresso($barraProgresso);
		fileUploader.atualizarBarraProgresso($barraProgresso, 100, 'Enviando...');
		
		$form_arquivo.appendTo("body").submit().remove();
		if(upl.campos[id].multiplos_arquivos) $campo.attr("multiple", "multiple");
		fileUploader.instanciar( $campo.attr('id') );
		
		var mensagem_erro = "";
		var erro_timeout_iframe = function(){
			// Contador de tempo que, após x segundos, dará a requisição do iframe como inválida
			// e a removerá.
			if(mensagem_erro == "") mensagem_erro = "Tempo de requisição expirado ao tentar enviar arquivo!";
			var numero_tds = $tr_arquivo.children("td").length;
			$tr_arquivo.children("td").each(function(i){
				var $td = $(this);
				if(i == 1){
					$td.attr("colspan", numero_tds - 1).css("color", "red").html(mensagem_erro)
				} else if(i > 1){
					$td.remove();
				}
			})
			
			if($("#"+id_iframe).length > 0){
				$("#"+id_iframe).remove();
				upl.campos[id].arquivos_sendo_enviados--;
			}
			if(upl.campos[id].arquivos_sendo_enviados == 0){
				if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
					fileUploader.repoeAtributoRequiredCampo( $campo );
					if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
				}
			}
			
			$tr_arquivo.children("td").delay(10000).fadeOut("slow", function(){ $tr_arquivo.remove() });
		}
		upl.timeout_iframe[id_iframe] = setTimeout(erro_timeout_iframe, 6000*1000);
		
		$botaoRemover.on({
			'click': function(){
				clearTimeout( upl.timeout_iframe[id_iframe] );
				// Rotina de abortagem do envio do arquivo
				$tr_arquivo.children("td").fadeOut("fast", function(){
					if($("#"+id_iframe).length > 0){
						$("#"+id_iframe).remove();
						upl.campos[id].arquivos_sendo_enviados--;
					}
					if(upl.campos[id].arquivos_sendo_enviados == 0){
						if( $tr_arquivo.siblings().filter(".arquivo_valido").length == 0 ){
							fileUploader.repoeAtributoRequiredCampo( $campo );
							if(!upl.campos[id].multiplos_arquivos) $campo.removeAttr("disabled");
							$campo.focus();
						}
					}
					$tr_arquivo.remove();
				});
				// Chamando evento "OnFileRemove"
				callback_onfileremove(upl);
			}
		})
		$("#" + id_iframe).load(function(){
			// Evento acionado quando o iframe termina de carregar. Aqui, o contador anterior é removido,
			// e são obtidas informações do servidor, contendo o nome e o caminho temporários dos arquivos
			// transferidos para lá.
			clearTimeout( upl.timeout_iframe[id_iframe] );
			fileUploader.atualizarBarraProgresso($barraProgresso, 100);
			fileUploader.desativarAnimacaoBarraProgresso($barraProgresso);
			
			var resposta = $("[name='" + iframe.attr("name") + "'")[0].contentWindow.document.body.innerHTML;
			var info_arquivo_servidor;
			try{
				info_arquivo_servidor = $.parseJSON(resposta);
			}catch(e){
				info_arquivo_servidor = [{"error": "1", "error_msg": "Não foi possível obter retorno do servidor!"}];
			}
			var erro_iframe = (info_arquivo_servidor[0]['error'] == "1");
			if(!erro_iframe){
				var nome_servidor = info_arquivo_servidor[0]['name'];
				var caminho_servidor = info_arquivo_servidor[0]['tmp_name'];
				var tamanho_arquivo_transferido = fileUploader.serializarTamanhoArquivo(info_arquivo_servidor[0]['size'], true);
				
				var nome_campo_formatado = nome_campo;
				if(upl.campos[id].multiplos_arquivos){
					nome_campo_formatado += '[' + posicao + ']';
				}

				$tr_arquivo.children("td.tamanho").html(tamanho_arquivo_transferido);
				$tr_arquivo.children("td.acoes").append(
					$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[acao]", "value": "cadastrar"})
				).append(
					$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[name]", "value": nome_servidor})
				).append(
					$("<input />", {"type": "hidden", "name": nome_campo_formatado + "[tmp_name]", "value": caminho_servidor})
				)
					
				iframe.remove();
				upl.campos[id].arquivos_sendo_enviados--;
				// Chamando evento "OnFileComplete"
				callback_onfilecomplete(upl, $tr_arquivo);
				// Checando se todos os arquivos foram enviados
				if(upl.campos[id].arquivos_sendo_enviados == 0){
					// Chamando evento "OnUploadComplete"
					callback_onuploadcomplete(upl);
				}
			} else {
				mensagem_erro = info_arquivo_servidor[0]['error_msg'];
				erro_timeout_iframe();
			}
		});
	}
}

fileUploader.mostrarTipoArquivo = function(arquivo, campo, id_tr){
	var $campo = $(campo);
	var id = $campo.attr('id');
	var extensao;
	if(typeof arquivo.name != 'undefined'){
		extensao = (arquivo.name).split('.').pop();
	} else {
		extensao = '';
	}
	var $tr_arquivo = $("#"+id_tr);
	if($tr_arquivo.length > 0){
		var upl = this.upl;
		if(upl.suporta_xhr2_upload && ($.inArray(extensao, ['jpg', 'jpeg', 'png', 'gif']) >= 0) && upl.dispositivo != 'xs'){
			// Mostrar thumbnail
			if(upl.campos[id].iniciado_com_valor){
				var caminho_arquivo = arquivo.name;
				fileUploader.mostrarThumbnailImagem(id_tr, caminho_arquivo);
				upl.campos[id].iniciado_com_valor = null;
			} else {
				var reader = new FileReader();
				reader.onload = function (e) {
					var imagem = e.target.result;
					fileUploader.mostrarThumbnailImagem(id_tr, imagem);
				};
				try{ reader.readAsDataURL(arquivo) }catch(e){ };
			}
		} else {
			// Mostrar ícone da extensão do arquivo
			if(extensao == "docx") extensao = "doc";
			if(extensao == "pptx") extensao = "ppt";
			if(extensao == "xlsx") extensao = "xls";
			var icone = "../common/icones/32x32/file_extension_" + extensao + ".png";
			$tr_arquivo.find("td.tipo").html(
				$("<img />", {"src": icone}).css({"display": "inline-block", "verticalAlign": "middle"}).error(function(){
					$(this).attr("src", "../common/icones/32x32/page_white.png")
				})
			)
		}
	}
}

fileUploader.mostrarThumbnailImagem = function(id_tr, caminho_imagem){
	$("#"+id_tr).find("td.tipo").html(
		$('<img />').addClass('thumbnail').attr({
			'src': caminho_imagem,
			'title': 'Clique para ampliar',
			'width': '100'
		}).css({
			'display': 'inline-block',
			'verticalAlign': 'middle'
		})
	);
}