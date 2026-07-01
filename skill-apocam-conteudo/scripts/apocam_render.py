# -*- coding: utf-8 -*-
"""
APOCAM | Biblioteca de renderização de peças sociais (offline, Pillow).

Design system oficial + verificador de conformidade de linguagem.
Renderiza slides 1080x1350 (4:5). Data-driven: você passa uma lista de dicts
descrevendo cada slide; o layout já testado cuida do resto.

Correções embutidas (erros que NÃO devem voltar):
  * Texto sempre em UTF-8 acentuado.
  * Sem escala dupla: helpers retornam coordenadas já escaladas (nunca reembrulhe em P()).
  * Ícones/setas vetoriais (sem depender de glyphs como "→").
  * Resolvedor de fontes com fallback (Montserrat->Poppins, Source Sans 3->Lato, Lora).
  * compliance_check() aborta se achar termo proibido.
  * 100% offline (não usa rede nem navegador).
"""
import os, math, glob, re
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ----------------------------------------------------------------------------
# Tokens
# ----------------------------------------------------------------------------
S = 2                       # supersampling (render 2x, downscale = nitidez)
LW, LH = 1080, 1350
W, H = LW * S, LH * S
ML = 96                     # margem lateral (unidades lógicas)

PALETTE = {
    "verde": (0, 133, 5), "verde_agua": (0, 158, 154), "azul": (0, 67, 79),
    "carmim": (217, 43, 67), "marrom": (128, 81, 61), "areia_queimada": (160, 115, 70),
    "areia_dourada": (220, 168, 101), "branco": (255, 255, 255),
}
VERDE, VERDE_AGUA, AZUL = PALETTE["verde"], PALETTE["verde_agua"], PALETTE["azul"]
CARMIM, AREIA_D, BRANCO = PALETTE["carmim"], PALETTE["areia_dourada"], PALETTE["branco"]

def P(v):  # lógico -> pixel (escalado). Aplicar UMA vez.
    return int(round(v * S))

# ----------------------------------------------------------------------------
# Conformidade de linguagem (regras não-negociáveis)
# ----------------------------------------------------------------------------
FORBIDDEN = [r"\bvendas?\b", r"\bdescontos?\b", r"\bintermedi[áa]ri", r"\bpromo[çc][ãa]o\b"]
# Frases de garantia/promessa: só passam se estiverem negadas (não/sem/nunca antes).
PROMISE = [r"promet[ae]", r"garant(e|ir|imos|ia)", r"cura garantida", r"resultado garantido"]

def compliance_check(texts, strict=True):
    """Recebe lista de strings. Aborta em termo proibido; avisa em promessa não-negada."""
    joined = " \n ".join(t for t in texts if t)
    low = joined.lower()
    hard = []
    for pat in FORBIDDEN:
        for m in re.finditer(pat, low):
            hard.append((pat, joined[max(0, m.start()-30):m.start()+30]))
    warn = []
    for pat in PROMISE:
        for m in re.finditer(pat, low):
            ctx = low[max(0, m.start()-16):m.start()]
            if not re.search(r"n[ãa]o|sem|nunca|jamais|\bnem\b|nenhum", ctx):
                warn.append((pat, joined[max(0, m.start()-40):m.start()+30]))
    print("== Conformidade ==")
    if hard:
        for pat, ctx in hard:
            print(f"  [PROIBIDO] {pat} :: ...{ctx.strip()}...")
        if strict:
            raise SystemExit("Abortado: termo proibido encontrado. Ajuste o texto.")
    else:
        print("  OK: sem venda/desconto/intermediária/promoção.")
    if warn:
        print("  [REVISAR] promessa possivelmente NÃO negada:")
        for pat, ctx in warn:
            print(f"    {pat} :: ...{ctx.strip()}...")
    else:
        print("  OK: nenhuma promessa não-negada.")
    return not hard

