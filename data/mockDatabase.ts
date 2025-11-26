import { Material, Movimentacao, Colaborador, Parceiro, NotaFiscal, UserRole } from '../types';

// CONFIGURAÇÃO DE CENÁRIO:
// Faturamento Alvo Total: ~R$ 500.000,00
// Distribuição: Jan-Set (Constante), Out (Alto), Nov (Pico Máximo), Dez (Zero).
// Regra: Entradas (Compra) sempre acontecem no dia 05 ou 10 do mês.
// Regra: Saídas (Venda) sempre acontecem a partir do dia 15 do mês.

export const mockMateriais: Material[] = [
  { id: 'MAT007', nome: 'Furadeira Impacto', codigoFabricante: '200', quantidade: 85, armazenamento: 'Corredor A', entradas: 600, valorUnitario: 280.00, imageUrl: 'https://m.media-amazon.com/images/I/717p-3I5N5L._AC_SL1500_.jpg' },
  { id: 'MAT010', nome: 'Parafusadeira Pro', codigoFabricante: '941', quantidade: 60, armazenamento: 'Corredor A', entradas: 550, valorUnitario: 350.00, imageUrl: 'https://m.media-amazon.com/images/I/61k1f-h05ZL._AC_SL1500_.jpg' },
  { id: 'MAT020', nome: 'Serra Tico-Tico', codigoFabricante: '239', quantidade: 35, armazenamento: 'Corredor B', entradas: 350, valorUnitario: 380.00, imageUrl: 'https://m.media-amazon.com/images/I/71u9ZTbClnL._AC_SL1500_.jpg' },
  { id: 'MAT028', nome: 'Torquímetro Digital', codigoFabricante: '385', quantidade: 25, armazenamento: 'Corredor C', entradas: 300, valorUnitario: 350.00, imageUrl: 'https://m.media-amazon.com/images/I/61zBwn-4KLL._AC_SL1500_.jpg' },
  { id: 'MAT049', nome: 'Pistola Pintura HVLP', codigoFabricante: '385', quantidade: 45, armazenamento: 'Corredor B', entradas: 400, valorUnitario: 280.00, imageUrl: 'https://m.media-amazon.com/images/I/61Bf4E226SL._AC_SL1500_.jpg' },
  { id: 'MAT001', nome: 'Chave de Fenda', codigoFabricante: '257', quantidade: 450, armazenamento: 'Gaveta 10', entradas: 1200, valorUnitario: 8.50, imageUrl: 'https://m.media-amazon.com/images/I/617F3a8O9DL._AC_SL1500_.jpg' },
  { id: 'MAT002', nome: 'Parafuso Philips', codigoFabricante: '346', quantidade: 5000, armazenamento: 'Caixa 01', entradas: 20000, valorUnitario: 0.25, imageUrl: 'https://m.media-amazon.com/images/I/61k0p2y8d-L._AC_SL1500_.jpg' },
  { id: 'MAT003', nome: 'Arruela Lisa', codigoFabricante: '170', quantidade: 4200, armazenamento: 'Caixa 02', entradas: 15000, valorUnitario: 0.15, imageUrl: 'https://m.media-amazon.com/images/I/61Kq-unm4bL._AC_SL1500_.jpg' },
  { id: 'MAT004', nome: 'Porca Sextavada', codigoFabricante: '239', quantidade: 1500, armazenamento: 'Caixa 03', entradas: 5000, valorUnitario: 0.20, imageUrl: 'https://m.media-amazon.com/images/I/71FkL45B2IL._AC_SL1500_.jpg' },
  { id: 'MAT005', nome: 'Bucha 8mm', codigoFabricante: '111', quantidade: 2800, armazenamento: 'Caixa 04', entradas: 8000, valorUnitario: 0.50, imageUrl: 'https://m.media-amazon.com/images/I/61gXyP4QZLL._AC_SL1500_.jpg' },
  { id: 'MAT006', nome: 'Martelo Unha', codigoFabricante: '462', quantidade: 180, armazenamento: 'Painel 1', entradas: 600, valorUnitario: 35.00, imageUrl: 'https://m.media-amazon.com/images/I/51rHe2a7rSL._AC_SL1200_.jpg' },
  { id: 'MAT008', nome: 'Jogo Chave Allen', codigoFabricante: '290', quantidade: 200, armazenamento: 'Gaveta 12', entradas: 500, valorUnitario: 15.00, imageUrl: 'https://m.media-amazon.com/images/I/71x4agL-zSL._AC_SL1500_.jpg' },
  { id: 'MAT009', nome: 'Trena 5m', codigoFabricante: '789', quantidade: 220, armazenamento: 'Balcão', entradas: 600, valorUnitario: 25.00, imageUrl: 'https://m.media-amazon.com/images/I/71sVo7kKqJL._AC_SL1500_.jpg' },
  { id: 'MAT011', nome: 'Cola Madeira', codigoFabricante: '592', quantidade: 90, armazenamento: 'Prateleira Quimicos', entradas: 400, valorUnitario: 12.00, imageUrl: 'https://m.media-amazon.com/images/I/61NGLtKqJkL._AC_SL1500_.jpg' },
  { id: 'MAT012', nome: 'Spray Lubrificante', codigoFabricante: '385', quantidade: 85, armazenamento: 'Prateleira Quimicos', entradas: 300, valorUnitario: 28.00, imageUrl: 'https://m.media-amazon.com/images/I/61j4iP1v-GL._AC_SL1500_.jpg' },
  { id: 'MAT013', nome: 'Chave Inglesa', codigoFabricante: '278', quantidade: 40, armazenamento: 'Painel 2', entradas: 150, valorUnitario: 45.50, imageUrl: 'https://m.media-amazon.com/images/I/510Ralo-1kL._AC_SL1500_.jpg' },
  { id: 'MAT017', nome: 'Alicate Universal', codigoFabricante: '257', quantidade: 60, armazenamento: 'Painel 3', entradas: 200, valorUnitario: 38.00, imageUrl: 'https://m.media-amazon.com/images/I/61G+pTT-Q-L._AC_SL1500_.jpg' },
  { id: 'MAT024', nome: 'Esquadro Aço', codigoFabricante: '290', quantidade: 100, armazenamento: 'Gaveta 15', entradas: 250, valorUnitario: 25.00, imageUrl: 'https://m.media-amazon.com/images/I/613n-u7vwsL._AC_SL1500_.jpg' },
  { id: 'MAT050', nome: 'Suporte Mão Francesa', codigoFabricante: '941', quantidade: 80, armazenamento: 'Caixa 10', entradas: 200, valorUnitario: 15.00, imageUrl: 'https://m.media-amazon.com/images/I/516Lq2kADIL._AC_SL1500_.jpg' },
  { id: 'MAT100', nome: 'Lixa d\'água P120', codigoFabricante: 'LIX-120', quantidade: 1500, armazenamento: 'Gaveta 20', entradas: 3000, valorUnitario: 1.50, imageUrl: 'https://m.media-amazon.com/images/I/71z1h-U5VjL._AC_SL1500_.jpg' },
  { id: 'MAT101', nome: 'Disco de Corte Inox', codigoFabricante: 'DIS-001', quantidade: 300, armazenamento: 'Caixa 05', entradas: 600, valorUnitario: 5.50, imageUrl: 'https://m.media-amazon.com/images/I/815yS1HwbyL._AC_SL1500_.jpg' },
  { id: 'MAT102', nome: 'Luva de Malha', codigoFabricante: 'EPI-050', quantidade: 120, armazenamento: 'Armário EPI', entradas: 300, valorUnitario: 4.00, imageUrl: 'https://m.media-amazon.com/images/I/81VqJhtB+vL._AC_SL1500_.jpg' },
  { id: 'MAT103', nome: 'Estopa para Limpeza (Kg)', codigoFabricante: 'LIM-200', quantidade: 50, armazenamento: 'Depósito Limpeza', entradas: 100, valorUnitario: 12.00, imageUrl: 'https://m.media-amazon.com/images/I/81b2+6oB-3L._AC_SL1500_.jpg' },
];

