# Dockerfile para o Backend
# Este Dockerfile está na pasta backend para funcionar quando o contexto é backend/
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

# Copiar apenas os arquivos compilados do stage de build
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Usar node para rodar o servidor
CMD ["node", "dist/index.js"]
