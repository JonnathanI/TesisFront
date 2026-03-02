# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

# 1. Dependencias
COPY package*.json ./
RUN npm install

# 2. Código fuente
COPY . .

# 3. Variable para la URL del backend (React)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 4. Build
RUN npm run build

# Etapa de Nginx
FROM nginx:alpine

# 5. Copiamos config de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 6. Copiamos el build de React
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]