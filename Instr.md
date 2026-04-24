# Projeto: Sistema de Votação IA para Negócios 🚀

## 🎯 Objetivo
Gerenciar a exposição de projetos de IA, permitindo que o público vote no melhor grupo através de QR Codes individuais, garantindo a unicidade de temas e ferramentas de IA entre os grupos.

## 👥 Estrutura dos Grupos
- **Tamanho:** Até 5 alunos.
- **Total de Grupos:** ~18 (Baseado em 90 alunos).
- **Restrição de IA:** Cada grupo escolhe até 3 IAs. Nenhuma IA pode ser repetida entre grupos diferentes.
- **Restrição de Tema:** Cada grupo possui um tema único.

## 💻 Especificações Técnicas
- **Back-end:** Node.js + PostgreSQL.
- **Front-end:** React (Web Responsivo).
- **Votação:** Registro de Voto Único por dispositivo (LocalStorage + IP Check).
- **Sem Login para Votantes:** Otimização para rapidez no evento.

## 🛠️ Entidades do Banco de Dados (Sugestão)
- **Groups:** id, name, theme, qr_code_link, vote_count.
- **Technologies:** id, name (ex: GPT-4, Gemini, Claude).
- **Group_Techs:** Relacionamento N:N entre Grupos e IAs.
- **Votes:** id, ip_address, user_agent, timestamp, group_id.

## 📊 Dashboard do Professor
- Cadastro e edição de grupos.
- Visualização de rankings.
- Gráficos de participação e distribuição de votos.
- Exportação de resultados finais.

## 🔒 Regra de Segurança (Voto Único)
1. Ao votar, o Front-end salva uma chave `voted: true` no LocalStorage.
2. O Back-end valida se o IP + User Agent já consta na tabela de `Votes`.
3. Caso já exista, o sistema impede o novo registro e informa ao usuário.