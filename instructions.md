# Instruction.md - Setup Automático del Proyecto

## Propósito
Este archivo contiene instrucciones paso-a-paso + scripts bash para crear toda la estructura y archivos del proyecto Task Autopsy en 5 minutos.

---

## OPCIÓN A: Setup Manual (Si usás Cursor GUI)

### PASO 1: Crear Estructura de Carpetas

En la terminal (en raíz del proyecto):

```bash
# Crear carpetas
mkdir -p src/utils
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/components

# Verificar creadas
tree src/
# Output esperado:
# src/
# ├── utils/
# ├── store/
# ├── hooks/
# ├── components/
```

### PASO 2: Crear Archivos Vacíos

```bash
# Utils
touch src/utils/constants.js
touch src/utils/api.js
touch src/utils/storage.js

# Store
touch src/store/taskStore.js

# Hooks
touch src/hooks/useDecompose.js

# Components
touch src/components/TaskInput.jsx
touch src/components/TaskTree.jsx
touch src/components/index.js

# Root level
touch .env.local
touch claude.md
touch prd.md
touch design.md
touch skills.md
```

### PASO 3: Instalar Dependencies

```bash
npm install uuid
```

---

## OPCIÓN B: Setup Automático (Bash Script)

### Copia este script en terminal (de una, completo)

```bash
#!/bin/bash

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Task Autopsy - Setup Automático${NC}\n"

# 1. Crear carpetas
echo -e "${BLUE}1. Creando estructura de carpetas...${NC}"
mkdir -p src/{utils,store,hooks,components}
echo -e "${GREEN}✓ Carpetas creadas${NC}\n"

# 2. Crear archivos
echo -e "${BLUE}2. Creando archivos...${NC}"

# Utils
touch src/utils/{constants,api,storage}.js
# Store
touch src/store/taskStore.js
# Hooks
touch src/hooks/useDecompose.js
# Components
touch src/components/{TaskInput,TaskTree,index}.jsx
# Root
touch .env.local

echo -e "${GREEN}✓ Archivos creados${NC}\n"

# 3. Instalar deps
echo -e "${BLUE}3. Instalando dependencies...${NC}"
npm install uuid
echo -e "${GREEN}✓ Dependencies instaladas${NC}\n"

echo -e "${GREEN}🎉 Setup completado!${NC}"
echo -e "${BLUE}Próximo paso: Pega los contenidos de cada archivo${NC}"
```

**Cómo usar:**
1. Copia el script completo
2. Pegá en terminal (raíz del proyecto)
3. Presioná Enter
4. Espera a que termine

---

## OPCIÓN C: Setup con Curl (Si querés descargar archivo base)

```bash
# Este script descarga templates mínimos pre-hechos
# (ideal si no querés copiar/pegar manualmente)

curl -s https://task-autopsy-templates.com/setup.sh | bash

# Nota: Asumiendo que hay servidor con templates
# Si no, usá Opción A o B
```

---

## DESPUÉS DEL SETUP: Completar Contenidos

Una vez tengas la estructura, necesitás pegar el **contenido** de cada archivo.

### Archivos a Completar (en orden):

#### 1. `src/utils/constants.js`
Pegá el bloque que empieza en: