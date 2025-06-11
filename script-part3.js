// === Parte 3: Metas, Reserva, Relatórios e Exportação/Importação ===

// Adicionar meta financeira
function addMeta() {
    try {
        // Obter elementos do formulário
        const valorInput = document.getElementById('metaValor');
        const descricaoInput = document.getElementById('metaDescricao');
        const estrategiaInput = document.getElementById('metaEstrategia');
        
        if (!valorInput || !descricaoInput || !estrategiaInput) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Obter valores
        const valorStr = valorInput.value.replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr) || 0;
        const descricao = descricaoInput.value.trim();
        const estrategia = estrategiaInput.value.trim();
        
        // Validar dados
        if (valor <= 0) {
            showToast('Digite um valor válido para a meta', 'warning');
            valorInput.focus();
            return;
        }
        
        if (!descricao) {
            showToast('Digite uma descrição para a meta', 'warning');
            descricaoInput.focus();
            return;
        }
        
        // Criar meta
        const metaItem = {
            id: Date.now(),
            valor,
            descricao,
            estrategia,
            progresso: 0,
            user: currentUser
        };
        
        // Adicionar à lista
        metas.push(metaItem);
        
        // Limpar campos
        valorInput.value = '';
        descricaoInput.value = '';
        estrategiaInput.value = '';
        
        // Atualizar interface
        updateMetas();
        
        // Salvar dados
        saveData();
        
        showToast('Meta adicionada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao adicionar meta:', error);
        showToast(`Erro ao adicionar meta: ${error.message}`, 'error');
    }
}

// Remover meta
function deleteMeta(id) {
    // Confirmação
    if (!confirm('Tem certeza que deseja excluir esta meta?')) {
        return;
    }
    
    // Remover meta
    metas = metas.filter(m => m.id !== id);
    
    // Atualizar interface
    updateMetas();
    
    // Salvar dados
    saveData();
    
    showToast('Meta removida com sucesso!', 'success');
}