# ----------------------------------------------------------------------------
# Fontes (resolvedor com fallback + relatório)
# ----------------------------------------------------------------------------
class Fonts:
    # (papel, peso, italico) -> lista de "stems" em ordem de preferência
    CAND = {
        ("display","bold",False): ["Montserrat-Bold","Montserrat[wght]","Poppins-Bold"],
        ("display","med", False): ["Montserrat-Medium","Poppins-Medium"],
        ("display","reg", False): ["Montserrat-Regular","Poppins-Regular"],
        ("body","reg", False):    ["SourceSans3-Regular","SourceSans-Regular","Lato-Regular"],
        ("body","semi",False):    ["SourceSans3-SemiBold","Lato-Semibold"],
        ("body","bold",False):    ["SourceSans3-Bold","Lato-Bold"],
        ("serif","reg", False):   ["Lora-Regular","Lora-Variable","Lora[wght]"],
        ("serif","reg", True):    ["Lora-Italic","Lora-Italic-Variable","Lora-Italic[wght]"],
    }
    DIRS = [
        "/usr/share/fonts/truetype/google-fonts",
        "/usr/share/fonts/truetype/lato",
        os.path.expanduser("~/.local/share/fonts"),
        os.path.expanduser("~/.fonts"),
        "/usr/share/fonts",
    ]
    def __init__(self, extra_dir=None):
        dirs = ([extra_dir] if extra_dir else []) + self.DIRS
        self.files = []
        for d in dirs:
            if d and os.path.isdir(d):
                for ext in ("ttf","otf"):
                    self.files += glob.glob(os.path.join(d, "**", f"*.{ext}"), recursive=True)
        self.report = {}
    def _find(self, stems):
        for stem in stems:
            s = stem.lower()
            for f in self.files:
                if os.path.splitext(os.path.basename(f))[0].lower() == s:
                    return f, stem
        for stem in stems:  # startswith
            s = stem.lower().replace("[wght]","")
            for f in self.files:
                if os.path.splitext(os.path.basename(f))[0].lower().startswith(s):
                    return f, stem
        return None, None
    def get(self, role, size, weight="reg", italic=False):
        stems = self.CAND[(role, weight, italic)]
        path, used = self._find(stems)
        if not path:  # último recurso
            path, used = self.files[0], "FALLBACK"
        ideal = stems[0]
        if used != ideal:
            self.report[ideal] = os.path.basename(path)
        return ImageFont.truetype(path, P(size))
    def print_report(self):
        print("== Fontes ==")
        if not self.report:
            print("  OK: todas as fontes ideais disponíveis.")
        else:
            for ideal, used in self.report.items():
                print(f"  [substituição] {ideal} -> {used}")

# ----------------------------------------------------------------------------
# Fundo
# ----------------------------------------------------------------------------
def background():
    c1=np.array([5,59,69.]); c2=np.array([2,50,59.]); c3=np.array([5,58,56.])
    ys,xs=np.mgrid[0:H,0:W].astype(float)
    th=math.radians(155); vx,vy=math.sin(th),-math.cos(th)
    t=xs*vx+ys*vy; t=(t-t.min())/(t.max()-t.min()); seg=0.55
    tA=np.clip(t/seg,0,1)[...,None]; colA=c1*(1-tA)+c2*tA
    tB=np.clip((t-seg)/(1-seg),0,1)[...,None]; colB=c2*(1-tB)+c3*tB
    base=np.where((t<seg)[...,None],colA,colB).astype(float)
    def glow(b,cx,cy,rx,ry,color,amax,exp=1.35):
        d=np.sqrt(((xs-cx)/rx)**2+((ys-cy)/ry)**2)
        f=(np.clip(1-d,0,1)**exp*amax)[...,None]
        return b*(1-f)+np.array(color,float)*f
    base=glow(base,1.02*W,-0.06*H,0.95*W,0.62*H,VERDE_AGUA,0.42)
    base=glow(base,-0.04*W,1.06*H,0.80*W,0.58*H,VERDE,0.34)
    base=glow(base,0.15*W,0.10*H,0.55*W,0.40*H,AZUL,0.18)
    return Image.fromarray(np.clip(base,0,255).astype("uint8"),"RGB")

# ----------------------------------------------------------------------------
# Marca / logos
# ----------------------------------------------------------------------------
class Assets:
    def __init__(self, assets_dir):
        self.dir = assets_dir
    def _open(self, name):
        return Image.open(os.path.join(self.dir, name)).convert("RGBA")
    def mark(self):        return self._open("logo-apocam-mark.png")
    def wordmark(self):    return self._open("logo-apocam-branco.png")
    def mark_white(self):
        m=self.mark(); a=m.split()[3]
        w=Image.new("RGBA",m.size,(255,255,255,255)); w.putalpha(a); return w

