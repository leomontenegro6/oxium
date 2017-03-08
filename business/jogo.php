<?php
class jogo extends abstractBusiness {
	
	public function getAll(){
		return $this->getByParameter("ORDER BY nome");
	}
	
	private function formataSQLByListagem($nome, $id_plataforma){
		$array_sql = array(
			'sql'=>'TRUE',
			'parametros'=>array()
		);
		
		if(!empty($nome)){
			$nome = str_replace(' ', '%', $nome);
			$nome = trim($nome);
			
			$array_sql['sql'] .= ' AND j.nome LIKE :nome';
			$array_sql['parametros']['nome'] = "%$nome%";
		}
		if(is_numeric($id_plataforma)){
			
			$array_sql['sql'] .= ' AND j.plataforma = :plataforma';
			$array_sql['parametros']['plataforma'] = $id_plataforma;
		}
		
		return $array_sql;
	}
	
	public function getTotalByListagem($nome, $id_plataforma){
		$array_sql = $this->formataSQLByListagem($nome, $id_plataforma);
		
		return $this->getTotal("j WHERE {$array_sql['sql']}", $array_sql['parametros']);
	}
	
	public function getByListagem($nome, $id_plataforma, $ordenacao='nome', $filtragem='ASC', $limit=15, $offset=0){
		$array_sql = $this->formataSQLByListagem($nome, $id_plataforma);
		
		$jogo_rs = $this->getFieldsByParameter("j.nome, CONCAT('[', UPPER(p.sigla), '] ', p.nome) AS plataforma, j.sigla, j.icone, j.id", "j
				LEFT JOIN plataformas p ON (j.plataforma = p.id)
			WHERE {$array_sql['sql']}
			ORDER BY $ordenacao $filtragem
			LIMIT $limit OFFSET $offset", $array_sql['parametros']);
		foreach($jogo_rs as $i=>$jogo_row){
			if(file_exists($jogo_row['icone'])){
				$jogo_rs[$i]['icone'] = "<img src='{$jogo_row['icone']}' />";
			} else {
				$jogo_rs[$i]['icone'] = '---';
			}
		}
		return $jogo_rs;
	}
	
	public function formatarIcone($origem){
		$imagem = imagecreatefromstring(file_get_contents($origem));
		$imagem_64x64 = imagecreatetruecolor(64, 64);
		
		// Se a imagem for PNG, configurar parâmetros de transparência
		if(exif_imagetype($origem) == 3){
			imagealphablending($imagem_64x64, false);
			imagesavealpha($imagem_64x64, true);
			$transparencia = imagecolorallocatealpha($imagem_64x64, 255, 255, 255, 127);
			imagefilledrectangle($imagem_64x64, 0, 0, 64, 64, $transparencia);
		}
		
		// Redimensionando imagem para 64x64 píxels, mantendo a transparência
		$retorno = imagecopyresampled($imagem_64x64, $imagem, 0, 0, 0, 0, 64, 64, imagesx($imagem), imagesy($imagem));
		if(!$retorno){
			return false;
		}

		// Salvando imagem redimensionada para PNG
		$nova_origem = $origem . '_64';
		$retorno = imagepng($imagem_64x64, $nova_origem);
		if(!$retorno){
			return false;
		}
		
		return $nova_origem;
	}
	
	public function set($post, $commit=true){
		$plataforma = new plataforma();
		
		// Obtendo parâmetros necessários
		$arquivo = $post['icone'];
		$sigla_jogo = mensagens::formataSigla($post['sigla']);
		if(isset($post['plataforma']) && is_numeric($post['plataforma'])){
			$sigla_plataforma = mensagens::formataSigla( $plataforma->getSigla($post['plataforma']) );
		} else {
			$sigla_plataforma = '';
		}
		
		// Verificando se um arquivo foi fornecido pelo usuário
		if(isset($post['icone']) && is_array($post['icone']) && count($post['icone']) > 0){
			// Obtendo dados do arquivo
			$nome = base64_decode($arquivo['name']);
			$origem = base64_decode($arquivo['tmp_name']);
			$extensao = mensagens::getExtensaoByNomeArquivo($nome);
			$prefixo = 'jogo_icone';
			
			if(!in_array($extensao, array('jpg', 'jpeg', 'png', 'gif'))){
				return "Formato $extensao inválido!";
			}
			
			// Formatando ícone
			$nova_origem = $this->formatarIcone($origem);
			if($nova_origem === false){
				return 'Erro ao formatar ícone!';
			}
			
			// Formatando nome e caminho do arquivo, a ser salvo no servidor
			$nomeArquivo = "{$prefixo}_{$sigla_plataforma}_{$sigla_jogo}.{$extensao}";
			$caminhoArquivo = "arquivos/$nomeArquivo";

			// Salvando arquivo na pasta
			$retorno = rename($nova_origem, $caminhoArquivo);
			if(!$retorno){
				return "Falha ao copiar arquivo.";
			}
			
			// Definindo caminho do arquivo salvo, para ser inserido no banco
			$post['icone'] = $caminhoArquivo;
		} else {
			// Arquivo não existe, ou está em formato inválido.
			// Logo, removê-lo da inserção
			if(isset($post['icone'])){
				unset($post['icone']);
			}
		}
		
		// Criando registro na tabela "jogos"
		return parent::set($post, $commit);
	}
	
	public function update($post, $id, $commit=true){
		$plataforma = new plataforma();
		
		// Obtendo parâmetros necessários
		$icone_antigo = $this->getIcone($id, 'n');
		$arquivo = $post['icone'];
		$sigla_jogo = mensagens::formataSigla($post['sigla']);
		if(isset($post['plataforma']) && is_numeric($post['plataforma'])){
			$sigla_plataforma = mensagens::formataSigla( $plataforma->getSigla($post['plataforma']) );
		} else {
			$sigla_plataforma = '';
		}
		
		// Verificando se um arquivo foi fornecido pelo usuário
		if(isset($post['icone']) && is_array($post['icone']) && count($post['icone']) > 0){
			// Obtendo dados do arquivo
			$acao = $arquivo['acao'];
			if($acao == 'cadastrar'){
				$nome = base64_decode($arquivo['name']);
				$origem = base64_decode($arquivo['tmp_name']);
				$extensao = mensagens::getExtensaoByNomeArquivo($nome);
				$prefixo = 'jogo_icone';

				if(!in_array($extensao, array('jpg', 'jpeg', 'png', 'gif'))){
					return "Formato $extensao inválido!";
				}

				// Formatando ícone
				$nova_origem = $this->formatarIcone($origem);
				if($nova_origem === false){
					return 'Erro ao formatar ícone!';
				}

				// Formatando nome e caminho do arquivo, a ser salvo no servidor
				$nomeArquivo = "{$prefixo}_{$sigla_plataforma}_{$sigla_jogo}.{$extensao}";
				$caminhoArquivo = "arquivos/$nomeArquivo";

				// Salvando arquivo na pasta
				$retorno = rename($nova_origem, $caminhoArquivo);
				if(!$retorno){
					return "Falha ao copiar arquivo.";
				}

				// Definindo caminho do arquivo salvo, para ser inserido no banco
				$post['icone'] = $caminhoArquivo;
			} elseif($acao == 'nenhuma'){
				// Arquivo não modificado. Logo, não fazer nada.
				if(isset($post['icone'])){
					unset($post['icone']);
				}
				$icone_antigo = '';
			} else {
				return 'Ação do arquivo desconhecida!';
			}
		} else {
			// Arquivo não existe, ou está em formato inválido.
			// Logo, remover ícone deste jogo.
			$post['icone'] = '';
		}
		
		// Salvando dados no banco
		if($commit){
			// Editando registro na tabela "jogos"
			$retorno = parent::update($post, $id);
			if($retorno){
				// Removendo ícone antigo da pasta "arquivos/"
				$this->removerArquivoIcone($icone_antigo);
				
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
		$icone = $this->getIcone($id, 'n');
		
		if($commit){
			$retorno = parent::delete($id, $commit);
			if($retorno){
				$this->removerArquivoIcone($icone);
				
				return true;
			} else {
				return $retorno;
			}
		} else {
			return parent::delete($id, $commit, false);
		}
	}
	
	public function removerArquivoIcone($icone){
		if(file_exists($icone)){
			return unlink($icone);
		} else {
			return true;
		}
	}
	
}