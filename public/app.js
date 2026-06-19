const form = document.getElementById('appointmentForm');
const message = document.getElementById('message');
const appointmentsList = document.getElementById('appointmentsList');
const submitButton = form.querySelector('button[type="submit"]');
const cancelButton = document.getElementById('cancelEdit');

let editingAppointmentId = null;

// Buscar os agendamentos salvos no SQLite
async function loadAppointments() {
  try {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();
    
    appointmentsList.innerHTML = appointments.length
      ? appointments.map(renderAppointment).join('')
      : `
        <div class="no-data">
          <i class="fa-regular fa-calendar-minus"></i>
          <p>Nenhum agendamento encontrado.</p>
        </div>`;
  } catch (error) {
    console.error('Erro ao carregar consultas:', error);
    appointmentsList.innerHTML = '<p class="error-text">Erro ao conectar com o servidor.</p>';
  }
}

// Criar o card HTML de cada consulta na lista
function renderAppointment(appointment) {
  // Ajusta a data americana do input para o formato do Brasil (DD/MM/AAAA)
  const dataBr = appointment.data.split('-').reverse().join('/');
  
  return `
    <div class="appointment-item">
      <div class="appointment-info">
        <h3><i class="fa-solid fa-user-check"></i> ${appointment.nome}</h3>
        <p><i class="fa-solid fa-id-card"></i> <strong>CPF:</strong> ${appointment.cpf}</p>
        <p><i class="fa-solid fa-hospital"></i> <strong>Unidade:</strong> ${appointment.posto}</p>
        <p><i class="fa-solid fa-clock"></i> <strong>Data/Hora:</strong> ${dataBr} às ${appointment.horario}</p>
        <small class="timestamp">Registrado em: ${new Date(appointment.criado_em).toLocaleString('pt-BR')}</small>
      </div>
      <div class="appointment-actions">
        <button type="button" class="edit-btn" data-id="${appointment.id}"><i class="fa-solid fa-pen"></i> Editar</button>
        <button type="button" class="delete-btn" data-id="${appointment.id}"><i class="fa-solid fa-trash-can"></i> Excluir</button>
      </div>
    </div>
  `;
}

// Alterar o estado do formulário (Criação normal vs Edição)
function setFormState(appointment = null) {
  if (appointment) {
    form.nome.value = appointment.nome;
    form.cpf.value = appointment.cpf;
    form.data.value = appointment.data;
    form.horario.value = appointment.horario;
    form.posto.value = appointment.posto;
    
    submitButton.textContent = 'Atualizar';
    submitButton.classList.add('btn-editing');
    cancelButton.hidden = false;
    editingAppointmentId = appointment.id;
    
    showMessage('Modo edição ativado. Modifique os campos acima.', 'edit');
    return;
  }

  form.reset();
  submitButton.textContent = 'Agendar';
  submitButton.classList.remove('btn-editing');
  cancelButton.hidden = true;
  editingAppointmentId = null;
  message.textContent = '';
  message.className = 'message';
}

// Exibe feedbacks visuais em cores diferentes
function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = 'message'; // limpa antigas
  
  if (type === 'success') message.classList.add('msg-success');
  if (type === 'error') message.classList.add('msg-error');
  if (type === 'edit') message.classList.add('msg-edit');
}

// Excluir Agendamento
async function handleDeleteAppointment(id) {
  if (!confirm('Deseja realmente excluir este agendamento do SUS?')) {
    return;
  }

  try {
    const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    const data = await response.json();
    
    if (!response.ok) {
      showMessage(data.error || 'Erro ao excluir agendamento.', 'error');
      return;
    }

    showMessage('Agendamento excluído com sucesso!');
    if (editingAppointmentId === Number(id)) {
      setFormState(null);
    }
    loadAppointments();
  } catch (error) {
    showMessage('Erro na comunicação com o banco.', 'error');
  }
}

// Buscar dados e ativar modo de edição
async function handleEditAppointment(id) {
  try {
    const response = await fetch(`/api/appointments`);
    const appointments = await response.json();
    const appointment = appointments.find((item) => item.id === Number(id));

    if (!appointment) {
      showMessage('Agendamento não encontrado.', 'error');
      return;
    }

    setFormState(appointment);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela de forma fluida
  } catch (error) {
    showMessage('Erro ao carregar dados para edição.', 'error');
  }
}

// Enviar Formulário (POST para criar ou PUT para atualizar)
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

  const url = editingAppointmentId ? `/api/appointments/${editingAppointmentId}` : '/api/appointments';
  const method = editingAppointmentId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage(data.error || 'Erro ao salvar agendamento.', 'error');
      return;
    }

    showMessage(editingAppointmentId ? 'Agendamento atualizado com sucesso!' : 'Agendamento salvo com sucesso!');
    setFormState(null);
    loadAppointments();
  } catch (error) {
    showMessage('Não foi possível conectar ao servidor.', 'error');
  }
});

cancelButton.addEventListener('click', () => {
  setFormState(null);
});

// Delegação dinâmica de cliques para os botões dentro dos cards
appointmentsList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.classList.contains('edit-btn')) {
    handleEditAppointment(id);
  } else if (button.classList.contains('delete-btn')) {
    handleDeleteAppointment(id);
  }
});

// Inicialização automática
loadAppointments();