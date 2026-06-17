const form = document.getElementById('appointmentForm');
const message = document.getElementById('message');
const appointmentsList = document.getElementById('appointmentsList');
const submitButton = form.querySelector('button[type="submit"]');
const cancelButton = document.getElementById('cancelEdit');

let editingAppointmentId = null;

async function loadAppointments() {
  const response = await fetch('/api/appointments');
  const appointments = await response.json();
  appointmentsList.innerHTML = appointments.length
    ? appointments.map(renderAppointment).join('')
    : '<p>Nenhum agendamento encontrado.</p>';
}

function renderAppointment(appointment) {
  return `
    <div class="appointment-item">
      <strong>${appointment.nome}</strong>
      <span>CPF: ${appointment.cpf}</span>
      <span>Data: ${appointment.data} às ${appointment.horario}</span>
      <span>Posto: ${appointment.posto}</span>
      <span>Registrado em: ${new Date(appointment.criado_em).toLocaleString('pt-BR')}</span>
      <div class="appointment-actions">
        <button type="button" class="edit-btn" data-id="${appointment.id}">Editar</button>
        <button type="button" class="delete-btn" data-id="${appointment.id}">Excluir</button>
      </div>
    </div>
  `;
}

function setFormState(appointment = null) {
  if (appointment) {
    form.nome.value = appointment.nome;
    form.cpf.value = appointment.cpf;
    form.data.value = appointment.data;
    form.horario.value = appointment.horario;
    form.posto.value = appointment.posto;
    submitButton.textContent = 'Atualizar';
    cancelButton.hidden = false;
    editingAppointmentId = appointment.id;
    message.textContent = 'Modo edição ativado.';
    message.style.color = '#1d4ed8';
    return;
  }

  form.reset();
  submitButton.textContent = 'Agendar';
  cancelButton.hidden = true;
  editingAppointmentId = null;
  message.textContent = '';
}

function showMessage(text, success = true) {
  message.textContent = text;
  message.style.color = success ? '#047857' : '#b91c1c';
}

async function handleDeleteAppointment(id) {
  if (!confirm('Deseja realmente excluir este agendamento?')) {
    return;
  }

  const response = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    showMessage(data.error || 'Erro ao excluir agendamento.', false);
    return;
  }

  showMessage('Agendamento excluído com sucesso!');
  if (editingAppointmentId === id) {
    setFormState(null);
  }
  loadAppointments();
}

async function handleEditAppointment(id) {
  const response = await fetch(`/api/appointments`);
  const appointments = await response.json();
  const appointment = appointments.find((item) => item.id === Number(id));

  if (!appointment) {
    showMessage('Agendamento não encontrado.', false);
    return;
  }

  setFormState(appointment);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    nome: formData.get('nome'),
    cpf: formData.get('cpf'),
    data: formData.get('data'),
    horario: formData.get('horario'),
    posto: formData.get('posto'),
  };

  const url = editingAppointmentId
    ? `/api/appointments/${editingAppointmentId}`
    : '/api/appointments';
  const method = editingAppointmentId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    showMessage(data.error || 'Erro ao salvar agendamento.', false);
    return;
  }

  showMessage(editingAppointmentId ? 'Agendamento atualizado com sucesso!' : 'Agendamento salvo com sucesso!');
  setFormState(null);
  loadAppointments();
});

cancelButton.addEventListener('click', () => {
  setFormState(null);
});

appointmentsList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  if (button.classList.contains('edit-btn')) {
    handleEditAppointment(id);
    return;
  }

  if (button.classList.contains('delete-btn')) {
    handleDeleteAppointment(id);
  }
});

loadAppointments();
