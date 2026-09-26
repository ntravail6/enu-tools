#!/usr/bin/env python3
"""
株ログ — 銘柄辞書アップデートスクリプト

JPX（日本取引所）が公開する東証上場銘柄一覧 (data_j.xls) から
銘柄コード → 銘柄名 の JSON を生成します。

使い方:
  pip install pandas openpyxl xlrd
  python update-stocks.py

出力:
  stocks.json（アプリと同じフォルダに配置してください）
"""

import json
import sys

try:
    import pandas as pd
except ImportError:
    print("pandas が必要です: pip install pandas openpyxl xlrd")
    sys.exit(1)

URL = "https://www.jpx.co.jp/markets/statistics-equities/misc/tvdivq0000001vg2-att/data_j.xls"

def main():
    print(f"📥 JPX銘柄一覧をダウンロード中...\n   {URL}")
    try:
        df = pd.read_excel(URL)
    except Exception as e:
        print(f"❌ ダウンロード失敗: {e}")
        print("   ネットワーク接続を確認してください。")
        sys.exit(1)

    # カラム名を確認
    print(f"   カラム: {list(df.columns)}")

    # コードと銘柄名を抽出
    stocks = {}
    code_col = None
    name_col = None

    # カラム名を柔軟に検索（JPXがフォーマット変更しても対応）
    for col in df.columns:
        col_str = str(col)
        if 'コード' in col_str and not code_col:
            code_col = col
        if '銘柄名' in col_str and not name_col:
            name_col = col

    if not code_col or not name_col:
        print(f"❌ カラムが見つかりません。")
        print(f"   コード列: {code_col}, 銘柄名列: {name_col}")
        print(f"   利用可能なカラム: {list(df.columns)}")
        sys.exit(1)

    print(f"   コード列: '{code_col}' / 銘柄名列: '{name_col}'")

    for _, row in df.iterrows():
        try:
            code = str(row[code_col]).strip()
            name = str(row[name_col]).strip()
            # 4桁 or 5桁の数字コードのみ対象
            if code and name and code.isdigit() and 4 <= len(code) <= 5:
                stocks[code] = name
        except Exception:
            continue

    # JSON 出力
    output_path = "stocks.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(stocks, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\n✅ {len(stocks)} 銘柄を {output_path} に書き出しました")
    size_kb = len(json.dumps(stocks, ensure_ascii=False).encode("utf-8")) / 1024
    print(f"   ファイルサイズ: {size_kb:.1f} KB")

if __name__ == "__main__":
    main()
