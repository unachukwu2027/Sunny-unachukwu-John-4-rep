const SUPABASE_URL = "https://sibionetcywotyrfrneb.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_I4twpfihwtAML9wFLgY2-Q_v2S85kAI";

const WEBSITE_URL =
  "https://unachukwu2027.github.io/Sunny-unachukwu-John-4-rep/";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

module.exports = async (req, res) => {
  const id = req.query.article;

  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).send("Invalid article ID.");
  }

  try {
    const apiURL =
      `${SUPABASE_URL}/rest/v1/campaign_news` +
      `?id=eq.${id}&published=eq.true` +
      "&select=id,title,summary,image_url";

    const response = await fetch(apiURL, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      return res.status(502).send("Unable to retrieve news.");
    }

    const articles = await response.json();
    const article = articles[0];

    if (!article) {
      return res.status(404).send("Article not found.");
    }

    const title = escapeHTML(article.title || "CONSISTENCY 2027 News");
    const description = escapeHTML(
      article.summary || article.title || "Latest campaign news."
    );

    let image = "";

    if (article.image_url) {
      const imageURL = new URL(article.image_url, WEBSITE_URL);

      if (imageURL.protocol === "https:") {
        image = escapeHTML(imageURL.href);
      }
    }

    const destination =
      WEBSITE_URL + `news.html?article=${encodeURIComponent(id)}`;

    const shareURL =
      `https://${req.headers.host}/api/preview?article=${encodeURIComponent(id)}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");

    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">

<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${escapeHTML(shareURL)}">
${image ? `<meta property="og:image" content="${image}">` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${image ? `<meta name="twitter:image" content="${image}">` : ""}

<meta http-equiv="refresh" content="3;url=${escapeHTML(destination)}">
</head>
<body>
<h2>${title}</h2>
<p>${description}</p>
${image ? `<img src="${image}" alt="${title}" style="max-width:100%">` : ""}
<p><a href="${escapeHTML(destination)}">Read the full news article</a></p>
<script>
window.location.replace(${JSON.stringify(destination)});
</script>
</body>
</html>`);

  } catch (error) {
    return res.status(500).send("An error occurred.");
  }
};
