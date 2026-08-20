# Site — Yasmim dos Santos Pinho (Psicóloga Clínica)

Site one-page institucional, focado em agendamento via WhatsApp. HTML5 +
CSS moderno + JavaScript vanilla, sem frameworks e sem backend. Ver
[PROJETO.md](PROJETO.md) para o briefing completo (público-alvo, textos
aprovados, identidade visual e regras do CFP).

## Como rodar localmente

Não precisa de build nem de instalação de dependências. Abra
`index.html` diretamente no navegador, ou sirva a pasta com um servidor
local simples (recomendado, para o `fetch`/iframes se comportarem como em
produção):

```bash
npx serve .
# ou, com Python instalado:
python -m http.server 8000
```

Depois acesse `http://localhost:8000` (ou a porta indicada).

## Estrutura de arquivos

```
/
├── index.html          → todo o conteúdo e estrutura da página
├── PROJETO.md           → briefing do projeto (textos, paleta, regras)
├── sitemap.xml / robots.txt
├── /css
│   ├── reset.css        → reset moderno, acessibilidade de movimento
│   └── style.css        → variáveis, utilitários e estilos de cada seção
├── /js
│   └── main.js           → toda a interatividade (menu, lightbox, FAQ, carrossel...)
└── /assets
    ├── favicon.svg
    ├── logo.svg          → PENDENTE (ver "O que falta trocar")
    └── /img              → fotos placeholder, PENDENTES
```

## O que falta trocar (checklist para publicar)

Tudo abaixo já está marcado no código com o comentário `TROCAR AQUI` —
use "buscar no projeto" (Ctrl+Shift+F no VSCode) por `TROCAR AQUI` para
achar cada ponto exato.

### 1. Número do WhatsApp

Arquivo: [js/main.js](js/main.js), linha 7.

```js
const WHATSAPP_NUMBER = '5511999999999';
```

Trocar pelo número real, **só dígitos**, no formato
`55` + DDD + número (ex.: `5511987654321`). Esse número alimenta todos
os botões de WhatsApp do site automaticamente — não é preciso mexer em
nenhum outro lugar.

### 2. Logotipo

Arquivo esperado: `assets/logo.svg` (referenciado no cabeçalho, em
[index.html](index.html)). Enquanto o arquivo não existir, o nome
"Yasmim dos Santos Pinho" aparece no lugar do logo automaticamente — não
precisa editar nada além de colocar o arquivo `logo.svg` (ou trocar a
extensão referenciada) dentro de `assets/`.

### 3. Fotos

Todas em `assets/img/`, nos nomes já referenciados no HTML (basta
salvar os arquivos reais com esses nomes exatos, mantendo `.jpg`, ou
ajustar a extensão no `src` da tag `<img>` correspondente):

| Arquivo esperado | Onde aparece |
|---|---|
| `yasmim.jpg` | Foto principal, na abertura (Hero) |
| `sobre.jpg` | Seção "Sobre mim" |
| `consultorio-1.jpg` a `consultorio-6.jpg` | Galeria "Conheça o consultório" (pode reduzir para 4, apagando os `<button class="consultorio__item">` extras) |
| `instagram-1.jpg` a `instagram-4.jpg` | Grade de prévia do Instagram |
| `og-image.jpg` | Imagem de compartilhamento (WhatsApp/Facebook/Twitter) — 1200×630px, referenciada no `<head>` |

Enquanto as fotos não existirem, o site continua bonito: aparece a
moldura/gradiente de placeholder no lugar (sem ícone de imagem
quebrada).

### 4. ID da Google Tag (GTM)

Arquivo: [index.html](index.html), início do `<head>` (comentário bem
grande e visível) e também no `<noscript>` logo após a abertura do
`<body>`. Trocar `GTM-XXXXXXX` pelo ID real **nos dois lugares**.

Onde a cliente encontra o ID dela: acessar
[tagmanager.google.com](https://tagmanager.google.com), entrar com a
conta Google, criar um contêiner do tipo "Web" — o ID aparece no canto
superior direito do painel. O comentário no próprio `index.html` já
tem esse passo a passo.

O site já dispara um evento pronto para medir agendamentos (configurável
como "Acionador" dentro do GTM):
- `clique_whatsapp` — todo clique em botão de WhatsApp

(O formulário de contato foi removido nesta rodada de ajustes — o
contato agora é só por WhatsApp — então o evento `envio_formulario_contato`
não existe mais.)

### 5. Endereço do consultório

Aparece em 2 lugares (marcados `TROCAR AQUI`) em [index.html](index.html):
dentro do JSON-LD no `<head>` (campo `streetAddress`) e no comentário
acima do `<iframe>` do mapa, na seção "Contato". Desde a remoção do
formulário nesta rodada, a seção "Contato" não exibe mais o endereço
como texto — só o mapa incorporado e o link para o Google Maps.

### 6. Mapa (Google Maps)

O `<iframe>` da seção "Contato" usa um endereço de texto genérico
("Consultório Yasmim dos Santos Pinho, Santo André, SP") porque ainda
não temos o endereço completo. Assim que tiver:

1. Abrir [Google Maps](https://maps.google.com), buscar o endereço
   completo do consultório.
2. Clicar em "Compartilhar" → aba "Incorporar um mapa" → copiar o
   código do `<iframe>` fornecido pelo Google.
3. Substituir o `<iframe class="contato__mapa-iframe" ...>` inteiro
   pelo trecho copiado (mantendo a classe `contato__mapa-iframe` para
   não perder o estilo).

O link curto enviado pela cliente
(`https://maps.app.goo.gl/Ywut3vT8o9KjeAsJ8`) está anotado em
comentário ao lado do iframe, para conferência.

### 7. Domínio / URL final

Todas as tags de SEO (canonical, Open Graph, Twitter Card, JSON-LD,
`sitemap.xml`, `robots.txt`) usam `https://www.yasmimpinho.com.br/`
como placeholder. Trocar pela URL real assim que o domínio for
definido e o site publicado (busque por esse endereço no projeto para
achar todas as ocorrências).

## Como publicar (GitHub Pages)

1. Criar um repositório no GitHub (pode ser público) e subir este
   projeto (veja os comandos de `git` já rodados abaixo, na seção
   "Controle de versão").
2. No repositório, ir em **Settings → Pages**.
3. Em "Source", selecionar a branch `main` e a pasta `/ (root)`.
4. Salvar. Em alguns minutos o site fica disponível em
   `https://<usuario>.github.io/<repositorio>/`.
5. (Opcional) Configurar um domínio próprio em "Custom domain", na
   mesma tela — depois lembrar de atualizar o item 7 acima com a URL
   final.

## Testado em

375px, 768px, 1024px e 1440px de largura — sem scroll horizontal em
nenhuma delas. Ver o relatório de revisão final entregue na última
etapa do desenvolvimento para o detalhamento completo (contraste,
links, SEO e pendências).

## Pendências que dependem da cliente

- [ ] Número do WhatsApp com DDD
- [ ] Logotipo (SVG ou PNG com fundo transparente)
- [ ] Fotos profissionais dela (Hero e Sobre)
- [ ] Fotos do consultório (sala de espera e sala de atendimento)
- [ ] Confirmar se haverá depoimentos e ciência das regras do CFP
      (estrutura pronta, comentada, em `index.html`)
- [ ] ID da Google Tag (GTM-XXXXXXX)
- [ ] Endereço completo do consultório (contato, rodapé, mapa e JSON-LD)
- [ ] Confirmar se aparece e-mail profissional no site (hoje não aparece)
- [ ] Domínio definitivo do site