// Atualizar exibição de metas
function updateMetas() {
    try {
        const metaProgressoDisplay = document.getElementById('metaProgressoDisplay');
        if (!metaProgressoDisplay) return;
        
        // Obter mês/ano atual
        const mesAno = dadosPessoais.mesAno || defaultMesAno;
        const [year, month] = mesAno.split('-');
        
        // Calcular saldo atual usando a função filterItemsByMonth
        let totalReceita = 0, totalDespesa = 0;
        
        // Somar receitas do mês
        filterItemsByMonth(entradas, year, parseInt(month), currentUser).forEach(e => {
            totalReceita += e.receita || 0;
        });
        
        // Subtrair despesas do mês
        filterItemsByMonth(gastos, year, parseInt(month), currentUser).forEach(g => {
            totalDespesa += g.despesa || 0;
        });
        
        // Calcular saldo atual
        const saldoAtual = totalReceita - totalDespesa;
        
        // Filtrar metas do usuário atual
        const userMetas = metas.filter(m => m.user === currentUser);
        
        // Verificar se há metas
        if (userMetas.length === 0) {
            metaProgressoDisplay.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <p>Nenhuma meta cadastrada</p>
                    <p>Adicione sua primeira meta usando o formulário acima</p>
                </div>
            `;
            return;
        }
        
        // Criar HTML para exibir metas
        let metasHTML = '';
        
        userMetas.forEach(meta => {
            // Usar o saldo como progresso (limitado ao valor da meta)
            const progresso = Math.min(saldoAtual, meta.valor);
            const percentProgress = meta.valor > 0 ? Math.min((progresso / meta.valor) * 100, 100).toFixed(2) : 0;
            
            metasHTML += `
                <div class="meta-item">
                    <div class="meta-header">
                        <h4>${meta.descricao}</h4>
                        <button class="btn-danger btn-sm" onclick="deleteMeta(${meta.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="meta-details">
                        <p><strong>Valor da meta:</strong> R$ ${meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p><strong>Progresso:</strong> R$ ${progresso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ ${meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentProgress}%)</p>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${percentProgress}%"></div>
                        </div>
                        ${meta.estrategia ? `<p><strong>Estratégia:</strong> ${meta.estrategia}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        metaProgressoDisplay.innerHTML = metasHTML;
        
    } catch (error) {
        console.error('Erro ao atualizar metas:', error);
        showToast('Erro ao atualizar metas', 'error');
    }
}

// Salvar reserva de emergência
function saveReserva() {
    try {
        // Obter elementos do formulário
        const valorInput = document.getElementById('reservaValor');
        const objetivoInput = document.getElementById('reservaObjetivo');
        const localInput = document.getElementById('reservaLocal');
        const liquidezInput = document.getElementById('reservaLiquidez');
        
        if (!valorInput || !objetivoInput || !localInput || !liquidezInput) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Obter valores
        const valorStr = valorInput.value.replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr) || 0;
        
        const objetivoStr = objetivoInput.value.replace(/\./g, '').replace(',', '.');
        const objetivo = parseFloat(objetivoStr) || 0;
        
        const local = localInput.value.trim();
        const liquidez = liquidezInput.value;
        
        // Validar dados
        if (valor < 0) {
            showToast('O valor atual não pode ser negativo', 'warning');
            valorInput.focus();
            return;
        }
        
        if (objetivo <= 0) {
            showToast('O objetivo deve ser maior que zero', 'warning');
            objetivoInput.focus();
            return;
        }
        
        if (!local) {
            showToast('Informe onde a reserva está guardada', 'warning');
            localInput.focus();
            return;
        }
        
        // Atualizar reserva
        reserva = {
            valor,
            objetivo,
            local,
            liquidez,
            user: currentUser
        };
        
        // Limpar campos
        valorInput.value = '';
        objetivoInput.value = '';
        localInput.value = '';
        liquidezInput.value = 'Sim';
        
        // Atualizar interface
        updateReserva();
        
        // Salvar dados
        saveData();
        
        showToast('Reserva salva com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar reserva:', error);
        showToast(`Erro ao salvar reserva: ${error.message}`, 'error');
    }
}

// Atualizar exibição da reserva
function updateReserva() {
    try {
        const reservaDisplay = document.getElementById('reservaDisplay');
        if (!reservaDisplay) return;
        
        // Verificar se há dados de reserva
        if (!reserva || !reserva.objetivo) {
            reservaDisplay.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-piggy-bank"></i>
                    <p>Nenhuma reserva configurada</p>
                    <p>Configure sua reserva de emergência usando o formulário acima</p>
                </div>
            `;
            return;
        }
        
        // Calcular percentual
        const percentProgress = reserva.objetivo > 0 
            ? Math.min((reserva.valor / reserva.objetivo) * 100, 100).toFixed(2) 
            : 0;
        
        // Criar HTML
        reservaDisplay.innerHTML = `
            <div class="reserva-container">
                <div class="reserva-header">
                    <h4>Reserva de Emergência</h4>
                </div>
                <div class="reserva-details">
                    <div class="reserva-item">
                        <span>Valor atual</span>
                        <p>R$ ${reserva.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div class="reserva-item">
                        <span>Objetivo</span>
                        <p>R$ ${reserva.objetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div class="reserva-progress">
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${percentProgress}%"></div>
                        </div>
                        <p>${percentProgress}% completo</p>
                    </div>
                    <div class="reserva-info">
                        <div class="reserva-item">
                            <span>Onde está guardado</span>
                            <p>${reserva.local || 'Não definido'}</p>
                        </div>
                        <div class="reserva-item">
                            <span>Liquidez</span>
                            <p>${reserva.liquidez}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao atualizar reserva:', error);
        showToast('Erro ao atualizar reserva', 'error');
    }
}

// Atualizar resumo financeiro
function updateResumo() {
    try {
        const yearSelect = document.getElementById('resumoYearSelect');
        const monthSelect = document.getElementById('resumoMonthSelect');
        const resumoDisplay = document.getElementById('resumoDisplay');
        
        if (!yearSelect || !monthSelect || !resumoDisplay) {
            throw new Error('Elementos do resumo não encontrados');
        }
        
        const year = yearSelect.value;
        const month = parseInt(monthSelect.value);
        
        // Filtrar entradas e gastos usando a função filterItemsByMonth
        const filteredEntradas = filterItemsByMonth(entradas, year, month, currentUser);
        const filteredGastos = filterItemsByMonth(gastos, year, month, currentUser);
        
        // Calcular totais
        let totalReceita = 0, totalDespesa = 0;
        filteredEntradas.forEach(item => totalReceita += item.receita || 0);
        filteredGastos.forEach(item => totalDespesa += item.despesa || 0);
        
        // Calcular saldo
        const totalSaldo = totalReceita - totalDespesa;
        
        // Calcular gastos por categoria
        const categorias = {};
        filteredGastos.forEach(item => {
            if (!categorias[item.category]) {
                categorias[item.category] = 0;
            }
            categorias[item.category] += item.despesa || 0;
        });
        
        // Ordenar categorias do maior para o menor gasto
        const categoriasOrdenadas = Object.entries(categorias)
            .sort((a, b) => b[1] - a[1])
            .map(([categoria, valor]) => ({
                categoria,
                valor,
                percentual: totalDespesa > 0 ? (valor / totalDespesa * 100).toFixed(2) : 0
            }));
        
        // Criar HTML para o resumo
        let resumoHTML = '';
        
        // Período do resumo
        const periodoTexto = month === 0 
            ? `Todo o ano de ${year}` 
            : `${new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long' })} de ${year}`;
        
        resumoHTML += `
            <div class="resumo-header">
                <h4>Resumo Financeiro - ${periodoTexto}</h4>
            </div>
            
            <div class="resumo-grid">
                <div class="resumo-section">
                    <h5>Visão Geral</h5>
                    <div class="overview-stats">
                        <div class="stat-item income">
                            <span>Receita Total</span>
                            <p>R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div class="stat-item expenses">
                            <span>Despesa Total</span>
                            <p>R$ ${totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div class="stat-item balance ${totalSaldo >= 0 ? 'positive' : 'negative'}">
                            <span>Saldo</span>
                            <p>R$ ${totalSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
        `;
        
        // Gastos por categoria
        if (categoriasOrdenadas.length > 0) {
            resumoHTML += `
                <div class="resumo-section">
                    <h5>Gastos por Categoria</h5>
                    <div class="category-stats">
            `;
            
            categoriasOrdenadas.forEach(cat => {
                resumoHTML += `
                    <div class="category-item">
                        <div class="category-info">
                            <span>${cat.categoria}</span>
                            <p>R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual}%)</p>
                        </div>
                        <div class="progress-container small">
                            <div class="progress-bar" style="width: ${cat.percentual}%"></div>
                        </div>
                    </div>
                `;
            });
            
            resumoHTML += `
                    </div>
                </div>
            `;
        }
        
        // Metas
        const userMetas = metas.filter(m => m.user === currentUser);
        
        if (userMetas.length > 0) {
            resumoHTML += `
                <div class="resumo-section">
                    <h5>Progresso de Metas</h5>
                    <div class="meta-stats">
            `;
            
            userMetas.forEach(meta => {
                // Usar o saldo como progresso
                const progresso = Math.min(totalSaldo, meta.valor);
                const percentProgress = meta.valor > 0 ? Math.min((progresso / meta.valor) * 100, 100).toFixed(2) : 0;
                
                resumoHTML += `
                    <div class="meta-stat-item">
                        <div class="meta-info">
                            <span>${meta.descricao}</span>
                            <p>${percentProgress}% concluído</p>
                        </div>
                        <div class="progress-container small">
                            <div class="progress-bar" style="width: ${percentProgress}%"></div>
                        </div>
                    </div>
                `;
            });
            
            resumoHTML += `
                    </div>
                </div>
            `;
        }
        
        resumoHTML += '</div>'; // Fechar resumo-grid
        
        resumoDisplay.innerHTML = resumoHTML;
        
    } catch (error) {
        console.error('Erro ao atualizar resumo:', error);
        showToast('Erro ao atualizar resumo', 'error');
    }
}

// Atualizar relatório financeiro
function updateRelatorio() {
    try {
        const yearSelect = document.getElementById('relatorioYearSelect');
        const monthSelect = document.getElementById('relatorioMonthSelect');
        const relatorioContent = document.getElementById('relatorioContent');
        
        if (!yearSelect || !monthSelect || !relatorioContent) {
            throw new Error('Elementos do relatório não encontrados');
        }
        
        const year = yearSelect.value;
        const month = parseInt(monthSelect.value);
        
        // Filtrar entradas e gastos usando a função filterItemsByMonth
        const filteredEntradas = filterItemsByMonth(entradas, year, month, currentUser);
        const filteredGastos = filterItemsByMonth(gastos, year, month, currentUser);
        
        // Filtrar faturas de cartão para o relatório
        const filteredFaturas = filterItemsByMonth(faturas, year, month, currentUser);
        
        // Calcular totais
        let totalReceita = 0, totalDespesa = 0, totalFaturasPendentes = 0;
        filteredEntradas.forEach(item => totalReceita += item.receita || 0);
        filteredGastos.forEach(item => totalDespesa += item.despesa || 0);
        
        // Calcular total de faturas pendentes
        filteredGastos.forEach(gasto => {
            if (gasto.forma === 'Crédito' && gasto.status === 'Pendente') {
                totalFaturasPendentes += gasto.despesa || 0;
            }
        });
        
        // Calcular saldo
        const totalSaldo = totalReceita - totalDespesa;
        
        // Calcular gastos por categoria
        const categorias = {};
        filteredGastos.forEach(item => {
            if (!categorias[item.category]) {
                categorias[item.category] = 0;
            }
            categorias[item.category] += item.despesa || 0;
        });
        
        // Ordenar categorias do maior para o menor gasto
        const categoriasOrdenadas = Object.entries(categorias)
            .sort((a, b) => b[1] - a[1])
            .map(([categoria, valor]) => ({
                categoria,
                valor,
                percentual: totalDespesa > 0 ? (valor / totalDespesa * 100).toFixed(2) : 0
            }));
        
        // Combinar entradas e gastos em uma lista de transações
        const allTransactions = [
            ...filteredEntradas.map(e => ({
                date: e.date,
                description: e.description,
                category: e.category,
                value: e.receita || 0,
                type: 'Entrada'
            })),
            ...filteredGastos.map(g => ({
                date: g.date,
                description: g.description,
                category: g.category,
                value: g.despesa || 0,
                type: 'Gasto',
                forma: g.forma || '',
                status: g.status || 'Pago',
                parcela: g.parcelaAtual ? `${g.parcelaAtual}/${g.parcelas}` : ''
            }))
        ].sort((a, b) => {
            // CORREÇÃO AQUI: Ordenar por data com formato correto
            const dateA = a.date.split('-').map(Number);
            const dateB = b.date.split('-').map(Number);
            // Comparar ano, mês e dia
            if (dateA[0] !== dateB[0]) return dateA[0] - dateB[0];
            if (dateA[1] !== dateB[1]) return dateA[1] - dateB[1];
            return dateA[2] - dateB[2];
        });
        
        // Criar seção de faturas para o relatório
        let faturasHTML = '';
        if (filteredGastos.some(g => g.forma === 'Crédito')) {
            // Agrupar faturas por cartão
            const faturasCartao = {};
            
            filteredGastos.forEach(gasto => {
                if (gasto.forma === 'Crédito') {
                    if (!faturasCartao[gasto.cartao]) {
                        faturasCartao[gasto.cartao] = {
                            total: 0,
                            pagas: 0,
                            pendentes: 0,
                            parcelas: []
                        };
                    }
                    
                    faturasCartao[gasto.cartao].total += gasto.despesa || 0;
                    
                    if (gasto.status === 'Pago') {
                        faturasCartao[gasto.cartao].pagas += gasto.despesa || 0;
                    } else {
                        faturasCartao[gasto.cartao].pendentes += gasto.despesa || 0;
                    }
                    
                    // Adicionar à lista de parcelas
                    faturasCartao[gasto.cartao].parcelas.push({
                        descricao: gasto.description,
                        valor: gasto.despesa || 0,
                        status: gasto.status,
                        parcela: gasto.parcelaAtual ? `${gasto.parcelaAtual}/${gasto.parcelas}` : ''
                    });
                }
            });
            
            // Criar HTML para seção de faturas
            faturasHTML = `
                <div class="pdf-section">
                    <h4>Faturas de Cartão de Crédito</h4>
                    ${Object.keys(faturasCartao).length > 0 ? `
                        <div class="table-responsive">
                            <table class="pdf-table">
                                <thead>
                                    <tr>
                                        <th>Cartão</th>
                                        <th>Total</th>
                                        <th>Pago</th>
                                        <th>Pendente</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(faturasCartao).map(([cartao, dados]) => `
                                        <tr>
                                            <td>${cartao}</td>
                                            <td>R$ ${dados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td>R$ ${dados.pagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td>R$ ${dados.pendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <h5 style="margin-top: 15px;">Detalhamento de Parcelas</h5>
                        <div class="table-responsive">
                            <table class="pdf-table">
                                <thead>
                                    <tr>
                                        <th>Cartão</th>
                                        <th>Descrição</th>
                                        <th>Parcela</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(faturasCartao).flatMap(([cartao, dados]) => 
                                        dados.parcelas.map(parcela => `
                                            <tr>
                                                <td>${cartao}</td>
                                                <td>${parcela.descricao}</td>
                                                <td>${parcela.parcela || '-'}</td>
                                                <td>R$ ${parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td>${parcela.status}</td>
                                            </tr>
                                        `)
                                    ).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p>Nenhuma fatura de cartão de crédito registrada no período.</p>'}
                </div>
            `;
        }
        
        // Formatar período para o relatório
        const periodoTexto = month === 0 
            ? `Todo o ano de ${year}` 
            : `${new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long' })} de ${year}`;
        
        // Criar HTML para o relatório
        relatorioContent.innerHTML = `
            <div class="pdf-content">
                <div class="pdf-header">
                    <h3>Relatório Financeiro</h3>
                    <p><strong>Usuário:</strong> ${currentUser}</p>
                    <p><strong>Período:</strong> ${periodoTexto}</p>
                    <p><strong>Data do relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div class="pdf-section">
                    <h4>Resumo</h4>
                    <div class="table-responsive">
                        <table class="pdf-table">
                            <tr>
                                <td><strong>Receita Total:</strong></td>
                                <td>R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td><strong>Despesa Total:</strong></td>
                                <td>R$ ${totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td><strong>Saldo:</strong></td>
                                <td>R$ ${totalSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td><strong>Faturas Pendentes:</strong></td>
                                <td>R$ ${totalFaturasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="pdf-section">
                    <h4>Gastos por Categoria</h4>
                    ${categoriasOrdenadas.length > 0 ? `
                        <div class="table-responsive">
                            <table class="pdf-table">
                                <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th>Valor</th>
                                        <th>Percentual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${categoriasOrdenadas.map(cat => `
                                        <tr>
                                            <td>${cat.categoria}</td>
                                            <td>R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td>${cat.percentual}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p>Nenhum gasto registrado no período selecionado.</p>'}
                </div>
                
                ${faturasHTML}
                
                <div class="pdf-section">
                    <h4>Transações</h4>
                    ${allTransactions.length > 0 ? `
                        <div class="table-responsive">
                            <table class="pdf-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th>Valor</th>
                                        <th>Tipo</th>
                                        <th>Forma</th>
                                        <th>Parcela</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allTransactions.map(t => {
                                        // CORREÇÃO AQUI: Formatar a data corretamente sem manipulação de timezone
                                        const dateParts = t.date.split('-');
                                        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                                        
                                        return `
                                            <tr>
                                                <td>${formattedDate}</td>
                                                <td>${t.description}</td>
                                                <td>${t.category}</td>
                                                <td>R$ ${t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td>${t.type}</td>
                                                <td>${t.forma || '-'}</td>
                                                <td>${t.parcela || '-'}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p>Nenhuma transação registrada no período selecionado.</p>'}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao atualizar relatório:', error);
        showToast('Erro ao atualizar relatório', 'error');
    }
}

// Exportar relatório como PDF
// Exportar relatório como PDF
function exportPDF() {
    try {
        const element = document.querySelector('.pdf-content');
        if (!element) {
            showToast('Nenhum conteúdo para exportar', 'warning');
            return;
        }
        
        // Mostrar mensagem de processamento
        showToast('Gerando PDF, aguarde...', 'info');
        
        // Preparar nome do arquivo
        const fileName = `Relatorio_Financeiro_${currentUser}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Configurações do PDF otimizadas para mobile
        const opt = {
            margin: [10, 5, 10, 5], // Margens reduzidas [topo, direita, baixo, esquerda]
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                // Melhorar renderização em dispositivos móveis
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'landscape', // Usar orientação paisagem para tabelas largas
                compress: true
            },
            // Configurações para melhor quebra de página
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        // Antes de gerar o PDF, aplicar classe especial para otimização
        element.classList.add('optimized-for-pdf');
        
        // Gerar PDF
        html2pdf().from(element).set(opt).save()
            .then(() => {
                // Remover classe especial após gerar PDF
                element.classList.remove('optimized-for-pdf');
                showToast('PDF gerado com sucesso!', 'success');
            })
            .catch(error => {
                // Remover classe em caso de erro também
                element.classList.remove('optimized-for-pdf');
                console.error('Erro ao exportar PDF:', error);
                showToast('Erro ao gerar PDF', 'error');
            });
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
    }
}

// Exportar dados como Excel e JSON
function exportData(tableId, sheetName) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            showToast(`Tabela ${tableId} não encontrada`, 'error');
            return;
        }
        
        // Mostrar mensagem de processamento
        showToast('Exportando dados, aguarde...', 'info');
        
        // Exportar como Excel
        const wb = XLSX.utils.table_to_book(table, { sheet: sheetName });
        const excelFileName = `Controle_${sheetName}_${currentUser}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, excelFileName);
        
        // Exportar como JSON
        const jsonData = tableId === 'entradasTable' 
            ? entradas.filter(e => e.user === currentUser) 
            : gastos.filter(g => g.user === currentUser);
        
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `Controle_${sheetName}_${currentUser}_${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        
        showToast('Dados exportados com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showToast('Erro ao exportar dados', 'error');
    }
}

// Importar dados de arquivo JSON ou CSV
function importData(type) {
    try {
        const fileInput = document.getElementById(`import${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showToast('Selecione um arquivo para importar', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        
        // Verificar extensão
        if (!fileName.endsWith('.json') && !fileName.endsWith('.csv')) {
            showToast('Formato de arquivo não suportado. Use JSON ou CSV', 'warning');
            fileInput.value = '';
            return;
        }
        
        // Mostrar mensagem de processamento
        showToast('Importando dados, aguarde...', 'info');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let data;
                
                if (fileName.endsWith('.json')) {
                    // Processar JSON
                    data = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(data)) {
                        throw new Error('Formato de arquivo inválido: não é um array');
                    }
                } else {
                    // Processar CSV (implementação básica)
                    const csvText = e.target.result;
                    const lines = csvText.split('\n');
                    const headers = lines[0].split(',');
                    
                    data = [];
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        
                        const values = lines[i].split(',');
                        const item = {};
                        
                        headers.forEach((header, index) => {
                            let value = values[index] ? values[index].trim() : '';
                            
                            // Converter números
                            if (!isNaN(value) && value !== '') {
                                value = Number(value);
                            }
                            
                            item[header.trim()] = value;
                        });
                        
                        // Adicionar ID se não existir
                        if (!item.id) {
                            item.id = Date.now() + i;
                        }
                        
                        // Adicionar usuário se não existir
                        if (!item.user) {
                            item.user = currentUser;
                        }
                        
                        data.push(item);
                    }
                }
                
                // Atualizar dados
                if (type === 'entradas') {
                    // Manter entradas de outros usuários
                    const otherEntradas = entradas.filter(e => e.user !== currentUser);
                    // Adicionar novas entradas com o usuário atual
                    const newEntradas = data.map(e => ({ ...e, user: currentUser }));
                    entradas = [...otherEntradas, ...newEntradas];
                    updateDashboard();
                } else {
                    // Manter gastos de outros usuários
                    const otherGastos = gastos.filter(g => g.user !== currentUser);
                    // Adicionar novos gastos com o usuário atual
                    const newGastos = data.map(g => ({ ...g, user: currentUser }));
                    gastos = [...otherGastos, ...newGastos];
                    updateGastos();
                }
                
                // Salvar dados
                saveData();
                updateDashboardTotals();
                
                // Limpar input
                fileInput.value = '';
                
                showToast(`${data.length} ${type} importados com sucesso!`, 'success');
                
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                showToast(`Erro ao importar dados: ${error.message}`, 'error');
                fileInput.value = '';
            }
        };
        
        reader.onerror = function() {
            showToast('Erro ao ler o arquivo', 'error');
            fileInput.value = '';
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        showToast(`Erro ao importar dados: ${error.message}`, 'error');
    }
}

// Exportar todos os dados como backup
function exportAllData() {
    try {
        // Reunir todos os dados do sistema
        const allData = {
            dadosPessoais: dadosPessoais,
            entradas: entradas.filter(e => e.user === currentUser),
            gastos: gastos.filter(g => g.user === currentUser),
            metas: metas.filter(m => m.user === currentUser),
            reserva: reserva,
            categorias: expenseCategories,
            cartoes: cartoes,
            exportDate: new Date().toISOString(),
            version: "1.0.0"
        };
        
        // Converter para JSON
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Criar link para download
        const a = document.createElement('a');
        a.href = url;
        a.download = `FinancasApp_Backup_${currentUser}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Backup exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showToast(`Erro ao exportar: ${error.message}`, 'error');
    }
}

// Importar backup completo
function importBackup() {
    try {
        const fileInput = document.getElementById('importBackup');
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showToast('Selecione um arquivo para importar', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        
        // Verificar se é um JSON
        if (!fileName.endsWith('.json')) {
            showToast('Formato de arquivo não suportado. Use JSON', 'warning');
            fileInput.value = '';
            return;
        }
        
        // Mostrar mensagem de processamento
        showToast('Importando backup, aguarde...', 'info');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Processar JSON
                const backupData = JSON.parse(e.target.result);
                
                // Verificar se o backup tem a estrutura esperada
                if (!backupData.dadosPessoais || !backupData.entradas || !backupData.gastos) {
                    throw new Error('Arquivo de backup inválido ou corrompido');
                }
                
                // Confirmar a importação
                if (!confirm('Atenção! Importar este backup substituirá todos os seus dados atuais. Deseja continuar?')) {
                    fileInput.value = '';
                    return;
                }
                
                // Processar dados pessoais (preservando o usuário atual)
                dadosPessoais = { ...backupData.dadosPessoais, nome: currentUser };
                
                // Filtrar entradas de outros usuários
                const otherEntradas = entradas.filter(e => e.user !== currentUser);
                // Adicionar entradas do backup, garantindo o usuário correto
                const newEntradas = backupData.entradas.map(e => ({ ...e, user: currentUser }));
                entradas = [...otherEntradas, ...newEntradas];
                
                // Mesmo processo para gastos
                const otherGastos = gastos.filter(g => g.user !== currentUser);
                const newGastos = backupData.gastos.map(g => ({ ...g, user: currentUser }));
                gastos = [...otherGastos, ...newGastos];
                
                // Mesmo processo para metas
                const otherMetas = metas.filter(m => m.user !== currentUser);
                const newMetas = backupData.metas.map(m => ({ ...m, user: currentUser }));
                metas = [...otherMetas, ...newMetas];
                
                // Atualizar reserva
                if (backupData.reserva) {
                    reserva = { ...backupData.reserva, user: currentUser };
                }
                
                // Atualizar categorias
                if (backupData.categorias) {
                    expenseCategories = backupData.categorias;
                }
                
                // Atualizar cartões
                if (backupData.cartoes) {
                    cartoes = backupData.cartoes;
                }
                
                // Salvar dados
                saveData();
                
                // Atualizar interface
                updateDados();
                updateDashboard();
                updateGastos();
                updateResumo();
                updateMetas();
                updateReserva();
                updateRelatorio();
                
                // Limpar input
                fileInput.value = '';
                
                showToast('Backup importado com sucesso!', 'success');
                
            } catch (error) {
                console.error('Erro ao processar arquivo de backup:', error);
                showToast(`Erro ao importar backup: ${error.message}`, 'error');
                fileInput.value = '';
            }
        };
        
        reader.onerror = function() {
            showToast('Erro ao ler o arquivo', 'error');
            fileInput.value = '';
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        console.error('Erro ao importar backup:', error);
        showToast(`Erro ao importar backup: ${error.message}`, 'error');
    }
}

// Salvar preferências do usuário
function savePreferences() {
    try {
        const defaultMonth = document.getElementById('defaultMonth').value;
        
        // Armazenar preferências
        const preferences = {
            defaultMonth,
            user: currentUser
        };
        
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        showToast('Preferências salvas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
        showToast(`Erro ao salvar preferências: ${error.message}`, 'error');
    }
}

// Alterar tema
function changeTheme(theme) {
    try {
        const body = document.body;
        const lightBtn = document.getElementById('lightThemeBtn');
        const darkBtn = document.getElementById('darkThemeBtn');
        const systemBtn = document.getElementById('systemThemeBtn');
        const themeIcon = document.getElementById('themeIcon');
        
        // Remover seleção de todos os botões
        lightBtn.classList.remove('active');
        darkBtn.classList.remove('active');
        systemBtn.classList.remove('active');
        
        // Aplicar tema selecionado
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkBtn.classList.add('active');
            if (themeIcon) themeIcon.className = 'fas fa-moon';
        } else if (theme === 'light') {
            body.classList.remove('dark-mode');
            lightBtn.classList.add('active');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
        } else {
            // Tema do sistema
            systemBtn.classList.add('active');
            
            // Verificar preferência do sistema
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (prefersDark) {
                body.classList.add('dark-mode');
                if (themeIcon) themeIcon.className = 'fas fa-moon';
            } else {
                body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.className = 'fas fa-sun';
            }
        }
        
        // Salvar preferência
        localStorage.setItem('theme', theme);
        
        showToast(`Tema ${theme === 'system' ? 'do sistema' : theme === 'dark' ? 'escuro' : 'claro'} aplicado!`, 'success');
    } catch (error) {
        console.error('Erro ao alterar tema:', error);
        showToast(`Erro ao alterar tema: ${error.message}`, 'error');
    }
}

// Atualizar a aba de configurações
function updateConfiguracoes() {
    try {
        // Aplicar tema atual aos botões
        const currentTheme = localStorage.getItem('theme') || 'light';
        const lightBtn = document.getElementById('lightThemeBtn');
        const darkBtn = document.getElementById('darkThemeBtn');
        const systemBtn = document.getElementById('systemThemeBtn');
        
        if (lightBtn && darkBtn && systemBtn) {
            lightBtn.classList.remove('active');
            darkBtn.classList.remove('active');
            systemBtn.classList.remove('active');
            
            if (currentTheme === 'light') {
                lightBtn.classList.add('active');
            } else if (currentTheme === 'dark') {
                darkBtn.classList.add('active');
            } else if (currentTheme === 'system') {
                systemBtn.classList.add('active');
            }
        }
        
        // Carregar preferências salvas
        const savedPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        const defaultMonthSelect = document.getElementById('defaultMonth');
        
        if (defaultMonthSelect && savedPreferences.defaultMonth) {
            defaultMonthSelect.value = savedPreferences.defaultMonth;
        }
        
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        showToast('Erro ao carregar configurações', 'error');
    }
}