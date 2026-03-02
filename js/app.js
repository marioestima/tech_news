// Seleção de elementos
const grid = document.getElementById("news-grid");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");

let currentArticle = { title: "", content: "" };

// Chave e URL da NewsAPI
const API_KEY = "7c5d88baecfc4ac182d7321d22164bb8";
const API_URL = `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=12&apiKey=${API_KEY}`;

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(err => console.log("Erro SW:", err));
}

// Função para forçar a tradução automática
function forceTranslate() {
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
        googleCombo.value = 'pt';
        googleCombo.dispatchEvent(new Event('change'));
    } else {
        // Se o elemento ainda não carregou, tenta novamente em breve
        setTimeout(forceTranslate, 500);
    }
}

// Buscar notícias da API
async function fetchNews() {
    grid.innerHTML = '<div class="loading">Carregando últimas notícias...</div>';

    // Lógica Offline (PWA)
    if (!navigator.onLine) {
        const saved = JSON.parse(localStorage.getItem("offlineNews")) || [];
        if (saved.length > 0) {
            renderNews(saved);
            return;
        }
        grid.innerHTML = "<p>Você está offline.</p>";
        return;
    }

    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        if (!data.articles || data.articles.length === 0) {
            throw new Error("Nenhum artigo encontrado.");
        }

        const articles = data.articles.map(article => ({
            title: article.title,
            description: article.description || "Toque em ler notícia para ver mais detalhes.",
            content: article.content || article.description || "Conteúdo não disponível."
        }));

        localStorage.setItem("offlineNews", JSON.stringify(articles));
        renderNews(articles);

    } catch (e) {
        grid.innerHTML = `<p style="padding:20px">Erro: Verifique sua conexão ou limite da API NewsAPI.</p>`;
        console.error("Erro ao buscar notícias:", e);
    }
}

// Renderizar cards no Grid
function renderNews(articles) {
    grid.innerHTML = "";
    window.articles = articles; 

    articles.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-badge"><i class="bi bi-lightning-charge-fill"></i> Tech</div>
            <h3>${item.title}</h3>
            <p>${item.description.substring(0, 100)}...</p>
            <button class="read-more-btn" onclick="openModal(${i})">
                <i class="bi bi-book"></i> Ler Notícia
            </button>
        `;
        grid.appendChild(card);
    });

    // Dispara a tradução obrigatória
    forceTranslate();
}

// Modal
function openModal(i) {
    const article = window.articles[i];
    currentArticle = article;
    
    modalTitle.innerText = article.title;
    modalContent.innerText = article.description;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

// Exportar PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(currentArticle.title, 180);
    doc.text(titleLines, 10, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const contentLines = doc.splitTextToSize(currentArticle.description || "", 180);
    doc.text(contentLines, 10, 40);
    
    doc.save("noticia-tech.pdf");
}

window.onclick = (event) => {
    if (event.target == modal) closeModal();
}

// Inicializar
fetchNews();