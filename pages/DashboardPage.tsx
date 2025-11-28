
import React, { useMemo } from 'react';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import BarChart from '../components/ui/BarChart';
import { useDatabase } from '../contexts/DatabaseContext';
import { 
    ArchiveBoxIcon, NoSymbolIcon, CurrencyDollarIcon,
    BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ScaleIcon, ArrowTrendingUpIcon
} from '../components/icons/HeroIcons';

const DashboardPage: React.FC = () => {
    const { materials: mockMateriais, movements: mockMovimentacoes } = useDatabase();
    
  const inventoryStats = useMemo(() => {
    const totalItens = mockMateriais.length;
    // Estoque negativo removido do display, mas mantemos o cálculo se necessário futuramente, 
    // ou removemos para limpar. Mantendo apenas os necessários para o UI atual.
    const estoqueZerado = mockMateriais.filter(m => m.quantidade === 0).length;
    const totalEstoque = mockMateriais.reduce((sum, m) => sum + m.quantidade, 0);
    return { totalItens, estoqueZerado, totalEstoque };
  }, [mockMateriais]);

  const financialStats = useMemo(() => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Valor Unitário considerado como CUSTO do produto
    const valorTotalEstoque = mockMateriais.reduce((sum, m) => sum + (m.quantidade * m.valorUnitario), 0);

    const materialPrices = new Map(mockMateriais.map(m => [m.nome, m.valorUnitario]));
    
    // Find the latest year and month from the data itself to display active month stats
    let latestYear = 0;
    let latestMonth = 0;

    if (mockMovimentacoes.length > 0) {
        const sortedDates = mockMovimentacoes
            .map(m => new Date(m.data))
            .sort((a, b) => b.getTime() - a.getTime());
        
        latestYear = sortedDates[0].getUTCFullYear();
        latestMonth = sortedDates[0].getUTCMonth() + 1; // 0-indexed
    } else {
        const now = new Date();
        latestYear = now.getUTCFullYear();
        latestMonth = now.getUTCMonth() + 1;
    }

    const monthName = new Date(latestYear, latestMonth - 1).toLocaleString('pt-BR', { month: 'long' });

    // Cálculos do Mês de Referência (Último mês com dados)
    const movimentacoesMes = mockMovimentacoes.filter(mov => {
        const movDate = new Date(mov.data);
        return movDate.getUTCMonth() + 1 === latestMonth && movDate.getUTCFullYear() === latestYear;
    });

    const custoEntradasMes = movimentacoesMes
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, mov) => sum + (Number(mov.quantidade) * (Number(materialPrices.get(mov.material)) || 0)), 0);

    const custoSaidasMes = movimentacoesMes
        .filter(m => m.tipo === 'saida' || m.tipo === 'consumo')
        .reduce((sum, mov) => sum + (Number(mov.quantidade) * (Number(materialPrices.get(mov.material)) || 0)), 0);
    
    const fluxoDeValorMes = custoSaidasMes - custoEntradasMes;

    // Cálculo do Lucro Bruto sobre Vendas (Considerando uma margem média de 50% sobre o custo)
    const MARGEM_LUCRO_ESTIMADA = 0.5; // 50%

    const lucroBrutoEstimado = mockMovimentacoes
        .filter(m => m.tipo === 'saida') // Apenas vendas geram lucro (consumo é despesa)
        .reduce((sum, mov) => {
            const custoUnitario = Number(materialPrices.get(mov.material)) || 0;
            const lucroPorUnidade = custoUnitario * MARGEM_LUCRO_ESTIMADA;
            return sum + (Number(mov.quantidade) * lucroPorUnidade);
        }, 0);

    // Lógica do Status de Movimentação
    let statusMovimentacao = 'Baixa';
    let statusMovimentacaoColor: 'red' | 'yellow' | 'green' = 'red';

    if (custoSaidasMes >= 30000) {
        statusMovimentacao = 'Movimentação Alta';
        statusMovimentacaoColor = 'green';
    } else if (custoSaidasMes >= 10000) {
        statusMovimentacao = 'Movimentação Média';
        statusMovimentacaoColor = 'yellow';
    } else {
        statusMovimentacao = 'Movimentação Baixa';
        statusMovimentacaoColor = 'red';
    }

    return {
        valorTotalEstoque: formatCurrency(valorTotalEstoque),
        custoEntradasMes: formatCurrency(custoEntradasMes),
        custoSaidasMes: formatCurrency(custoSaidasMes),
        fluxoDeValorMes: formatCurrency(fluxoDeValorMes),
        lucroEstimado: lucroBrutoEstimado,
        lucroEstimadoFormatted: formatCurrency(lucroBrutoEstimado),
        referenciaMes: `${monthName}/${latestYear}`,
        statusMovimentacao,
        statusMovimentacaoColor
    }

  }, [mockMateriais, mockMovimentacoes]);

  // Data for the Profit Chart (Top Products by Gross Profit)
  const profitChartData = useMemo(() => {
      const materialPrices = new Map(mockMateriais.map(m => [m.nome, m.valorUnitario]));
      const MARGEM_LUCRO_ESTIMADA = 0.5; // 50%
      const productProfitMap = new Map<string, number>();

      mockMovimentacoes
        .filter(m => m.tipo === 'saida')
        .forEach(mov => {
            const custoUnitario = Number(materialPrices.get(mov.material)) || 0;
            const lucroTotalMovimentacao = (Number(mov.quantidade) * custoUnitario) * MARGEM_LUCRO_ESTIMADA;
            
            const currentProfit = productProfitMap.get(mov.material) || 0;
            productProfitMap.set(mov.material, currentProfit + lucroTotalMovimentacao);
        });

      return Array.from(productProfitMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort descending by profit
        .slice(0, 5) // Top 5
        .map(([label, value]) => ({ label, value }));

  }, [mockMateriais, mockMovimentacoes]);

  // Data for Top Collaborators (Last 3 Months)
  const topCollaboratorsData = useMemo(() => {
    const materialPrices = new Map(mockMateriais.map(m => [m.nome, m.valorUnitario]));
    const collaboratorSalesMap = new Map<string, number>();

    // Definir data de corte (3 meses atrás)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3);

    mockMovimentacoes
      .filter(m => m.tipo === 'saida') // Apenas vendas
      .forEach(mov => {
        const movDate = new Date(mov.data);
        if (movDate >= cutoffDate) {
           const valorVenda = Number(mov.quantidade) * (Number(materialPrices.get(mov.material)) || 0);
           const currentTotal = collaboratorSalesMap.get(mov.colaborador) || 0;
           collaboratorSalesMap.set(mov.colaborador, currentTotal + valorVenda);
        }
      });

    return Array.from(collaboratorSalesMap.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar maior valor para menor
      .slice(0, 5) // Top 5
      .map(([label, value]) => ({ label, value }));

  }, [mockMateriais, mockMovimentacoes]);

  // Lógica para Produtos sem Venda (3+ Meses)
  const staleProductsChartData = useMemo(() => {
    // Data de hoje
    const today = new Date();
    // 90 dias atrás
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 90);

    // 1. Identificar produtos que TIVERAM venda nos últimos 90 dias
    const activeProducts = new Set();
    mockMovimentacoes.forEach(m => {
        if (m.tipo === 'saida' && new Date(m.data) >= cutoffDate) {
            activeProducts.add(m.material);
        }
    });

    // 2. Filtrar materiais que NÃO estão no conjunto activeProducts e têm estoque > 0
    const staleMaterials = mockMateriais.filter(m => !activeProducts.has(m.nome) && m.quantidade > 0 && m.categoria !== 'consumivel');

    // 3. Para cada um, calcular há quantos dias foi a última venda (ou se nunca foi vendido)
    const data = staleMaterials.map(m => {
        // Buscar todas as saídas deste material
        const sales = mockMovimentacoes
            .filter(mov => mov.material === m.nome && mov.tipo === 'saida')
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); // Mais recente primeiro
        
        let daysSince = 0;
        
        if (sales.length > 0) {
            const lastSaleDate = new Date(sales[0].data);
            const diffTime = Math.abs(today.getTime() - lastSaleDate.getTime());
            daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else {
            // Se nunca foi vendido, usamos um valor alto para indicar "encalhado" (ex: dias desde 01/01/2025 ou fixo)
            // Vamos assumir dias desde o início do ano de simulação ou 120 dias se não houver referência
            daysSince = 365; // Valor simbólico para "Nunca vendido no período"
        }

        return {
            label: m.nome,
            value: daysSince
        };
    });

    // Ordenar por dias sem venda (maior para menor) e pegar Top 5
    return data.sort((a, b) => b.value - a.value).slice(0, 5);

  }, [mockMateriais, mockMovimentacoes]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      
      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Itens Totais em Estoque" value={inventoryStats.totalEstoque.toLocaleString('pt-BR')} icon={<ArchiveBoxIcon className="w-6 h-6"/>} color="blue" />
        
        {/* Novo Indicador de Movimentação */}
        <StatCard 
            title={`Status (${financialStats.referenciaMes})`} 
            value={financialStats.statusMovimentacao} 
            icon={<ArrowTrendingUpIcon className="w-6 h-6"/>} 
            color={financialStats.statusMovimentacaoColor} 
        />
        
        <StatCard title="Itens com Estoque Zerado" value={inventoryStats.estoqueZerado} icon={<NoSymbolIcon className="w-6 h-6"/>} color="yellow" />
        
        {/* Card de Lucro Bruto */}
        <div className="relative group">
            <StatCard 
                title="Lucro Bruto (Vendas Total)" 
                value={financialStats.lucroEstimadoFormatted} 
                icon={<CurrencyDollarIcon className="w-6 h-6"/>} 
                color="green" 
            />
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded shadow-lg mt-1 mr-1">
                Baseado em margem estimada de 50% sobre o custo.
            </div>
        </div>
      </div>

       {/* Financial Summary */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700 capitalize">Movimentação Financeira ({financialStats.referenciaMes})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Valor Total do Estoque" value={financialStats.valorTotalEstoque} icon={<BanknotesIcon className="w-6 h-6"/>} color="blue" />
                <StatCard title="Entradas (Mês)" value={financialStats.custoEntradasMes} icon={<ArrowDownTrayIcon className="w-6 h-6"/>} color="red" />
                <StatCard title="Saídas (Mês)" value={financialStats.custoSaidasMes} icon={<ArrowUpTrayIcon className="w-6 h-6"/>} color="yellow" />
                <StatCard title="Balanço (Mês)" value={financialStats.fluxoDeValorMes} icon={<ScaleIcon className="w-6 h-6"/>} color="blue" />
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Chart */}
        <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Top 5 Produtos por Lucro Bruto</h2>
            <BarChart data={profitChartData} height={250} />
        </Card>

        {/* Stock Levels */}
        <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Níveis de Estoque (Top 5)</h2>
            <div className="space-y-4">
                {mockMateriais.slice(0, 5).map(material => (
                    <div key={material.id}>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{material.nome}</span>
                            <span className="text-sm font-medium text-slate-500">{material.quantidade} un.</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${material.quantidade > 50 ? 'bg-blue-500' : material.quantidade > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, (material.quantidade / (material.entradas || 1)) * 100))}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      {/* Charts Row 2: Collaborators and Dead Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <h2 className="text-lg font-semibold mb-4">Colaboradores com Maior Venda (3 Meses)</h2>
            <div className="w-full">
                {topCollaboratorsData.length > 0 ? (
                    <BarChart data={topCollaboratorsData} height={250} />
                ) : (
                    <p className="text-slate-500 text-sm p-4 text-center">Nenhuma venda registrada nos últimos 3 meses.</p>
                )}
            </div>
         </Card>

         <Card>
            <h2 className="text-lg font-semibold mb-4 text-red-600">Produtos Parados em Estoque (3+ Meses)</h2>
            <div className="w-full">
                {staleProductsChartData.length > 0 ? (
                    <BarChart data={staleProductsChartData} height={250} format="days" />
                ) : (
                    <p className="text-slate-500 text-sm p-4 text-center">Ótimo! Nenhum produto parado há mais de 3 meses.</p>
                )}
                <p className="text-xs text-slate-400 mt-2 text-right">* Dias desde a última venda.</p>
            </div>
         </Card>
      </div>

       {/* Recent Movements */}
      <Card>
            <h2 className="text-lg font-semibold mb-4">Últimas Movimentações</h2>
            <ul className="divide-y divide-slate-200">
                {mockMovimentacoes.slice(0, 10).map(mov => {
                    const typeClasses = {
                        entrada: 'bg-blue-100 text-blue-800',
                        saida: 'bg-red-100 text-red-800',
                        consumo: 'bg-yellow-100 text-yellow-800'
                    }
                    return (
                         <li key={mov.id} className="py-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm">{mov.material}</p>
                                    <p className="text-xs text-slate-500">{new Date(mov.data).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-xs text-slate-500">{mov.colaborador}</p>
                                    {mov.notaFiscal && <p className="text-xs text-blue-500">NF: {mov.notaFiscal}</p>}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-medium ${typeClasses[mov.tipo]}`}>{mov.tipo.toUpperCase()} ({mov.quantidade})</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </Card>
    </div>
  );
};

export default DashboardPage;
