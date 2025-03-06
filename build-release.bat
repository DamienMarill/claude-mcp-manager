@echo off
echo ===================================
echo Build release de Claude MCP Manager
echo ===================================

echo Nettoyage des dossiers de build...
rmdir /s /q dist
rmdir /s /q .angular
rmdir /s /q dist-electron

echo Construction de l'application Angular...
call npm run build

echo Création de l'exécutable portable...
call npm run package-portable

echo.
echo ===================================
echo Build terminé! Exécutable disponible dans le dossier dist-electron
echo ===================================
