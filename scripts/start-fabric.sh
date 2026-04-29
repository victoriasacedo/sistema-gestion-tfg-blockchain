#!/bin/bash

cd ~/fabric-samples/test-network

echo "🚀 Levantando red Fabric..."
./network.sh up createChannel -ca

echo "✅ Fabric listo"
