import { formatarHorarioFuncionamento, verificarAbertoAgora } from '../schedule';

describe('Utilitários de horário de funcionamento', () => {
  test('normaliza espaços e acentuação em horários válidos', () => {
    expect(formatarHorarioFuncionamento('  Seg a Sex ,  08h   as   18h  ')).toBe(
      'Seg a Sex, 08h às 18h'
    );
  });

  test('retorna mensagem padrão quando horário está vazio', () => {
    expect(formatarHorarioFuncionamento('')).toBe('Horário não informado');
    expect(formatarHorarioFuncionamento(null)).toBe('Horário não informado');
  });

  test('identifica ecoponto aberto em dia útil dentro do expediente', () => {
    const quarta10h = new Date(2026, 3, 15, 10, 0); // Quarta-feira, 10:00
    expect(verificarAbertoAgora('Seg a Sáb, 08h às 18h', quarta10h)).toBe(true);
  });

  test('identifica ecoponto fechado fora do horário de funcionamento', () => {
    const quarta20h = new Date(2026, 3, 15, 20, 0); // Quarta-feira, 20:00
    expect(verificarAbertoAgora('Seg a Sáb, 08h às 18h', quarta20h)).toBe(false);
  });

  test('identifica ecoponto fechado aos domingos quando funciona Seg a Sáb', () => {
    const domingo10h = new Date(2026, 3, 19, 10, 0); // Domingo, 10:00
    expect(verificarAbertoAgora('Seg a Sáb, 08h às 18h', domingo10h)).toBe(false);
  });

  test('interpreta corretamente horários com minutos (08h30 às 17h30)', () => {
    const sexta08h15 = new Date(2026, 3, 17, 8, 15);
    const sexta09h00 = new Date(2026, 3, 17, 9, 0);
    expect(verificarAbertoAgora('Seg a Sex, 08h30 às 17h30', sexta08h15)).toBe(false);
    expect(verificarAbertoAgora('Seg a Sex, 08h30 às 17h30', sexta09h00)).toBe(true);
  });

  test('retorna null quando o formato do horário não é reconhecido', () => {
    expect(verificarAbertoAgora('24 horas')).toBeNull();
  });
});
