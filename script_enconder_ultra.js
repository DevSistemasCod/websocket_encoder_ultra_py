function criarGraficos() {
  let ultrassonico = document.getElementById('graficoUltrassonico');
  let encoder = document.getElementById('graficoEncoder');

  let graficoUltrassonico = null;
  let graficoEncoder = null;

  if (ultrassonico instanceof HTMLCanvasElement) {
    // @ts-ignore
    graficoUltrassonico = new Chart(ultrassonico.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Quantidade de Peças',
            data: [],
            borderWidth: 1,
            backgroundColor: [],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: { size: 20 },
              color: '#697b6dff',
              boxWidth: 0,
            },
          },
        },
        scales: {
          x: { ticks: { font: { size: 18 }, color: '#697b6dff' } },
          y: {
            ticks: { font: { size: 18 }, color: '#697b6dff' },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // gerar gráfico enconder
  if (encoder instanceof HTMLCanvasElement) {
    // @ts-ignore
    graficoEncoder = new Chart(encoder.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Contagem'],
        datasets: [
          {
            label: 'Encoder',
            data: [0],
            backgroundColor: ['#0077ff'],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: { size: 20 },
              color: '#697b6dff',
              boxWidth: 0,
            },
          },
        },
        scales: {
          x: { ticks: { font: { size: 18 }, color: '#697b6dff' } },
          y: {
            ticks: { font: { size: 18 }, color: '#697b6dff' },
            beginAtZero: true,
          },
        },
      },
    });
  }

  conectarWebSocket(graficoUltrassonico, graficoEncoder);
}

// @ts-ignore
function conectarWebSocket(graficoUltrassonico, graficoEncoder) {
  // Abre uma conexão com o ESP32 pela 8080
  let socket = new WebSocket('ws://192.168.43.186:8080');
  //ouvinte (callback) que será chamado quando o servidor enviar
  // uma mensagem pelo WebSocket.
  socket.onmessage = (event) => {
    try {
      // servidor está mandando um JSON,
      // aqui temos JSON.parse(event.data) para transformar em objeto JavaScript
      let dados = JSON.parse(event.data);
      processamentoMensagem(graficoUltrassonico, graficoEncoder, dados);
    } catch (erro) {
      console.error('Falha ao processar a mensagem', erro);
    }
  };

  socket.onclose = () => {
    setTimeout(
      () => conectarWebSocket(graficoUltrassonico, graficoEncoder),
      2000
    );
  };
}
// @ts-ignore
function processamentoMensagem(graficoUltrassonico, graficoEncoder, dados) {
  console.log('Recebido:', dados);

  if ('tipo' in dados && 'quantidade' in dados) {
    // === Dados do ULTRASSÔNICO ===
    let indiceTipo = graficoUltrassonico.data.labels.indexOf(dados.tipo);
    if (indiceTipo === -1) {
      graficoUltrassonico.data.labels.push(dados.tipo);
      graficoUltrassonico.data.datasets[0].data.push(dados.quantidade);
      graficoUltrassonico.data.datasets[0].backgroundColor.push(
        corPorTipo(dados.tipo)
      );
    } else {
      graficoUltrassonico.data.datasets[0].data[indiceTipo] = dados.quantidade;
    }
    graficoUltrassonico.update();
    // aqui update é usado para re-renderizar o gráfico depois que
    // alteramos os dados ou as configurações.
  } else if ('contagem' in dados) {
    // === Dados do ENCODER ===
    graficoEncoder.data.datasets[0].data[0] = dados.contagem;
    graficoEncoder.update();
    // aqui update é usado para re-renderizar o gráfico depois que
    // alteramos os dados ou as configurações.
  }
}
// @ts-ignore
function corPorTipo(tipo) {
  switch (tipo) {
    case 'Grande':
      return '#fcff32ff';
    case 'Media':
      return '#34e758ff';
    case 'Pequena':
      return '#ba66f5ff';
    default:
      return '#999999';
  }
}

document.addEventListener('DOMContentLoaded', criarGraficos);
