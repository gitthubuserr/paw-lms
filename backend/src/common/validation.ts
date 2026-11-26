import { TransformFnParams } from 'class-transformer';

export const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export const normalizeEmail = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export const emptyToUndefined = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? undefined : v;
};

// 8-72 karakter (bcrypt hanya memakai 72 byte pertama), minimal 1 huruf dan 1 angka.
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;
export const PASSWORD_MESSAGE = 'Kata sandi 8-72 karakter dan harus mengandung huruf serta angka';

// NIM / NIP: huruf-angka 5-30 karakter
export const IDENTITY_REGEX = /^[0-9A-Za-z]{5,30}$/;
export const IDENTITY_MESSAGE = 'NIM/NIP harus 5-30 karakter huruf atau angka';
