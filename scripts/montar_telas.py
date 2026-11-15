"""Monta prints de celular lado a lado, com moldura e legenda (para o PDF).

Uso: python scripts/montar_telas.py saida.jpg tela1.jpg "Legenda 1" tela2.jpg "Legenda 2" ...
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONTE = "C:/Windows/Fonts/segoeuib.ttf"


def moldura(img: Image.Image) -> Image.Image:
    w, h = img.size
    pad = 14
    base = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    mask = Image.new("L", (w + 2 * pad, h + 2 * pad), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w + 2 * pad - 1, h + 2 * pad - 1], 46, fill=255)
    corpo = Image.new("RGBA", base.size, (31, 36, 48, 255))
    base.paste(corpo, (0, 0), mask)
    tela_mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(tela_mask).rounded_rectangle([0, 0, w - 1, h - 1], 34, fill=255)
    base.paste(img.convert("RGBA"), (pad, pad), tela_mask)
    return base


def montar(saida, itens):
    telas = [(moldura(Image.open(p).convert("RGB").resize((375, 812), Image.LANCZOS)), legenda) for p, legenda in itens]
    tw, th = telas[0][0].size
    gap, topo, leg = 60, 40, 90
    W = len(telas) * tw + (len(telas) + 1) * gap
    H = topo + th + leg
    folha = Image.new("RGB", (W, H), (255, 250, 243))
    d = ImageDraw.Draw(folha)
    f = ImageFont.truetype(FONTE, 30)
    for i, (t, legenda) in enumerate(telas):
        x = gap + i * (tw + gap)
        sombra = Image.new("RGBA", (tw + 40, th + 40), (0, 0, 0, 0))
        ImageDraw.Draw(sombra).rounded_rectangle([20, 26, tw + 20, th + 26], 46, fill=(31, 36, 48, 60))
        sombra = sombra.filter(ImageFilter.GaussianBlur(14))
        folha.paste(sombra, (x - 20, topo - 20), sombra)
        folha.paste(t, (x, topo), t)
        bw = d.textlength(legenda, font=f)
        d.text((x + (tw - bw) / 2, topo + th + 28), legenda, font=f, fill=(31, 36, 48))
    folha.save(saida, quality=90)
    print(saida, folha.size)


if __name__ == "__main__":
    args = sys.argv[2:]
    montar(sys.argv[1], list(zip(args[0::2], args[1::2])))
