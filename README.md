# 📘 Sistema de gestión del ciclo de vida del TFG

## 🧾 Descripción

Este proyecto implementa un sistema para la **gestión del ciclo de vida del Trabajo Fin de Grado (TFG)**, utilizando:

- **IPFS** → almacenamiento de documentos PDF  
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
- `version` → identifica la versión concreta del documento  
- `cid` → identificador real generado por IPFS  
- `url` → enlace de acceso al documento  

---

### Sistema de versionado

El sistema utiliza un sistema de versionado específico para representar las distintas etapas del ciclo de vida del TFG:

- `v0.x` → iteraciones del anteproyecto  
- `v1.0` → entrega final del TFG  
- `v2.0` → documento final calificado  

Ejemplo:

- `v0.1` → primera entrega del anteproyecto  
- `v0.2` → nueva entrega tras modificación  
- `v1.0` → entrega final del TFG  
- `v2.0` → versión final calificada  

---

### Estados del sistema

- `ENTREGADO` → el alumno sube el documento  
- `MODIFICACION` → se solicitan cambios  
- `ACEPTADO` → validado por el tutor  
- `CALIFICADO` → documento final validado y calificado  

---

### Flujo del sistema

```text
v0.x → fase de anteproyecto

ENTREGADO
│
├──> MODIFICACION ───> ENTREGADO (nueva versión)
│
└──> ACEPTADO

↓

v1.0 → entrega final del TFG

↓

v2.0 → documento final CALIFICADO
```

---

## 🏗️ Arquitectura

```text
Usuario (curl / futuro frontend)
↓
Backend Node.js (Express)
↓
IPFS (PDFs) + Hyperledger Fabric (metadatos)
```

---

## 📦 Qué se almacena en Hyperledger Fabric

La blockchain **no almacena el PDF**, sino:

```json
{
  "tfgId": "TFG-001",
  "version": "0.2",
  "estado": "ENTREGADO",
  "cid": "Qm...",
  "url": "https://ipfs.io/ipfs/Qm...",
  "timestamp": "2026-04-29T18:13:24.416Z"
}
```

### 🔑 Importante

- El **CID** identifica el documento  
- La **URL** permite acceder a él  

---

## 🔧 Funcionalidades del sistema

El sistema permite gestionar el ciclo de vida completo del TFG mediante una API REST, que a su vez invoca funciones del chaincode desplegado en Hyperledger Fabric.

A continuación se describen las operaciones disponibles y su correspondencia interna.

---

### 📤 Envío de documento

Permite al alumno subir un documento PDF.

- Se almacena en IPFS  
- Se genera un CID  
- Se registra como una nueva versión en blockchain  
- El estado y la versión se calculan automáticamente según la lógica del sistema  

### Endpoint

```text
POST /tfg/submit-file
```

### Función en chaincode

```text
submitAnteproyecto(tfgId, cid, url)
```

---

### ✏️ Solicitar modificación

Permite al tutor solicitar cambios sobre una versión concreta.

- Cambia el estado a `MODIFICACION`  
- Se añade un comentario  
- Se registra de forma inmutable  

### Endpoint

```text
POST /tfg/modification
```

### Función en chaincode

```text
requestModification(tfgId, version, comentario)
```

---

### ✅ Aceptar versión

Permite validar una versión concreta.

- Cambia el estado a `ACEPTADO`  
- Se registra en blockchain  

### Endpoint

```text
POST /tfg/accept
```

### Función en chaincode

```text
acceptAnteproyecto(tfgId, version)
```

---

### 🔍 Consultar última versión

Permite obtener la versión más reciente de un TFG.

### Endpoint

```text
GET /tfg/{tfgId}/latest
```

### Función en chaincode

```text
queryLatestVersion(tfgId)
```

---

### 📚 Listar versiones

Permite obtener el histórico completo de versiones.

### Endpoint

```text
GET /tfg/{tfgId}/versions
```

### Función en chaincode

```text
listVersions(tfgId)
```

---

### 📄 Consultar versión concreta

Permite recuperar una versión específica.

### Endpoint

```text
GET /tfg/{tfgId}/{version}
```

### Función en chaincode

```text
queryAnteproyecto(tfgId, version)
```

---

## 🧪 Ejemplo de uso

Subir archivo:

```bash
curl -X POST http://localhost:3000/tfg/submit-file \
-F "tfgId=TFG-001" \
-F "file=@/ruta/al/pdf.pdf"
```

---

## 📁 Estructura del proyecto

```text
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
```

---

## ⚙️ Tecnologías

- Node.js + Express  
- Hyperledger Fabric (test-network)  
- IPFS  
- Bash (scripts)

---

## 🚀 Ejecución del sistema

### 1. Levantar Fabric

```bash
cd ~/fabric-samples/test-network
./network.sh up createChannel -ca
```

---

### 2. Configurar entorno

```bash
source ~/tfg-backend/scripts/env-org1.sh
```

---

### 3. Iniciar IPFS

```bash
ipfs daemon
```

---

### 4. Iniciar backend

```bash
cd ~/tfg-backend
node server.js
```

---

## ⚡ Automatización del entorno

Para simplificar el uso del sistema, se han desarrollado scripts:

```text
tfg-backend/scripts/
```

Incluyen:

- `start-fabric.sh`  
- `env-org1.sh`  
- `start-backend.sh`  
- `start-all.sh`  

Arranque completo:

```bash
cd ~/tfg-backend
./scripts/start-all.sh
```

---

## 🔐 Qué aporta el sistema

- Integridad del documento mediante CID  
- Acceso al documento mediante URL  
- Histórico inmutable de versiones  
- Timestamps verificables  
- Trazabilidad completa del proceso académico  

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
