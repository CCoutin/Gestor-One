

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    mockMateriais, 
    mockMovimentacoes, 
    mockColaboradores, 
    mockParceiros, 
    mockNotasFiscais 
} from '../data/mockDatabase';
import { Material, Movimentacao, Colaborador, Parceiro, NotaFiscal, MovimentacaoTipo, UserRole } from '../types';

// VERSÃO DO BANCO DE DADOS
// Sempre que alterarmos o mockDatabase.ts significativamente, incrementamos isso
// para forçar o navegador a descartar o cache antigo e usar os novos dados.
const DB_VERSION = '2.5'; 

interface DatabaseContextType {
  materials: Material[];
  movements: Movimentacao[];
  collaborators: Colaborador[];
  partners: Parceiro[];
  invoices: NotaFiscal[];
  addMovement: (movement: Omit<Movimentacao, 'id' | 'tipo'>, type: MovimentacaoTipo) => void;
  updateMovement: (updatedMovement: Movimentacao) => void;
  deleteMovement: (movementId: string) => void;
  addMaterial: (material: Omit<Material, 'id' | 'entradas'>) => void;
  updateMaterial: (updatedMaterial: Material) => void;
  deleteMaterial: (materialId: string) => void;
  updateMaterialStock: (materialId: string, newQuantity: number) => void;
  updateMaterialBatchValues: (updates: { id: string; novoValorTotal: number }[]) => void;
  updateMaterialBatch: (updates: Material[]) => void; // Nova função genérica
  updateCollaboratorRole: (collaboratorId: string, newRole: UserRole) => void;
  resetDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicialização de Estado com Verificação de Versão
  const initializeState = <T,>(key: string, fallback: T): T => {
      if (typeof window === 'undefined') return fallback;
      try {
          const storedVersion = localStorage.getItem('gestor_db_version');
          
          if (storedVersion !== DB_VERSION) {
              return fallback;
          }

          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : fallback;
      } catch (error) {
          console.error(`Erro ao carregar ${key} do localStorage:`, error);
          return fallback;
      }
  };

  const [materials, setMaterials] = useState<Material[]>(() => initializeState('gestor_materials', mockMateriais));
  const [movements, setMovements] = useState<Movimentacao[]>(() => initializeState('gestor_movements', mockMovimentacoes));
  const [collaborators, setCollaborators] = useState<Colaborador[]>(() => initializeState('gestor_collaborators', mockColaboradores));
  const [partners, setPartners] = useState<Parceiro[]>(() => initializeState('gestor_partners', mockParceiros));
  const [invoices, setInvoices] = useState<NotaFiscal[]>(() => initializeState('gestor_invoices', mockNotasFiscais));

  // Efeito para atualizar a versão no storage quando a app carrega
  useEffect(() => {
      localStorage.setItem('gestor_db_version', DB_VERSION);
  }, []);

  // Efeitos para salvar mudanças no localStorage (Persistência)
  useEffect(() => { localStorage.setItem('gestor_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('gestor_movements', JSON.stringify(movements)); }, [movements]);
  useEffect(() => { localStorage.setItem('gestor_collaborators', JSON.stringify(collaborators)); }, [collaborators]);
  useEffect(() => { localStorage.setItem('gestor_partners', JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem('gestor_invoices', JSON.stringify(invoices)); }, [invoices]);

  // Funções de Material (Auxiliares)
  const updateMaterialStock = (materialId: string, newQuantity: number) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, quantidade: newQuantity } : m));
  };
  
  // Atualiza valor total (recalcula valor unitário) para múltiplos itens (Deprecated: use updateMaterialBatch)
  const updateMaterialBatchValues = (updates: { id: string; novoValorTotal: number }[]) => {
      setMaterials(prev => prev.map(m => {
          const update = updates.find(u => u.id === m.id);
          if (update && m.quantidade > 0) {
              const novoValorUnitario = update.novoValorTotal / m.quantidade;
              return { ...m, valorUnitario: novoValorUnitario };
          }
          return m;
      }));
  };

  // Nova função para atualizar qualquer campo em lote
  const updateMaterialBatch = (updates: Material[]) => {
      setMaterials(prev => prev.map(m => {
          const update = updates.find(u => u.id === m.id);
          return update ? update : m;
      }));
  };