export const mockColaboradores: Colaborador[] = [
    { id: 'COL001', nome: 'Jorge', latitude: -20.4332, longitude: -40.3484, role: UserRole.OPERADOR },
    { id: 'COL002', nome: 'João', latitude: -20.319, longitude: -40.3377, role: UserRole.OPERADOR },
    { id: 'COL003', nome: 'Luiz', latitude: -20.2976, longitude: -40.2958, role: UserRole.DIRETOR },
    { id: 'COL004', nome: 'Davi', latitude: -20.2118, longitude: -40.2581, role: UserRole.OPERADOR },
    { id: 'COL005', nome: 'Henrique', latitude: -20.2713, longitude: -40.2993, role: UserRole.GERENTE },
    { id: 'COL006', nome: 'Arthur', latitude: -20.35, longitude: -40.31, role: UserRole.OPERADOR },
    { id: 'COL007', nome: 'Carlos', latitude: -20.33, longitude: -40.29, role: UserRole.OPERADOR },
    { id: 'COL008', nome: 'Gabriel', latitude: -20.31, longitude: -40.33, role: UserRole.OPERADOR },
    { id: 'COL009', nome: 'Eduardo', latitude: -20.29, longitude: -40.35, role: UserRole.OPERADOR },
    { id: 'COL010', nome: 'Pedro', latitude: -20.27, longitude: -40.31, role: UserRole.OPERADOR },
];

