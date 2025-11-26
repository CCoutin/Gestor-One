import React, { useMemo } from 'react';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import BarChart from '../components/ui/BarChart';
import { useDatabase } from '../contexts/DatabaseContext';
import { 
    ArchiveBoxIcon, ExclamationTriangleIcon, NoSymbolIcon, CurrencyDollarIcon,
    BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ScaleIcon
} from '../components/icons/HeroIcons';

const DashboardPage: React.FC = () => {
    const { materials: mockMateriais, movements: mockMovimentacoes } = useDatabase();
    
  const inventoryStats = useMemo(() => {
    const totalItens = mockMateriais.length;
    const estoqueNegativo = mockMateriais.filter(m => m.quantidade < 0).length;
    const estoqueZerado = mockMateriais.filter(m => m.quantidade === 0).length;
    const totalEstoque = mockMateriais.reduce((sum, m) => sum + m.quantidade, 0);
    return { totalItens, estoqueNegativo, estoqueZerado, totalEstoque };
  }, [mockMateriais]);

  const financialStats = useMemo(() => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Valor Unitário considerado como CUSTO do produto
    const valorTotalEstoque = mockMateriais.reduce((sum, m) => sum + (m.quantidade * m.valorUnitario), 0);

    const materialPrices = new Map(mockMateriais.map(m => [m.nome, m.valorUnitario]));
    
    // Find the latest year and month from the data itself to display active month stats
    // This ensures that if the simulated data is in Nov/2025, the dashboard shows Nov/2025, not current real date.
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

    return {
        valorTotalEstoque: formatCurrency(valorTotalEstoque),
        custoEntradasMes: formatCurrency(custoEntradasMes),
        custoSaidasMes: formatCurrency(custoSaidasMes),
        fluxoDeValorMes: formatCurrency(fluxoDeValorMes),
        lucroEstimado: lucroBrutoEstimado,
        lucroEstimadoFormatted: formatCurrency(lucroBrutoEstimado),
        referenciaMes: `${monthName}/${latestYear}`
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      
      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Itens Totais em Estoque" value={inventoryStats.totalEstoque.toLocaleString('pt-BR')} icon={<ArchiveBoxIcon className="w-6 h-6"/>} color="blue" />
        <StatCard title="Itens com Estoque Negativo" value={inventoryStats.estoqueNegativo} icon={<ExclamationTriangleIcon className="w-6 h-6"/>} color="red" />
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
                                    <p className="text-xs text-slate-500">{new Date(mov.data).toLocaleDateString('pt-BR')} - {mov.colaborador}</p>
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