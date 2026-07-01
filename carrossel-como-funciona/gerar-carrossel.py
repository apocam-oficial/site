# -*- coding: utf-8 -*-
"""
APOCAM | Carrossel "Como funciona o acolhimento" — 9 slides 1080x1350 (retrato 4:5).
Design system oficial. Fontes offline: Poppins (~Montserrat), Lora (exata), Lato (~Source Sans 3).
"""
import os, math
from PIL import Image, ImageDraw, ImageFont
import numpy as np

S = 2
LW, LH = 1080, 1350
W, H = LW * S, LH * S
BASE = "/sessions/magical-brave-archimedes/mnt/outputs/carrossel"
OUT = os.path.join(BASE, "slides"); os.makedirs(OUT, exist_ok=True)
ASSETS = os.path.join(BASE, "assets")

# Paleta oficial
VERDE=(0,133,5); VERDE_AGUA=(0,158,154); AZUL=(0,67,79)
CARMIM=(217,43,67); AREIA_D=(220,168,101); BRANCO=(255,255,255)
ML = 96

def P(v): return int(round(v*S))

GF = "/usr/share/fonts/truetype/google-fonts"
LATO = "/usr/share/fonts/truetype/lato"
def poppins(size, w="bold"):
    m={"reg":"Poppins-Regular.ttf","med":"Poppins-Medium.ttf","light":"Poppins-Light.ttf","bold":"Poppins-Bold.ttf"}
    return ImageFont.truetype(os.path.join(GF,m[w]), P(size))
def lato(size, w="reg"):
    m={"reg":"Lato-Regular.ttf","semi":"Lato-Semibold.ttf","med":"Lato-Medium.ttf","bold":"Lato-Bold.ttf"}
    return ImageFont.truetype(os.path.join(LATO,m[w]), P(size))
def lora(size, italic=False, weight=430):
    f=ImageFont.truetype(os.path.join(GF,"Lora-Italic-Variable.ttf" if italic else "Lora-Variable.ttf"), P(size))
    try: f.set_variation_by_axes([weight])
    except Exception: pass
    return f

# ---------- Fundo: gradiente escuro + brilhos (secao 'Como funciona') ----------
def background():
    c1=np.array([5,59,69.]); c2=np.array([2,50,59.]); c3=np.array([5,58,56.])
    ys,xs=np.mgrid[0:H,0:W].astype(float)
    th=math.radians(155); vx,vy=math.sin(th),-math.cos(th)
    t=xs*vx+ys*vy; t=(t-t.min())/(t.max()-t.min())
    seg=0.55
    tA=np.clip(t/seg,0,1)[...,None]; colA=c1*(1-tA)+c2*tA
    tB=np.clip((t-seg)/(1-seg),0,1)[...,None]; colB=c2*(1-tB)+c3*tB
    base=np.where((t<seg)[...,None],colA,colB).astype(float)
    def glow(base,cx,cy,rx,ry,color,amax,exp=1.35):
        d=np.sqrt(((xs-cx)/rx)**2+((ys-cy)/ry)**2)
        f=(np.clip(1-d,0,1)**exp*amax)[...,None]
        return base*(1-f)+np.array(color,float)*f
    base=glow(base,1.02*W,-0.06*H,0.95*W,0.62*H,VERDE_AGUA,0.42)
    base=glow(base,-0.04*W,1.06*H,0.80*W,0.58*H,VERDE,0.34)
    base=glow(base,0.15*W,0.10*H,0.55*W,0.40*H,AZUL,0.18)
    return Image.fromarray(np.clip(base,0,255).astype("uint8"),"RGB")

# ---------- Logos / marca d'agua ----------
def _open(name): return Image.open(os.path.join(ASSETS,name)).convert("RGBA")
def mark_white():
    m=_open("logo-apocam-mark.png"); a=m.split()[3]
    w=Image.new("RGBA",m.size,(255,255,255,255)); w.putalpha(a); return w
def scaled(img,wpx):
    r=wpx/img.width; return img.resize((max(1,int(img.width*r)),max(1,int(img.height*r))),Image.LANCZOS)
def with_opacity(img,op):
    img=img.copy(); a=img.split()[3].point(lambda p:int(p*op)); img.putalpha(a); return img