  // Funções de Movimentação
  const addMovement = (movement: Omit<Movimentacao, 'id' | 'tipo'>, type: MovimentacaoTipo) => {
    const material = materials.find(m => m.nome.toLowerCase() === movement.material.toLowerCase());
    const collaborator = collaborators.find(c => c.nome.toLowerCase() === movement.colaborador.toLowerCase());

    if (!material) {
        console.error(`Material "${movement.material}" não encontrado.`);
        return;
    }
    if (!collaborator) {
        console.error(`Colaborador "${movement.colaborador}" não encontrado.`);
        return;
    }

    const newMovement: Movimentacao = { 
        ...movement, 
        material: material.nome, 
        colaborador: collaborator.nome,
        id: `MOV${Date.now()}`, 
        tipo: type,
        notaFiscal: type === 'entrada' ? movement.notaFiscal : undefined,
    };
    
    // Se o usuário informou um valorTotal personalizado (na página de movimentações), usamos ele.
    // Caso contrário, calculamos (mas o form já deve mandar calculado ou o valor).
    // O mock já espera o objeto com valorTotal se ele existir no tipo Movimentacao.
    
    setMovements(prev => [newMovement, ...prev].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));

    // Atualiza estoque
    const quantityChange = type === 'entrada' ? movement.quantidade : -movement.quantidade;
    const newQuantity = material.quantidade + quantityChange;
    updateMaterialStock(material.id, newQuantity);
  };

  const updateMovement = (updatedMovement: Movimentacao) => {
    setMovements(prev => {
        const oldMovement = prev.find(m => m.id === updatedMovement.id);
        if (!oldMovement) return prev;

        // Reverter impacto no estoque da movimentação antiga e aplicar a nova
        setMaterials(currentMaterials => {
            let mats = [...currentMaterials];
            
            // Reverter antiga
            const oldMatIndex = mats.findIndex(m => m.nome === oldMovement.material);
            if (oldMatIndex >= 0) {
                const revertChange = oldMovement.tipo === 'entrada' ? -oldMovement.quantidade : oldMovement.quantidade;
                mats[oldMatIndex] = { ...mats[oldMatIndex], quantidade: mats[oldMatIndex].quantidade + revertChange };
            }

            // Aplicar nova
            const newMatIndex = mats.findIndex(m => m.nome === updatedMovement.material);
            if (newMatIndex >= 0) {
                const applyChange = updatedMovement.tipo === 'entrada' ? updatedMovement.quantidade : -updatedMovement.quantidade;
                mats[newMatIndex] = { ...mats[newMatIndex], quantidade: mats[newMatIndex].quantidade + applyChange };
            }
            return mats;
        });

        return prev.map(m => m.id === updatedMovement.id ? updatedMovement : m);
    });
  };

  const deleteMovement = (movementId: string) => {
    setMovements(prev => {
        const movementToDelete = prev.find(m => m.id === movementId);
        
        if (movementToDelete) {
             setMaterials(currentMaterials => {
                const mats = [...currentMaterials];
                const matIndex = mats.findIndex(m => m.nome === movementToDelete.material);
                if (matIndex >= 0) {
                    const change = movementToDelete.tipo === 'entrada' ? -movementToDelete.quantidade : movementToDelete.quantidade;
                    mats[matIndex] = { ...mats[matIndex], quantidade: mats[matIndex].quantidade + change };
                }
                return mats;
             });
        }
        
        return prev.filter(m => m.id !== movementId);
    });
  };

  const addMaterial = (material: Omit<Material, 'id' | 'entradas'>) => {
    const newMaterial: Material = { 
        ...material, 
        id: `MAT${Date.now()}`, 
        entradas: material.quantidade, 
    };
    setMaterials(prev => [newMaterial, ...prev]);
  };

  const updateMaterial = (updatedMaterial: Material) => {
    setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
  };

  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };
  
  const updateCollaboratorRole = (collaboratorId: string, newRole: UserRole) => {
    setCollaborators(prev => 
        prev.map(c => 
            c.id === collaboratorId ? { ...c, role: newRole } : c
        )
    );
  };

  const resetDatabase = () => {
      setMaterials(mockMateriais);
      setMovements(mockMovimentacoes);
      setCollaborators(mockColaboradores);
      setPartners(mockParceiros);
      setInvoices(mockNotasFiscais);
      localStorage.setItem('gestor_db_version', DB_VERSION);
  };

  const value = {
    materials,
    movements,
    collaborators,
    partners,
    invoices,
    addMovement,
    updateMovement,
    deleteMovement,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    updateMaterialStock,
    updateMaterialBatchValues,
    updateMaterialBatch,
    updateCollaboratorRole,
    resetDatabase,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};