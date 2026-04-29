📘 README – Sistema de gestión del ciclo de vida del TFG
🧾 Descripción

Este proyecto implementa un sistema para la gestión del ciclo de vida del Trabajo Fin de Grado (TFG), utilizando:

IPFS → almacenamiento de documentos (PDFs)
Hyperledger Fabric → registro inmutable de eventos y estados

El objetivo es garantizar:

Trazabilidad completa
Integridad de los documentos
Auditabilidad del proceso académico

El sistema NO almacena documentos en la blockchain, sino pruebas verificables sobre ellos.

🧠 Idea principal

Separación de responsabilidades:

Componente	Función
IPFS	Guarda los PDFs
Fabric	Guarda metadatos y decisiones

Cada documento subido genera:

Un CID (Content Identifier) → identificador criptográfico único
Una URL IPFS → acceso al documento
🔄 Modelo del sistema
Identificadores
tfgId → identifica el TFG
version → versión del documento (v1, v2…)
cid → hash IPFS del archivo (identificador real)
url → enlace de acceso al documento
Estados del anteproyecto
ENTREGADO → el alumno sube el documento
MODIFICACION → se solicitan cambios
ACEPTADO → validado por el tutor
Flujo
ENTREGADO
   │
   ├──> MODIFICACION ───> ENTREGADO (nueva versión)
   │
   └──> ACEPTADO (estado final)
🏗️ Arquitectura
Usuario (curl / futuro frontend)
        ↓
Backend Node.js (Express)
        ↓
   ┌─────────────┬─────────────┐
   │             │             │
 IPFS        Hyperledger Fabric
(PDFs)       (metadatos)
📦 Qué se almacena en Hyperledger Fabric

La blockchain no almacena el PDF, sino un registro estructurado como:

{
  "tfgId": "TFG-001",
  "version": 5,
  "estado": "ENTREGADO",
  "cid": "Qm...",
  "url": "https://ipfs.io/ipfs/Qm...",
  "timestamp": "2026-04-29T18:13:24.416Z"
}
🔑 Importante
El CID es el identificador único del documento
La URL permite acceder al archivo

Esto permite:

Verificar que el documento no ha sido modificado
Acceder fácilmente al contenido
⚙️ Tecnologías
Node.js + Express
Hyperledger Fabric (test-network)
IPFS
Bash (scripts de automatización)
🚀 Ejecución del sistema
1. Levantar Fabric
cd ~/fabric-samples/test-network
./network.sh up createChannel -ca
2. Configurar entorno
source ~/tfg-backend/scripts/env-org1.sh
3. Iniciar IPFS
ipfs daemon
4. Iniciar backend
cd ~/tfg-backend
node server.js
⚡ Automatización del entorno

Para simplificar el uso del sistema, se han desarrollado scripts de automatización que permiten evitar la ejecución manual de múltiples comandos.

Estos scripts se encuentran en:

tfg-backend/scripts/

Incluyen:

start-fabric.sh → levanta la red de Hyperledger Fabric
env-org1.sh → configura variables de entorno
start-backend.sh → inicia el backend
start-all.sh → ejecuta todo el flujo completo

El sistema puede iniciarse de forma simplificada mediante:

cd ~/tfg-backend
./scripts/start-all.sh

Esto reduce la complejidad operativa y mejora la reproducibilidad del entorno.

🧪 Uso de la API
Subir anteproyecto
curl -X POST http://localhost:3000/anteproyecto/submit-file \
-F "tfgId=TFG-001" \
-F "file=@/ruta/al/pdf.pdf"
Consultar última versión
curl http://localhost:3000/anteproyecto/TFG-001/latest
Listar versiones
curl http://localhost:3000/anteproyecto/TFG-001/versions
📌 Ejemplo real
{
  "tfgId": "TFG-001",
  "version": 5,
  "estado": "ENTREGADO",
  "cid": "QmaN8MGwcPWmQ3J27GuL9Vx45JUT6tLxzxCdp7XQ4TmErs",
  "url": "https://ipfs.io/ipfs/QmaN8MGwcPWmQ3J27GuL9Vx45JUT6tLxzxCdp7XQ4TmErs",
  "timestamp": "2026-04-29T18:13:24.416Z"
}
🔐 Qué aporta el sistema
🔒 Integridad del documento (CID)
🌐 Acceso directo mediante URL
📜 Histórico inmutable de versiones
🕒 Timestamps verificables
⚖️ Resolución de conflictos académicos
⚠️ Limitaciones actuales
Sin interfaz gráfica (uso mediante curl)
Sin autenticación ni roles
Red de Fabric no persistente (test-network)
IPFS sin persistencia garantizada
🔮 Trabajo futuro
Frontend web (alumno / tutor)
Sistema de autenticación (JWT / SSO)
Evaluación automática con IA (rúbrica)
Persistencia completa en entorno productivo
Roles académicos formales
🧠 Nota importante

Este proyecto se ejecuta sobre la red de pruebas de Hyperledger Fabric (test-network), por lo que:

Los datos pueden no persistir entre reinicios del entorno.

👩‍💻 Autor

Victoria Sacedo
Trabajo Fin de Grado – ETSIT

💬 Resumen

Este sistema demuestra cómo combinar IPFS + Blockchain para crear una capa de confianza en procesos académicos, sin almacenar archivos directamente en la blockchain.
