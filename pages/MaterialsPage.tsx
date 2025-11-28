
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import AISuggestion from types.ts to resolve module export error.
import { UserRole, Material, AISuggestion } from '../types';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PlusIcon from '../components/icons/PlusIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import { SparklesIcon, ExclamationTriangleIcon, PhotoIcon, CloudArrowUpIcon } from '../components/icons/HeroIcons';
import Modal from '../components/ui/Modal';
// FIX: Remove AISuggestion from this import as it's now imported from types.ts.
import { suggestSupplier, findMaterialImage } from '../services/geminiService';

const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    materials, 
    addMaterial, 
    updateMaterial, 
    deleteMaterial,
    partners,
    movements,
    invoices
  } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  // State for Add/Edit Form
  const initialFormState: Omit<Material, 'id' | 'entradas'> = {
    nome: '',
    codigoFabricante: '',
    quantidade: 0,
    armazenamento: '',
    valorUnitario: 0,
    imageUrl: '',
    categoria: 'ferramenta',
  };
  const [currentMaterial, setCurrentMaterial] = useState(initialFormState);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  
  // State for Delete
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  // State for AI Suggestion
  const [suggestionMaterial, setSuggestionMaterial] = useState<Material | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isFindingSingleImage, setIsFindingSingleImage] = useState(false);
  
  const canEdit = user?.role === UserRole.GERENTE || user?.role === UserRole.DIRETOR || user?.role === UserRole.VISITANTE;
  const canDelete = user?.role === UserRole.DIRETOR || user?.role === UserRole.VISITANTE;
  
  const headers = ['Imagem', 'Produto', 'Cód. Fabricante', 'Em Estoque', 'Status', 'Local', 'Ações'];

  // CRUD Modal Handlers
  const handleOpenAddModal = () => {
    setMaterialToEdit(null);
    setCurrentMaterial(initialFormState);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (material: Material) => {
    setMaterialToEdit(material);
    setCurrentMaterial(material);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!materialToDelete) return;
    deleteMaterial(materialToDelete.id);
    setIsDeleteModalOpen(false);
    setMaterialToDelete(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentMaterial(prev => ({ 
      ...prev, 
      [name]: (name === 'quantidade' || name === 'valorUnitario') ? parseFloat(value) || 0 : value 
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validação básica de tamanho (limite de 1MB para não estourar o LocalStorage)
        if (file.size > 1024 * 1024) {
            alert("A imagem é muito grande (máx 1MB). Por favor, escolha uma imagem menor.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCurrentMaterial(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
      setCurrentMaterial(prev => ({ ...prev, imageUrl: '' }));
  }

  const handleSingleImageSearch = async (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submit
      if (!currentMaterial.nome) {
          alert("Digite o nome do material primeiro.");
          return;
      }
      setIsFindingSingleImage(true);
      try {
          const url = await findMaterialImage(currentMaterial.nome);
          if (url) {
              setCurrentMaterial(prev => ({ ...prev, imageUrl: url }));
          } else {
              alert("Nenhuma imagem encontrada para este nome.");
          }
      } catch (err) {
          console.error(err);
          alert("Erro ao buscar imagem.");
      } finally {
          setIsFindingSingleImage(false);
      }
  }
  
  const isFormValid = currentMaterial.nome && currentMaterial.codigoFabricante && currentMaterial.armazenamento && currentMaterial.valorUnitario > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (materialToEdit) {
      updateMaterial({ ...materialToEdit, ...currentMaterial });
    } else {
      addMaterial(currentMaterial);
    }
    
    setIsModalOpen(false);
  };

  // AI Suggestion Handlers
  const handleSuggestClick = async (material: Material) => {
    setSuggestionMaterial(material);
    setIsSuggestionModalOpen(true);
    setIsLoading(true);
    setError(null);
    setAiSuggestion(null);

    try {
        const suggestion = await suggestSupplier(material.nome, partners, movements, invoices);
        setAiSuggestion(suggestion);
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAutoFillImages = async () => {
    setIsSearchingImages(true);
    const materialsWithoutImages = materials.filter(m => !m.imageUrl);
    
    let count = 0;
    for (const mat of materialsWithoutImages) {
        if (count >= 5) break; 
        
        try {
            const url = await findMaterialImage(mat.nome);
            if (url) {
                updateMaterial({ ...mat, imageUrl: url });
                count++;
            }
        } catch (e) {
            console.error("Skipping image search for", mat.nome);
        }
    }
    setIsSearchingImages(false);
    if(count > 0) alert(`${count} imagens encontradas e atualizadas!`);
    else alert("Não foi possível encontrar novas imagens no momento.");
  }

  const closeSuggestionModal = () => {
    setIsSuggestionModalOpen(false);
    setSuggestionMaterial(null);
  }

  const getSuggestedPartnerName = () => {
      if(!aiSuggestion) return 'N/A';
      return partners.find(p => p.id === aiSuggestion.recommendedPartnerId)?.nome || 'Desconhecido';
  }
  
  const modalTitle = materialToEdit ? 'Editar Material' : 'Adicionar Novo Material';
  const submitText = materialToEdit ? 'Salvar Alterações' : 'Adicionar Material';

  return (
    <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Cadastro de Materiais</h1>
                <div className="flex space-x-2">
                    {canEdit && (
                        <button 
                            onClick={handleAutoFillImages} 
                            disabled={isSearchingImages}
                            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                        >
                            {isSearchingImages ? (
                                <span className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Buscando...</span>
                            ) : (
                                <><SparklesIcon className="w-5 h-5 mr-2" />Buscar Imagens Faltantes (IA)</>
                            )}
                        </button>
                    )}
                    {canEdit && (
                        <button onClick={handleOpenAddModal} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Novo Material
                        </button>
                    )}
                </div>
            </div>
            
            <Card>
                <Table headers={headers}>
                {materials.map(material => {
                    const isNegativeStock = material.quantidade < 0;
                    const isOutOfStock = material.quantidade === 0;
                    const isLowStock = material.quantidade > 0 && material.quantidade < 20;

                    const rowClasses = `border-b border-slate-200 last:border-b-0 transition-colors ${
                        isNegativeStock ? 'bg-red-100 hover:bg-red-200' :
                        isOutOfStock ? 'bg-red-50 hover:bg-red-100' :
                        isLowStock ? 'bg-yellow-50 hover:bg-yellow-100' :
                        'hover:bg-slate-50'
                    }`;

                    const badgeClasses = `px-2 py-1 text-sm font-semibold rounded-full ${
                        isNegativeStock ? 'bg-red-200 text-red-900' :
                        isOutOfStock ? 'bg-red-100 text-red-800' :
                        isLowStock ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`;

                    let statusLabel = 'Alto';
                    let statusColor = 'bg-green-100 text-green-800';
                    
                    if (material.quantidade <= 0) {
                        statusLabel = material.quantidade < 0 ? 'Negativo' : 'Zerado';
                        statusColor = 'bg-slate-200 text-slate-800';
                    } else if (material.quantidade < 20) {
                        statusLabel = 'Baixo';
                        statusColor = 'bg-red-100 text-red-800';
                    } else if (material.quantidade <= 100) {
                        statusLabel = 'Médio';
                        statusColor = 'bg-yellow-100 text-yellow-800';
                    }
                    
                    return (
                        <tr key={material.id} className={rowClasses}>
                        <td className="p-4">
                            {material.imageUrl ? (
                                <img src={material.imageUrl} alt={material.nome} className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white" />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                                    <PhotoIcon className="w-6 h-6" />
                                </div>
                            )}
                        </td>
                        <td className="p-4">
                            <div>
                                <p className="font-semibold text-slate-800">{material.nome}</p>
                                <p className="text-sm text-slate-500">{material.id}</p>
                            </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-mono">{material.codigoFabricante}</td>
                        <td className="p-4">
                            <span className={badgeClasses}>
                                {material.quantidade} un.
                            </span>
                            {isNegativeStock && (
                                <div className="flex items-center mt-1 text-red-700">
                                    <ExclamationTriangleIcon className="w-4 h-4 mr-1"/>
                                    <p className="text-xs font-bold">
                                        Estoque negativo!
                                    </p>
                                </div>
                            )}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${statusColor}`}>
                                {statusLabel}
                            </span>
                        </td>
                        <td className="p-4 text-slate-600">{material.armazenamento}</td>
                        <td className="p-4">
                            <div className="flex items-center space-x-2">
                            {canEdit && (
                                <button onClick={() => handleOpenEditModal(material)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            )}
                            {canDelete && (
                                <button onClick={() => handleOpenDeleteModal(material)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Excluir">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            )}
                            <button onClick={() => handleSuggestClick(material)} className="p-2 text-slate-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors" title="Sugerir Fornecedor (IA)">
                                <SparklesIcon className="w-5 h-5"/>
                            </button>
                            </div>
                        </td>
                        </tr>
                    )
                })}
                </Table>
            </Card>
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome do Material</label>
                    <input type="text" name="nome" value={currentMaterial.nome} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm placeholder-slate-400" required />
                </div>
                
                {/* Image Upload / Management Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do Produto</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                        {currentMaterial.imageUrl ? (
                            <div className="relative inline-block group">
                                <img src={currentMaterial.imageUrl} alt="Preview" className="h-32 w-auto mx-auto rounded-md shadow-sm" />
                                <button 
                                    type="button" 
                                    onClick={handleClearImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                    title="Remover imagem"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-center">
                                     <PhotoIcon className="w-12 h-12 text-slate-300" />
                                </div>
                                <div className="flex text-sm text-slate-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Fazer Upload</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG até 1MB</p>
                            </div>
                        )}
                        
                        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                             <div className="flex-1 mr-2">
                                <input 
                                    type="text" 
                                    name="imageUrl" 
                                    value={currentMaterial.imageUrl || ''} 
                                    onChange={handleInputChange} 
                                    className="block w-full rounded-md border border-slate-300 bg-white py-1.5 px-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-xs" 
                                    placeholder="Ou cole uma URL..." 
                                />
                             </div>
                             <button 
                                type="button"
                                onClick={handleSingleImageSearch}
                                disabled={isFindingSingleImage || !currentMaterial.nome}
                                className="inline-flex items-center rounded border border-transparent bg-purple-100 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-400"
                                title="Buscar imagem na web usando IA"
                             >
                                {isFindingSingleImage ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                                ) : (
                                    <SparklesIcon className="w-3 h-3 mr-1" />
                                )}
                                Buscar IA
                             </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="codigoFabricante" className="block text-sm font-medium text-slate-700">Cód. Fabricante</label>
                        <input type="text" name="codigoFabricante" value={currentMaterial.codigoFabricante} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm placeholder-slate-400" required />
                    </div>
                     <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">Categoria</label>
                        <select name="categoria" value={currentMaterial.categoria} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm">
                            <option value="ferramenta">Ferramenta</option>
                            <option value="consumivel">Consumível</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700">Quantidade</label>
                        <input type="number" name="quantidade" value={currentMaterial.quantidade} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm placeholder-slate-400" required />
                    </div>
                    <div>
                        <label htmlFor="armazenamento" className="block text-sm font-medium text-slate-700">Local</label>
                        <input type="text" name="armazenamento" value={currentMaterial.armazenamento} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm placeholder-slate-400" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="valorUnitario" className="block text-sm font-medium text-slate-700">Valor Unitário (R$)</label>
                        <input type="number" name="valorUnitario" value={currentMaterial.valorUnitario} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-2 border-transparent bg-slate-800 text-white p-2 focus:border-blue-500 focus:outline-none sm:text-sm placeholder-slate-400" min="0.01" step="0.01" required />
                    </div>
                </div>
                <div className="pt-4">
                     <button type="submit" disabled={!isFormValid} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                       {submitText}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Delete Modal */}
         <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Exclusão">
            <div className="space-y-4">
                <p>Tem certeza de que deseja excluir o material <span className="font-bold">{materialToDelete?.nome}</span>? Esta ação não pode ser desfeita.</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Excluir
                    </button>
                </div>
            </div>
        </Modal>

        {/* Suggestion Modal */}
        <Modal 
            isOpen={isSuggestionModalOpen} 
            onClose={closeSuggestionModal} 
            title={`Sugestão de Fornecedor para ${suggestionMaterial?.nome}`}
        >
            {isLoading && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">A IA está analisando os melhores fornecedores...</p>
                </div>
            )}
            {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            {aiSuggestion && !isLoading && (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">Fornecedor Recomendado:</p>
                        <p className="text-xl font-bold text-blue-700">{getSuggestedPartnerName()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Justificativa da IA:</p>
                        <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-700 bg-slate-50 p-3 rounded-r-md">
                            {aiSuggestion.justification}
                        </blockquote>
                    </div>
                </div>
            )}
        </Modal>
    </>
  );
};

export default MaterialsPage;
