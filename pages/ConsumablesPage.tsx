
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useDatabase } from '../contexts/DatabaseContext';
import { TagIcon, PhotoIcon } from '../components/icons/HeroIcons';
import { Material } from '../types';

const ConsumablesPage: React.FC = () => {
    const { materials, updateMaterialBatch } = useDatabase();
    
    // Estado para armazenar as edições. A chave é o ID do material.
    const [edits, setEdits] = useState<{ [key: string]: Material }>({});
    
    // Filtra apenas itens categorizados como 'consumivel'
    const consumables = useMemo(() => {
        return materials.filter(m => m.categoria === 'consumivel');
    }, [materials]);

    // Inicializa o estado de edições com os valores atuais quando a lista muda
    // (apenas para itens que ainda não estão sendo editados para evitar overwrite enquanto digita)
    useEffect(() => {
        setEdits(prev => {
            const newEdits = { ...prev };
            consumables.forEach(m => {
                if (!newEdits[m.id]) {
                    newEdits[m.id] = { ...m };
                }
            });
            return newEdits;
        });
    }, [consumables]);

    const handleTextChange = (id: string, field: keyof Material, value: string) => {
        setEdits(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleNumberChange = (id: string, field: 'quantidade' | 'valorUnitario' | 'total', valueStr: string) => {
        const value = parseFloat(valueStr);
        if (isNaN(value) && valueStr !== '') return; // Permite string vazia temporariamente

        setEdits(prev => {
            const currentItem = prev[id];
            const updates: Partial<Material> = {};
            const numVal = isNaN(value) ? 0 : value;

            if (field === 'quantidade') {
                updates.quantidade = numVal;
                // Se muda quantidade, recalcula total (mantém unitário fixo)
                // Total = Nova Qtd * Unitário Atual
                // updates.valorUnitario = currentItem.valorUnitario;
            } else if (field === 'valorUnitario') {
                updates.valorUnitario = numVal;
                // Se muda unitário, recalcula total (mantém quantidade fixa)
            } else if (field === 'total') {
                // Se muda total, recalcula unitário (mantém quantidade fixa)
                // Unitário = Novo Total / Quantidade Atual
                if (currentItem.quantidade > 0) {
                    updates.valorUnitario = numVal / currentItem.quantidade;
                }
            }

            return {
                ...prev,
                [id]: { ...currentItem, ...updates }
            };
        });
    };

    const handleSave = () => {
        const updates = Object.values(edits);
        updateMaterialBatch(updates);
        alert(`${updates.length} itens atualizados com sucesso!`);
    };

    const hasChanges = useMemo(() => {
        return consumables.some(original => {
            const edited = edits[original.id];
            if (!edited) return false;
            return (
                original.nome !== edited.nome ||
                original.codigoFabricante !== edited.codigoFabricante ||
                original.quantidade !== edited.quantidade ||
                Math.abs(original.valorUnitario - edited.valorUnitario) > 0.001
            );
        });
    }, [consumables, edits]);

    const headers = ['Imagem', 'Material', 'Cód.', 'Quantidade', 'Valor Unitário', 'Valor Total'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pt-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <TagIcon className="w-8 h-8" />
                    </div>
                   {/* Mensagem removida conforme solicitado */}
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Salvar Alterações
                </button>
            </div>

            <Card>
                <Table headers={headers}>
                    {consumables.map(material => {
                        const edited = edits[material.id] || material;
                        const totalValue = edited.quantidade * edited.valorUnitario;
                        
                        return (
                            <tr key={material.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                                <td className="p-4 w-16">
                                    {material.imageUrl ? (
                                        <img src={material.imageUrl} alt={material.nome} className="w-10 h-10 rounded object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-slate-400">
                                            <PhotoIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <input 
                                        type="text" 
                                        value={edited.nome}
                                        onChange={(e) => handleTextChange(material.id, 'nome', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 font-semibold text-slate-800"
                                    />
                                    <p className="text-xs text-slate-500 px-1 mt-1">{material.id}</p>
                                </td>
                                <td className="p-4">
                                    <input 
                                        type="text" 
                                        value={edited.codigoFabricante}
                                        onChange={(e) => handleTextChange(material.id, 'codigoFabricante', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 text-sm text-slate-600 font-mono"
                                    />
                                </td>
                                <td className="p-4 w-32">
                                     <input 
                                        type="number" 
                                        value={edited.quantidade}
                                        onChange={(e) => handleNumberChange(material.id, 'quantidade', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="0"
                                    />
                                </td>
                                <td className="p-4 w-32">
                                     <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                                        <input 
                                            type="number" 
                                            value={edited.valorUnitario} // Apenas para display, arredondando
                                            onChange={(e) => handleNumberChange(material.id, 'valorUnitario', e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded pl-6 pr-2 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </td>
                                <td className="p-4 w-40">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                                        <input 
                                            type="number" 
                                            value={totalValue.toFixed(2)} // Display do total calculado
                                            onChange={(e) => handleNumberChange(material.id, 'total', e.target.value)}
                                            className="w-full bg-blue-50 border border-blue-200 rounded pl-6 pr-2 py-1 text-blue-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {consumables.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                Nenhum material consumível cadastrado.
                            </td>
                        </tr>
                    )}
                </Table>
            </Card>
        </div>
    );
};

export default ConsumablesPage;
