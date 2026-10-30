const { configured, load, save, checkPassword } = require("./_store");

const CATS = ["Emergência", "Prevenção e Inspeção", "Gestão da Equipe", "Treinamento", "Documentação"];

function valid(d) {
  if (!d || !Array.isArray(d.roles) || d.roles.length !== 3) return false;
  return d.roles.every(r => r && typeof r.nome === "string" && r.resp && typeof r.resp === "object" &&
    Object.entries(r.resp).every(([c, v]) => CATS.includes(c) && Array.isArray(v) && v.every(s => typeof s === "string")));
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(503).json({ error: "banco_nao_configurado" });
  try {
    if (req.method === "GET") {
      return res.status(200).json((await load()) || {});
    }
    if (req.method === "POST") {
      if (!checkPassword(req.headers["x-admin-password"])) return res.status(401).json({ error: "senha_invalida" });
      const d = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!valid(d)) return res.status(400).json({ error: "dados_invalidos" });
      const doc = { roles: d.roles, matriz: Array.isArray(d.matriz) ? d.matriz : [], updatedAt: (typeof d.updatedAt === "string" && d.updatedAt.length < 40) ? d.updatedAt : new Date().toISOString() };
      if (JSON.stringify(doc).length > 500000) return res.status(413).json({ error: "muito_grande" });
      await save(doc);
      return res.status(200).json({ ok: true, updatedAt: doc.updatedAt });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: "erro_servidor" });
  }
};