def paste_wm(ov,corner,wpx=520,op=0.055):
    img=with_opacity(scaled(mark_white(),P(wpx)),op); w,h=img.size
    xy={"br":(W-w,H-h),"bl":(0,H-h),"tl":(0,0),"tr":(W-w,0)}[corner]
    ov.alpha_composite(img,xy)

# ---------- Texto ----------
def tw(d,txt,font): return d.textlength(txt,font=font)
def tracked_w(d,txt,font,tr):
    return sum(tw(d,ch,font)+P(tr) for ch in txt)-P(tr) if txt else 0
def draw_tracked(d,xy,txt,font,fill,tr):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=font,fill=fill); x+=tw(d,ch,font)+P(tr)
    return x
def center_tracked(d,cx,y,txt,font,fill,tr):
    draw_tracked(d,(cx-tracked_w(d,txt,font,tr)/2,y),txt,font,fill,tr)
def wrap(d,txt,font,maxw):
    out=[]
    for para_ in txt.split("\n"):
        cur=""
        for wd in para_.split():
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
        if center: d.text((cx-tw(d,ln,font)/2,y),ln,font=font,fill=fill)
        else: d.text((x,y),ln,font=font,fill=fill)
        y+=P(lh)
    return y

def eyebrow(d,x,y,txt,fill=AREIA_D):
    d.rounded_rectangle([P(x),P(y)+P(9),P(x)+P(30),P(y)+P(12)],radius=P(2),fill=fill)
    draw_tracked(d,(P(x)+P(42),P(y)),txt.upper(),poppins(15,"med"),fill,3.5)
def footer(d,idx,total):
    y=1266
    d.line([P(ML),P(y-14),P(LW-ML),P(y-14)],fill=(255,255,255,38),width=P(1))
    draw_tracked(d,(P(ML),P(y)),"APOCAM",poppins(14,"med"),(255,255,255,155),2.5)
    draw_tracked(d,(P(ML)+P(96),P(y)+P(2)),"ASSOCIAÇÃO POPULAR DE CANNABIS MEDICINAL",lato(11,"reg"),(255,255,255,110),1.5)
    pg=f"{idx:02d} / {total:02d}"
    d.text((P(LW-ML)-tw(d,pg,poppins(14,"med")),P(y)),pg,font=poppins(14,"med"),fill=(255,255,255,155))

def new_slide():
    base=background().convert("RGBA")
    ov=Image.new("RGBA",(W,H),(0,0,0,0))
    return base,ov,ImageDraw.Draw(ov)
def finish(base,ov,idx):
    img=Image.alpha_composite(base,ov).convert("RGB").resize((LW,LH),Image.LANCZOS)
    p=os.path.join(OUT,f"slide-{idx:02d}.png"); img.save(p,"PNG"); print("ok",os.path.basename(p))

TOTAL=9

# ---------- 1. Capa ----------
def s_cover(idx):
    base,ov,d=new_slide(); paste_wm(ov,"br",560,0.05); cx=W/2
    logo=scaled(_open("logo-apocam-mark.png"),P(188))
    ov.alpha_composite(logo,(int(cx-logo.width/2),P(158)))
    center_tracked(d,cx,P(396),"COMO FUNCIONA",poppins(16,"med"),AREIA_D,4)
    para(d,(0,P(446)),"Como funciona o\nacolhimento na APOCAM",poppins(66,"bold"),BRANCO,P(LW-2*ML),80,center=True,cx=cx)
    d.rounded_rectangle([int(cx-P(34)),P(636),int(cx+P(34)),P(641)],radius=P(3),fill=AREIA_D)
    para(d,(0,P(688)),"Do primeiro contato ao acompanhamento: um caminho ético, gratuito e sem julgamento.",
         lora(31,italic=True),(255,255,255,225),P(770),46,center=True,cx=cx)
    # arraste + seta desenhada
    lab="ARRASTE PARA VER AS ETAPAS"; f=poppins(14,"med")
    twd=tracked_w(d,lab,f,3); aw=P(30); gap=P(18); total=twd+gap+aw
    lx=cx-total/2; ly=P(1120)
    draw_tracked(d,(lx,ly),lab,f,(255,255,255,185),3)
    ax=lx+twd+gap; ayc=ly+f.size*0.40
    d.line([ax,ayc,ax+aw-P(9),ayc],fill=AREIA_D,width=P(3))
    d.polygon([(ax+aw-P(15),ayc-P(9)),(ax+aw,ayc),(ax+aw-P(15),ayc+P(9))],fill=AREIA_D)
    wm=scaled(_open("logo-apocam-branco.png"),P(150))
    ov.alpha_composite(wm,(int(cx-wm.width/2),P(1178)))
    finish(base,ov,idx)

