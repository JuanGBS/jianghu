Tales of Jianghu - Ficha de Personagem Digital

Tales of Jianghu é uma aplicação web interativa para a criação e gerenciamento de fichas de personagem de RPG, com uma temática de fantasia oriental inspirada nos gêneros Wuxia e Xianxia. Crie seu cultivador, escolha seu clã, distribua seus atributos e mergulhe em um mundo de artes marciais místicas e poder espiritual.

A aplicação foi desenvolvida para digitalizar e agilizar a experiência de jogo, oferecendo uma interface moderna, intuitiva e responsiva.

📋 Índice

Visão Geral

✨ Principais Funcionalidades

🛠️ Tecnologias Utilizadas

🚀 Como Executar o Projeto

Pré-requisitos

Configuração do Supabase

Instalação Local

📂 Estrutura do Projeto

📄 Licença

💡 Visão Geral

Este projeto oferece uma solução completa para jogadores de um sistema de RPG focado em cultivo e artes marciais. Ele abrange desde a criação guiada do personagem, com cálculos automáticos de status, até uma ficha digital interativa com rolagem de dados, gerenciamento de técnicas e um sistema de progressão.

✨ Principais Funcionalidades

🔒 Autenticação de Usuários: Sistema seguro de login e registro para que cada usuário tenha acesso apenas à sua ficha.

🧙‍♂️ Criação de Personagem Guiada: Um fluxo passo a passo para:

Escolher um entre quatro clãs distintos, cada um com bônus e habilidades passivas únicas.

Distribuir pontos de atributos (Vigor, Agilidade, Disciplina, Compreensão, Presença).

Selecionar um Estilo de Luta.

Calcular automaticamente os status de combate (PV, Chi, CA).

📜 Ficha de Personagem Interativa:

Rolagem de Dados: Modal interativo para testes de atributos com suporte a vantagem e desvantagem.

Histórico de Rolagens: Painel lateral que armazena os últimos resultados dos dados.

Status Editáveis: Modifique facilmente os Pontos de Vida e Chi atuais.

Gerenciador de Técnicas: Adicione, edite e remova as habilidades e técnicas do seu personagem.

📈 Sistema de Progressão:

Acompanhe a evolução do personagem em Refino Corporal, Estágio de Cultivo e Nível de Maestria.

Mecânica de Treinamento para evoluir atributos e níveis através de testes de perícia.

🎨 Personalização Visual: Faça o upload e selecione uma imagem de avatar para o seu personagem.

🛠️ Tecnologias Utilizadas

Frontend:

React - Biblioteca para a construção da interface de usuário.

Tailwind CSS - Framework de CSS para estilização rápida e responsiva.

Heroicons - Biblioteca de ícones SVG.

Backend (BaaS):

Supabase - Plataforma open-source que provê:

Autenticação de usuários.

Banco de Dados PostgreSQL em tempo real.

Storage para o upload de imagens.

🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e executar a aplicação em seu ambiente local.

Pré-requisitos

Node.js (versão 16 ou superior)

npm ou yarn

Uma conta gratuita no Supabase.

Configuração do Supabase

Crie um Projeto no Supabase:

Faça login no seu painel do Supabase e clique em "New Project".

Dê um nome ao projeto e gere uma senha segura para o banco de dados.

Obtenha as Chaves de API:

No painel do seu projeto, vá para Project Settings (ícone de engrenagem) > API.

Copie a URL do Projeto e a chave anon public.

Crie a Tabela de Personagens:

Vá para o SQL Editor no menu lateral.

Clique em "+ New query" e execute o seguinte script SQL para criar a tabela characters:

code
SQL
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  clan_id TEXT,
  fighting_style TEXT,
  image_url TEXT,
  proficient_attribute TEXT,
  body_refinement_level INT DEFAULT 0,
  cultivation_stage INT DEFAULT 0,
  mastery_level INT DEFAULT 0,
  attributes JSONB,
  stats JSONB,
  techniques JSONB,
  proficient_pericias JSONB
);
-- Ativa a Row Level Security (RLS) para proteger os dados
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Cria políticas de acesso
CREATE POLICY "Users can view their own character."
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own character."
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own character."
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own character."
  ON characters FOR DELETE
  USING (auth.uid() = user_id);

Crie o Bucket de Storage:

Vá para Storage no menu lateral.

Clique em "New Bucket", nomeie-o como character-images e marque-o como público.

Vá para as políticas do bucket recém-criado e adicione políticas para permitir que usuários autenticados façam upload (insert) e visualizem (select) imagens.

Instalação Local

Clone o Repositório:

code
Bash
download
content_copy
expand_less
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY

Instale as Dependências:

code
Bash
download
content_copy
expand_less
npm install
# ou
yarn install

Configure as Variáveis de Ambiente:

Abra o arquivo src/services/supabaseClient.js.

Substitua os valores das constantes supabaseUrl e supabaseAnonKey pelas chaves que você copiou do seu painel Supabase:

code
JavaScript
download
content_copy
expand_less
// ARQUIVO: src/services/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Cole sua URL e chave anon aqui
const supabaseUrl = 'SUA_URL_DO_SUPABASE_AQUI';
const supabaseAnonKey = 'SUA_CHAVE_ANON_PUBLIC_AQUI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

Nota: Para produção, é recomendado o uso de variáveis de ambiente (.env).

Inicie a Aplicação:

code
Bash
download
content_copy
expand_less
npm run dev
# ou
yarn dev

A aplicação estará disponível em http://localhost:5173 (ou outra porta indicada no terminal).

📂 Estrutura do Projeto

A estrutura de pastas do projeto foi organizada para manter uma clara separação de responsabilidades:

code
Code
download
content_copy
expand_less
/src
|-- /assets             # Imagens estáticas e outros recursos
|-- /components         # Componentes React reutilizáveis
|   |-- /character-creation # Componentes da tela de criação
|   |-- /character-sheet  # Componentes da ficha de personagem
|   |-- /ui               # Componentes de UI genéricos (Modal, Button, etc.)
|-- /context            # Contextos React (ex: AuthContext)
|-- /data               # Dados estáticos do jogo (clãs, estilos, etc.)
|-- /pages              # Componentes de página (telas principais)
|-- /services           # Configuração de serviços externos (ex: Supabase)
|-- App.jsx             # Componente raiz da aplicação
|-- main.jsx            # Ponto de entrada da aplicação
|-- index.css           # Estilos globais
📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.