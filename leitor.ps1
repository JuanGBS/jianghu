# --- Script para Gerar Dossiê Completo de Código ---
# Autor: Gemini
# Data: 29/10/2025
# Descrição: Este script lê o conteúdo de todos os arquivos de código da pasta /src
#            e os concatena em um único arquivo .txt na raiz do projeto.
# --------------------------------------------------------------------

# Define os caminhos relativos ao local do script
$scriptRoot = $PSScriptRoot
$srcPath = Join-Path -Path $scriptRoot -ChildPath "src"
$reportPath = Join-Path -Path $scriptRoot -ChildPath "relatorio_codigo_completo.txt"

# Define os tipos de arquivo que queremos incluir no dossiê
$fileTypes = @("*.jsx", "*.js", "*.css")

# Limpa o relatório antigo, se existir, e cria um novo com um cabeçalho
$header = @"
======================================================================
           DOSSIÊ DE CÓDIGO - PROJETO TALES OF JIANGHU
======================================================================
Data de Geração: $(Get-Date)
Este arquivo contém uma cópia completa de todo o código-fonte
da pasta /src do projeto.
----------------------------------------------------------------------

"@
Set-Content -Path $reportPath -Value $header -Encoding UTF8


# Tenta encontrar os arquivos na pasta src
try {
    $files = Get-ChildItem -Path $srcPath -Recurse -Include $fileTypes -ErrorAction Stop
}
catch {
    Write-Host "ERRO: A pasta 'src' não foi encontrada ou está vazia." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

# Itera sobre cada arquivo encontrado
foreach ($file in $files) {
    # Pega o caminho relativo do arquivo para usar no cabeçalho
    $relativePath = $file.FullName.Substring($scriptRoot.Length + 1)
    
    # Cria um separador para cada arquivo
    $fileSeparator = @"

######################################################################
# ARQUIVO: $($relativePath)
######################################################################

"@
    
    # Adiciona o separador ao final do arquivo de relatório
    Add-Content -Path $reportPath -Value $fileSeparator -Encoding UTF8
    
    # Lê o conteúdo completo do arquivo e o adiciona ao relatório
    $fileContent = Get-Content -Path $file.FullName -Raw
    Add-Content -Path $reportPath -Value $fileContent -Encoding UTF8
}

# Adiciona um rodapé para indicar o fim do relatório
$footer = @"

----------------------------------------------------------------------
                      FIM DO RELATÓRIO DE CÓDIGO
----------------------------------------------------------------------
"@
Add-Content -Path $reportPath -Value $footer -Encoding UTF8


# Exibe uma mensagem de sucesso no console
Write-Host "Dossiê de código gerado com sucesso!" -ForegroundColor Green
Write-Host "Local do arquivo: $reportPath"