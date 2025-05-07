# Backend アプリケーション

## 概要 (Overview)

「Yojitsuトラッカー」のバックエンドです。

*(詳細な機能や目的については、後日追記)*

## ディレクトリ構成 (Directory Structure)
一部変更あるかも
```
backend/
├── cmd/          # アプリケーションのエントリーポイント (main packages)
│   └── api/      # APIサーバー用の main package
│       └── main.go
├── internal/     # アプリケーション固有のコード (外部から import されたくないもの)
│   ├── application/ # アプリケーション/ユースケース層 (ビジネスロジックの調整役)
│   │   └── service/   # (例: UserService)
│   ├── domain/     # ドメイン層 (コアなビジネスロジック、エンティティ、リポジトリインターフェース)
│   │   ├── model/     # (例: user.go)
│   │   └── repository/ # (例: user_repository.go - Interface)
│   ├── infra/ # インフラストラクチャ層 (DBアクセス、外部APIクライアントなど)
│   │   └── persistence/ # (例: user_repository_impl.go - 実装)
│   │   └── router/      # ルーター設定 (chi を使用)
│   │       └── router.go
│   ├── handler/    # APIリクエストハンドラー (HTTP層)
│   │   └── handler.go # (oapi-codegen の ServerInterface を実装)
│   ├── generated/  # oapi-codegen で生成されたコード置き場 (別案あり)
│   │   └── api/       # (例: schema.gen.go, server.gen.go)
│   └── config/     # 設定関連
│       └── config.go
├── api/          # OpenAPI定義ファイル置き場
│   └── openapi.yml
├── go.mod        # Go モジュールファイル
├── go.sum
└── Makefile      # (任意) ビルド、コード生成、テストなどのコマンドをまとめる
```

## 開発環境のセットアップ (Development Environment Setup)

### 前提条件 (Prerequisites)

開発を開始する前に、以下のツールがインストールされていることを確認してください。

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Visual Studio Code (VS Code)](https://code.visualstudio.com/)
* [Remote - Containers (Dev Containers) VS Code 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Dev Container での起動と動作確認手順 (Using Dev Containers)
参考：[devcontainerいいぞという話](https://qiita.com/yoshii0110/items/c480e98cfe981e36dd56)

1.  **リポジトリをクローン:** リポジトリをローカルマシンにクローンする。
2.  **VS Code で開く:** クローンしたリポジトリのルートディレクトリを VS Code で開く。
3.  **コンテナで再度開く:** VS Code が `.devcontainer` フォルダを検知し、右下に「Reopen in Container」という通知が表示される。これをクリックする。（通知が表示されない場合は、コマンドパレット (`Ctrl+Shift+P` または `Cmd+Shift+P`) を開き、「Dev Containers: Reopen in Container」を実行する。）
4.  **初回ビルド:** 初めてコンテナを開く際には、Docker イメージのビルドなどに時間がかかる場合がある。VS Code のターミナルに進捗が表示される。
5.  **開発環境の起動完了:** ビルドが完了すると、VS Code が Dev Container に接続された状態で再起動する。VS Code のターミナルは、`backend` サービスコンテナ内の `/workspace/backend` をカレントディレクトリとして開く。
6.  **実行確認:** 以下のコマンドを順番に実行しアプリケーションサーバーを起動する。（※ `go mod tidy` は2回目以降は不要）
    ```bash
    go mod tidy
    make run
    ```
    サーバーが起動し、ポート (例: 8080) でリクエストを待ち受けるログが表示されれば成功。(`Ctrl+C` で停止できる。)

## OpenAPI を用いた開発フロー (OpenAPI Development Flow)
参考：[OpenAPIとは](https://www.aeyescan.jp/blog/openapi/)

このプロジェクトでは、API の仕様をOpenAPIで定義し、`oapi-codegen` を使用してサーバーサイドのコードの一部（型定義、サーバーインターフェースなど）を自動生成している。開発の基本的な流れは以下の通り。

1.  **OpenAPI 定義の編集:**
    APIの仕様変更や追加が必要な場合は、まず `api/openapi.yml` ファイルを編集する。スキーマ、パス、操作などを定義・修正する。
2.  **コード生成の実行:**
    `openapi.yml` を編集した後、コンテナ内のターミナルで以下の Make コマンドを実行し、Go のコード (`internal/generated/api.gen.go`、`internal/generated/types.gen.go`) を自動生成する。
    ```bash
    make gen-api
    make gen-type
    ```
3.  **各種コードの実装・修正:**
    * **ハンドラー (`internal/handler/`):** 生成された `ServerInterface` に変更があった場合、このディレクトリ内のハンドラー実装を修正または追加する。新しいエンドポイントのロジックなどを記述する。
    * **ドメインロジック、データアクセス等:** 必要に応じて、`internal/domain/`, `internal/application/`, `internal/infrastructure/persistence/` などの関連コードを実装・修正する。
