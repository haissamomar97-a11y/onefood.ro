#!/usr/bin/env python3
"""Imagini provizorii (SVG) pentru produsele fără poză. Se înlocuiesc cu poze reale în public/produse/."""
import json, pathlib
src = pathlib.Path("lib/catalog.generated.ts").read_text()
data = json.loads(src[src.index("= [") + 2 : src.rindex("]") + 1])
out = pathlib.Path("public/produse"); out.mkdir(parents=True, exist_ok=True)
for p in data:
    blue = "albastrui" in p["slug"]
    green, dark = ("#3d7a8a", "#2a5b68") if blue else ("#1f6b4a", "#134a33")
    snow = p["snow"] or "varfuri-albe" in p["slug"]
    deco = "decorat" in p["tags"]
    mini = "mini" in p["tags"]
    w = 0.7 if "slim" in p["tags"] else 1.0
    def tier(y, half):
        hw = half * w
        return (f'<path d="M200 {y-70} L{200-hw} {y} Q200 {y+14} {200+hw} {y} Z" fill="{green}"/>'
                f'<path d="M200 {y-70} L{200+hw} {y} Q{200+hw*0.4} {y+8} 200 {y+6} Z" fill="{dark}" opacity=".55"/>')
    tiers = "".join(tier(y, h) for y, h in [(150, 60), (205, 85), (265, 112), (320, 135)])
    snowd = "".join(f'<ellipse cx="{200+dx*w}" cy="{y}" rx="{rx*w}" ry="5" fill="#fff" opacity=".9"/>'
                    for dx, y, rx in [(-40,148,18),(35,150,16),(-60,204,22),(55,206,20),(0,202,14),(-90,264,22),(80,266,24),(-20,262,16),(-110,318,22),(100,320,22),(10,318,18)]) if snow else ""
    col = "#e0b84f" if "aurii" in p["slug"] else "#c0322b"
    decod = "".join(f'<circle cx="{200+dx*w}" cy="{y}" r="7" fill="{col}"/>'
                    for dx, y in [(-25,180),(30,190),(-55,235),(45,245),(5,225),(-80,295),(70,300),(-15,290),(100,312),(-105,312)]) if deco else ""
    if "buturuga" in p["tags"]:
        trunk = '<ellipse cx="200" cy="352" rx="46" ry="14" fill="#7a5233"/><rect x="154" y="330" width="92" height="22" fill="#8b5e3c"/><ellipse cx="200" cy="330" rx="46" ry="12" fill="#a8774d"/>'
    elif mini:
        trunk = '<path d="M165 330h70l-8 38h-54z" fill="#b5824f"/>'
    else:
        trunk = '<rect x="190" y="325" width="20" height="30" fill="#6b4a2e"/><path d="M170 355h60l-6 12h-48z" fill="#333"/>'
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="g" cx="50%" cy="35%" r="70%">'
           '<stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1e8d6"/></radialGradient></defs>'
           f'<rect width="400" height="400" fill="url(#g)"/>{tiers}{snowd}{decod}{trunk}'
           '<path d="m200 64 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#c8a24a"/></svg>')
    (out / f"{p['slug']}.svg").write_text(svg)
print(len(data), "imagini")
