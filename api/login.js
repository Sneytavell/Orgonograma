const { checkPassword } = require("./_store");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end();
  const ok = checkPassword(req.headers["x-admin-password"]);
  if (!ok) await new Promise(r => setTimeout(r, 600)); // freia tentativas
  return res.status(ok ? 200 : 401).json({ ok });
};