export const mockParceiros: Parceiro[] = [
    { id: 'PAR001', nome: 'Casa dos materiais', cnpj: '6124920529200', endereco: 'Rua três', cidade: 'Cariacica', uf: 'ES', telefone: '2733361258', latitude: -20.2655, longitude: -40.4204 },
    { id: 'PAR002', nome: 'Ferragens Silva', cnpj: '12345678000195', endereco: 'Av. Principal', cidade: 'Vitória', uf: 'ES', telefone: '2733254879', latitude: -20.3194, longitude: -40.3378 },
    { id: 'PAR003', nome: 'Materiais Constru', cnpj: '98765432000187', endereco: 'Rua das Flores', cidade: 'Vila Velha', uf: 'ES', telefone: '2733547123', latitude: -20.3297, longitude: -40.2925 },
    { id: 'PAR004', nome: 'Depot Madeiras', cnpj: '45678912000134', endereco: 'Rua do Comércio', cidade: 'Serra', uf: 'ES', telefone: '2733658987', latitude: -20.1293, longitude: -40.3079 },
    { id: 'PAR005', nome: 'Tech Ferragens', cnpj: '65412378000156', endereco: 'Rua Projetada', cidade: 'Cariacica', uf: 'ES', telefone: '2733321456', latitude: -20.2680, longitude: -40.4250 },
    { id: 'PAR008', nome: 'Ferro & Aço', cnpj: '15975346000128', endereco: 'Rua do Aço', cidade: 'Serra', uf: 'ES', telefone: '2733369874', latitude: -20.1285, longitude: -40.3100 },
];

