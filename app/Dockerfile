FROM node:20-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# Prismaクライアントの生成
RUN npx prisma generate

# ポートの公開
EXPOSE 8888

# 開発サーバーの起動
CMD ["npm", "run", "start:dev"]