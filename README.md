# 📘 Sistema de gestión del ciclo de vida del TFG

## 🧾 Descripción

Este proyecto implementa un sistema para la **gestión del ciclo de vida del Trabajo Fin de Grado (TFG)**, utilizando:

- **IPFS** → almacenamiento de documentos (PDFs)  
- **Hyperledger Fabric** → registro inmutable de eventos y estados  

El objetivo es garantizar:

- Trazabilidad completa  
- Integridad de los documentos  
- Auditabilidad del proceso académico  

> ⚠️ El sistema NO almacena documentos en la blockchain, sino pruebas verificables sobre ellos.

---

## 🧠 Idea principal

Separación de responsabilidades:

| Componente | Función |
|-----------|--------|
| IPFS | Guarda los PDFs |
| Fabric | Guarda metadatos y decisiones |

Cada documento subido genera:

- **CID (Content Identifier)** → identificador criptográfico único  
- **URL IPFS** → acceso al documento  

---

## 🔄 Modelo del sistema

### Identificadores

- `tfgId` → identifica el TFG  
- `version` → versión del documento (v1, v2…)  
- `cid` → identificador real (hash IPFS)  
- `url` → enlace de acceso  

---

### Estados del anteproyecto

- `ENTREGADO` → el alumno sube el documento  
- `MODIFICACION` → se solicitan cambios  
- `ACEPTADO` → validado por el tutor  

---

### Flujo

ENTREGADO  
│  
├──> MODIFICACION ───> ENTREGADO (nueva versión)  
│  
└──> ACEPTADO (estado final)

---

## 🏗️ Arquitectura

Usuario (curl / futuro frontend)  
↓  
Backend Node.js (Express)  
↓  
IPFS (PDFs) + Hyperledger Fabric (metadatos)

---

## 📦 Qué se almacena en Hyperledger Fabric

La blockchain **no almacena el PDF**, sino:

{
  "tfgId": "TFG-001",
  "version": 5,
  "estado": "ENTREGADO",
  "cid": "Qm...",
  "url": "https://ipfs.io/ipfs/Qm...",
  "timestamp": "2026-04-29T18:13:24.416Z"
}

### 🔑 Importante

- El **CID** identifica el documento  
- La **URL** permite acceder a él  

---

## 🔧 Funcionalidades del sistema

### 📤 Envío de anteproyecto

Permite subir un PDF:

- Se almacena en IPFS  
- Se genera un CID  
- Se crea una nueva versión en blockchain  
- Estado inicial: ENTREGADO  

Endpoint:

POST /anteproyecto/submit-file  

---

### ✏️ Solicitar modificación

Permite solicitar cambios:

- Cambia el estado a MODIFICACION  
- Se añade comentario  
- Se registra en blockchain  

Endpoint:

POST /anteproyecto/modification  

---

### ✅ Aceptar anteproyecto

Permite validar una versión:

- Cambia el estado a ACEPTADO  

Endpoint:

POST /anteproyecto/accept  

---

### 🔍 Consultar última versión

GET /anteproyecto/{tfgId}/latest  

---

### 📚 Listar versiones

GET /anteproyecto/{tfgId}/versions  

---

### 📄 Consultar versión concreta

GET /anteproyecto/{tfgId}/{version}  

---

## 🧪 Ejemplo de uso

Subir archivo:

curl -X POST http://localhost:3000/anteproyecto/submit-file \
-F "tfgId=TFG-001" \
-F "file=@/ruta/al/pdf.pdf"

---

## 📁 Estructura del proyecto

tfg-backend/  
│  
├── server.js  
├── fabric.js  
├── package.json  
│  
├── chaincode/  
│   └── anteproyecto-js/  
│       ├── index.js  
│       └── lib/  
│           └── anteproyecto.js  
│  
└── scripts/  
    ├── start-fabric.sh  
    ├── env-org1.sh  
    ├── start-backend.sh  
    └── start-all.sh  

---

## ⚙️ Tecnologías

- Node.js + Express  
- Hyperledger Fabric (test-network)  
- IPFS  
- Bash (scripts)

---

## 🚀 Ejecución del sistema

### 1. Levantar Fabric

cd ~/fabric-samples/test-network  
./network.sh up createChannel -ca  

---

### 2. Configurar entorno

source ~/tfg-backend/scripts/env-org1.sh  

---

### 3. Iniciar IPFS

ipfs daemon  

---

### 4. Iniciar backend

cd ~/tfg-backend  
node server.js  

---

## ⚡ Automatización del entorno

Para simplificar el uso del sistema, se han desarrollado scripts:

tfg-backend/scripts/

Incluyen:

- start-fabric.sh  
- env-org1.sh  
- start-backend.sh  
- start-all.sh  

Arranque completo:

cd ~/tfg-backend  
./scripts/start-all.sh  

---


## 🔐 Qué aporta el sistema

- Integridad del documento (CID)  
- Acceso mediante URL  
- Histórico inmutable  
- Timestamps verificables  

---

## ⚠️ Limitaciones

- Sin interfaz gráfica  
- Sin autenticación  
- Red no persistente  

---

## 🔮 Trabajo futuro

- Frontend web  
- Sistema de autenticación  
- Evaluación automática con IA  
- Persistencia completa  

---

## 👩‍💻 Autor

Victoria Sacedo  
TFG – ETSIT
