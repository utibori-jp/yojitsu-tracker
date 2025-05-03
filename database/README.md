# Database ディレクトリ

このディレクトリは、データベース (PostgreSQL) 関連の設定ファイル、マイグレーションスクリプト、初期データなどを管理することを目的としています。

## ディレクトリ構成 (予定)

## 接続情報

Dev Container 環境 (Docker Compose) で起動される PostgreSQL データベースへの接続情報は以下の通りです。

* **ホスト名:**
    * **ローカルPC (ホストOS) から接続する場合:** `localhost` または `127.0.0.1`
    * **他のDockerコンテナ (例: `backend` サービス) から接続する場合:** `database` (これは `docker-compose.yml` で定義されたサービス名です)
* **ポート番号:** `5432` (デフォルトの PostgreSQL ポート)
* **ユーザー名:** `postgres` (環境変数 `POSTGRES_USER` で設定)
* **パスワード:** `postgres` (環境変数 `POSTGRES_PASSWORD` で設定)
* **データベース名:** `db` (環境変数 `POSTGRES_DB` で設定)

## 接続手順

データベースに接続して状態を確認したり、データを操作したりするには、いくつかの方法があります。

### 1. ローカルPCのターミナルから (`psql` コマンド)

ホストOS に PostgreSQL クライアントツール (`psql`) がインストールされている場合、ターミナルから以下のコマンドで直接接続できます。
コマンド実行後、パスワードの入力を求められますので、`postgres`と入力してください。

```bash
psql -h localhost -p 5432 -U postgres -d db
```
### 2. Docker コンテナ内のターミナルから (例: `backend` コンテナ)

VS Code の "Reopen in Container" などで `backend` サービスコンテナにアタッチしている場合、そのコンテナ内のターミナルから `database` サービスに接続できます。

まず、アタッチしているコンテナに `psql` クライアントがインストールされている必要があります。もしインストールされていない場合は、コンテナのベースOSに応じてインストールしてください。

* **Debian/Ubuntu系の場合:**
    ```bash
    apt-get update && apt-get install -y postgresql-client
    ```
* **Alpine Linux系の場合:**
    ```bash
    apk update && apk add postgresql-client
    ```

`psql` が利用可能になったら、以下のコマンドで接続します（ホスト名が `database` である点に注意してください）。

```bash
psql -h database -p 5432 -U postgres -d db
```
同様にパスワード (`postgres`) を入力します。

**別の方法 (`docker exec`):**

アタッチしているコンテナに `psql` をインストールしたくない場合は、ホストOSのターミナル（または VS Code の別のターミナル）から `docker exec` コマンドを使用し、`database` コンテナ内で直接 `psql` を実行することも可能です。

```bash
# 1. `docker ps` を実行して、database コンテナの正確な名前またはIDを確認します。
#    (例: <プロジェクト名>-database-1)
docker ps

# 2. 確認したコンテナ名/IDを使って psql を実行します。
docker exec -it <database_container_name_or_id> psql -U postgres -d db
```

### 3. GUI データベースクライアントから

pgAdmin, DBeaver, TablePlus, Beekeeper Studio などのグラフィカルなデータベース管理ツールを使用する場合は、新しい接続設定を作成し、以下の情報を入力します。

* **接続タイプ/ドライバ:** `PostgreSQL`
* **ホスト:** `localhost` (または `127.0.0.1`)
* **ポート:** `5432`
* **データベース:** `db`
* **ユーザー名:** `postgres`
* **パスワード:** `postgres`
* **SSLモード:** `disable` (または同等の設定)

設定後、接続テストを行い、問題なければ接続を保存して使用してください。
