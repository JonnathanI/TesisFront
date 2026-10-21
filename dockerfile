# Usamos directamente Nginx para servir los archivos estáticos listos
FROM nginx:alpine

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos la carpeta 'build' que acabamos de generar en tu PC
COPY build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]