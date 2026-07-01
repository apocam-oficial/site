# -*- coding: utf-8 -*-
"""
Exemplo reprodutível: carrossel "Como funciona o acolhimento na APOCAM".
Uso:
  python3 build_como_funciona.py --assets /caminho/APOCAM/assets --out ./saida
  # fidelidade máxima de fonte (opcional): --fonts /pasta/com/Montserrat-*.ttf/SourceSans3-*.ttf
Conteúdo separado do layout — edite a lista SLIDES para novas peças.
"""
import os, sys, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apocam_render import render_carousel, VERDE_AGUA, AREIA_D

SLIDES = [
    {"type":"cover",
     "eyebrow":"Como funciona",
     "title":"Como funciona o\nacolhimento na APOCAM",
     "subtitle":"Do primeiro contato ao acompanhamento: um caminho ético, gratuito e sem julgamento.",
     "hint":"ARRASTE PARA VER AS ETAPAS"},

    {"type":"statement",
     "eyebrow":"Para quem é",
     "title":"Aberto a\nqualquer pessoa",
     "body":("O acolhimento da APOCAM não exige laudo prévio nem região específica. "
             "Nosso foco é facilitar o acesso à consulta médica, com prioridade "
             "para quem não tem condições de arcar com o atendimento."),
     "chips":[("Gratuito",VERDE_AGUA),("Sem laudo prévio",AREIA_D),("Escuta sem julgamento",VERDE_AGUA)]},

    {"type":"step","n":1,"steps":5,"title":"Acolhimento inicial",
     "body":("Você entra em contato pelo formulário do site e conversa com a equipe de acolhimento. "
             "Uma primeira conversa com escuta atenta e sem julgamento, para entender quem você é e como podemos ajudar.")},
    {"type":"step","n":2,"steps":5,"title":"Orientação",
     "body":("Buscamos entender a sua necessidade e explicar, de forma clara e baseada em evidências, "
             "os caminhos possíveis para o acesso à cannabis medicinal, indicando o próximo passo mais adequado ao seu caso.")},
    {"type":"step","n":3,"steps":5,"title":"Encaminhamento médico",
     "body":("Nosso foco é viabilizar o acesso à consulta médica para quem não tem condições financeiras. "
             "A indicação a profissionais é sempre referencial: a responsabilidade terapêutica é do profissional de saúde.")},
    {"type":"step","n":4,"steps":5,"title":"Encaminhamento jurídico",
     "body":("Contamos com uma rede de advogados parceiros que oferecem instrução sobre o caminho legal de acesso: "
             "direitos, documentos e possibilidades. Orientação educativa e transparente, sem garantir decisões judiciais.")},
    {"type":"step","n":5,"steps":5,"title":"Acompanhamento social",
     "body":("Uma assistente social conduz todo o processo, acolhendo o paciente e a família nas dimensões "
             "individual, familiar e coletiva. Um cuidado próximo, com escuta qualificada em cada etapa da jornada.")},

    {"type":"callout",
     "eyebrow":"Com responsabilidade e ética",
     "main":("A APOCAM não promete resultados terapêuticos nem garante a "
             "concessão de habeas corpus ou de decisões judiciais."),
     "sub":("Cada caso é único e conduzido com informação, escuta qualificada "
            "e cuidado, sempre com base em evidências.")},

    {"type":"cta",
     "eyebrow":"Fale com a gente",
     "title":"Precisa de acolhimento\nou quer somar?",
     "body":("Seja para buscar orientação, contribuir ou se voluntariar, este é um espaço seguro e gratuito. "
             "Fale com a gente pelo formulário do site: nossa equipe, incluindo a assistente social, responde com atenção e cuidado."),
     "button":"Buscar orientação",
     "sede_label":"Nossa sede",
     "sede_addr":"SCES Trecho 2, Lote 32 - Pier 21, Loja R60C   ·   Asa Sul, Brasília/DF"},
]

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--assets", default=os.path.join(here, "..", "assets"),
                    help="pasta com logo-apocam-mark.png e logo-apocam-branco.png")
    ap.add_argument("--out", default="./carrossel-como-funciona", help="pasta de saída")
    ap.add_argument("--fonts", default=None, help="pasta opcional com Montserrat/Source Sans 3 (.ttf)")
    a = ap.parse_args()
    render_carousel(SLIDES, out_dir=a.out, assets_dir=os.path.abspath(a.assets), fonts_dir=a.fonts)
