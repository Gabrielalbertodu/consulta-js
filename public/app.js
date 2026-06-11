const form = document.getElementById('appointmentForm');
const message = document.getElementById('message');
const appointmentsList = document.getElementById('appointmentsList');

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
    </div>
  `;
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

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    message.textContent = data.error || 'Erro ao agendar.';
    message.style.color = '#b91c1c';
    return;
  }

  message.textContent = 'Agendamento salvo com sucesso!';
  message.style.color = '#047857';
  form.reset();
  loadAppointments();
});

loadAppointments();
