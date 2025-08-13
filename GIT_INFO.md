# 🏮 Kamakura Event Management System - Git Repository Info

## 📍 **ローカルリポジトリ情報**

### 🔧 **基本情報**
- **リポジトリ場所**: `C:\Users\sugimoto\OneDrive\project\kamakura-event-app`
- **現在のブランチ**: `master`
- **最新タグ**: `v1.0`
- **コミット数**: 2個

### 📊 **リポジトリ統計**
```bash
# 基本コマンド
cd C:\Users\sugimoto\OneDrive\project\kamakura-event-app

# 履歴確認
git log --oneline --graph --decorate

# ファイル一覧
git ls-files

# タグ確認
git tag -l

# 変更統計
git log --stat
```

## 🌐 **GitHub アップロード手順**

### 1. **GitHub リポジトリ作成**
1. https://github.com にアクセス
2. 「New repository」→「kamakura-event-management」
3. Public/Private 選択
4. 「Create repository」

### 2. **リモート追加とプッシュ**
```bash
cd C:\Users\sugimoto\OneDrive\project\kamakura-event-app

# リモート追加
git remote add origin https://github.com/[USERNAME]/kamakura-event-management.git

# プッシュ
git push -u origin master
git push origin --tags  # すべてのタグをプッシュ
```

### 3. **他の場所でクローン**
```bash
# 任意のディレクトリで
git clone https://github.com/[USERNAME]/kamakura-event-management.git
cd kamakura-event-management

# 依存関係インストール
npm run install:all

# 開発サーバー起動
npm run dev
```

## 🔑 **アクセスレベル**

### 🏠 **ローカルアクセス**
- **現在**: ✅ 利用可能
- **場所**: `C:\Users\sugimoto\OneDrive\project\kamakura-event-app`
- **コマンド**: `cd kamakura-event-app && git status`

### 🌍 **リモートアクセス**
- **現在**: ❌ 設定されていません
- **推奨**: GitHub、GitLab、Bitbucket
- **利点**: バックアップ、共有、CI/CD

## 📚 **Git コマンド集**

```bash
# 基本操作
git status                    # 現在の状態
git log --oneline            # 履歴（簡潔版）
git tag                      # タグ一覧
git branch                   # ブランチ一覧

# ファイル操作
git ls-files                 # 追跡中のファイル一覧
git show HEAD                # 最新コミットの詳細
git diff                     # 変更差分

# バージョン管理
git checkout v1.0            # v1.0タグにチェックアウト
git checkout master          # masterブランチに戻る
```

## 🚀 **次のステップ推奨事項**

1. **🔄 GitHub アップロード** - 他の場所からアクセス可能に
2. **🏷️ ブランチ戦略** - `develop`ブランチ作成
3. **📋 Issues 管理** - GitHub Issues で課題管理  
4. **🤖 CI/CD 設定** - GitHub Actions で自動デプロイ
5. **👥 協力者追加** - チーム開発の場合

---

## 📞 **サポート情報**
- **Git ドキュメント**: https://git-scm.com/doc
- **GitHub ガイド**: https://guides.github.com/
- **ローカルパス**: `C:\Users\sugimoto\OneDrive\project\kamakura-event-app`

**🏮 いつでもこのディレクトリからGit操作が可能です！ 🏮**