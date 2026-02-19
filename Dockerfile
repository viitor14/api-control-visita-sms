# 1. Baixa um "computador" minúsculo (Linux Alpine) que já tem o Node.js 18 instalado
FROM node:24-alpine

# 2. Cria uma pasta chamada /app lá dentro desse computador virtual
WORKDIR /app

# 3. Copia apenas os arquivos de configuração das bibliotecas primeiro
COPY package*.json ./

# 4. Instala todas as dependências do seu backend (socket.io, express, cors, etc.)
RUN npm install

# 5. Copia todo o resto do seu código para dentro do container
COPY . .

# 6. Avisa ao Docker que o seu Node.js vai rodar internamente na porta 3001
EXPOSE 3001

# 7. O comando que "liga" o servidor quando o container ligar
CMD ["node", "server.js"]
