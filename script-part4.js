// === Parte 4: Gerenciamento de Cartões de Crédito ===

// Salvar cartão
function saveCartao() {
    try {
        // Obter elementos do formulário
        const idInput = document.getElementById('cartaoId');
        const nomeInput = document.getElementById('cartaoNome');
        const bancoInput = document.getElementById('cartaoBanco');
        const limiteInput = document.getElementById('cartaoLimite');
        const diaFechamentoInput = document.getElementById('cartaoDiaFechamento');
        const diaVencimentoInput = document.getElementById('cartaoDiaVencimento');

        if (!nomeInput || !bancoInput || !limiteInput || !diaFechamentoInput || !diaVencimentoInput) {
            throw new Error('Elementos do formulário não encontrados');
        }

        // Obter valores
        const id = parseInt(idInput.value) || Date.now();
        const nome = nomeInput.value.trim();
        const banco = bancoInput.value.trim();
        
        // Processar limite como valor monetário
        let limite = 0;
        if (limiteInput.value) {
            limite = parseFloat(limiteInput.value.replace(/\./g, '').replace(',', '.')) || 0;
        }
        
        const diaFechamento = parseInt(diaFechamentoInput.value) || 10;
        const diaVencimento = parseInt(diaVencimentoInput.value) || 15;

        // Validar campos
        if (!nome) {
            showToast('Digite um nome para o cartão', 'warning');
            nomeInput.focus();
            return;
        }

        if (!banco) {
            showToast('Digite o banco/instituição do cartão', 'warning');
            bancoInput.focus();
            return;
        }

        if (diaFechamento < 1 || diaFechamento > 31) {
            showToast('Dia de fechamento deve estar entre 1 e 31', 'warning');
            diaFechamentoInput.focus();
            return;
        }

        if (diaVencimento < 1 || diaVencimento > 31) {
            showToast('Dia de vencimento deve estar entre 1 e 31', 'warning');
            diaVencimentoInput.focus();
            return;
        }

        // Criar objeto do cartão
        const cartaoItem = {
            id,
            nome,
            banco,
            limite,
            diaFechamento,
            diaVencimento,
            user: currentUser
        };

        // Atualizar ou adicionar
        const index = cartoes.findIndex(c => c.id === id);
        if (index !== -1) {
            cartoes[index] = cartaoItem;
        } else {
            cartoes.push(cartaoItem);
        }

        // Limpar formulário
        cancelEditCartao();
        
        // Atualizar interface
        updateCartoesLista();
        updateCartaoSelect();
        
        // Atualizar também o select da fatura
        updateFaturaCartaoSelect();
        
        // Salvar dados
        saveData();
        
        showToast('Cartão salvo com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar cartão:', error);
        showToast(`Erro ao salvar cartão: ${error.message}`, 'error');
    }
}

// Editar cartão existente
function editCartao(id) {
    try {
        // Encontrar o cartão
        const cartao = cartoes.find(c => c.id === id);
        
        if (!cartao) {
            throw new Error('Cartão não encontrado');
        }
        
        // Obter elementos do formulário
        const idInput = document.getElementById('cartaoId');
        const nomeInput = document.getElementById('cartaoNome');
        const bancoInput = document.getElementById('cartaoBanco');
        const limiteInput = document.getElementById('cartaoLimite');
        const diaFechamentoInput = document.getElementById('cartaoDiaFechamento');
        const diaVencimentoInput = document.getElementById('cartaoDiaVencimento');
        
        // Verificar se os elementos existem
        if (!idInput || !nomeInput || !bancoInput || !limiteInput || !diaFechamentoInput || !diaVencimentoInput) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Preencher formulário
        idInput.value = cartao.id;
        nomeInput.value = cartao.nome;
        bancoInput.value = cartao.banco;
        
        // Formatar limite como valor monetário
        if (cartao.limite) {
            limiteInput.value = cartao.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        } else {
            limiteInput.value = '';
        }
        
        diaFechamentoInput.value = cartao.diaFechamento || 10;
        diaVencimentoInput.value = cartao.diaVencimento || 15;
        
        // Atualizar título do formulário
        const formTitle = document.getElementById('formTitleCartoes');
        if (formTitle) {
            formTitle.innerHTML = `<i class="fas fa-edit"></i> Editar Cartão`;
        }
        
        // Mostrar botão cancelar
        const cancelBtn = document.getElementById('cancelBtnCartao');
        if (cancelBtn) {
            cancelBtn.classList.remove('hidden');
        }
        
        // Rolar até o formulário
        const formCard = document.querySelector('#cartoes .form-card');
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth' });
        }
        
        showToast('Editando cartão. Faça as alterações e clique em Salvar.', 'info');
        
    } catch (error) {
        console.error('Erro ao editar cartão:', error);
        showToast(`Erro ao editar cartão: ${error.message}`, 'error');
    }
}