# ---------- 2. Contexto ----------
def s_context(idx):
    base,ov,d=new_slide(); paste_wm(ov,"bl",520,0.05)
    eyebrow(d,ML,360,"Para quem é")
    y=para(d,(P(ML),P(434)),"Aberto a\nqualquer pessoa",poppins(60,"bold"),BRANCO,P(LW-2*ML),74)
    d.rounded_rectangle([P(ML),y+P(6),P(ML)+P(70),y+P(11)],radius=P(3),fill=AREIA_D)
    body=("O acolhimento da APOCAM não exige laudo prévio nem região específica. "
          "Nosso foco é facilitar o acesso à consulta médica, com prioridade "
          "para quem não tem condições de arcar com o atendimento.")
    y=para(d,(P(ML),y+P(52)),body,lato(33),(255,255,255,232),P(LW-2*ML),50)
    chips=[("Gratuito",VERDE_AGUA),("Sem laudo prévio",AREIA_D),("Escuta sem julgamento",VERDE_AGUA)]
    cy=y+P(50); cxp=P(ML); fchip=poppins(21,"med"); h=P(66)
    for txt,col in chips:
        wd=tw(d,txt,fchip)+P(74)
        if cxp+wd>P(LW-ML): cxp=P(ML); cy+=h+P(20)
        d.rounded_rectangle([cxp,cy,cxp+wd,cy+h],radius=P(33),outline=col,width=P(2),fill=(col[0],col[1],col[2],26))
        d.ellipse([cxp+P(28),cy+h/2-P(5),cxp+P(38),cy+h/2+P(5)],fill=col)
        d.text((cxp+P(50),cy+h/2),txt,font=fchip,fill=BRANCO,anchor="lm")
        cxp+=wd+P(18)
    footer(d,idx,TOTAL); finish(base,ov,idx)

# ---------- 3-7. Etapas ----------
def s_step(idx,n,title,body):
    base,ov,d=new_slide()
    eyebrow(d,ML,120,"Como funciona")
    dotx=P(LW-ML)
    for i in range(5,0,-1):
        cur=(i==n); col=AREIA_D if cur else (255,255,255,70); rr=P(11) if cur else P(7)
        cyd=P(150)+P(6)
        d.ellipse([dotx-2*rr,cyd-rr,dotx,cyd+rr],fill=col); dotx-=P(34)
    x0,y0,x1,y1=P(ML),P(238),P(LW-ML),P(1150)
    d.rounded_rectangle([x0,y0,x1,y1],radius=P(30),fill=(255,255,255,15),outline=(255,255,255,46),width=P(2))
    d.rounded_rectangle([x0,y0,x0+P(8),y1],radius=P(4),fill=AREIA_D)
    px=x0+P(62); by=y0+P(72); bd=P(104)
    d.ellipse([px,by,px+bd,by+bd],fill=AREIA_D)
    d.text((px+bd/2,by+bd/2),str(n),font=poppins(46,"bold"),fill=(3,44,52),anchor="mm")
    draw_tracked(d,(px+bd+P(32),by+P(18)),"ETAPA",poppins(15,"med"),AREIA_D,3)
    d.text((px+bd+P(32),by+P(46)),f"{n} de 5",font=poppins(24,"med"),fill=(255,255,255,235))
    ty=by+bd+P(56)
    ty=para(d,(px,ty),title,poppins(43,"bold"),BRANCO,x1-px-P(62),54)
    d.rounded_rectangle([px,ty+P(12),px+P(64),ty+P(17)],radius=P(3),fill=VERDE_AGUA)
    para(d,(px,ty+P(54)),body,lato(32),(255,255,255,233),x1-px-P(62),50)
    footer(d,idx,TOTAL); finish(base,ov,idx)

