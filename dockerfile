# --- ETAPA 1: Construcción de la aplicación React ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos las dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Si usas variables de entorno en tiempo de compilación (como REACT_APP_API_URL)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Ejecutamos el build de producción
RUN npm run build

# --- ETAPA 2: Servir con Nginx ---
FROM nginx:alpine

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]