// Excluir cartão
function deleteCartao(id) {
    try {
        // Encontrar o cartão
        const cartao = cartoes.find(c => c.id === id);
        
        if (!cartao) {
            throw new Error('Cartão não encontrado');
        }
        
        // Pedir confirmação
        if (!confirm(`Tem certeza que deseja excluir o cartão "${cartao.nome}"?`)) {
            return;
        }
        
        // Verificar se há faturas associadas a este cartão
        const faturasAssociadas = faturas.some(f => f.cartao === cartao.nome);
        
        if (faturasAssociadas && !confirm(`Existem faturas associadas a este cartão. Excluir mesmo assim?`)) {
            return;
        }
        
        // Remover o cartão
        cartoes = cartoes.filter(c => c.id !== id);
        
        // Atualizar interface
        updateCartoesLista();
        updateCartaoSelect();
        updateFaturaCartaoSelect();
        
        // Salvar dados
        saveData();
        
        showToast('Cartão excluído com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir cartão:', error);
        showToast(`Erro ao excluir cartão: ${error.message}`, 'error');
    }
}

// Cancelar edição do cartão
function cancelEditCartao() {
    try {
        // Limpar campos
        const idInput = document.getElementById('cartaoId');
        const nomeInput = document.getElementById('cartaoNome');
        const bancoInput = document.getElementById('cartaoBanco');
        const limiteInput = document.getElementById('cartaoLimite');
        const diaFechamentoInput = document.getElementById('cartaoDiaFechamento');
        const diaVencimentoInput = document.getElementById('cartaoDiaVencimento');
        
        if (idInput) idInput.value = '';
        if (nomeInput) nomeInput.value = '';
        if (bancoInput) bancoInput.value = '';
        if (limiteInput) limiteInput.value = '';
        if (diaFechamentoInput) diaFechamentoInput.value = '10';
        if (diaVencimentoInput) diaVencimentoInput.value = '15';
        
        // Restaurar título e esconder botão cancelar
        const formTitle = document.getElementById('formTitleCartoes');
        if (formTitle) {
            formTitle.innerHTML = `<i class="fas fa-plus-circle"></i> Adicionar Cartão`;
        }
        
        const cancelBtn = document.getElementById('cancelBtnCartao');
        if (cancelBtn) {
            cancelBtn.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Erro ao cancelar edição:', error);
        // Não mostrar toast de erro ao cancelar para não confundir o usuário
    }
}

// Atualizar lista de cartões
function updateCartoesLista() {
    try {
        const cartoesLista = document.getElementById('cartoesLista');
        if (!cartoesLista) return;
        
        // Filtrar cartões do usuário atual
        const userCartoes = cartoes.filter(c => c.user === currentUser);
        
        // Verificar se há cartões
        if (userCartoes.length === 0) {
            cartoesLista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <p>Nenhum cartão cadastrado</p>
                    <p>Adicione seu primeiro cartão usando o formulário acima</p>
                </div>
            `;
            return;
        }
        
        // Construir HTML para cada cartão
        let cartoesHTML = '';
        
        userCartoes.forEach(cartao => {
            cartoesHTML += `
                <div class="cartao-item">
                    <div class="cartao-header">
                        <h4>${cartao.nome}</h4>
                        <div class="cartao-actions">
                            <button class="btn-secondary btn-sm" onclick="editCartao(${cartao.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="deleteCartao(${cartao.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cartao-info">
                        <p><span>Banco/Instituição:</span> <span>${cartao.banco}</span></p>
                        <p><span>Limite:</span> <span>R$ ${(cartao.limite || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        <p><span>Fechamento:</span> <span>Dia ${cartao.diaFechamento || 10}</span></p>
                        <p><span>Vencimento:</span> <span>Dia ${cartao.diaVencimento || 15}</span></p>
                    </div>
                </div>
            `;
        });
        
        cartoesLista.innerHTML = cartoesHTML;
        
    } catch (error) {
        console.error('Erro ao atualizar lista de cartões:', error);
        showToast('Erro ao atualizar lista de cartões', 'error');
    }
}

// Atualizar select de cartões para o formulário de fatura
function updateFaturaCartaoSelect() {
    try {
        const select = document.getElementById('faturaCartao');
        const faturaCategoria = document.getElementById('faturaCategoria');
        
        if (!select) return;
        
        // Limpar select
        select.innerHTML = '';
        
        // Filtrar cartões do usuário atual
        const userCartoes = cartoes.filter(c => c.user === currentUser);
        
        // Verificar se há cartões
        if (userCartoes.length === 0) {
            select.innerHTML = '<option value="">Nenhum cartão disponível</option>';
        } else {
            // Adicionar opções para cada cartão
            userCartoes.forEach(cartao => {
                const option = document.createElement('option');
                option.value = cartao.nome;
                option.textContent = `${cartao.nome} (${cartao.banco})`;
                select.appendChild(option);
            });
        }
        
        // Também atualizar o select de categorias para a fatura
        if (faturaCategoria) {
            faturaCategoria.innerHTML = '';
            
            expenseCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                faturaCategoria.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Erro ao atualizar select de cartões para fatura:', error);
        showToast('Erro ao atualizar cartões', 'error');
    }
}

// Função para criar data do próximo mês
function getNextMonthDate(dateString, monthsToAdd) {
    // Extrair o ano, mês e dia diretamente da string para evitar problemas de fuso horário
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    
    // Criar um novo objeto Date
    // Meses em JavaScript são 0-indexed, então subtraímos 1 do mês
    const date = new Date(year, month - 1, day);
    
    // Adicionar os meses
    date.setMonth(date.getMonth() + monthsToAdd);
    
    // Formatar a data como YYYY-MM-DD, garantindo que os valores tenham 2 dígitos
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    
    return `${newYear}-${newMonth}-${newDay}`;
}

// Lançar fatura com suporte a parcelas em meses futuros
function lancarFatura() {
    try {
        // Obter elementos do formulário
        const cartaoSelect = document.getElementById('faturaCartao');
        const descricaoInput = document.getElementById('faturaDescricao');
        const valorInput = document.getElementById('faturaValor');
        const dataInput = document.getElementById('faturaDate');
        const parcelasInput = document.getElementById('faturaParcelas');
        const categoriaSelect = document.getElementById('faturaCategoria');
        
        if (!cartaoSelect || !descricaoInput || !valorInput || !dataInput || !parcelasInput || !categoriaSelect) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Obter valores
        const cartao = cartaoSelect.value;
        const descricao = descricaoInput.value.trim();
        const data = dataInput.value;
        const parcelas = parseInt(parcelasInput.value) || 1;
        const categoria = categoriaSelect.value;
        
        // Processar valor como monetário
        let valor = 0;
        if (valorInput.value) {
            valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
        }
        
        // Validar campos
        if (!cartao) {
            showToast('Selecione um cartão', 'warning');
            cartaoSelect.focus();
            return;
        }
        
        if (!descricao) {
            showToast('Digite uma descrição para a fatura', 'warning');
            descricaoInput.focus();
            return;
        }
        
        if (!data) {
            showToast('Selecione a data da compra', 'warning');
            dataInput.focus();
            return;
        }
        
        if (valor <= 0) {
            showToast('Digite um valor válido', 'warning');
            valorInput.focus();
            return;
        }
        
        if (!categoria) {
            showToast('Selecione uma categoria', 'warning');
            categoriaSelect.focus();
            return;
        }
        
        // Calcular valor por parcela
        const valorParcela = valor / parcelas;
        
        // Criar objeto da fatura principal
        const faturaItem = {
            id: Date.now(),
            cartao,
            descricao,
            valor,
            date: data,
            parcelas,
            valorParcela,
            category: categoria,
            user: currentUser
        };
        
        // Adicionar à lista de faturas
        faturas.push(faturaItem);
        
        // Criar gastos para cada parcela
        for (let i = 0; i < parcelas; i++) {
            // Calcular a data para cada parcela
            const parcelaDate = getNextMonthDate(data, i);
            
            // Criar descrição específica para a parcela
            let parcelaDescricao = descricao;
            if (parcelas > 1) {
                parcelaDescricao = `${descricao} (Parcela ${i+1}/${parcelas})`;
            }
            
            // Criar gasto para a parcela
            const gastoItem = {
                id: Date.now() + i + 1, // ID único para cada parcela
                date: parcelaDate,
                description: `${parcelaDescricao} (Cartão ${cartao})`,
                category: categoria,
                forma: 'Crédito',
                fixoVariavel: 'Variável',
                status: i === 0 ? 'Pago' : 'Pendente', // Primeira parcela paga, demais pendentes
                despesa: valorParcela,
                parcelas: parcelas,
                parcelaAtual: i + 1,
                valorParcela: valorParcela,
                cartao,
                user: currentUser,
                faturaId: faturaItem.id // Referência à fatura principal
            };
            
            gastos.push(gastoItem);
        }
        
        // Limpar campos
        descricaoInput.value = '';
        valorInput.value = '';
        dataInput.value = new Date().toISOString().split('T')[0]; // Data atual
        parcelasInput.value = '1';
        
        // Atualizar interface
        updateFaturasTable();
        updateGastos();
        updateDashboardTotals();
        
        // Salvar dados
        saveData();
        
        showToast(`Fatura lançada com sucesso! ${parcelas > 1 ? `${parcelas} parcelas criadas.` : ''}`, 'success');
        
    } catch (error) {
        console.error('Erro ao lançar fatura:', error);
        showToast(`Erro ao lançar fatura: ${error.message}`, 'error');
    }
}

// Atualizar tabela de faturas
function updateFaturasTable() {
    try {
        const tableBody = document.getElementById('faturasTableBody');
        if (!tableBody) return;
        
        // Filtrar faturas do usuário atual
        const userFaturas = faturas.filter(f => f.user === currentUser);
        
        // Verificar se há faturas
        if (userFaturas.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma fatura registrada</td></tr>`;
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        const sortedFaturas = [...userFaturas].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Adicionar linhas
        sortedFaturas.forEach(fatura => {
            const row = document.createElement('tr');
            
            // Formatar a data
            const dateParts = fatura.date.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${fatura.descricao}</td>
                <td>${fatura.cartao}</td>
                <td>${fatura.category}</td>
                <td>R$ ${fatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>${fatura.parcelas}x R$ ${fatura.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteFatura(${fatura.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao atualizar tabela de faturas:', error);
        showToast('Erro ao atualizar faturas', 'error');
    }
}

// Excluir fatura e todas as parcelas associadas
function deleteFatura(id) {
    try {
        // Encontrar a fatura
        const fatura = faturas.find(f => f.id === id);
        
        if (!fatura) {
            throw new Error('Fatura não encontrada');
        }
        
        // Pedir confirmação
        if (!confirm(`Tem certeza que deseja excluir esta fatura e todas as parcelas associadas?`)) {
            return;
        }
        
        // Remover a fatura
        faturas = faturas.filter(f => f.id !== id);
        
        // Remover todos os gastos relacionados a esta fatura usando a referência faturaId
        gastos = gastos.filter(g => g.faturaId !== id);
        
        // Atualizar interface
        updateFaturasTable();
        updateGastos();
        updateDashboardTotals();
        
        // Salvar dados
        saveData();
        
        showToast('Fatura e parcelas excluídas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir fatura:', error);
        showToast(`Erro ao excluir fatura: ${error.message}`, 'error');
    }
}

// Função principal para inicializar a aba de cartões
function initCartoes() {
    updateCartoesLista();
    updateCartaoSelect();  // Select do formulário de gastos
    updateFaturaCartaoSelect();
    updateFaturasTable();
    
    // Definir data atual no campo de data da fatura
    const faturaDate = document.getElementById('faturaDate');
    if (faturaDate) {
        faturaDate.value = new Date().toISOString().split('T')[0];
    }
}
// Função para verificar atualizações
function checkForUpdates() {
    // Mostrar um spinner no botão
    const btn = document.querySelector('.check-update-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    btn.disabled = true;
    
    // Simular verificação de atualização após 1.5 segundos
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        
        // Mostrar toast de resultado
        showToast('Seu aplicativo está atualizado!', 'success');
    }, 1500);
}

// Função para abrir formulário de feedback
function openFeedbackForm() {
    // Criar um modal de feedback
    const modalHTML = `
        <div class="modal-overlay" id="feedbackModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Enviar Feedback</h3>
                    <button class="modal-close" onclick="closeFeedbackModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="feedbackType">Tipo de feedback</label>
                        <select id="feedbackType">
                            <option value="suggestion">Sugestão</option>
                            <option value="bug">Reportar bug</option>
                            <option value="compliment">Elogio</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedbackMessage">Mensagem</label>
                        <textarea id="feedbackMessage" rows="4" placeholder="Descreva seu feedback..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeFeedbackModal()">Cancelar</button>
                    <button class="btn-primary" onclick="submitFeedback()">Enviar</button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar o modal
    setTimeout(() => {
        const modal = document.getElementById('feedbackModal');
        modal.classList.add('show');
    }, 10);
}

// Fechar o modal de feedback
function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Enviar feedback
function submitFeedback() {
    const type = document.getElementById('feedbackType').value;
    const message = document.getElementById('feedbackMessage').value;
    
    if (!message.trim()) {
        showToast('Por favor, insira uma mensagem', 'warning');
        return;
    }
    
    // Fechar o modal
    closeFeedbackModal();
    
    // Mostrar confirmação
    showToast('Feedback enviado com sucesso!', 'success');
    
    // Aqui você poderia implementar o envio real para um servidor
    console.log('Feedback:', { type, message });
}

// Mostrar notas da versão
function showReleaseNotes() {
    const modalHTML = `
        <div class="modal-overlay" id="releaseNotesModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Notas da Versão 1.1</h3>
                    <button class="modal-close" onclick="closeReleaseNotesModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="release-notes">
                        <h4>Novidades</h4>
                        <ul>
                            <li>Interface redesenhada para melhor usabilidade</li>
                            <li>Novo sistema de relatórios financeiros</li>
                            <li>Integração com cartões de crédito aprimorada</li>
                            <li>Dashboard interativo com gráficos avançados</li>
                        </ul>
                        
                        <h4>Correções</h4>
                        <ul>
                            <li>Corrigido problema ao calcular metas financeiras</li>
                            <li>Melhorias de performance no carregamento de gráficos</li>
                            <li>Corrigido bug ao exportar relatórios em PDF</li>
                            <li>Resolvido problema de sincronização de dados</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="closeReleaseNotesModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar o modal
    setTimeout(() => {
        const modal = document.getElementById('releaseNotesModal');
        modal.classList.add('show');
    }, 10);
}

// Fechar o modal de notas da versão
function closeReleaseNotesModal() {
    const modal = document.getElementById('releaseNotesModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}