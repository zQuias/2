// === Parte 1: Inicialização e Funções de Login/Dados ===
let currentUser = null;
// Inicializar com o mês atual
const today = new Date();
const defaultMesAno = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
let dadosPessoais = JSON.parse(localStorage.getItem('dadosPessoais')) || { nome: "", mesAno: defaultMesAno, objetivo: "" };
let entradas = JSON.parse(localStorage.getItem('entradas')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let metas = JSON.parse(localStorage.getItem('metas')) || [];
let reserva = JSON.parse(localStorage.getItem('reserva')) || { valor: 0, objetivo: 0, local: "", liquidez: "Sim" };
let faturas = JSON.parse(localStorage.getItem('faturas')) || [];
let cartoes = JSON.parse(localStorage.getItem('cartoes')) || [
    { nome: "Cartão Principal", banco: "Nubank" },
    { nome: "Cartão Secundário", banco: "Itaú" },
];
let expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [
    { name: "Alimentação", isDefault: false },
    { name: "Lazer", isDefault: false },
    { name: "Moradia", isDefault: true },
    { name: "Transporte", isDefault: false },
    { name: "Saúde", isDefault: false }
];

// Garantir que o mês em dadosPessoais esteja em formato correto
if (dadosPessoais.mesAno) {
    try {
        const [year, month] = dadosPessoais.mesAno.split('-');
        // Verificar se o formato é válido
        if (!/^\d{4}-\d{2}$/.test(dadosPessoais.mesAno)) {
            console.warn('Formato de mês/ano inválido, usando valor padrão');
            dadosPessoais.mesAno = defaultMesAno;
        }
    } catch (error) {
        console.error('Erro ao validar mês/ano:', error);
        dadosPessoais.mesAno = defaultMesAno;
    }
}

/**
 * Função para filtrar itens por ano e mês
 * @param {Array} items - Array de itens com propriedade 'date'
 * @param {string} year - Ano para filtrar
 * @param {number} month - Mês para filtrar (0 = todos os meses)
 * @param {string} currentUser - Usuário atual
 * @returns {Array} - Itens filtrados
 */
function filterItemsByMonth(items, year, month, currentUser) {
    return items.filter(item => {
        if (item.user !== currentUser) return false;
        // CORREÇÃO AQUI: Manipular a data corretamente sem alterar o timezone
        const dateParts = item.date.split('-');
        const itemYear = dateParts[0];
        const itemMonth = parseInt(dateParts[1], 10);
        
        return itemYear === year && 
               (month === 0 || itemMonth === month);
    });
}

// Função para mostrar toast de notificação
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    
    // Adicionar classe para cor baseada no tipo
    if (type === 'success') {
        toast.style.background = 'var(--success)';
    } else if (type === 'error') {
        toast.style.background = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.background = 'var(--warning)';
    } else {
        toast.style.background = 'var(--primary)';
    }
    
    toast.classList.remove('hidden');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Função para salvar dados no localStorage
function saveData() {
    try {
        localStorage.setItem('dadosPessoais', JSON.stringify(dadosPessoais));
        localStorage.setItem('entradas', JSON.stringify(entradas));
        localStorage.setItem('gastos', JSON.stringify(gastos));
        localStorage.setItem('metas', JSON.stringify(metas));
        localStorage.setItem('reserva', JSON.stringify(reserva));
        localStorage.setItem('faturas', JSON.stringify(faturas));
        localStorage.setItem('cartoes', JSON.stringify(cartoes));
        localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
        localStorage.setItem('currentUser', currentUser);
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showToast('Erro ao salvar dados no armazenamento local.', 'error');
        return false;
    }
}

// Função para alternar visibilidade da senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Função de login com verificação para "Ezequias" - MELHORADA
function loginUser() {
    // Obter valores do formulário
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.btn-login');
    
    if (!loginInput || !passwordInput || !loginBtn) {
        alert("Erro: Elementos de login não encontrados!");
        return;
    }
    
    const login = loginInput.value.trim();
    const password = passwordInput.value;
    
    // Validar campos vazios
    if (!login) {
        showToast('Digite um nome de usuário', 'warning');
        loginInput.focus();
        return;
    }
    
    if (!password) {
        showToast('Digite uma senha', 'warning');
        passwordInput.focus();
        return;
    }
    
    // Adicionar estado de carregamento ao botão
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simular delay de autenticação para melhor UX
    setTimeout(() => {
        // Verificação direta para o usuário Ezequias ou qualquer outro com senha 1234
        if (login.toLowerCase() === 'ezequias' && password === '1234') {
            // Login bem-sucedido para Ezequias
            currentUser = 'Ezequias';
            completeLogin();
        } else if (password === '1234') {
            // Para fins de teste, aceita qualquer usuário com senha 1234
            currentUser = login.charAt(0).toUpperCase() + login.slice(1).toLowerCase();
            completeLogin();
        } else {
            // Senha incorreta
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            showToast('Senha incorreta. Use "1234" para acessar.', 'error');
            passwordInput.focus();
            passwordInput.select();
            
            // Adicionar efeito de shake ao formulário
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                loginCard.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    loginCard.style.animation = '';
                }, 500);
            }
        }
    }, 1500); // Delay de 1.5 segundos para simular autenticação
}