def _scaled(img,wpx):
    r=wpx/img.width; return img.resize((max(1,int(img.width*r)),max(1,int(img.height*r))),Image.LANCZOS)
def _op(img,op):
    img=img.copy(); a=img.split()[3].point(lambda p:int(p*op)); img.putalpha(a); return img

# ----------------------------------------------------------------------------
# Texto (todas as helpers trabalham/retornam em pixel escalado)
# ----------------------------------------------------------------------------
def tw(d,txt,font): return d.textlength(txt,font=font)
def tracked_w(d,txt,font,tr): return (sum(tw(d,c,font)+P(tr) for c in txt)-P(tr)) if txt else 0
def draw_tracked(d,xy,txt,font,fill,tr):
    x,y=xy
    for c in txt: d.text((x,y),c,font=font,fill=fill); x+=tw(d,c,font)+P(tr)
    return x
def center_tracked(d,cx,y,txt,font,fill,tr):
    draw_tracked(d,(cx-tracked_w(d,txt,font,tr)/2,y),txt,font,fill,tr)
def wrap(d,txt,font,maxw):
    out=[]
    for line in txt.split("\n"):
        cur=""
        for wd in line.split():
            test=(cur+" "+wd).strip()
            if tw(d,test,font)<=maxw: cur=test
            else:
                if cur: out.append(cur)
                cur=wd
        out.append(cur)
    return out
def para(d,xy,txt,font,fill,maxw,lh,center=False,cx=None):
    x,y=xy
    for ln in wrap(d,txt,font,maxw):
        d.text((cx-tw(d,ln,font)/2 if center else x, y),ln,font=font,fill=fill)
        y+=P(lh)
    return y   # já escalado — some offsets como y+P(k), nunca P(y)

def vector_arrow(d, x, yc, length, color):
    d.line([x,yc,x+length-P(9),yc],fill=color,width=P(3))
    d.polygon([(x+length-P(15),yc-P(9)),(x+length,yc),(x+length-P(15),yc+P(9))],fill=color)

# ----------------------------------------------------------------------------
# Blocos reutilizáveis
# ----------------------------------------------------------------------------
def eyebrow(d,F,x,y,txt,fill=AREIA_D):
    d.rounded_rectangle([P(x),P(y)+P(9),P(x)+P(30),P(y)+P(12)],radius=P(2),fill=fill)
    draw_tracked(d,(P(x)+P(42),P(y)),txt.upper(),F.get("display",15,"med"),fill,3.5)
def footer(d,F,idx,total):
    y=1266
    d.line([P(ML),P(y-14),P(LW-ML),P(y-14)],fill=(255,255,255,38),width=P(1))
    draw_tracked(d,(P(ML),P(y)),"APOCAM",F.get("display",14,"med"),(255,255,255,155),2.5)
    draw_tracked(d,(P(ML)+P(96),P(y)+P(2)),"ASSOCIAÇÃO POPULAR DE CANNABIS MEDICINAL",
                 F.get("body",11,"reg"),(255,255,255,110),1.5)
    pg=f"{idx:02d} / {total:02d}"
    d.text((P(LW-ML)-tw(d,pg,F.get('display',14,'med')),P(y)),pg,font=F.get("display",14,"med"),fill=(255,255,255,155))

# ----------------------------------------------------------------------------
# Renderizadores por tipo de slide
# ----------------------------------------------------------------------------
def _new():
    base=background().convert("RGBA"); ov=Image.new("RGBA",(W,H),(0,0,0,0))
    return base,ov,ImageDraw.Draw(ov)
def _wm(ov,A,corner,wpx=520,op=0.055):
    img=_op(_scaled(A.mark_white(),P(wpx)),op); w,h=img.size
    ov.alpha_composite(img,{"br":(W-w,H-h),"bl":(0,H-h),"tl":(0,0),"tr":(W-w,0)}[corner])