// --- NOTAS FISCAIS DE ENTRADA (MENSAL) ---
export const mockNotasFiscais: NotaFiscal[] = [
    { id: 'NF-JAN', numero: '20250105', parceiroId: 'PAR001', dataEmissao: '2025-01-05', valorTotal: 33600.00, itens: [{ materialId: 'MAT007', nome: 'Furadeira Impacto', quantidade: 120, valorUnitario: 280.00 }] },
    { id: 'NF-FEV', numero: '20250205', parceiroId: 'PAR002', dataEmissao: '2025-02-05', valorTotal: 35000.00, itens: [{ materialId: 'MAT010', nome: 'Parafusadeira Pro', quantidade: 100, valorUnitario: 350.00 }] },
    { id: 'NF-MAR', numero: '20250305', parceiroId: 'PAR003', dataEmissao: '2025-03-05', valorTotal: 19000.00, itens: [{ materialId: 'MAT020', nome: 'Serra Tico-Tico', quantidade: 50, valorUnitario: 380.00 }] },
    { id: 'NF-ABR', numero: '20250405', parceiroId: 'PAR004', dataEmissao: '2025-04-05', valorTotal: 17500.00, itens: [{ materialId: 'MAT028', nome: 'Torquímetro Digital', quantidade: 50, valorUnitario: 350.00 }] },
    { id: 'NF-MAI', numero: '20250505', parceiroId: 'PAR005', dataEmissao: '2025-05-05', valorTotal: 22400.00, itens: [{ materialId: 'MAT049', nome: 'Pistola Pintura HVLP', quantidade: 80, valorUnitario: 280.00 }] },
    { id: 'NF-JUN', numero: '20250605', parceiroId: 'PAR008', dataEmissao: '2025-06-05', valorTotal: 8500.00, itens: [{ materialId: 'MAT001', nome: 'Chave de Fenda', quantidade: 1000, valorUnitario: 8.50 }] },
    { id: 'NF-JUL', numero: '20250705', parceiroId: 'PAR001', dataEmissao: '2025-07-05', valorTotal: 5000.00, itens: [{ materialId: 'MAT002', nome: 'Parafuso Philips', quantidade: 20000, valorUnitario: 0.25 }] },
    { id: 'NF-AGO', numero: '20250805', parceiroId: 'PAR002', dataEmissao: '2025-08-05', valorTotal: 25000.00, itens: [{ materialId: 'MAT009', nome: 'Trena 5m', quantidade: 1000, valorUnitario: 25.00 }] },
    { id: 'NF-SET', numero: '20250905', parceiroId: 'PAR003', dataEmissao: '2025-09-05', valorTotal: 30400.00, itens: [{ materialId: 'MAT017', nome: 'Alicate Universal', quantidade: 800, valorUnitario: 38.00 }] },
    
    // Grandes entradas para cobrir o pico de Out/Nov
    { id: 'NF-OUT', numero: '20251005', parceiroId: 'PAR004', dataEmissao: '2025-10-05', valorTotal: 98000.00, itens: [{ materialId: 'MAT007', nome: 'Furadeira Impacto', quantidade: 350, valorUnitario: 280.00 }] },
    { id: 'NF-NOV', numero: '20251105', parceiroId: 'PAR005', dataEmissao: '2025-11-05', valorTotal: 122500.00, itens: [{ materialId: 'MAT010', nome: 'Parafusadeira Pro', quantidade: 350, valorUnitario: 350.00 }] },
    
    // Entrada de Consumíveis
    { id: 'NF-CONS1', numero: '20250110', parceiroId: 'PAR005', dataEmissao: '2025-01-10', valorTotal: 3500.00, itens: [{ materialId: 'MAT100', nome: 'Lixa d\'água P120', quantidade: 2000, valorUnitario: 1.50 }] },
    { id: 'NF-CONS2', numero: '20250610', parceiroId: 'PAR008', dataEmissao: '2025-06-10', valorTotal: 2200.00, itens: [{ materialId: 'MAT101', nome: 'Disco de Corte Inox', quantidade: 400, valorUnitario: 5.50 }] },
];

// --- MOVIMENTAÇÕES (ENTRADAS e SAÍDAS) ---
// Total Saídas (Vendas): ~500k
// Jan-Set: Média ~25-28k/mês
// Out: ~100k
// Nov: ~150k
// Dez: 0

