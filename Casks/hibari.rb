cask "hibari" do
  version "1.2.6"
  sha256 "2e999b09c3f9377f1e4587f5d70cd4db1eae9490f751e1a51a7b9bb87e346eca"

  url "https://github.com/watrix811/homebrew-tap/releases/download/hibari-v#{version}/Hibari-v#{version}-macOS.zip"
  name "Hibari"
  desc "Single-tap left/right Command keys to toggle Japanese/English IME (US keyboards)"
  homepage "https://github.com/watrix811/hibari"

  depends_on macos: :sonoma

  app "Hibari.app"

  zap trash: [
    "~/Library/Preferences/com.watrix.hibari.plist",
    "~/Library/Saved Application State/com.watrix.hibari.savedState",
  ]
end
