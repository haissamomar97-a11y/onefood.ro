#!/usr/bin/env python3
"""
Importă produsele din Excel în site.

    pip install openpyxl
    python3 scripts/import-produse.py data/brazi.xlsx > lib/catalog.generated.ts

Rândurile cu același model (SKU fără înălțime, ex. „LID” din „LID-150”) devin un singur produs
cu variante de înălțime. Numele și textele în română pentru fiecare model sunt în MODELS, mai jos.
"""
import json
import re
import sys

import openpyxl

# model -> (slug, nume RO, extra descriere, etichete, recomandat)
MODELS = {
    "LID": ("brad-artificial-lidia-varfuri-albe", "Brad artificial Lidia cu vârfuri albe", "Vârfurile albe ale ramurilor dau impresia de brad proaspăt nins, fără zăpadă care să se scuture.", [], True),
    "VIC-S": ("brad-artificial-victoria-nins", "Brad artificial Victoria nins", "Un brad clasic, generos, cu zăpadă artificială pe toate ramurile.", [], False),
    "KOV-G": ("brad-artificial-kovalivska-vip-verde", "Brad artificial Kovalivska VIP, verde", "Unul dintre cei mai realiști brazi din colecție: ramuri dense, ace PE 3D în nuanțe naturale de verde.", ["premium"], True),
    "KOV-B": ("brad-artificial-kovalivska-vip-albastrui", "Brad artificial Kovalivska VIP, verde-albăstrui", "Nuanța verde-albăstruie a molidului argintiu, cu ace PE 3D foarte realiste.", ["premium"], False),
    "BEL-G": ("brad-artificial-belgian-verde", "Brad artificial Belgian, verde", "Formă elegantă, conică, cu ramuri bogate și ace PE 3D realiste.", ["premium"], False),
    "BEL-S": ("brad-artificial-belgian-nins", "Brad artificial Belgian nins", "Varianta ninsă a bradului Belgian: ace PE 3D realiste și zăpadă artificială pe vârfuri.", ["premium"], True),
    "BUK-G": ("brad-artificial-bukovel-verde", "Brad artificial Bukovel, verde", "Ace PE 3D realiste, pe suport metalic stabil.", ["premium"], False),
    "VIE-G": ("brad-artificial-vienna-verde", "Brad artificial Vienna, verde", "Brad dens, cu silueta clasică a bradului de munte și ace PE 3D.", ["premium"], False),
    "VIE-S": ("brad-artificial-vienna-nins", "Brad artificial Vienna nins", "Bradul Vienna în varianta ninsă — ace PE 3D și zăpadă artificială.", ["premium"], False),
    "CAN-G": ("brad-artificial-canadian-verde", "Brad artificial Canadian, verde", "Ace PE 3D realiste, pe suport metalic.", ["premium"], False),
    "PRE-S": ("brad-artificial-presidential-slim-nins", "Brad artificial Presidential Slim nins", "Siluetă îngustă (slim), ideală pentru apartamente, holuri și colțuri mai mici.", ["premium", "slim"], False),
    "ELI-C": ("brad-artificial-elite-buturuga-conuri", "Brad artificial Elite pe buturugă, cu conuri", "Montat pe o buturugă decorativă, gata decorat cu conuri.", ["decorat", "buturuga"], False),
    "ELI-V": ("brad-artificial-elite-buturuga-fructe-rosii", "Brad artificial Elite pe buturugă, cu fructe roșii", "Montat pe o buturugă decorativă, gata decorat cu fructe roșii de călin.", ["decorat", "buturuga"], False),
    "DIA-S": ("brad-artificial-diamond-buturuga-fructe-rosii", "Brad artificial Diamond pe buturugă, cu fructe roșii", "Pe buturugă decorativă, decorat cu fructe roșii de călin.", ["decorat", "buturuga"], False),
    "DIA-V": ("brad-artificial-diamond-fructe-rosii", "Brad artificial Diamond cu fructe roșii", "Decorat cu fructe roșii de călin, care contrastează frumos cu verdele ramurilor.", ["decorat"], False),
    "PRM-S": ("brad-artificial-premium-nins-buturuga", "Brad artificial Premium nins, pe buturugă", "Ace PE 3D, zăpadă artificială și buturugă decorativă — arată ca adus din pădure.", ["premium", "buturuga"], False),
    "VIE-P": ("bradut-vienna-in-ghiveci", "Brăduț Vienna în ghiveci", "Brăduț mic în ghiveci, perfect pentru masă, birou, pervaz sau balcon.", ["mini"], True),
    "CHR-G": ("brad-artificial-christmas-conuri-fructe-aurii", "Brad artificial Christmas cu conuri și fructe aurii", "Gata decorat cu conuri și fructe aurii — nu mai ai nevoie de multe globuri.", ["decorat"], True),
    "CRY": ("brad-artificial-crystal-fructe-rosii", "Brad artificial Crystal cu fructe roșii și vârfuri albe", "Fructe roșii de călin și vârfuri albe — decor festiv din prima.", ["decorat"], True),
    "CAR-G": ("brad-artificial-carpathian-verde", "Brad artificial Carpathian, verde", "Inspirat de brazii din Carpați, cu ramuri pline și vârfuri verzi.", [], False),
    "ROY-C": ("brad-artificial-royal-cleme", "Brad artificial Royal, ramuri cu cleme", "Vârful gamei: ramuri montate cu cleme metalice, foarte dense, cu ace PE 3D. Un brad impresionant pentru living-uri mari.", ["premium"], False),
    "GLO-S": ("brad-artificial-global-nins", "Brad artificial Global nins", "Brad lat și bogat, cu ace PE 3D și zăpadă artificială.", ["premium"], False),
}