// Completa o processo de login
function completeLogin() {
    // Salvar estado de login
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', currentUser);
    
    // Atualizar nome do usuário na interface
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = currentUser;
    }
    
    // Esconder tela de login com animação
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    
    if (loginScreen && dashboard) {
        loginScreen.style.opacity = '0';
        loginScreen.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'flex';
            dashboard.style.opacity = '0';
            
            // Animar entrada do dashboard
            setTimeout(() => {
                dashboard.style.opacity = '1';
            }, 50);
        }, 300);
    }
    
    // Armazenar nome do usuário
    dadosPessoais.nome = currentUser;
    saveData();
    
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        showToast(`Bem-vindo, ${currentUser}!`, 'success');
    }, 500);
    
    // Inicializar dashboard
    showTab('dados');
    updateDashboardTotals();
    
    // Atualizar data atual
    updateCurrentDate();
    
    // Remover estado de carregamento
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Sair do sistema
function logout() {
    // Confirmar logout
    if (!confirm('Tem certeza que deseja sair?')) {
        return;
    }
    
    localStorage.removeItem('isLoggedIn');
    currentUser = null;
    
    // Animar saída do dashboard
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    
    if (loginScreen && dashboard) {
        dashboard.style.opacity = '0';
        dashboard.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            dashboard.style.display = 'none';
            loginScreen.style.display = 'flex';
            loginScreen.style.opacity = '0';
            loginScreen.style.transform = 'scale(1.05)';
            
            // Animar entrada da tela de login
            setTimeout(() => {
                loginScreen.style.opacity = '1';
                loginScreen.style.transform = 'scale(1)';
            }, 50);
        }, 300);
    }
    
    // Limpar campos do login
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    if (loginInput) loginInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    // Resetar toggle de senha
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');
    if (passwordInput && passwordToggleIcon) {
        passwordInput.type = 'password';
        passwordToggleIcon.classList.remove('fa-eye-slash');
        passwordToggleIcon.classList.add('fa-eye');
    }
    
    showToast('Você saiu do sistema.', 'info');
}

