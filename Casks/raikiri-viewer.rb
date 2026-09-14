# Raikiri Viewer — Homebrew Cask（Mac App Store 経由）
#
# Raikiri Viewer の配布経路は Mac App Store 一本（2026-08-01 決定）。課金が StoreKit
# なので、App Store 以外から入れた実体は試用1ヶ月のあと購読できずに読めなくなる。
# そのため Cask も DMG を配らず、mas（Mac App Store CLI）に入れさせる形にしてある。
#
# 前提: 利用者が自分の Apple Account でこのアプリを「入手」済みであること。
#       未入手だと mas が `Not purchased` を返して失敗する（README 参照）。
cask "raikiri-viewer" do
  version "1.17.2"
  # App Store から実体を落とすのは mas なので、Homebrew 側の取得物は照合しない。
  sha256 :no_check

  url "https://apps.apple.com/jp/app/raikiri-viewer/id6795181030"
  name "Raikiri Viewer"
  desc "Comic and ebook viewer for CBZ, CBR, EPUB, PDF, and MOBI"
  homepage "https://raikiri.watrix.co.jp/"

  livecheck do
    url "https://itunes.apple.com/lookup?id=6795181030"
    strategy :json do |json|
      json["results"]&.map { |result| result["version"] }
    end
  end

  depends_on formula: "mas"
  depends_on macos: :sonoma # macOS 14 以降（project.yml の MACOSX_DEPLOYMENT_TARGET と一致）

  installer script: {
    executable: "mas",
    args:       ["install", "6795181030"],
  }

  uninstall trash: "/Applications/Raikiri Viewer.app"

  # サンドボックス版（App Store）はコンテナ配下にすべて入る。
  zap trash: [
    "~/Library/Application Scripts/jp.watrix.raikiri",
    "~/Library/Containers/jp.watrix.raikiri",
  ]
end