MATERIAL = {
    "PE 3D": "Ace PE 3D turnate după ramuri reale — cel mai natural aspect pe care îl poate avea un brad artificial.",
    "PVC": "Ace din PVC moale, ramuri dese și pline, la un preț foarte bun.",
    "PVC + PE": "Ace PE 3D realiste la exterior și PVC des la interior, pentru volum și aspect natural.",
}


def model_of(sku: str) -> str:
    return re.sub(r"-\d+$", "", sku.strip().upper())


def num(v):
    return None if v in (None, "") else float(v)


def main(path: str):
    ws = openpyxl.load_workbook(path, data_only=True).active
    rows = list(ws.iter_rows(values_only=True))
    head = [str(h).strip() if h else "" for h in rows[0]]
    col = {name: head.index(name) for name in head if name}
    products = {}
    order = []
    for r in rows[1:]:
        sku = r[col["Cod SKU"]]
        if not sku:
            continue
        sku = str(sku).strip().upper()
        model = model_of(sku)
        if model not in MODELS:
            sys.exit(f"Model necunoscut: {model} (SKU {sku}). Adaugă-l în MODELS din scripts/import-produse.py")
        slug, name, extra, tags, featured = MODELS[model]
        material = (r[col["Material"]] or "").strip()
        snow = str(r[col["Snow"]] or "").strip().lower() == "da"
        h = int(num(r[col["Înălțime (cm)"]]))
        price = num(r[col["Preț vânzare cu TVA (RON)"]])
        if price is None:
            sys.exit(f"Preț lipsă pentru {sku}")
        if model not in products:
            order.append(model)
            t = list(tags) + (["nins"] if snow else [])
            desc = " ".join(x for x in [extra, MATERIAL.get(material, "")] if x)
            products[model] = {
                "slug": slug, "name": name, "category": "brazi", "material": material, "snow": snow,
                "tags": t, "featured": featured, "description": desc, "variantLabel": "Înălțime", "variants": [],
            }
        p = products[model]
        p["snow"] = p["snow"] or snow
        p["variants"].append({
            "id": str(h), "sku": sku, "label": f"{h} cm", "heightCm": h,
            "priceBani": round(price * 100),
            "stock": int(num(r[col["Cantitate (buc)"]]) or 0),
            "widthCm": num(r[col["Lățime (cm)"]]),
            "weightKg": num(r[col["Greutate (kg)"]]),
            "package": (str(r[col["Dimensiune ambalaj"]]).lower() if r[col["Dimensiune ambalaj"]] else None),
        })
    for p in products.values():
        p["variants"].sort(key=lambda v: v["heightCm"])
    out = [products[m] for m in order]
    print("// GENERAT AUTOMAT din Excel de scripts/import-produse.py — nu edita manual.")
    print('import type { ImportedProduct } from "./products";')
    print(f"export const importedProducts: ImportedProduct[] = {json.dumps(out, ensure_ascii=False, indent=2)};")
    print(f"// {len(out)} produse, {sum(len(p['variants']) for p in out)} variante", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data/brazi.xlsx")