// Alternar entre modo claro e escuro
function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('themeIcon');
    
    if (themeIcon) {
        if (isDarkMode) {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Sincronizar seletores de mês em todas as abas
function syncSelectedMonth() {
    // Obter o mês/ano atual da aplicação
    const mesAno = dadosPessoais.mesAno || defaultMesAno;
    const [year, month] = mesAno.split('-');
    
    // Atualizar todos os seletores para o mesmo mês/ano
    const yearSelectors = [
        document.getElementById('yearSelect'),
        document.getElementById('gastosYearSelect'),
        document.getElementById('resumoYearSelect'),
        document.getElementById('relatorioYearSelect')
    ];
    
    const monthSelectors = [
        document.getElementById('monthSelect'),
        document.getElementById('gastosMonthSelect'),
        document.getElementById('resumoMonthSelect'),
        document.getElementById('relatorioMonthSelect')
    ];
    
    // Atualizar seletores de ano
    yearSelectors.forEach(selector => {
        if (selector && selector.querySelector(`option[value="${year}"]`)) {
            selector.value = year;
        }
    });
    
    // Atualizar seletores de mês
    const monthValue = parseInt(month);
    monthSelectors.forEach(selector => {
        if (selector && selector.querySelector(`option[value="${monthValue}"]`)) {
            selector.value = monthValue;
        }
    });
}

// Mostrar aba específica
function showTab(tabId) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover destaque de todos os itens do menu
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Destacar item do menu
    const menuItem = document.getElementById(`menu${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    // Atualizar conteúdo da aba
    try {
        if (tabId === 'dados') {
            updateDados();
        }
        else if (tabId === 'entradas') {
            cancelEdit('entrada');
            updateDashboard();
        }
        else if (tabId === 'gastos') {
            cancelEdit('gasto');
            updateCategorySelect();
            updateCategoryList();
            updateGastos();
        }
        // Adicione este bloco para a aba de cartões
        else if (tabId === 'cartoes') {
            initCartoes();
        }
        else if (tabId === 'transacoes') {
    updateTransacoes();
}
        else if (tabId === 'resumo') {
            updateResumo();
        }
        else if (tabId === 'metas') {
            updateMetas();
        }
        else if (tabId === 'reserva') {
            updateReserva();
        }
        else if (tabId === 'relatorio') {
            updateRelatorio();
        }
        else if (tabId === 'configuracoes') {
            updateConfiguracoes();
        }
    } catch (error) {
        console.error(`Erro ao atualizar aba ${tabId}:`, error);
        showToast(`Erro ao carregar aba ${tabId}.`, 'error');
    }
}

// Salvar dados pessoais
function saveDados() {
    const nomeInput = document.getElementById('nome');
    const mesAnoInput = document.getElementById('mesAno');
    const objetivoInput = document.getElementById('objetivo');
    
    if (!nomeInput || !mesAnoInput || !objetivoInput) {
        showToast('Erro ao acessar campos do formulário.', 'error');
        return;
    }
    
    // Validar dados
    const nome = nomeInput.value.trim();
    const mesAno = mesAnoInput.value || defaultMesAno;
    const objetivo = objetivoInput.value.trim();
    
    // Salvar dados
    dadosPessoais.nome = nome || currentUser;
    dadosPessoais.mesAno = mesAno;
    dadosPessoais.objetivo = objetivo;
    
    // Limpar campos
    nomeInput.value = '';
    mesAnoInput.value = mesAno;
    objetivoInput.value = '';
    
    // Atualizar interface
    updateDados();
    
    // Sincronizar seletores de mês
    syncSelectedMonth();
    
    // CORREÇÃO: Atualizar TODAS as visualizações
    updateDashboardTotals();
    updateDashboard();
    updateGastos();
    updateResumo();
    updateRelatorio();
    
    // Salvar no localStorage
    if (saveData()) {
        showToast('Dados salvos com sucesso!', 'success');
    }
}

// Atualizar exibição de dados pessoais
function updateDados() {
    const dadosDisplay = document.getElementById('dadosDisplay');
    if (!dadosDisplay) return;
    
    // Formatar data
    const mesAno = dadosPessoais.mesAno || defaultMesAno;
    const [year, month] = mesAno.split('-');
    const formattedDate = new Date(year, month - 1, 1);
    
    // Exibir dados
    dadosDisplay.innerHTML = `
        <h4>Dados Salvos</h4>
        <div class="data-item">
            <i class="fas fa-user"></i>
            <div>
                <span>Nome</span>
                <p>${dadosPessoais.nome || currentUser}</p>
            </div>
        </div>
        <div class="data-item">
            <i class="fas fa-calendar"></i>
            <div>
                <span>Mês/Ano</span>
                <p>${formattedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
            </div>
        </div>
        <div class="data-item">
            <i class="fas fa-bullseye"></i>
            <div>
                <span>Objetivo</span>
                <p>${dadosPessoais.objetivo || 'Não definido'}</p>
            </div>
        </div>
    `;
    
    // Sincronizar o campo de entrada com o valor salvo
    const mesAnoInput = document.getElementById('mesAno');
    if (mesAnoInput) {
        mesAnoInput.value = mesAno;
    }
    
    // Sincronizar seletores de mês/ano
    syncSelectedMonth();
}

// Atualizar totais no dashboard
function updateDashboardTotals() {
    const totalReceitaEl = document.getElementById('totalReceita');
    const totalDespesaEl = document.getElementById('totalDespesa');
    const totalSaldoEl = document.getElementById('totalSaldo');
    const metaProgressoEl = document.getElementById('metaProgresso');
    
    if (!totalReceitaEl || !totalDespesaEl || !totalSaldoEl || !metaProgressoEl) return;
    
    // CORREÇÃO: Sempre mostrar totais do ano completo no dashboard
    const currentYear = new Date().getFullYear().toString();
    
    let totalReceita = 0, totalDespesa = 0;
    
    // Calcular receitas do ANO COMPLETO (não filtrar por mês)
    entradas.filter(e => e.user === currentUser && e.date.startsWith(currentYear)).forEach(e => {
        totalReceita += e.receita || 0;
    });
    
    // Calcular despesas do ANO COMPLETO (não filtrar por mês)
    gastos.filter(g => g.user === currentUser && g.date.startsWith(currentYear)).forEach(g => {
        totalDespesa += g.despesa || 0;
    });
    
    // Calcular saldo bruto
    const saldoBruto = totalReceita - totalDespesa;
    
    // Calcular valores comprometidos
    const valorReserva = reserva?.valor || 0;
    const userMetas = metas.filter(m => m.user === currentUser);
    const totalMetasGuardado = userMetas.reduce((total, meta) => total + (meta.valorGuardado || 0), 0);
    
    // Saldo disponível (descontando valores comprometidos)
    const saldoDisponivel = saldoBruto - valorReserva - totalMetasGuardado;
    
    // Calcular progresso total das metas
    const totalMetasObjetivo = userMetas.reduce((total, meta) => total + (meta.valor || 0), 0);
    const progressoMetas = totalMetasObjetivo > 0 ? ((totalMetasGuardado / totalMetasObjetivo) * 100).toFixed(1) : 0;
    
    // Atualizar elementos
    totalReceitaEl.textContent = `R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    totalDespesaEl.textContent = `R$ ${totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    totalSaldoEl.innerHTML = `
        R$ ${saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        <small style="font-size: 0.8em; opacity: 0.8; display: block;">Disponível</small>
    `;
    metaProgressoEl.innerHTML = `
        R$ ${totalMetasGuardado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        <small style="font-size: 0.8em; opacity: 0.8; display: block;">${progressoMetas}% das metas</small>
    `;
}

// Atualizar data atual no header
function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = new Date().toLocaleDateString('pt-BR', options);
    }
}

// Função para alternar o menu em dispositivos móveis
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando sistema de controle financeiro...');
    // Detectar se é PWA e aplicar melhorias
if (window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('pwa-mode');
    console.log('🚀 Executando como PWA');
}

// Melhorar performance em dispositivos móveis
if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile-device');
    
    // Otimizar scrolling
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
}
    
    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    // Atualizar data atual
    updateCurrentDate();
    
    // Verificar se usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn && savedUser) {
        // Restaurar sessão
        currentUser = savedUser;
        
        // Atualizar nome do usuário
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser;
        }
        
        // Mostrar dashboard
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        
        // Inicializar aba de dados
        showTab('dados');
        updateDashboardTotals();
    }
    
    // Inicializar seletores
    updateCartaoSelect();
    updateCategorySelect();
    updateCategoryList();
    
    // Sincronizar campo mesAno
    const mesAnoInput = document.getElementById('mesAno');
    if (mesAnoInput) {
        mesAnoInput.value = dadosPessoais.mesAno || defaultMesAno;
    }
    
    // Definir data atual em campos de data
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
    
    // Adicionar evento de tecla Enter no login
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginUser();
            }
        });
    }
    
    // Verificar se o elemento já existe para evitar duplicação
    if (!document.querySelector('.menu-toggle')) {
        // Criar botão de menu
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.onclick = toggleSidebar;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(menuToggle);
    }
    
    // Fechar o menu ao clicar em um item (em dispositivos móveis)
    const sidebarItems = document.querySelectorAll('.sidebar-nav li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });
    
    // Fechar menu ao clicar fora dele em dispositivos móveis
    document.addEventListener('click', function(event) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (sidebar && menuToggle && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
    
    // Atualizar layout ao redimensionar a janela
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        
        if (window.innerWidth > 992 && sidebar) {
            sidebar.classList.add('active');
        } else if (window.innerWidth <= 992 && sidebar) {
            sidebar.classList.remove('active');
        }
    });
    
    // Verificar o tamanho inicial da tela
    if (window.innerWidth > 992) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('active');
        }
    }
});

// Adicionar CSS para animação de shake no login
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Adicionar CSS ao head se não existir
if (!document.querySelector('#shake-animation-css')) {
    const style = document.createElement('style');
    style.id = 'shake-animation-css';
    style.textContent = shakeCSS;
    document.head.appendChild(style);
}