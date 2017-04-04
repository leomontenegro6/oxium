<?php
class fonte extends abstractBusiness {
	
	public function getByJogo($id_jogo){
		return $this->getByParameter("WHERE jogo = $id_jogo ORDER BY id");
	}
	
	private function formataSQLByListagem($id_jogo){
		$array_sql = array(
			'sql'=>'TRUE',
			'parametros'=>array()
		);
		
		if(is_numeric($id_jogo)){
			$array_sql['sql'] .= ' AND jogo = :jogo';
			$array_sql['parametros']['jogo'] = $id_jogo;
		}
		
		return $array_sql;
	}
	
	public function getTotalByListagem($id_jogo){
		$array_sql = $this->formataSQLByListagem($id_jogo);
		
		return $this->getTotal("WHERE {$array_sql['sql']}", $array_sql['parametros']);
	}
	
	public function getByListagem($id_jogo, $ordenacao='nome', $filtragem='ASC', $limit=15, $offset=0){
		$array_sql = $this->formataSQLByListagem($id_jogo);
		
		$fonte_rs = $this->getFieldsByParameter("CONCAT('[', j.sigla, '] ', j.nome) AS jogo, f.arquivo_dialogo, f.arquivo_fonte, f.cor_chave, f.id", "f
				JOIN jogos j ON (f.jogo = j.id)
			WHERE {$array_sql['sql']}
			ORDER BY $ordenacao $filtragem
			LIMIT $limit OFFSET $offset", $array_sql['parametros']);
		foreach($fonte_rs as $i=>$fonte_row){
			if(file_exists($fonte_row['arquivo_dialogo'])){
				$tamanho = getimagesize($fonte_row['arquivo_dialogo']);
				$largura = $tamanho[0];
				$altura = $tamanho[1];
				
				$fonte_rs[$i]['arquivo_dialogo'] = "<img src='{$fonte_row['arquivo_dialogo']}' width='$largura' height='$altura' />";
			} else {
				$fonte_rs[$i]['arquivo_dialogo'] = '---';
			}
			
			if(file_exists($fonte_row['arquivo_fonte'])){
				$tamanho = getimagesize($fonte_row['arquivo_fonte']);
				$largura = $tamanho[0];
				$altura = $tamanho[1];
				
				$fonte_rs[$i]['arquivo_fonte'] = "<img src='{$fonte_row['arquivo_fonte']}' width='$largura' height='$altura' />";
			} else {
				$fonte_rs[$i]['arquivo_fonte'] = '---';
			}
			
			if(mensagens::checaCorValida($fonte_row['cor_chave'], false)){
				$fonte_rs[$i]['cor_chave'] = "<div class='cor' style='background: #{$fonte_row['cor_chave']}' title='#{$fonte_row['cor_chave']}'></div>";
			} else {
				$fonte_rs[$i]['cor_chave'] = '---';
			}
		}
		return $fonte_rs;
	}
	
	// Formatações, checagens e validações
	public function gerarFonteTransparente($caminho, $cor_chave){
		$imagem = imagecreatefrompng($caminho);
		
		$caminhoArquivo = str_replace('.', '_transparente.', $caminho);
		
		$largura = imagesx($imagem);
		$altura = imagesy($imagem);
		$imagem_transparente = imagecreatetruecolor($largura, $altura);
		
		$indice_transparencia = imagecolortransparent($imagem); 
		$cor_transparencia = mensagens::converteCorHexadecimalParaDecimal($cor_chave);
		
		if ($indice_transparencia >= 0) { 
			$cor_transparencia = imagecolorsforindex($imagem, $indice_transparencia);    
		} 

		$indice_transparencia = imagecolorallocate($imagem_transparente, $cor_transparencia[0], $cor_transparencia[1], $cor_transparencia[2]); 
		imagefill($imagem_transparente, 0, 0, $indice_transparencia); 
		imagecolortransparent($imagem_transparente, $indice_transparencia); 
		
		imagecopyresampled($imagem_transparente, $imagem, 0, 0, 0, 0, $largura, $altura, $largura, $altura);
		
		$retorno = imagepng($imagem_transparente, $caminhoArquivo);
		if(!$retorno){
			return false;
		}
		
		return $caminhoArquivo;
	}
	
	// Métodos de persistência de dados
	public function set($post, $commit=true){
		$jogo = new jogo();
		$plataforma = new plataforma();
		$background = new background();
		$paleta = new paleta();
		
		$post_fonte = $post['fonte'];
		$post_backgrounds = (isset($post['backgrounds'])) ? ($post['backgrounds']) : (array());
		$post_paletas = $post['paletas'];
		
		// Obtendo parâmetros necessários
		$id_jogo = $post_fonte['jogo'];
		$arquivos = array(
			'c'=>(isset($post_fonte['arquivo_configuracao'])) ? ($post_fonte['arquivo_configuracao']) : (array()),
			'd'=>$post_fonte['arquivo_dialogo'],
			'f'=>$post_fonte['arquivo_fonte'],
		);
		$cor_chave = $post_fonte['cor_chave'];
		$post['id'] = $id_fonte = $this->getNextid();
		
		// Obtendo dados do jogo selecionado, para formatação dos nomes dos arquivos
		$jogo_row = $jogo->get($id_jogo);
		
		// Criando variáveis para formatação de nomes de arquivos
		$sigla_jogo = mensagens::formataSigla($jogo_row['sigla']);
		if(isset($jogo_row['plataforma']) && is_numeric($jogo_row['plataforma'])){
			$sigla_plataforma = mensagens::formataSigla( $plataforma->getSigla($jogo_row['plataforma']) );
		} else {
			$sigla_plataforma = '';
		}
		
		$caminhosArquivos = array();
		
		// Formatando arquivos da fonte para salvar no servidor
		foreach($arquivos as $tipo=>$arquivo){
			// Obtendo dados dos arquivos
			$nome = base64_decode($arquivo['name']);
			$origem = base64_decode($arquivo['tmp_name']);
			$extensao = mensagens::getExtensaoByNomeArquivo($nome);
			if($tipo == 'c'){
				$prefixo = 'configuracao';
			} elseif($tipo == 'd'){
				$prefixo = 'dialogo';
			} else {
				$prefixo = 'fonte';
			}
			
			// Validando extensão do arquivo de configuração
			if(($tipo == 'c') && (!in_array($extensao, array('txt')))){
				return "O formato $extensao do arquivo de configuração é inválido!";
			}
			
			// Validando extensão dos arquivos de diálogo e fonte
			if(($tipo == 'd' || $tipo == 'f') && (!in_array($extensao, array('png')))){
				if($tipo == 'd'){
					return "O formato $extensao do arquivo de diálogo é inválido!";
				} else {
					return "O formato $extensao do arquivo de fonte é inválido!";
				}
			}

			// Formatando nome e caminho do arquivo, a ser salvo no servidor
			$nomeArquivo = "{$prefixo}_{$sigla_plataforma}_{$sigla_jogo}.{$extensao}";
			$caminhoArquivo = "arquivos/$nomeArquivo";

			// Salvando arquivo na pasta
			$retorno = rename($origem, $caminhoArquivo);
			if($retorno){
				$caminhosArquivos[] = $caminhoArquivo;
			} else {
				mensagens::removerArquivos($caminhosArquivos);
				
				if($tipo == 'c'){
					return 'Falha ao copiar arquivo de configuração';
				} elseif($tipo == 'd'){
					return 'Falha ao copiar arquivo de diálogo';
				} else {
					return 'Falha ao copiar arquivo da fonte';
				}
			}

			// Definindo caminho do arquivo salvo, para ser inserido no banco
			if($tipo == 'c'){
				$post_fonte['arquivo_configuracao'] = $caminhoArquivo;
			} elseif($tipo == 'd'){
				$post_fonte['arquivo_dialogo'] = $caminhoArquivo;
			} else {
				$post_fonte['arquivo_fonte'] = $caminhoArquivo;
				$post_fonte['arquivo_fonte_transparente'] = $this->gerarFonteTransparente($caminhoArquivo, $cor_chave);
			}
		}
		
		// Criando registro na tabela "fontes"
		$retorno = parent::set($post_fonte, false);
		if($retorno !== true){
			mensagens::removerArquivos($caminhosArquivos);
			return $retorno;
		}
		
		// Formatando arquivos de backgrounds para salvar no servidor
		foreach($post_backgrounds as $arquivo_background){
			// Obtendo dados dos arquivos
			$nome = base64_decode($arquivo_background['name']);
			$origem = base64_decode($arquivo_background['tmp_name']);
			$extensao = mensagens::getExtensaoByNomeArquivo($nome);
			$prefixo = 'background';
			
			// Validando extensão dos arquivos de background
			if(!in_array($extensao, array('png'))){
				return "O formato $extensao do arquivo de background é inválido!";
			}
			
			// Formatando nome e caminho do arquivo, a ser salvo no servidor
			$nomeArquivo = "{$prefixo}_{$sigla_plataforma}_{$sigla_jogo}.{$extensao}";
			$caminhoArquivo = "arquivos/$nomeArquivo";
			
			// Salvando arquivo na pasta
			$retorno = rename($origem, $caminhoArquivo);
			if($retorno){
				$caminhosArquivos[] = $caminhoArquivo;
			} else {
				mensagens::removerArquivos($caminhosArquivos);
				return "Falha ao copiar arquivo de background.";
			}
			
			// Inserindo registros na tabela "backgrounds"
			$post_inserir = array(
				'fonte'=>$id_fonte,
				'arquivo'=>$caminhoArquivo
			);
			$retorno = $background->set($post_inserir, false);
			if($retorno !== true){
				mensagens::removerArquivos($caminhosArquivos);
				return $retorno;
			}
		}
		
		// Inserindo registros na tabela "paletas"
		foreach($post_paletas as $post_paleta){
			// Inserindo registros na tabela "backgrounds"
			$post_inserir = array(
				'fonte'=>$id_fonte,
				'cor_entrada'=>$post_paleta['cor_entrada'],
				'cor_saida'=>$post_paleta['cor_saida'],
			);
			$retorno = $paleta->set($post_inserir, false);
			if($retorno !== true){
				mensagens::removerArquivos($caminhosArquivos);
				return $retorno;
			}
		}
		
		// Commitando alterações via transação
		$retorno = $this->commit($commit);
		if($retorno === true){
			return true;
		} else {
			mensagens::removerArquivos($caminhosArquivos);
			return $retorno;
		}
	}
	
	public function update($post, $id, $commit=true){
		$jogo = new jogo();
		$plataforma = new plataforma();
		
		$fonte_row = $this->get($id);
		$arquivo_dialogo_antigo = $fonte_row['arquivo_dialogo'];
		$arquivo_fonte_antigo = $fonte_row['arquivo_fonte'];
		$arquivo_fonte_transparente_antigo = $fonte_row['arquivo_fonte_transparente'];
		
		// Obtendo parâmetros necessários
		$id_jogo = $post['jogo'];
		$arquivos = array(
			'd'=>$post['arquivo_dialogo'],
			'f'=>$post['arquivo_fonte'],
		);
		$cor_chave = $post['cor_chave'];
		
		// Obtendo dados do jogo selecionado, para formatação dos nomes dos arquivos
		$jogo_row = $jogo->get($id_jogo);
		
		// Criando variáveis para formatação de nomes de arquivos
		$sigla_jogo = mensagens::formataSigla($jogo_row['sigla']);
		if(isset($jogo_row['plataforma']) && is_numeric($jogo_row['plataforma'])){
			$sigla_plataforma = mensagens::formataSigla( $plataforma->getSigla($jogo_row['plataforma']) );
		} else {
			$sigla_plataforma = '';
		}
		
		// Formatando arquivos para salvar no servidor
		foreach($arquivos as $tipo=>$arquivo){
			// Obtendo dados dos arquivos
			$acao = $arquivo['acao'];
			if($acao == 'cadastrar'){
				$nome = base64_decode($arquivo['name']);
				$origem = base64_decode($arquivo['tmp_name']);
				$extensao = mensagens::getExtensaoByNomeArquivo($nome);
				if($tipo == 'd'){
					$prefixo = 'arquivo_dialogo';
				} else {
					$prefixo = 'arquivo_fonte';
				}

				if(!in_array($extensao, array('png'))){
					if($tipo == 'd'){
						return "O formato $extensao do arquivo de diálogo é inválido!";
					} else {
						return "O formato $extensao do arquivo de fonte é inválido!";
					}
				}

				// Formatando nome e caminho do arquivo, a ser salvo no servidor
				$nomeArquivo = "{$prefixo}_{$sigla_plataforma}_{$sigla_jogo}.{$extensao}";
				$caminhoArquivo = "arquivos/$nomeArquivo";

				// Salvando arquivo na pasta
				$retorno = rename($origem, $caminhoArquivo);
				if(!$retorno){
					return "Falha ao copiar arquivo.";
				}

				// Definindo caminho do arquivo salvo, para ser inserido no banco
				if($tipo == 'd'){
					$post['arquivo_dialogo'] = $caminhoArquivo;
				} else {
					$post['arquivo_fonte'] = $caminhoArquivo;
					$post['arquivo_fonte_transparente'] = $this->gerarFonteTransparente($caminhoArquivo, $cor_chave);
				}
			} elseif($acao == 'nenhuma'){
				// Arquivo não modificado. Logo, não fazer nada.
				if($tipo == 'd'){
					if(isset($post['arquivo_dialogo'])){
						unset($post['arquivo_dialogo']);
					}
					
				}
				if($tipo == 'f'){
					if(isset($post['arquivo_fonte'])){
						unset($post['arquivo_fonte']);
					}
					if(isset($post['arquivo_fonte_transparente'])){
						unset($post['arquivo_fonte_transparente']);
					}
				}
			} else {
				return 'Ação do arquivo desconhecida!';
			}
		}
		
		$post['cor_chave'] = $cor_chave;
		
		// Editando registro na tabela "fontes"
		// Salvando dados no banco
		if($commit){
			// Editando registro na tabela "jogos"
			$retorno = parent::update($post, $id);
			if($retorno){
				return true;
			} else {
				return $retorno;
			}
		} else {
			// Editando registro na tabela "jogos", sem commitar
			return parent::update($post, $id, false);
		}
	}
	
	public function delete($id, $commit=true){
		$fonte_row = $this->get($id);
		$arquivo_dialogo_antigo = $fonte_row['arquivo_dialogo'];
		$arquivo_fonte_antigo = $fonte_row['arquivo_fonte'];
		$arquivo_fonte_transparente_antigo = $fonte_row['arquivo_fonte_transparente'];
		
		if($commit){
			$retorno = parent::delete($id, $commit);
			if($retorno){
				$this->removerArquivos($arquivo_dialogo_antigo, $arquivo_fonte_antigo, $arquivo_fonte_transparente_antigo);
				
				return true;
			} else {
				return $retorno;
			}
		} else {
			return parent::delete($id, $commit, false);
		}
	}
	
	public function removerArquivos($arquivo_dialogo_antigo='', $arquivo_fonte_antigo='', $arquivo_fonte_transparente_antigo=''){
		$array_arquivos = array($arquivo_dialogo_antigo, $arquivo_fonte_antigo, $arquivo_fonte_transparente_antigo);
		return mensagens::removerArquivos($array_arquivos);
	}
	
}