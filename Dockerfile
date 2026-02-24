# Imagen base
FROM node:20

# Crear carpeta de trabajo
WORKDIR /app

# Copiar package.json primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer puerto
EXPOSE 5001

# Comando de inicio
CMD ["npm", "run", "dev"]