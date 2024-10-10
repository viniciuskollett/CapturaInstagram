const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/get-instagram-data">
      <label for="username">Instagram Username:</label>
      <input type="text" id="username" name="username" required />
      <button type="submit">Buscar Dados</button>
    </form>
  `);
});

app.post('/get-instagram-data', async (req, res) => {
  const { username } = req.body;
  const url = `https://www.instagram.com/${username}/`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let imageUrls = [];

    // Interceptar todas as requisições que retornam .jpg
    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.jpg')) {
        imageUrls.push(url);
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    await browser.close();

    // Exibir as imagens diretamente na resposta HTML
    const imagesHtml = imageUrls.map(url => `<img src="${url}" width="200" style="margin:10px;" />`).join('');

    res.send(`
      <h1>Imagens do perfil de @${username}</h1>
      <div>${imagesHtml}</div>
    `);

  } catch (error) {
    console.error('Erro ao buscar dados do Instagram:', error.message);
    res.send('Erro ao buscar dados. Verifique se o perfil é público e o nome está correto.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
