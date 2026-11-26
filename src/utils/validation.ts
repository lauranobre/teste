import { MIN_PASSWORD_LENGTH } from './constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valido: boolean;
  erro?: string;
}

export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validarSenha(senha: string): boolean {
  return senha.trim().length >= MIN_PASSWORD_LENGTH;
}

export function validarFormularioLogin(email: string, senha: string): ValidationResult {
  if (!email.trim() || !senha.trim()) {
    return { valido: false, erro: 'Preencha o e-mail e a senha.' };
  }

  if (!validarEmail(email)) {
    return { valido: false, erro: 'Informe um endereço de e-mail válido.' };
  }

  return { valido: true };
}

export function validarCadastroUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha?: string;
}): ValidationResult {
  if (!dados.nome.trim() || dados.nome.trim().length < 2) {
    return { valido: false, erro: 'Informe seu nome completo (mínimo 2 caracteres).' };
  }

  if (!validarEmail(dados.email)) {
    return { valido: false, erro: 'Informe um endereço de e-mail válido.' };
  }

  if (!validarSenha(dados.senha)) {
    return {
      valido: false,
      erro: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (dados.confirmarSenha !== undefined && dados.senha !== dados.confirmarSenha) {
    return { valido: false, erro: 'As senhas não coincidem.' };
  }

  return { valido: true };
}
