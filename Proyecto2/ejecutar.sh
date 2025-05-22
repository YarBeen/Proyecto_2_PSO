#!/bin/bash

# directorio del script
cd "$(dirname "$0")"

# instalar

echo "Instalando Python3..."
sudo dnf install -y python3



# abrir index en navegador default
xdg-open http://localhost:8000 &

# Iniciar servidor http con python
echo "Iniciando servidor HTTP de Python en el puerto 8000..."
python3 -m http.server 8000
