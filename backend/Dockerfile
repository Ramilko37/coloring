   FROM node:18-alpine

   WORKDIR /app

   # Копируем package.json и package-lock.json
   COPY package*.json ./

   # Устанавливаем зависимости
   RUN npm install

   # Копируем исходный код
   COPY . .

   # Приложение будет работать на порту 8080
   ENV PORT=8080
   EXPOSE 8080

   # Запускаем приложение
   CMD ["node", "src/index.js"]