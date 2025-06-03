# 🍇 Tech Challenge Frontend – Visualização de Dados Vitivinícolas

Este projeto é uma aplicação **Next.js** que consome e exibe dados sobre a produção, comercialização e processamento de uvas no Brasil. Os dados são extraídos do site da **Embrapa** por meio de uma API backend própria. A interface permite filtrar por tipo de dado e ano, exibir os dados em tabelas dinâmicas e realizar o download em `.zip`.

> 🔗 Acesse a aplicação em produção: [https://tech-challange-front.onrender.com]

---

## 📸 Visão Geral

A aplicação tem como objetivo facilitar a visualização e extração de dados vitivinícolas do Brasil de forma acessível e dinâmica, permitindo:

- Selecionar tipo de dado (produção, comercialização, processamento)
- Filtrar por ano
- Visualizar tabelas dinâmicas
- Baixar os dados em `.zip` (contendo CSVs)

--- 

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Requisições HTTP:** [Axios](https://axios-http.com/)
- **Backend:** API Flask
- **Hospedagem:** Render (frontend e backend)

---

## 📁 Estrutura do Projeto

```
Tech_Challange_Front/
├── src/
│   ├── app/
│   │   └── page.tsx         # Página principal da aplicação
│   ├── components/
│   │   └── Dashboard/       # Componente de tabela dinâmica
│   ├── services/
│   │   └── api.ts           # Configuração do Axios para a API
│   └── styles/
├── public/                  # Arquivos estáticos
├── .env.example             # Exemplo de variáveis de ambiente
├── package.json
├── tailwind.config.js
├── next.config.ts
└── README.md
```

---

## 🚀 Funcionalidades

- 🔍 Filtro por ano e tipo de dado (produção, comercialização, processamento)
- 📊 Visualização em tabelas responsivas e organizadas
- 📥 Download automático e manual de arquivos `.zip` com dados em CSV
- ✅ Feedback visual de carregamento e erros
- 🔐 Integração com API backend via API Key

---

## ⚙️ Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- Gerenciador de pacotes: `npm`, `yarn`, `pnpm` ou `bun`
- API Backend rodando (local ou hospedada) com CORS configurado

---

## 💻 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/Tech_Challange_Front.git
   cd Tech_Challange_Front
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou yarn / pnpm / bun
   ```

3. **Configure as variáveis de ambiente:**

   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com as informações corretas:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5432
   NEXT_PUBLIC_API_KEY=sua_api_key_aqui
   ```

   > Se estiver usando a API pública hospedada, utilize:
   ```env
   NEXT_PUBLIC_API_URL=https://grapi-backend.onrender.com
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   [http://localhost:3000](http://localhost:3000)

---

## 🧪 Como Usar

1. Acesse a aplicação.
2. Escolha o **tipo de dado** e o **ano** desejado.
3. Os dados serão carregados e exibidos em forma de tabela.
4. O download do `.zip` com os CSVs será feito automaticamente (ou clique no botão para baixar manualmente).

---

## 🔌 API Backend

A aplicação consome os seguintes endpoints da API Flask:

- `GET /extractor?year=YYYY`: Retorna os dados extraídos via scraping.
- `GET /download?year=YYYY`: Retorna os dados organizados em `.zip`.

> Documentação da API (Swagger):  
[http://localhost:5432/apidocs/](http://localhost:5432/apidocs/)  
ou conforme o ambiente de produção.

---

## ☁️ Deploy

A aplicação está em produção via **Render**:

🌐 **Frontend:**  
[https://tech-challange-front.onrender.com](https://tech-challange-front.onrender.com)

> Para deploys alternativos, considere usar Vercel, Netlify, ou serviços próprios. Consulte a [documentação oficial do Next.js sobre deploy](https://nextjs.org/docs/deployment).

---

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma nova branch com sua feature: `git checkout -b feature/NovaFeature`
3. Commit suas alterações: `git commit -m 'feat: NovaFeature'`
4. Faça push para a branch: `git push origin feature/NovaFeature`
5. Abra um Pull Request