# ---------- 8. Aviso etico ----------
def s_callout(idx):
    base,ov,d=new_slide(); paste_wm(ov,"br",520,0.055); cx=W/2
    ic=P(116); iy=P(372); ix=int(cx-ic/2)
    d.ellipse([ix,iy,ix+ic,iy+ic],outline=AREIA_D,width=P(4))
    cyi=iy+ic/2
    d.ellipse([cx-P(6),cyi-P(26),cx+P(6),cyi-P(14)],fill=AREIA_D)
    d.rounded_rectangle([cx-P(6),cyi-P(6),cx+P(6),cyi+P(28)],radius=P(6),fill=AREIA_D)
    center_tracked(d,cx,P(560),"COM RESPONSABILIDADE E ÉTICA",poppins(16,"med"),AREIA_D,3.5)
    main=("A APOCAM não promete resultados terapêuticos nem garante a "
          "concessão de habeas corpus ou de decisões judiciais.")
    y=para(d,(0,P(624)),main,poppins(37,"med"),BRANCO,P(872),52,center=True,cx=cx)
    sub=("Cada caso é único e conduzido com informação, escuta qualificada "
         "e cuidado, sempre com base em evidências.")
    para(d,(0,y+P(34)),sub,lora(29,italic=True),(255,255,255,222),P(824),44,center=True,cx=cx)
    footer(d,idx,TOTAL); finish(base,ov,idx)

# ---------- 9. CTA ----------
def s_cta(idx):
    base,ov,d=new_slide(); paste_wm(ov,"tr",520,0.05); cx=W/2
    center_tracked(d,cx,P(228),"FALE COM A GENTE",poppins(16,"med"),AREIA_D,4)
    para(d,(0,P(280)),"Precisa de acolhimento\nou quer somar?",poppins(54,"bold"),BRANCO,P(LW-2*ML),66,center=True,cx=cx)
    body=("Seja para buscar orientação, contribuir ou se voluntariar, este é um "
          "espaço seguro e gratuito. Fale com a gente pelo formulário do site: "
          "nossa equipe, incluindo a assistente social, responde com atenção e cuidado.")
    y=para(d,(0,P(486)),body,lato(32),(255,255,255,230),P(864),50,center=True,cx=cx)
    bt="Buscar orientação"; fb=poppins(24,"med")
    bw=tw(d,bt,fb)+P(100); bh=P(86); bx=int(cx-bw/2); by=y+P(44)
    d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=P(43),fill=VERDE_AGUA)
    d.text((cx,by+bh/2),bt,font=fb,fill=BRANCO,anchor="mm")
    center_tracked(d,cx,by+bh+P(48),"NOSSA SEDE",poppins(13,"med"),AREIA_D,3)
    addr="SCES Trecho 2, Lote 32 - Pier 21, Loja R60C   ·   Asa Sul, Brasília/DF"
    d.text((cx,by+bh+P(84)),addr,font=lato(23),fill=(255,255,255,222),anchor="ma")
    wm=scaled(_open("logo-apocam-branco.png"),P(168))
    ov.alpha_composite(wm,(int(cx-wm.width/2),P(1120)))
    finish(base,ov,idx)

s_cover(1); s_context(2)
s_step(3,1,"Acolhimento inicial",
    "Você entra em contato pelo formulário do site e conversa com a equipe de acolhimento. Uma primeira conversa com escuta atenta e sem julgamento, para entender quem você é e como podemos ajudar.")
s_step(4,2,"Orientação",
    "Buscamos entender a sua necessidade e explicar, de forma clara e baseada em evidências, os caminhos possíveis para o acesso à cannabis medicinal, indicando o próximo passo mais adequado ao seu caso.")
s_step(5,3,"Encaminhamento médico",
    "Nosso foco é viabilizar o acesso à consulta médica para quem não tem condições financeiras. A indicação a profissionais é sempre referencial: a responsabilidade terapêutica é do profissional de saúde.")
s_step(6,4,"Encaminhamento jurídico",
    "Contamos com uma rede de advogados parceiros que oferecem instrução sobre o caminho legal de acesso: direitos, documentos e possibilidades. Orientação educativa e transparente, sem garantir decisões judiciais.")
s_step(7,5,"Acompanhamento social",
    "Uma assistente social conduz todo o processo, acolhendo o paciente e a família nas dimensões individual, familiar e coletiva. Um cuidado próximo, com escuta qualificada em cada etapa da jornada.")
s_callout(8); s_cta(9)
print("== concluido ==")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  