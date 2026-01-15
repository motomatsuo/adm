# Dockerfile para o Backend
# Este Dockerfile está na pasta backend para funcionar quando o contexto é backend/
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3001

# Usar node para rodar o servidor
CMD ["node", "dist/index.js"]
