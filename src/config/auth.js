export default {
  // A "chave mestra" que assina o token. Deve ser única e secreta.
  secret: process.env.TOKEN_SECRET || 'sua-chave-secreta-padrao-aqui',

  // Quanto tempo o token dura (ex: '7d' = 7 dias, '1d' = 1 dia, '1h' = 1 hora)
  expiresIn: process.env.TOKEN_EXPIRATION || '7d',
};