def r_cover(F,A,s,idx,total):
    base,ov,d=_new(); _wm(ov,A,"br",560,0.05); cx=W/2
    logo=_scaled(A.mark(),P(188)); ov.alpha_composite(logo,(int(cx-logo.width/2),P(158)))
    center_tracked(d,cx,P(396),s["eyebrow"],F.get("display",16,"med"),AREIA_D,4)
    para(d,(0,P(446)),s["title"],F.get("display",66,"bold"),BRANCO,P(LW-2*ML),80,center=True,cx=cx)
    d.rounded_rectangle([int(cx-P(34)),P(636),int(cx+P(34)),P(641)],radius=P(3),fill=AREIA_D)
    para(d,(0,P(688)),s["subtitle"],F.get("serif",31,italic=True),(255,255,255,225),P(770),46,center=True,cx=cx)
    hint=s.get("hint","ARRASTE PARA VER AS ETAPAS"); f=F.get("display",14,"med")
    twd=tracked_w(d,hint,f,3); aw=P(30); gap=P(18); lx=cx-(twd+gap+aw)/2; ly=P(1120)
    draw_tracked(d,(lx,ly),hint,f,(255,255,255,185),3)
    vector_arrow(d,lx+twd+gap,ly+f.size*0.40,aw,AREIA_D)
    wm=_scaled(A.wordmark(),P(150)); ov.alpha_composite(wm,(int(cx-wm.width/2),P(1178)))
    return base,ov

def r_statement(F,A,s,idx,total):
    base,ov,d=_new(); _wm(ov,A,"bl",520,0.05)
    eyebrow(d,F,ML,360,s["eyebrow"])
    y=para(d,(P(ML),P(434)),s["title"],F.get("display",60,"bold"),BRANCO,P(LW-2*ML),74)
    d.rounded_rectangle([P(ML),y+P(6),P(ML)+P(70),y+P(11)],radius=P(3),fill=AREIA_D)
    y=para(d,(P(ML),y+P(52)),s["body"],F.get("body",33,"reg"),(255,255,255,232),P(LW-2*ML),50)
    cy=y+P(50); cxp=P(ML); fchip=F.get("display",21,"med"); h=P(66)
    for txt,col in s.get("chips",[]):
        wd=tw(d,txt,fchip)+P(74)
        if cxp+wd>P(LW-ML): cxp=P(ML); cy+=h+P(20)
        d.rounded_rectangle([cxp,cy,cxp+wd,cy+h],radius=P(33),outline=col,width=P(2),fill=(col[0],col[1],col[2],26))
        d.ellipse([cxp+P(28),cy+h/2-P(5),cxp+P(38),cy+h/2+P(5)],fill=col)
        d.text((cxp+P(50),cy+h/2),txt,font=fchip,fill=BRANCO,anchor="lm"); cxp+=wd+P(18)
    footer(d,F,idx,total); return base,ov

def r_step(F,A,s,idx,total):
    base,ov,d=_new(); n=s["n"]; tot=s.get("steps",5)
    eyebrow(d,F,ML,120,s.get("eyebrow","Como funciona"))
    dotx=P(LW-ML)
    for i in range(tot,0,-1):
        cur=(i==n); col=AREIA_D if cur else (255,255,255,70); rr=P(11) if cur else P(7); cyd=P(156)
        d.ellipse([dotx-2*rr,cyd-rr,dotx,cyd+rr],fill=col); dotx-=P(34)
    x0,y0,x1,y1=P(ML),P(238),P(LW-ML),P(1150)
    d.rounded_rectangle([x0,y0,x1,y1],radius=P(30),fill=(255,255,255,15),outline=(255,255,255,46),width=P(2))
    d.rounded_rectangle([x0,y0,x0+P(8),y1],radius=P(4),fill=AREIA_D)
    px=x0+P(62); by=y0+P(72); bd=P(104)
    d.ellipse([px,by,px+bd,by+bd],fill=AREIA_D)
    d.text((px+bd/2,by+bd/2),str(n),font=F.get("display",46,"bold"),fill=(3,44,52),anchor="mm")
    draw_tracked(d,(px+bd+P(32),by+P(18)),"ETAPA",F.get("display",15,"med"),AREIA_D,3)
    d.text((px+bd+P(32),by+P(46)),f"{n} de {tot}",font=F.get("display",24,"med"),fill=(255,255,255,235))
    ty=by+bd+P(56)
    ty=para(d,(px,ty),s["title"],F.get("display",43,"bold"),BRANCO,x1-px-P(62),54)
    d.rounded_rectangle([px,ty+P(12),px+P(64),ty+P(17)],radius=P(3),fill=VERDE_AGUA)
    para(d,(px,ty+P(54)),s["body"],F.get("body",32,"reg"),(255,255,255,233),x1-px-P(62),50)
    footer(d,F,idx,total); return base,ov

