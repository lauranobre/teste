const DIAS_SEMANA_MAP: Record<string, number> = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sab: 6,
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parseHorarioParaMinutos(horarioToken: string): number | null {
  const match = horarioToken.match(/^(\d{1,2})h(\d{2})?$/i);
  if (!match) return null;

  const horas = Number(match[1]);
  const minutos = match[2] ? Number(match[2]) : 0;

  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return null;
  }

  return horas * 60 + minutos;
}

/**
 * Normaliza e formata a string de horário de funcionamento para exibição na UI.
 */
export function formatarHorarioFuncionamento(horario?: string | null): string {
  if (!horario || !horario.trim()) {
    return 'Horário não informado';
  }

  return horario
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+as\s+/gi, ' às ');
}

/**
 * Verifica se o ecoponto está aberto em um determinado instante com base no formato
 * "Seg a Sáb, 08h às 18h". Retorna null quando o formato não é reconhecido.
 */
export function verificarAbertoAgora(
  horario: string,
  referencia: Date = new Date()
): boolean | null {
  if (!horario || !horario.trim()) return null;

  const normalizado = normalizarTexto(horario);
  const match = normalizado.match(
    /^([a-z]{3})\s+a\s+([a-z]{3}),\s*(\d{1,2}h(?:\d{2})?)\s+as\s+(\d{1,2}h(?:\d{2})?)$/
  );

  if (!match) return null;

  const diaInicio = DIAS_SEMANA_MAP[match[1]];
  const diaFim = DIAS_SEMANA_MAP[match[2]];
  const aberturaMin = parseHorarioParaMinutos(match[3]);
  const fechamentoMin = parseHorarioParaMinutos(match[4]);

  if (
    diaInicio === undefined ||
    diaFim === undefined ||
    aberturaMin === null ||
    fechamentoMin === null
  ) {
    return null;
  }

  const diaAtual = referencia.getDay();
  const dentroDosDias =
    diaInicio <= diaFim
      ? diaAtual >= diaInicio && diaAtual <= diaFim
      : diaAtual >= diaInicio || diaAtual <= diaFim;

  if (!dentroDosDias) return false;

  const minutosAtuais = referencia.getHours() * 60 + referencia.getMinutes();
  return minutosAtuais >= aberturaMin && minutosAtuais < fechamentoMin;
}
