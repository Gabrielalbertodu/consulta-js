## Agenda Consulta SUS

Aplicativo simples de agendamento de consulta SUS usando:

- Front-End: HTML, CSS e JavaScript
- Back-End: Node.js e Express
- Banco de Dados: SQLite (aplicação mais simples do que a do mysql)

## Estrutura do projeto

- `server.js` - servidor Express e APIs para agendamento
- `package.json` - dependências do Node.js
- `public/index.html` - interface do usuário
- `public/style.css` - estilos da página
- `public/app.js` - lógica do front-end para enviar e listar agendamentos
- `agenda.db` - arquivo SQLite gerado automaticamente após o primeiro uso

## Observações

- O banco de dados SQLite é criado automaticamente na pasta do projeto.
- Se precisar reiniciar os agendamentos, basta apagar `agenda.db` e reiniciar o servidor.
#
