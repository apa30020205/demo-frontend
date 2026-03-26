param(
  [Parameter(Mandatory = $true)]
  [string]$Version,

  [string]$Message = ""
)

$ErrorActionPreference = "Stop"

if (-not $Message) {
  $Message = "Release v$Version."
}

$tag = "v$Version"

git add .
git commit -m $Message
git tag -a $tag -m "Release $tag"
git push
git push origin $tag

Write-Output "Release completado: $tag"