def r_callout(F,A,s,idx,total):
    base,ov,d=_new(); _wm(ov,A,"br",520,0.055); cx=W/2
    ic=P(116); iy=P(372); ix=int(cx-ic/2); d.ellipse([ix,iy,ix+ic,iy+ic],outline=AREIA_D,width=P(4))
    cyi=iy+ic/2
    d.ellipse([cx-P(6),cyi-P(26),cx+P(6),cyi-P(14)],fill=AREIA_D)
    d.rounded_rectangle([cx-P(6),cyi-P(6),cx+P(6),cyi+P(28)],radius=P(6),fill=AREIA_D)
    center_tracked(d,cx,P(560),s["eyebrow"],F.get("display",16,"med"),AREIA_D,3.5)
    y=para(d,(0,P(624)),s["main"],F.get("display",37,"med"),BRANCO,P(872),52,center=True,cx=cx)
    if s.get("sub"):
        para(d,(0,y+P(34)),s["sub"],F.get("serif",29,italic=True),(255,255,255,222),P(824),44,center=True,cx=cx)
    footer(d,F,idx,total); return base,ov

def r_cta(F,A,s,idx,total):
    base,ov,d=_new(); _wm(ov,A,"tr",520,0.05); cx=W/2
    center_tracked(d,cx,P(228),s["eyebrow"],F.get("display",16,"med"),AREIA_D,4)
    para(d,(0,P(280)),s["title"],F.get("display",54,"bold"),BRANCO,P(LW-2*ML),66,center=True,cx=cx)
    y=para(d,(0,P(486)),s["body"],F.get("body",32,"reg"),(255,255,255,230),P(864),50,center=True,cx=cx)
    bt=s.get("button","Buscar orientação"); fb=F.get("display",24,"med")
    bw=tw(d,bt,fb)+P(100); bh=P(86); bx=int(cx-bw/2); by=y+P(44)
    d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=P(43),fill=VERDE_AGUA)
    d.text((cx,by+bh/2),bt,font=fb,fill=BRANCO,anchor="mm")
    if s.get("sede_label"):
        center_tracked(d,cx,by+bh+P(48),s["sede_label"],F.get("display",13,"med"),AREIA_D,3)
    if s.get("sede_addr"):
        d.text((cx,by+bh+P(84)),s["sede_addr"],font=F.get("body",23,"reg"),fill=(255,255,255,222),anchor="ma")
    wm=_scaled(A.wordmark(),P(168)); ov.alpha_composite(wm,(int(cx-wm.width/2),P(1120)))
    return base,ov

RENDERERS = {"cover":r_cover,"statement":r_statement,"step":r_step,"callout":r_callout,"cta":r_cta}

# ----------------------------------------------------------------------------
# API principal
# ----------------------------------------------------------------------------
def _collect_texts(slides):
    keys=("eyebrow","title","subtitle","body","main","sub","button","sede_addr","hint")
    out=[]
    for s in slides:
        for k in keys:
            if isinstance(s.get(k),str): out.append(s[k])
        for c in s.get("chips",[]): out.append(c[0])
    return out

def render_carousel(slides, out_dir, assets_dir, fonts_dir=None, montage=True, strict=True):
    os.makedirs(out_dir, exist_ok=True)
    compliance_check(_collect_texts(slides), strict=strict)
    F=Fonts(fonts_dir); A=Assets(assets_dir)
    total=len(slides); paths=[]
    for i,s in enumerate(slides,1):
        base,ov=RENDERERS[s["type"]](F,A,s,i,total)
        img=Image.alpha_composite(base,ov).convert("RGB").resize((LW,LH),Image.LANCZOS)
        p=os.path.join(out_dir,f"slide-{i:02d}.png"); img.save(p,"PNG"); paths.append(p); print("ok",os.path.basename(p))
    F.print_report()
    if montage:
        cols=3; rows=math.ceil(total/cols); tw_,th_,pad=360,450,12
        sheet=Image.new("RGB",(cols*tw_+(cols+1)*pad,rows*th_+(rows+1)*pad),(228,233,232))
        for i,p in enumerate(paths):
            im=Image.open(p).resize((tw_,th_),Image.LANCZOS); r,c=divmod(i,cols)
            sheet.paste(im,(pad+c*(tw_+pad),pad+r*(th_+pad)))
        mp=os.path.join(out_dir,"montage.png"); sheet.save(mp); print("montagem:",mp)
  