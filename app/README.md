## 使用技術

- NestJS
- Prisma
- MySQL
- Docker

# 実装手順

## Step１：セットアップ

1. まずlocalのgoのバージョンが古かったのでバージョンアップデート
2. goではなく実務で使ってきたnestjsを仕様するため、appディレクトリ内の不要なgoファイルを削除
3. nestjsのcliを使用しプロジェクトセットアップ。port番号を8888に変えておく
4. prismaのセットアップ（理由としては型安全にコードが書ける、インジェクションを防ぐ、トランザクションが簡単に書ける）
5. prismaファイルの書き換え→mysqlに変更、sqlファイルからmodelを作成
6. 環境変数の変更。port番号とdb接続情報
7. dockerfile, composeファイルの書き換え
8. dockerignoreの追加。不要なファイルをビルドコンテキストから除外する。主にdistファイルとnodeモジュール
9. docker compose upでコンテナが起動することを確認

## Step２：Transactionsエンドポイントの実装

1. cliで必要なリソースを用意
2. transactionを使用（prismaを使用すればロールバックは自動で処理される、ただし行ロックがサポートされていないので生のsqlを書く必要あり）
3. 限度額を超えた場合エラーを返す

### Cliで作成したプロジェクトアーキテクチャベースだが、以下の構成のみ意識

関心の分離

- Controller: リクエスト/レスポンスの処理
- Service: ビジネスロジック
- Repository: データアクセス層

## Step３：Api-key認証のためのGuardを実装

1. ApiKeyGuardを実装し、apiが必要なendpointにUseGuardsでセット
2. userをidで取得する関数をusers.repository.tsに作成

## Optional：Indexをはる

今回のテストボリュームではあまり効果をみられないかもしれないが、トランザクションは膨大になる仮定でインデックスを張っておく。

# 参考資料

- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [NestJS Best Practices](https://qiita.com/song_ss/items/38e514b05e9dabae3bdb)
- [Retry with Exponential Backoff](https://www.codewithyou.com/blog/how-to-implement-retry-with-exponential-backoff-in-nodejs)
