// === Parte 2: Gerenciamento de Entradas, Gastos e Categorias ===

// Atualizar select de cartões
function updateCartaoSelect() {
    try {
        const select = document.getElementById('gastoCartao');
        if (!select) return;
        
        // Limpar o select
        select.innerHTML = '<option value="">Sem Cartão</option>';
        
        // Filtrar cartões do usuário atual
        const userCartoes = cartoes.filter(c => c.user === currentUser);
        
        // Adicionar cada cartão como uma opção
        userCartoes.forEach(cartao => {
            const option = document.createElement('option');
            option.value = cartao.nome;
            option.textContent = `${cartao.nome} (${cartao.banco})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao atualizar select de cartões:', error);
        showToast('Erro ao atualizar select de cartões', 'error');
    }
}
// Atualizar select de categorias
function updateCategorySelect() {
    const select = document.getElementById('gastoCategory');
    
    if (!select) return;
    
    select.innerHTML = '';
    
    if (expenseCategories.length === 0) {
        // Adicionar categoria padrão se lista estiver vazia
        expenseCategories.push({
            name: "Outros",
            isDefault: true
        });
        saveData();
    }
    
    expenseCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name + (category.isDefault ? ' (Padrão)' : '');
        
        select.appendChild(option);
    });
    
    // Selecionar categoria padrão
    const defaultCategory = expenseCategories.find(cat => cat.isDefault);
    if (defaultCategory) {
        select.value = defaultCategory.name;
    } else if (expenseCategories.length > 0) {
        select.value = expenseCategories[0].name;
    }
}

// Atualizar lista de categorias - CORRIGIDO
function updateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    
    if (expenseCategories.length === 0) {
        categoryList.innerHTML = '<p class="empty-list">Nenhuma categoria cadastrada</p>';
        return;
    }
    
    // Criar o grid de categorias
    categoryList.className = 'category-grid';
    
    expenseCategories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        // Se for categoria padrão, adicionar indicador
        if (category.isDefault) {
            const defaultIndicator = document.createElement('div');
            defaultIndicator.className = 'default-indicator';
            defaultIndicator.textContent = 'Padrão';
            categoryItem.appendChild(defaultIndicator);
        }
        
        // Criar elemento para o nome da categoria
        const categoryName = document.createElement('div');
        categoryName.className = 'category-name';
        categoryName.innerHTML = `
            <i class="fas fa-tag"></i>
            <span>${category.name}</span>
        `;
        categoryItem.appendChild(categoryName);
        
        // Criar container de ações separadamente
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'category-actions-container';
        
        // Adicionar botão de edição
        const editButton = document.createElement('button');
        editButton.className = 'action-btn edit-btn';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = function() { openEditModal(category.name); };
        actionsContainer.appendChild(editButton);
        
        // Adicionar botões adicionais apenas se não for a categoria padrão
        if (!category.isDefault) {
            // Botão para definir como padrão
            const defaultButton = document.createElement('button');
            defaultButton.className = 'action-btn default-btn';
            defaultButton.innerHTML = '<i class="fas fa-star"></i>';
            defaultButton.onclick = function() { setDefaultCategory(category.name); };
            actionsContainer.appendChild(defaultButton);
            
            // Botão para excluir
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete-btn';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.onclick = function() { confirmDeleteCategory(category.name); };
            actionsContainer.appendChild(deleteButton);
        }
        
        // Adicionar container de ações ao item da categoria
        categoryItem.appendChild(actionsContainer);
        
        // Adicionar item completo à lista
        categoryList.appendChild(categoryItem);
    });
}

// Adicionar nova categoria
function addCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    if (!newCategoryInput) {
        showToast('Erro ao acessar o campo de categoria', 'error');
        return;
    }
    
    const newCategory = newCategoryInput.value.trim();
    
    if (!newCategory) {
        showToast('Digite um nome para a categoria', 'warning');
        newCategoryInput.focus();
        return;
    }
    
    // Verificar se a categoria já existe
    if (expenseCategories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
        showToast('Esta categoria já existe', 'warning');
        newCategoryInput.focus();
        return;
    }
    
    // Adicionar categoria
    const isFirst = expenseCategories.length === 0;
    expenseCategories.push({ 
        name: newCategory, 
        isDefault: isFirst // Se for a primeira categoria, definir como padrão
    });
    
    // Limpar campo
    newCategoryInput.value = '';
    
    // Atualizar interface
    updateCategorySelect();
    updateCategoryList();
    
    // Salvar dados
    if (saveData()) {
        showToast('Categoria adicionada com sucesso!', 'success');
    }
}

// Abrir modal de edição
function openEditModal(categoryName) {
    // Verificar se já existe um modal e removê-lo
    closeEditModal();
    
    const category = expenseCategories.find(cat => cat.name === categoryName);
    if (!category) {
        showToast('Categoria não encontrada', 'error');
        return;
    }
    
    // Criar elementos do modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'editCategoryModal';
    
    modalOverlay.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Editar Categoria</h3>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editCategoryName">Nome da categoria</label>
                    <input type="text" id="editCategoryName" value="${category.name}" />
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeEditModal()">Cancelar</button>
                <button class="btn-primary" onclick="saveEditedCategory('${category.name}')">Salvar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Forçar reflow para aplicar a transição
    void modalOverlay.offsetWidth;
    
    // Mostrar o modal
    modalOverlay.classList.add('show');
    
    // Focar no campo de nome
    setTimeout(() => {
        const nameInput = document.getElementById('editCategoryName');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }, 100);
}

// Fechar modal de edição
function closeEditModal() {
    const modalOverlay = document.getElementById('editCategoryModal');
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
        
        // Remover o modal após a transição
        setTimeout(() => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        }, 300);
    }
}

// Salvar categoria editada
function saveEditedCategory(oldName) {
    const nameInput = document.getElementById('editCategoryName');
    if (!nameInput) {
        showToast('Erro ao acessar o campo de nome', 'error');
        return;
    }
    
    const newName = nameInput.value.trim();
    
    if (!newName) {
        showToast('O nome da categoria não pode estar vazio', 'warning');
        nameInput.focus();
        return;
    }
    
    // Verificar se o novo nome já existe (exceto se for o mesmo nome)
    if (oldName.toLowerCase() !== newName.toLowerCase() && 
        expenseCategories.some(cat => cat.name.toLowerCase() === newName.toLowerCase())) {
        showToast('Já existe uma categoria com este nome', 'warning');
        nameInput.focus();
        return;
    }
    
    // Atualizar categoria
    expenseCategories = expenseCategories.map(cat => 
        cat.name === oldName ? { name: newName, isDefault: cat.isDefault } : cat
    );
    
    // Atualizar gastos com esta categoria
    gastos = gastos.map(g => g.category === oldName ? { ...g, category: newName } : g);
    
    // Atualizar interface
    updateCategorySelect();
    updateCategoryList();
    updateGastos();
    
    // Fechar modal
    closeEditModal();
    
    // Salvar dados
    if (saveData()) {
        showToast('Categoria editada com sucesso!', 'success');
    }
}

// Remover qualquer mensagem de erro existente
function removeErrorMessage() {
    const existingErrors = document.querySelectorAll('.category-error');
    existingErrors.forEach(error => {
        if (error.parentNode) {
            document.body.removeChild(error);
        }
    });
}

// Confirmar exclusão de categoria
function confirmDeleteCategory(categoryName) {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    if (!category) {
        showToast('Categoria não encontrada', 'error');
        return;
    }
    
    if (category.isDefault) {
        showToast('Não é possível excluir a categoria padrão', 'warning');
        return;
    }
    
    // Pedir confirmação
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
        deleteCategory(categoryName);
    }
}

// Excluir categoria
function deleteCategory(categoryName) {
    // Primeiro remover qualquer mensagem de erro existente
    removeErrorMessage();
    
    if (!categoryName) {
        showToast('Nome da categoria não informado', 'error');
        return;
    }
    
    // Verificar se é a categoria padrão
    const categoryObj = expenseCategories.find(cat => cat.name === categoryName);
    if (!categoryObj) {
        showToast('Categoria não encontrada', 'error');
        return;
    }
    
    if (categoryObj.isDefault) {
        showToast('Não é possível excluir a categoria padrão', 'warning');
        return;
    }
    
    // Encontrar categoria padrão
    const defaultCategory = expenseCategories.find(cat => cat.isDefault)?.name;
    
    if (!defaultCategory) {
        showToast('Nenhuma categoria padrão disponível', 'error');
        return;
    }
    
    // Atualizar gastos
    gastos = gastos.map(g => g.category === categoryName ? { ...g, category: defaultCategory } : g);
    
    // Remover categoria
    expenseCategories = expenseCategories.filter(cat => cat.name !== categoryName);
    
    // Atualizar interface
    updateCategorySelect();
    updateCategoryList();
    updateGastos();
    
    // Salvar dados
    if (saveData()) {
        showToast('Categoria excluída com sucesso!', 'success');
    }
}

// Definir categoria padrão
function setDefaultCategory(categoryName) {
    // Primeiro remover qualquer mensagem de erro existente
    removeErrorMessage();
    
    // Verificar se a categoria existe
    if (!expenseCategories.some(cat => cat.name === categoryName)) {
        showToast('Categoria não encontrada', 'error');
        return;
    }
    
    // Atualizar todas as categorias
    expenseCategories = expenseCategories.map(cat => ({
        ...cat,
        isDefault: cat.name === categoryName
    }));
    
    // Atualizar interface
    updateCategorySelect();
    updateCategoryList();
    
    // Salvar dados
    if (saveData()) {
        showToast(`Categoria "${categoryName}" definida como padrão!`, 'success');
    }
}

// Variável para controlar o estado do gerenciador de categorias
let categoryManagerOpen = true;

// Alternar exibição do gerenciador de categorias - CORRIGIDO
function toggleCategoryManager() {
    const content = document.querySelector('.category-content');
    const icon = document.getElementById('toggleCategoryIcon');
    
    if (!content || !icon) return;
    
    // Alterna o estado
    categoryManagerOpen = !categoryManagerOpen;
    
    if (categoryManagerOpen) {
        // Abrir o gerenciador
        content.style.maxHeight = content.scrollHeight + 'px';
        content.classList.remove('collapsed');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        // Fechar o gerenciador
        content.style.maxHeight = '0';
        content.classList.add('collapsed');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        
        // Remover qualquer mensagem de erro quando fechado
        removeErrorMessage();
    }
    
    // Atualizar a lista de categorias quando aberto
    if (categoryManagerOpen) {
        setTimeout(() => {
            updateCategoryList();
        }, 300); // Pequeno atraso para a animação terminar
    }
}

// Salvar entrada ou gasto
function saveEntry(type) {
    if (type !== 'entrada' && type !== 'gasto') {
        showToast('Tipo de entrada inválido', 'error');
        return;
    }
    
    try {
        // Obter elementos do formulário
        const idInput = document.getElementById(`${type}Id`);
        const dateInput = document.getElementById(`${type}Date`);
        const descriptionInput = document.getElementById(`${type}Description`);
        const categoryInput = document.getElementById(`${type}Category`);
        const formaInput = document.getElementById(`${type}Forma`);
        const valueInput = document.getElementById(`${type}Value`);
        
        if (!idInput || !dateInput || !descriptionInput || !formaInput || !valueInput) {
            throw new Error('Elementos do formulário não encontrados');
        }
        
        // Verificar se categoryInput existe (depende do tipo)
        if (type === 'gasto' && !categoryInput) {
            throw new Error('Campo de categoria não encontrado');
        }
        
        // Obter valores
        const id = parseInt(idInput.value) || Date.now();
        // CORREÇÃO AQUI: Usar o valor exato da data sem manipulação
        const date = dateInput.value;
        const description = descriptionInput.value.trim();
        const category = type === 'gasto' ? categoryInput.value : (type === 'entrada' ? document.getElementById('entradaCategory')?.value || 'Fixa' : '');
        const forma = formaInput.value;
        
        // Tratar valor monetário
        let value = valueInput.value.replace(/\./g, '').replace(',', '.');
        value = parseFloat(value) || 0;
        
        // Validar campos básicos
        if (!date) {
            showToast('Selecione uma data', 'warning');
            dateInput.focus();
            return;
        }
        
        if (!description) {
            showToast('Digite uma descrição', 'warning');
            descriptionInput.focus();
            return;
        }
        
        if (value <= 0) {
            showToast('Digite um valor válido', 'warning');
            valueInput.focus();
            return;
        }
        
        if (type === 'gasto' && !category) {
            showToast('Selecione uma categoria', 'warning');
            categoryInput.focus();
            return;
        }
        
        // Preparar objeto base
        const baseItem = {
            id,
            date,
            description,
            category,
            forma,
            user: currentUser
        };
        
        // Completar com dados específicos por tipo
        if (type === 'entrada') {
            const origemInput = document.getElementById('entradaOrigem');
            const metaInput = document.getElementById('entradaMeta');
            
            if (!origemInput) {
                throw new Error('Campo de origem não encontrado');
            }
            
            const origem = origemInput.value.trim();
            
            if (!origem) {
                showToast('Digite a origem da entrada', 'warning');
                origemInput.focus();
                return;
            }
            
            // Obter valor da meta
            let meta = 0;
            if (metaInput && metaInput.value) {
                meta = parseFloat(metaInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            }
            
            // Criar entrada
            const entradaItem = {
                ...baseItem,
                origem,
                receita: value,
                meta
            };
            
            // Atualizar ou adicionar
            const index = entradas.findIndex(e => e.id === id);
if (index !== -1) {
    entradas[index] = entradaItem;
} else {
    entradas.push(entradaItem);
}
            
            // Atualizar tabela
            updateDashboard();
        } else { // Gasto
            // Obter campos específicos de gasto
            const fixoVariavelInput = document.getElementById('gastoFixoVariavel');
            const statusInput = document.getElementById('gastoStatus');
            const cartaoInput = document.getElementById('gastoCartao');
            const parcelasInput = document.getElementById('gastoParcelas');
            const valorParcelaInput = document.getElementById('gastoValorParcela');
            
            if (!fixoVariavelInput || !statusInput || !parcelasInput) {
                throw new Error('Campos do formulário de gasto não encontrados');
            }
            
            const fixoVariavel = fixoVariavelInput.value;
            const status = statusInput.value;
            const cartao = cartaoInput ? cartaoInput.value : '';
            const parcelas = parseInt(parcelasInput.value) || 1;
            
            // Obter valor da parcela
            let valorParcela = value;
            if (valorParcelaInput && valorParcelaInput.value) {
                valorParcela = parseFloat(valorParcelaInput.value.replace(/\./g, '').replace(',', '.')) || value;
            }
            
            // Criar gasto
            const gastoItem = {
                ...baseItem,
                fixoVariavel,
                status,
                cartao: cartao || 'Sem Cartão',
                despesa: value,
                parcelas,
                valorParcela
            };
            
            // Atualizar ou adicionar
          const index = gastos.findIndex(g => g.id === id);
if (index !== -1) {
    gastos[index] = gastoItem;
} else {
    gastos.push(gastoItem);
}

// CORREÇÃO: Atualizar tabela E totais
updateGastos();
updateDashboardTotals();

            // Atualizar tabela
            updateGastos();
        }
        
        // Limpar formulário
        cancelEdit(type);
        
        // Atualizar totais
        updateDashboardTotals();
        
        // Salvar dados
        saveData();
        
        showToast(`${type === 'entrada' ? 'Entrada' : 'Gasto'} salvo com sucesso!`, 'success');
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showToast(`Erro ao salvar: ${error.message}`, 'error');
    }
}

// Editar entrada ou gasto existente - CORRIGIDO
function editEntry(type, id) {
    try {
        if (type !== 'entrada' && type !== 'gasto') {
            throw new Error('Tipo inválido');
        }
        
        // Encontrar o item
        const item = type === 'entrada' 
            ? entradas.find(e => e.id === id) 
            : gastos.find(g => g.id === id);
        
        if (!item) {
            throw new Error(`${type === 'entrada' ? 'Entrada' : 'Gasto'} não encontrado`);
        }
        
        // Obter elementos do formulário
        const idInput = document.getElementById(`${type}Id`);
        const dateInput = document.getElementById(`${type}Date`);
        const descriptionInput = document.getElementById(`${type}Description`);
        const formaInput = document.getElementById(`${type}Forma`);
        const valueInput = document.getElementById(`${type}Value`);
        
        // Verificações iniciais de elementos críticos
        if (!idInput || !dateInput || !descriptionInput || !formaInput || !valueInput) {
            showToast(`Alguns elementos do formulário não foram encontrados. Por favor, tente novamente.`, 'error');
            console.error('Elementos não encontrados:', 
                          { idInput, dateInput, descriptionInput, formaInput, valueInput });
            return;
        }
        
        // Rolar até o formulário primeiro para garantir visibilidade
        const formCard = document.querySelector(`#${type}s .form-card`);
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Identificar o elemento de título com segurança, tentando as duas variações de ID
        const titleElement = document.getElementById(`formTitle${type.charAt(0).toUpperCase() + type.slice(1)}`) || 
                          document.getElementById(`formTitle${type.charAt(0).toUpperCase() + type.slice(1)}s`);
        
        if (!titleElement) {
            console.warn(`Elemento de título não encontrado para ${type}`);
            // Continuar mesmo sem o elemento de título
        } else {
            titleElement.innerHTML = `<i class="fas fa-edit"></i> Editar ${type === 'entrada' ? 'Entrada' : 'Gasto'}`;
        }
        
        // Verificar botão de cancelar
        const cancelBtn = document.getElementById(`cancelBtn${type.charAt(0).toUpperCase() + type.slice(1)}s`);
        if (!cancelBtn) {
            console.warn(`Botão de cancelar não encontrado para ${type}`);
            // Continuar mesmo sem o botão de cancelar
        } else {
            cancelBtn.classList.remove('hidden');
        }
        
        // Preencher campos básicos
        idInput.value = item.id;
        // CORREÇÃO AQUI: Usar o valor exato da data sem manipulação
        dateInput.value = item.date;
        descriptionInput.value = item.description;
        formaInput.value = item.forma || '';
        
        // Campos específicos por tipo
        if (type === 'entrada') {
            // Formatação de valores monetários
            valueInput.value = item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            
            // Campo de categoria (se existir)
            const categoryInput = document.getElementById('entradaCategory');
            if (categoryInput) {
                categoryInput.value = item.category || 'Fixa';
            }
            
            // Campos específicos de entrada
            const origemInput = document.getElementById('entradaOrigem');
            const metaInput = document.getElementById('entradaMeta');
            
            if (origemInput) origemInput.value = item.origem || '';
            if (metaInput && item.meta) {
                metaInput.value = item.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            } else if (metaInput) {
                metaInput.value = '';
            }
        } else { // Gasto
            valueInput.value = item.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            
            // Campo de categoria
            const categoryInput = document.getElementById('gastoCategory');
            if (categoryInput) {
                // Certificar que a categoria existe no select
                let categoriaExiste = false;
                for (let i = 0; i < categoryInput.options.length; i++) {
                    if (categoryInput.options[i].value === item.category) {
                        categoriaExiste = true;
                        break;
                    }
                }
                
                if (categoriaExiste) {
                    categoryInput.value = item.category;
                } else {
                    // Usar categoria padrão se a original não existir mais
                    const defaultCategory = expenseCategories.find(cat => cat.isDefault);
                    categoryInput.value = defaultCategory ? defaultCategory.name : expenseCategories[0]?.name || '';
                    console.warn(`Categoria ${item.category} não encontrada, usando padrão.`);
                }
            }
            
            // Campos específicos de gasto
            const fixoVariavelInput = document.getElementById('gastoFixoVariavel');
            const statusInput = document.getElementById('gastoStatus');
            const cartaoInput = document.getElementById('gastoCartao');
            const parcelasInput = document.getElementById('gastoParcelas');
            const valorParcelaInput = document.getElementById('gastoValorParcela');
            
            if (fixoVariavelInput) fixoVariavelInput.value = item.fixoVariavel || 'Fixa';
            if (statusInput) statusInput.value = item.status || 'Pago';
            if (cartaoInput) cartaoInput.value = item.cartao || '';
            if (parcelasInput) parcelasInput.value = item.parcelas || 1;
            
            if (valorParcelaInput && item.valorParcela) {
                valorParcelaInput.value = item.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            } else if (valorParcelaInput) {
                valorParcelaInput.value = valueInput.value;
            }
        }
        
        showToast(`Editando ${type === 'entrada' ? 'entrada' : 'gasto'}. Faça as alterações e clique em Salvar.`, 'info');
        
    } catch (error) {
        console.error('Erro ao editar:', error);
        showToast(`Erro ao editar: ${error.message}`, 'error');
    }
}

// Cancelar edição - CORRIGIDO
function cancelEdit(type) {
    if (type !== 'entrada' && type !== 'gasto') {
        showToast('Tipo inválido', 'error');
        return;
    }
    
    try {
        // Obter elementos do formulário
        const idInput = document.getElementById(`${type}Id`);
        const dateInput = document.getElementById(`${type}Date`);
        const descriptionInput = document.getElementById(`${type}Description`);
        const formaInput = document.getElementById(`${type}Forma`);
        const valueInput = document.getElementById(`${type}Value`);
        
        // Verificar IDs dos elementos de título e cancelar
        const titleElement = document.getElementById(`formTitle${type.charAt(0).toUpperCase() + type.slice(1)}`) || 
                          document.getElementById(`formTitle${type.charAt(0).toUpperCase() + type.slice(1)}s`);
        
        const cancelBtn = document.getElementById(`cancelBtn${type.charAt(0).toUpperCase() + type.slice(1)}s`);
        
        // Limpar e resetar campos se existirem
        if (idInput) idInput.value = '';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0]; // Data atual
        if (descriptionInput) descriptionInput.value = '';
        if (formaInput) formaInput.value = 'Dinheiro';
        if (valueInput) valueInput.value = '';
        
        if (type === 'entrada') {
            const categoryInput = document.getElementById('entradaCategory');
            const origemInput = document.getElementById('entradaOrigem');
            const metaInput = document.getElementById('entradaMeta');
            
            if (categoryInput) categoryInput.value = 'Fixa';
            if (origemInput) origemInput.value = '';
            if (metaInput) metaInput.value = '';
        } else { // Gasto
            const categoryInput = document.getElementById('gastoCategory');
            const fixoVariavelInput = document.getElementById('gastoFixoVariavel');
            const statusInput = document.getElementById('gastoStatus');
            const cartaoInput = document.getElementById('gastoCartao');
            const parcelasInput = document.getElementById('gastoParcelas');
            const valorParcelaInput = document.getElementById('gastoValorParcela');
            
            // Selecionar categoria padrão
            if (categoryInput) {
                const defaultCategory = expenseCategories.find(cat => cat.isDefault);
                if (defaultCategory) {
                    categoryInput.value = defaultCategory.name;
                } else if (expenseCategories.length > 0) {
                    categoryInput.value = expenseCategories[0].name;
                }
            }
            
            if (fixoVariavelInput) fixoVariavelInput.value = 'Fixa';
            if (statusInput) statusInput.value = 'Pago';
            if (cartaoInput) cartaoInput.value = '';
            if (parcelasInput) parcelasInput.value = '1';
            if (valorParcelaInput) valorParcelaInput.value = '';
        }
        
        // Restaurar título e esconder botão cancelar se existirem
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-plus-circle"></i> Adicionar ${type === 'entrada' ? 'Entrada' : 'Gasto'}`;
        }
        
        if (cancelBtn) {
            cancelBtn.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Erro ao cancelar edição:', error);
        // Não mostrar toast de erro ao cancelar para não confundir o usuário
    }
}

// Excluir entrada ou gasto
function deleteEntry(type, id) {
    if (type !== 'entrada' && type !== 'gasto') {
        showToast('Tipo inválido', 'error');
        return;
    }
    
    // Encontrar o item
    const item = type === 'entrada' 
        ? entradas.find(e => e.id === id) 
        : gastos.find(g => g.id === id);
        
    if (!item) {
        showToast(`${type === 'entrada' ? 'Entrada' : 'Gasto'} não encontrado`, 'error');
        return;
    }
    
    // Confirmação
    if (!confirm(`Tem certeza que deseja excluir ${type === 'entrada' ? 'esta entrada' : 'este gasto'}?`)) {
        return;
    }
    
   // Remover o item
if (type === 'entrada') {
    entradas = entradas.filter(e => e.id !== id);
    updateDashboard();
    updateDashboardTotals();
} else {
    gastos = gastos.filter(g => g.id !== id);
    updateGastos();
    updateDashboardTotals();
}

// Salvar dados
saveData();
    // Salvar e atualizar
    saveData();
    updateDashboardTotals();
    
    showToast(`${type === 'entrada' ? 'Entrada' : 'Gasto'} excluído com sucesso!`, 'success');
}

// Atualizar tabela de entradas
function updateDashboard() {
    try {
        const yearSelect = document.getElementById('yearSelect');
        const monthSelect = document.getElementById('monthSelect');
        const tableBody = document.getElementById('entradasTableBody');
        
        if (!yearSelect || !monthSelect || !tableBody) {
            throw new Error('Elementos da tabela não encontrados');
        }
        
        const year = yearSelect.value;
        const month = parseInt(monthSelect.value);
        
        // Filtrar entradas usando a função filterItemsByMonth
        const filteredEntradas = filterItemsByMonth(entradas, year, month, currentUser);
        
        // Calcular totais
        let totalReceita = 0, totalMeta = 0;
        
        filteredEntradas.forEach(item => {
            totalReceita += item.receita || 0;
            totalMeta += item.meta || 0;
        });
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Verificar se há entradas
        if (filteredEntradas.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">Nenhuma entrada encontrada</td>';
            tableBody.appendChild(emptyRow);
        } else {
            // Ordenar por data (mais recente primeiro)
            const sortedEntradas = [...filteredEntradas].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Adicionar linhas
            sortedEntradas.forEach(item => {
                const row = document.createElement('tr');
                
                // CORREÇÃO AQUI: Formatar a data corretamente
                // Usar o date-fns ou uma abordagem sem manipulação de tempo
                const dateParts = item.date.split('-');
                const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>${item.origem || ''}</td>
                    <td>${item.forma || ''}</td>
                    <td>R$ ${(item.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                        <button class="btn-secondary btn-sm" onclick="editEntry('entrada', ${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger btn-sm" onclick="deleteEntry('entrada', ${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Linha de total
            const summaryRow = document.createElement('tr');
            summaryRow.className = 'summary';
            summaryRow.innerHTML = `
                <td colspan="5"><strong>Total</strong></td>
                <td><strong>R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                <td></td>
            `;
            tableBody.appendChild(summaryRow);
        }
        
        // Atualizar dashboard
        updateDashboardTotals();
        
    } catch (error) {
        console.error('Erro ao atualizar tabela de entradas:', error);
        showToast('Erro ao atualizar tabela de entradas', 'error');
    }
}

// Atualizar tabela de gastos
function updateGastos() {
    try {
        const yearSelect = document.getElementById('gastosYearSelect');
        const monthSelect = document.getElementById('gastosMonthSelect');
        const tableBody = document.getElementById('gastosTableBody');
        
        if (!yearSelect || !monthSelect || !tableBody) {
            throw new Error('Elementos da tabela não encontrados');
        }
        
        const year = yearSelect.value;
        const month = parseInt(monthSelect.value);
        
        // Filtrar gastos usando a função filterItemsByMonth
        const filteredGastos = filterItemsByMonth(gastos, year, month, currentUser);
        
        // Calcular total
        let totalDespesa = 0;
        filteredGastos.forEach(item => {
            totalDespesa += item.despesa || 0;
        });
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Verificar se há gastos
        if (filteredGastos.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9" class="text-center">Nenhum gasto encontrado</td>';
            tableBody.appendChild(emptyRow);
        } else {
            // Ordenar por data (mais recente primeiro)
            const sortedGastos = [...filteredGastos].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Adicionar linhas
            sortedGastos.forEach(item => {
                const row = document.createElement('tr');
                
                // CORREÇÃO AQUI: Formatar a data corretamente
                // Usar o date-fns ou uma abordagem sem manipulação de tempo
                const dateParts = item.date.split('-');
                const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>${item.forma || ''}</td>
                    <td>${item.fixoVariavel || 'Fixa'}</td>
                    <td>${item.status || 'Pago'}</td>
                    <td>R$ ${(item.despesa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${item.parcelas || 1} x R$ ${(item.valorParcela || item.despesa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                        <button class="btn-secondary btn-sm" onclick="editEntry('gasto', ${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger btn-sm" onclick="deleteEntry('gasto', ${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Linha de total
            const summaryRow = document.createElement('tr');
            summaryRow.className = 'summary';
            summaryRow.innerHTML = `
                <td colspan="6"><strong>Total</strong></td>
                <td><strong>R$ ${totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                <td></td>
                <td></td>
            `;
            tableBody.appendChild(summaryRow);
        }
        
        // Atualizar dashboard
        updateDashboardTotals();
        
    } catch (error) {
        console.error('Erro ao atualizar tabela de gastos:', error);
        showToast('Erro ao atualizar tabela de gastos', 'error');
    }
}

// Função para formatar números como moeda
function formatCurrency(input) {
    if (!input) return;
    
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    
    value = (value / 100).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = value;
}

// Debounce para formatação de moeda
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const debouncedFormatCurrency = debounce(formatCurrency, 300);

// Inicializar o estado do gerenciador de categorias
document.addEventListener('DOMContentLoaded', function() {
    // Definir o estado inicial como aberto
    categoryManagerOpen = true;
    
    // Certificar-se de que o ícone esteja correto
    const icon = document.getElementById('toggleCategoryIcon');
    if (icon) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
});