#!/bin/bash

echo "===== INICIO DEL SISTEMA TFG ====="

echo "1. Levantando Fabric..."
bash ~/tfg-backend/scripts/start-fabric.sh

echo "2. Cargando entorno..."
source ~/tfg-backend/scripts/env-org1.sh

echo "3. Recuerda abrir IPFS Desktop (Ready)"

echo "4. Arrancando backend..."
bash ~/tfg-backend/scripts/start-backend.sh
