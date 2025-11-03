
$scriptRoot = $PSScriptRoot
$srcPath = Join-Path -Path $scriptRoot -ChildPath "src"
$reportPath = Join-Path -Path $scriptRoot -ChildPath "relatorio_codigo_completo.txt"

$fileTypes = @("*.jsx", "*.js", "*.css")

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

try {
    $files = Get-ChildItem -Path $srcPath -Recurse -Include $fileTypes -ErrorAction Stop
}
catch {
    Write-Host "ERRO: A pasta 'src' não foi encontrada ou está vazia." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($scriptRoot.Length + 1)
    
    $fileSeparator = @"

######################################################################
# ARQUIVO: $($relativePath)
######################################################################

"@
    
    Add-Content -Path $reportPath -Value $fileSeparator -Encoding UTF8
    
    $fileContent = Get-Content -Path $file.FullName -Raw
    Add-Content -Path $reportPath -Value $fileContent -Encoding UTF8
}

$footer = @"

----------------------------------------------------------------------
                      FIM DO RELATÓRIO DE CÓDIGO
----------------------------------------------------------------------
"@
Add-Content -Path $reportPath -Value $footer -Encoding UTF8


Write-Host "Dossiê de código gerado com sucesso!" -ForegroundColor Green
Write-Host "Local do arquivo: $reportPath"