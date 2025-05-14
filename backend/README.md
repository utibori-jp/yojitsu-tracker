# Backend アプリケーション

## 概要 (Overview)

「Yojitsuトラッカー」のバックエンドです。

*(詳細な機能や目的については、後日追記)*

## ディレクトリ構成 (Directory Structure)
一部変更あるかも
ディレクトリ構成に関するインプット（https://www.issoh.co.jp/tech/details/4285/）
```
backend/
├── cmd/          # アプリケーションのエントリーポイント (main packages)
│   └── api/      # APIサーバー用の main package
│       └── main.go
├── ent/          # ent関連のファイル群
│   └── schema/   # entのスキーマ定義定義（例：user.go、todo.go）
├── internal/     # アプリケーション固有のコード (外部から import されたくないもの)
│   ├── application/ # アプリケーション/ユースケース層 (ビジネスロジックの調整役)
│   │   └── service/   # ビジネスロジック。entの型を直接扱い、リポジトリ経由でDB操作。
│   ├── domain/     # ドメイン層 (コアなビジネスロジック、エンティティ、リポジトリインターフェース)
│   │   └── repository/ # (例: user_repository.go - Interface)
│   │       └── user_repository.go # メソッドの引数や戻り値はentの型
│   ├── infra/ # インフラストラクチャ層 (DBアクセス、外部APIクライアントなど)
│   │   ├── persistence/ # データ永続化の実装
│   │   │   └── ent_user_repository.go # UserRepositoryインターフェースのent実装
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

## 技術スタック

本バックエンドアプリケーションは、以下の主要な技術・ライブラリで構築されています。

*   **プログラミング言語:** [Go](https://golang.org/)
*   **Webフレームワーク/ルーター:** [Chi](https://github.com/go-chi/chi) - 軽量でルーティング機能が豊富なHTTPルーター
*   **ORM:** [Ent](https://entgo.io/) - Goのエンティティフレームワーク (コード生成ベ
)
*   **データベース:** [PostgreSQL](https://www.postgresql.org/) 
*   **API仕様:** [OpenAPI 3.0](https://swagger.io/specification/)
*   **コード生成 (API):** [oapi-codegen](https://github.com/deepmap/oapi-codegen) - OpenAPI定義からGoのサーバー/クライアントコードを生成
*   **コンテナ化:** [Docker](https://www.docker.com/)
*   **開発環境:** [Dev Containers (VS Code)](https://code.visualstudio.com/docs/remote/containers)

これらの技術スタックは、「可能な限りコードを自動生成し、開発者がビジネスロジックの設計と記述に集中できるようにする」という思想のもと選定されています。

具体的には、APIの仕様をOpenAPIで定義し、これを中心にコード生成を行います。これにより、APIの型定義やサーバーインターフェースといった、ロジック部分（主にハンドラーとサービス）以外の多くのコードを自動で生成することが可能です。
データベースに関しても同様に、Entを用いてスキーマを定義することで、DDLの作成や、各サービスからのデータベース呼び出しに関連するコードの自動化を実現しています。

さらに、DockerコンテナとVS CodeのDev Containersを活用することで、開発環境の統一を図っています。これにより、開発者はVS CodeとDocker Desktopをインストールするだけで、誰でも同じ環境で開発を開始でき、環境構築に伴う手間や問題を大幅に削減しています。

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
    * **ドメインロジック、データアクセス等:** 必要に応じて、`internal/domain/`, `internal/application/`, `internal/infra/router` などの関連コードを実装・修正する。

## Ent によるデータモデル開発フロー

このプロジェクトでは、データベースのスキーマ定義とデータアクセスコードの生成に Ent を使用しています。Entを利用することで、型安全な方法でデータベース操作を行うことができ、開発効率の向上に繋がります。

開発の基本的な流れは以下の通りです。

1.  **スキーマ定義の作成・編集:**
    *   新しいエンティティ（テーブルに相当）を追加する場合や、既存エンティティのフィールド（カラムに相当）やリレーションを変更する場合は、`ent/schema/` ディレクトリ内の Go ファイルを編集します。
    *   例えば、`todo` というエンティティであれば `ent/schema/todo.go` を編集します。
    *   フィールドの型、バリデーションルール、リレーション（エッジ）などを定義します。詳細は Ent の公式ドキュメント を参照してください。

2.  **コード生成の実行:**
    *   スキーマ定義ファイルを編集した後、コンテナ内のターミナルで以下の Make コマンドを実行します。
        ```bash
        make ent-generate
        ```
    *   このコマンドは `ent generate ./ent/schema` を実行し、スキーマ定義に基づいて `ent/` ディレクトリ以下に必要な Go のコード（CRUD操作、マイグレーションコードなど）を自動生成・更新します。

3.  **マイグレーションの実行 (開発時):**
    *   生成されたマイグレーションコードをデータベースに適用し、実際のテーブル構造を更新します。開発環境では、アプリケーション起動時に自動でマイグレーションを実行するように設定されています (`cmd/api/main.go` 内の `client.Schema.Create(context.Background())`)。
    *   本番環境では、別途マイグレーションツールやスクリプトを用いて慎重に適用することを推奨します。

4.  **生成されたコードの利用:**
    *   `internal/application/service/` などのビジネスロジックを記述する箇所で、生成されたEntのクライアントや型を利用してデータベース操作を行います。
