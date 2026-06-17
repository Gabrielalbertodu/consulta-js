const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(path.join(__dirname, 'agenda.sqlite'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      posto TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )
  `);
});

app.get('/api/appointments', (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
    }
    res.json(rows);
  });
});

app.post('/api/appointments', (req, res) => {
  const { nome, cpf, data, horario, posto } = req.body;
  if (!nome || !cpf || !data || !horario || !posto) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const criadoEm = new Date().toISOString();
  const stmt = db.prepare(
    'INSERT INTO appointments (nome, cpf, data, horario, posto, criado_em) VALUES (?, ?, ?, ?, ?, ?)',
  );
  stmt.run(nome, cpf, data, horario, posto, criadoEm, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar agendamento.' });
    }
    res.json({ id: this.lastID, nome, cpf, data, horario, posto, criado_em: criadoEm });
  });
  stmt.finalize();
});

app.put('/api/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nome, cpf, data, horario, posto } = req.body;

  if (!nome || !cpf || !data || !horario || !posto) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const sql = 'UPDATE appointments SET nome = ?, cpf = ?, data = ?, horario = ?, posto = ? WHERE id = ?';
  db.run(sql, [nome, cpf, data, horario, posto, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.json({ id, nome, cpf, data, horario, posto });
  });
});

app.delete('/api/appointments/:id', (req, res) => {
  const id = Number(req.params.id);

  db.run('DELETE FROM appointments WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir agendamento.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.json({ message: 'Agendamento excluído com sucesso.' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
