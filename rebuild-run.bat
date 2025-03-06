@echo off
echo Nettoyage des dossiers de build...
rmdir /s /q dist
rmdir /s /q .angular

echo Construction de l'application Angular...
call npm run build

echo Lancement de l'application Electron...
call npm run electron-only

echo Fin du script.
