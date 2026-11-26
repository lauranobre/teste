import {
  validarCadastroUsuario,
  validarEmail,
  validarFormularioLogin,
  validarSenha,
} from '../validation';

describe('Utilitários de validação de formulários', () => {
  test('valida e-mails válidos e rejeita inválidos', () => {
    expect(validarEmail('cidadao@reciclaspot.com')).toBe(true);
    expect(validarEmail('email-invalido')).toBe(false);
    expect(validarEmail('sem@dominio')).toBe(false);
  });

  test('valida senha com no mínimo 6 caracteres', () => {
    expect(validarSenha('123456')).toBe(true);
    expect(validarSenha('12345')).toBe(false);
  });

  test('valida formulário de login completo', () => {
    expect(validarFormularioLogin('', '123456').valido).toBe(false);
    expect(validarFormularioLogin('invalido', '123456').valido).toBe(false);
    expect(validarFormularioLogin('ana@email.com', '123456')).toEqual({ valido: true });
  });

  test('valida cadastro de novo cidadão corretamente', () => {
    expect(
      validarCadastroUsuario({
        nome: 'A',
        email: 'novo@email.com',
        senha: '123456',
        confirmarSenha: '123456',
      }).valido
    ).toBe(false);

    expect(
      validarCadastroUsuario({
        nome: 'João Pedro',
        email: 'joao@email.com',
        senha: '123456',
        confirmarSenha: '654321',
      })
    ).toEqual({ valido: false, erro: 'As senhas não coincidem.' });

    expect(
      validarCadastroUsuario({
        nome: 'João Pedro',
        email: 'joao@email.com',
        senha: '123456',
        confirmarSenha: '123456',
      })
    ).toEqual({ valido: true });
  });
});
