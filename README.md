# 🌿 Herbário Jarros (SDR) — Acervo Digital | UFMA

Galeria botânica digital desenvolvida para o projeto acadêmico de **Biologia da Universidade Federal do Maranhão (UFMA)**, dedicada à catalogação, preservação e divulgação das exsicatas (plantas e flores coletadas) do **Herbário Jarros — Sigla SDR**.

---

## 📖 Sobre o Trabalho

Na botânica, o registro preciso de uma coleta é tão importante quanto a própria amostra vegetal. Este projeto transforma o catálogo físico do **Herbário Jarros (SDR)** em uma vitrine digital acessível, unindo a fotografia de cada espécime à sua **etiqueta botânica completa**, contendo:

- **Identificação Taxonômica:** Família botânica, nome científico (em latim) e nome popular regional.
- **Rastreabilidade de Coleta:** Número de tombo/coleta (`SDR`), data e localidade exata do achado.
- **Créditos e Campo:** Nome do coletor, contribuidor/laboratório responsável e observações morfológicas ou ecológicas.

O design da interface foi pensado com estética editorial inspirada em fichas reais de herbário, priorizando leitura confortável, carregamento leve e consulta rápida tanto em computadores de laboratório quanto em celulares durante atividades de campo.

---

## 🎯 O que o Projeto Almeja

- **Democratizar o Acesso Científico:** Permitir que estudantes, professores, pesquisadores e a comunidade consultem o acervo botânico de qualquer lugar, sem barreiras técnicas.
- **Preservar a Memória Botânica:** Criar um backup visual e estruturado das coletas realizadas no Maranhão e regiões estudadas pelo projeto.
- **Acessibilidade em Qualquer Tela:** Garantir fluidez e legibilidade total desde dispositivos móveis compactos (`320px`) até monitores widescreen.
- **Manutenção Simples e Sustentável:** Utilizar uma arquitetura estática (sem necessidade de servidores complexos ou bancos de dados pagos), facilitando a atualização contínua do acervo pela própria equipe do projeto.

---

## 🛠️ Tecnologias Utilizadas

- **[Vue 3](https://vuejs.org/):** Framework progressivo utilizado com Composition API (`<script setup>`) para componentização modular da galeria, filtros e modal de ampliação.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática que garante consistência nos metadados de cada exsicata cadastrada.
- **[Vite](https://vitejs.dev/):** Ferramenta de build ultrarrápida para desenvolvimento ágil e geração de arquivos otimizados para produção.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Framework utilitário utilizado na construção do layout *mobile-first*, tipografia editorial e etiquetas botânicas responsivas.
- **[pnpm](https://pnpm.io/):** Gerenciador de pacotes rápido e eficiente para controle de dependências.
- **[Netlify](https://www.netlify.com/):** Plataforma de hospedagem estática com deploy contínuo integrado ao GitHub.

---

## 📂 Estrutura do Projeto

```text
herbario-jarros-ufma/
├── public/
│   └── images/               # Fotografias das exsicatas (.webp ou .jpg)
├── src/
│   ├── components/
│   │   ├── HerbariumHeader.vue  # Cabeçalho institucional (UFMA, logo, sigla SDR e busca)
│   │   ├── SpecimenCard.vue     # Cartão da planta com fotografia e etiqueta de coleta
│   │   └── SpecimenModal.vue    # Modal para visualização ampliada da exsicata
│   ├── data/
│   │   └── specimens.ts         # Base de dados estruturada do acervo
│   ├── types/
│   │   └── specimen.ts          # Interface TypeScript dos campos botânicos
│   ├── App.vue                  # Lógica principal de busca, filtros e grade da galeria
│   ├── main.ts                  # Ponto de entrada da aplicação Vue
│   └── style.css                # Tokens de tema, fontes e estilos de papel botânico
├── index.html
├── netlify.toml                 # Configuração de build e cache para o Netlify
└── vite.config.ts
```

---

**Universidade Federal do Maranhão (UFMA)** · Curso de Ciências Biológicas · São Luís, MA