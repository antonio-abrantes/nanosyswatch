const VALID_API_KEY = process.env.API_KEY;

const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!VALID_API_KEY || apiKey !== VALID_API_KEY) {
    return res.status(403).json({ error: "Acesso negado: chave inválida" });
  }
  next();
};

module.exports = authenticate;
