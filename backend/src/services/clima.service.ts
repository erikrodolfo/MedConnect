import axios from 'axios';

export async function obterClima(cidade: string, dataAgendada: Date) {
  try {
    const agora = new Date();
    const diffMs = dataAgendada.getTime() - agora.getTime(); //diferença em milissegundos
    const diffHoras = diffMs / (1000 * 60 * 60); //diferença em hora

    //se a consulta já passou ou é daqui a mais 24h:
    if (diffHoras < -1 || diffHoras > 24)
      return 'Previsão disponível apenas na data da consulta';

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: cidade,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric',
          lang: 'pt_br',
        },
        timeout: 3000, // Se a API travar por 3s, o Axios mata a requisição
      }
    );

    const previsaoFormatada = `
        temperatura: ${parseInt(data.main.temp)}°
        descrição: ${data.weather[0].description}
        `;

    return previsaoFormatada;
  } catch (error) {
    console.error(
      'Clima falhou:',
      axios.isAxiosError(error) ? error.message : error
    );
    return 'Clima indisponível';
  }
}