export const mockMovimentacoes: Movimentacao[] = [
    // --- JANEIRO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_JAN', material: 'Furadeira Impacto', quantidade: 120, colaborador: 'Carlos', tipo: 'entrada', data: '2025-01-05', notaFiscal: '20250105' },
    // Entrada Consumiveis
    { id: 'ENT_JAN_CONS', material: 'Lixa d\'água P120', quantidade: 2000, colaborador: 'Carlos', tipo: 'entrada', data: '2025-01-10', notaFiscal: '20250110' },
    // Saídas Dia 15+
    { id: 'SAI_JAN_1', material: 'Furadeira Impacto', quantidade: 80, colaborador: 'João', tipo: 'saida', data: '2025-01-15' }, // 22.4k
    { id: 'SAI_JAN_2', material: 'Chave de Fenda', quantidade: 200, colaborador: 'Luiz', tipo: 'saida', data: '2025-01-20' }, // 1.7k
    { id: 'SAI_JAN_3', material: 'Martelo Unha', quantidade: 100, colaborador: 'Davi', tipo: 'saida', data: '2025-01-25' }, // 3.5k
    { id: 'SAI_JAN_4', material: 'Lixa d\'água P120', quantidade: 500, colaborador: 'Gabriel', tipo: 'saida', data: '2025-01-28' }, // 750 (Venda)
    { id: 'CONS_JAN_1', material: 'Lixa d\'água P120', quantidade: 50, colaborador: 'Jorge', tipo: 'consumo', data: '2025-01-12' }, // Uso interno

    // --- FEVEREIRO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_FEV', material: 'Parafusadeira Pro', quantidade: 100, colaborador: 'Jorge', tipo: 'entrada', data: '2025-02-05', notaFiscal: '20250205' },
    // Saídas Dia 15+
    { id: 'SAI_FEV_1', material: 'Parafusadeira Pro', quantidade: 60, colaborador: 'Gabriel', tipo: 'saida', data: '2025-02-15' }, // 21k
    { id: 'SAI_FEV_2', material: 'Jogo Chave Allen', quantidade: 200, colaborador: 'Pedro', tipo: 'saida', data: '2025-02-20' }, // 3k
    { id: 'SAI_FEV_3', material: 'Cola Madeira', quantidade: 300, colaborador: 'Arthur', tipo: 'saida', data: '2025-02-22' }, // 3.6k
    { id: 'CONS_FEV_1', material: 'Luva de Malha', quantidade: 10, colaborador: 'Equipe', tipo: 'consumo', data: '2025-02-02' }, // Uso interno

    // --- MARÇO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_MAR', material: 'Serra Tico-Tico', quantidade: 50, colaborador: 'Henrique', tipo: 'entrada', data: '2025-03-05', notaFiscal: '20250305' },
    // Saídas Dia 15+
    { id: 'SAI_MAR_1', material: 'Serra Tico-Tico', quantidade: 60, colaborador: 'Carlos', tipo: 'saida', data: '2025-03-15' }, // 22.8k
    { id: 'SAI_MAR_2', material: 'Esquadro Aço', quantidade: 100, colaborador: 'João', tipo: 'saida', data: '2025-03-20' }, // 2.5k
    { id: 'SAI_MAR_3', material: 'Bucha 8mm', quantidade: 5000, colaborador: 'Luiz', tipo: 'saida', data: '2025-03-25' }, // 2.5k

    // --- ABRIL (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_ABR', material: 'Torquímetro Digital', quantidade: 50, colaborador: 'Jorge', tipo: 'entrada', data: '2025-04-05', notaFiscal: '20250405' },
    // Saídas Dia 15+
    { id: 'SAI_ABR_1', material: 'Torquímetro Digital', quantidade: 60, colaborador: 'Davi', tipo: 'saida', data: '2025-04-15' }, // 21k
    { id: 'SAI_ABR_2', material: 'Trena 5m', quantidade: 200, colaborador: 'Gabriel', tipo: 'saida', data: '2025-04-20' }, // 5k
    { id: 'SAI_ABR_3', material: 'Parafuso Philips', quantidade: 5000, colaborador: 'Henrique', tipo: 'saida', data: '2025-04-25' }, // 1.25k
    { id: 'CONS_ABR_1', material: 'Estopa para Limpeza (Kg)', quantidade: 5, colaborador: 'Limpeza', tipo: 'consumo', data: '2025-04-10' },

    // --- MAIO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_MAI', material: 'Pistola Pintura HVLP', quantidade: 80, colaborador: 'Arthur', tipo: 'entrada', data: '2025-05-05', notaFiscal: '20250505' },
    // Saídas Dia 15+
    { id: 'SAI_MAI_1', material: 'Pistola Pintura HVLP', quantidade: 80, colaborador: 'Pedro', tipo: 'saida', data: '2025-05-15' }, // 22.4k
    { id: 'SAI_MAI_2', material: 'Spray Lubrificante', quantidade: 100, colaborador: 'Carlos', tipo: 'saida', data: '2025-05-20' }, // 2.8k
    { id: 'SAI_MAI_3', material: 'Suporte Mão Francesa', quantidade: 100, colaborador: 'João', tipo: 'saida', data: '2025-05-25' }, // 1.5k

    // --- JUNHO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_JUN', material: 'Chave de Fenda', quantidade: 1000, colaborador: 'Luiz', tipo: 'entrada', data: '2025-06-05', notaFiscal: '20250605' },
    // Entrada Consumiveis
    { id: 'ENT_JUN_CONS', material: 'Disco de Corte Inox', quantidade: 400, colaborador: 'Luiz', tipo: 'entrada', data: '2025-06-10', notaFiscal: '20250610' },
    // Saídas Dia 15+
    { id: 'SAI_JUN_1', material: 'Chave Inglesa', quantidade: 200, colaborador: 'Davi', tipo: 'saida', data: '2025-06-15' }, // 9.1k
    { id: 'SAI_JUN_2', material: 'Alicate Universal', quantidade: 300, colaborador: 'Jorge', tipo: 'saida', data: '2025-06-20' }, // 11.4k
    { id: 'SAI_JUN_3', material: 'Martelo Unha', quantidade: 200, colaborador: 'Henrique', tipo: 'saida', data: '2025-06-25' }, // 7k
    { id: 'SAI_JUN_4', material: 'Disco de Corte Inox', quantidade: 100, colaborador: 'Henrique', tipo: 'saida', data: '2025-06-28' }, // 550 (Venda)
    { id: 'CONS_JUN_1', material: 'Disco de Corte Inox', quantidade: 10, colaborador: 'Oficina', tipo: 'consumo', data: '2025-06-12' }, // Uso interno

    // --- JULHO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_JUL', material: 'Parafuso Philips', quantidade: 20000, colaborador: 'Gabriel', tipo: 'entrada', data: '2025-07-05', notaFiscal: '20250705' },
    // Saídas Dia 15+
    { id: 'SAI_JUL_1', material: 'Furadeira Impacto', quantidade: 60, colaborador: 'Arthur', tipo: 'saida', data: '2025-07-15' }, // 16.8k
    { id: 'SAI_JUL_2', material: 'Chave de Fenda', quantidade: 500, colaborador: 'Pedro', tipo: 'saida', data: '2025-07-20' }, // 4.25k
    { id: 'SAI_JUL_3', material: 'Trena 5m', quantidade: 250, colaborador: 'Carlos', tipo: 'saida', data: '2025-07-25' }, // 6.25k

    // --- AGOSTO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_AGO', material: 'Trena 5m', quantidade: 1000, colaborador: 'João', tipo: 'entrada', data: '2025-08-05', notaFiscal: '20250805' },
    // Saídas Dia 15+
    { id: 'SAI_AGO_1', material: 'Parafusadeira Pro', quantidade: 50, colaborador: 'Luiz', tipo: 'saida', data: '2025-08-15' }, // 17.5k
    { id: 'SAI_AGO_2', material: 'Arruela Lisa', quantidade: 10000, colaborador: 'Davi', tipo: 'saida', data: '2025-08-20' }, // 1.5k
    { id: 'SAI_AGO_3', material: 'Porca Sextavada', quantidade: 5000, colaborador: 'Jorge', tipo: 'saida', data: '2025-08-25' }, // 1k
    { id: 'SAI_AGO_4', material: 'Spray Lubrificante', quantidade: 250, colaborador: 'Henrique', tipo: 'saida', data: '2025-08-28' }, // 7k
    { id: 'CONS_AGO_1', material: 'Lixa d\'água P120', quantidade: 50, colaborador: 'Oficina', tipo: 'consumo', data: '2025-08-10' },

    // --- SETEMBRO (Meta: 28k) ---
    // Entrada Dia 05
    { id: 'ENT_SET', material: 'Alicate Universal', quantidade: 800, colaborador: 'Gabriel', tipo: 'entrada', data: '2025-09-05', notaFiscal: '20250905' },
    // Saídas Dia 15+
    { id: 'SAI_SET_1', material: 'Alicate Universal', quantidade: 400, colaborador: 'Arthur', tipo: 'saida', data: '2025-09-15' }, // 15.2k
    { id: 'SAI_SET_2', material: 'Bucha 8mm', quantidade: 10000, colaborador: 'Pedro', tipo: 'saida', data: '2025-09-20' }, // 5k
    { id: 'SAI_SET_3', material: 'Cola Madeira', quantidade: 500, colaborador: 'Carlos', tipo: 'saida', data: '2025-09-25' }, // 6k

    // --- OUTUBRO (Meta: 100k - Alta Temporada 1) ---
    // Entrada Dia 05 (Grande estoque)
    { id: 'ENT_OUT', material: 'Furadeira Impacto', quantidade: 350, colaborador: 'João', tipo: 'entrada', data: '2025-10-05', notaFiscal: '20251005' },
    // Saídas Dia 15+
    { id: 'SAI_OUT_1', material: 'Furadeira Impacto', quantidade: 250, colaborador: 'Luiz', tipo: 'saida', data: '2025-10-15' }, // 70k
    { id: 'SAI_OUT_2', material: 'Serra Tico-Tico', quantidade: 50, colaborador: 'Davi', tipo: 'saida', data: '2025-10-18' }, // 19k
    { id: 'SAI_OUT_3', material: 'Pistola Pintura HVLP', quantidade: 40, colaborador: 'Jorge', tipo: 'saida', data: '2025-10-22' }, // 11.2k
    { id: 'CONS_OUT_1', material: 'Estopa para Limpeza (Kg)', quantidade: 10, colaborador: 'Limpeza Geral', tipo: 'consumo', data: '2025-10-02' },

    // --- NOVEMBRO (Meta: 150k - Pico Máximo) ---
    // Entrada Dia 05 (Grande estoque)
    { id: 'ENT_NOV', material: 'Parafusadeira Pro', quantidade: 350, colaborador: 'Henrique', tipo: 'entrada', data: '2025-11-05', notaFiscal: '20251105' },
    // Saídas Dia 15+
    { id: 'SAI_NOV_1', material: 'Parafusadeira Pro', quantidade: 300, colaborador: 'Gabriel', tipo: 'saida', data: '2025-11-15' }, // 105k
    { id: 'SAI_NOV_2', material: 'Torquímetro Digital', quantidade: 100, colaborador: 'Arthur', tipo: 'saida', data: '2025-11-20' }, // 35k
    { id: 'SAI_NOV_3', material: 'Chave Inglesa', quantidade: 200, colaborador: 'Pedro', tipo: 'saida', data: '2025-11-25' }, // 9.1k
    { id: 'SAI_NOV_4', material: 'Disco de Corte Inox', quantidade: 100, colaborador: 'Pedro', tipo: 'saida', data: '2025-11-28' }, // 550
    { id: 'CONS_NOV_1', material: 'Luva de Malha', quantidade: 20, colaborador: 'Equipe Extra', tipo: 'consumo', data: '2025-11-01' },
];
