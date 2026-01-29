import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Objective, OKRCycle, Task, SectorConfig } from '@/types/okr';
import { mockObjectives } from '@/data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  sector?: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'manual';
  status: 'connected' | 'error' | 'pending';
  lastSync: string;
  records: number;
  tables: string[];
}

interface ImportHistory {
  id: string;
  source: string;
  date: string;
  records: number;
  status: 'success' | 'error';
  user: string;
}

interface AppContextType {
  // OKRs
  objectives: Objective[];
  archivedObjectives: Objective[];
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'> & { keyResults: any[] }) => void;
  updateObjectiveProgress: (id: string, progress: number) => void;
  archiveObjective: (id: string) => void;
  restoreObjective: (id: string) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  
  // Sectors
  sectors: SectorConfig[];
  addSector: (sector: Omit<SectorConfig, 'id' | 'createdAt'>) => void;
  updateSector: (id: string, data: Partial<SectorConfig>) => void;
  deleteSector: (id: string) => void;
  
  // Users (for task assignment)
  users: User[];
  
  // Cycles
  cycles: OKRCycle[];
  archivedCycles: OKRCycle[];
  addCycle: (cycle: Omit<OKRCycle, 'id' | 'createdAt'>) => void;
  updateCycle: (id: string, data: Partial<OKRCycle>) => void;
  deleteCycle: (id: string) => void;
  archiveCycle: (id: string) => void;
  
  // Data Sources
  dataSources: DataSource[];
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  removeDataSource: (id: string) => void;
  syncDataSource: (id: string) => void;
  
  // Import History
  importHistory: ImportHistory[];
  addImportRecord: (record: Omit<ImportHistory, 'id'>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'warning' | 'error') => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  timestamp: Date;
}

const initialUsers: User[] = [
  { id: 'user-1', name: 'Carlos Silva', email: 'carlos@h2m.com', role: 'Gerente', sector: 'comercial' },
  { id: 'user-2', name: 'Ana Costa', email: 'ana@h2m.com', role: 'Analista', sector: 'comercial' },
  { id: 'user-3', name: 'Pedro Santos', email: 'pedro@h2m.com', role: 'Vendedor', sector: 'comercial' },
  { id: 'user-4', name: 'Maria Lima', email: 'maria@h2m.com', role: 'Analista', sector: 'financeiro' },
  { id: 'user-5', name: 'Roberto Mendes', email: 'roberto@h2m.com', role: 'Diretor', sector: 'financeiro' },
  { id: 'user-6', name: 'Fernanda Alves', email: 'fernanda@h2m.com', role: 'Gerente', sector: 'compras' },
  { id: 'user-7', name: 'Bruno Martins', email: 'bruno@h2m.com', role: 'Coordenador', sector: 'marketing' },
  { id: 'user-8', name: 'André Souza', email: 'andre@h2m.com', role: 'Gerente', sector: 'operacoes' },
];

const initialSectors: SectorConfig[] = [
  { id: 'sector-1', name: 'Comercial', slug: 'comercial', createdAt: '2025-01-01', createdBy: 'admin-1' },
  { id: 'sector-2', name: 'Financeiro', slug: 'financeiro', createdAt: '2025-01-01', createdBy: 'admin-1' },
  { id: 'sector-3', name: 'Marketing', slug: 'marketing', createdAt: '2025-01-01', createdBy: 'admin-1' },
  { id: 'sector-4', name: 'Compras', slug: 'compras', createdAt: '2025-01-01', createdBy: 'admin-1' },
  { id: 'sector-5', name: 'Operações', slug: 'operacoes', createdAt: '2025-01-01', createdBy: 'admin-1' },
  { id: 'sector-6', name: 'Diretoria', slug: 'diretoria', createdAt: '2025-01-01', createdBy: 'admin-1' },
];

const initialDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Planilha Faturamento',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-28 09:15',
    records: 1250,
    tables: ['Faturamento Mensal'],
  },
  {
    id: '2',
    name: 'Planilha Custos Operacionais',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-27 14:00',
    records: 890,
    tables: ['Custos', 'DRE'],
  },
  {
    id: '3',
    name: 'Planilha Estoque',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-28 08:00',
    records: 3420,
    tables: ['Giro de Estoque', 'Curva ABC'],
  },
  {
    id: '4',
    name: 'Planilha Leads Marketing',
    type: 'csv',
    status: 'connected',
    lastSync: '2026-01-28 10:30',
    records: 520,
    tables: ['Leads', 'Campanhas'],
  },
  {
    id: '5',
    name: 'Entrada Manual - Metas',
    type: 'manual',
    status: 'connected',
    lastSync: '2026-01-27 16:45',
    records: 85,
    tables: ['Metas por Setor'],
  },
];

const initialImportHistory: ImportHistory[] = [
  { id: '1', source: 'Planilha Faturamento', date: '2026-01-28 09:15', records: 125, status: 'success', user: 'Carlos Silva' },
  { id: '2', source: 'Planilha Custos Operacionais', date: '2026-01-27 14:00', records: 89, status: 'success', user: 'Roberto Mendes' },
  { id: '3', source: 'Planilha Estoque', date: '2026-01-28 08:00', records: 342, status: 'success', user: 'Fernanda Alves' },
  { id: '4', source: 'Planilha Leads Marketing', date: '2026-01-28 10:30', records: 52, status: 'success', user: 'Bruno Martins' },
  { id: '5', source: 'Entrada Manual - Metas', date: '2026-01-27 16:45', records: 12, status: 'success', user: 'Ana Costa' },
];

const initialCycles: OKRCycle[] = [
  { id: 'q1-2026', label: 'Q1 2026', startDate: '2026-01-01', endDate: '2026-03-31', isActive: true, isArchived: false, createdAt: '2025-12-01' },
  { id: 'q2-2026', label: 'Q2 2026', startDate: '2026-04-01', endDate: '2026-06-30', isActive: false, isArchived: false, createdAt: '2025-12-01' },
  { id: 'q3-2026', label: 'Q3 2026', startDate: '2026-07-01', endDate: '2026-09-30', isActive: false, isArchived: false, createdAt: '2025-12-01' },
  { id: 'q4-2026', label: 'Q4 2026', startDate: '2026-10-01', endDate: '2026-12-31', isActive: false, isArchived: false, createdAt: '2025-12-01' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [objectives, setObjectives] = useState<Objective[]>(mockObjectives);
  const [archivedObjectives, setArchivedObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sectors, setSectors] = useState<SectorConfig[]>(initialSectors);
  const [users] = useState<User[]>(initialUsers);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>(initialImportHistory);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cycles, setCycles] = useState<OKRCycle[]>(initialCycles);
  const [archivedCycles, setArchivedCycles] = useState<OKRCycle[]>([]);

  const addObjective = (newOkr: Omit<Objective, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'> & { keyResults: any[] }) => {
    const now = new Date().toISOString().split('T')[0];
    const objective: Objective = {
      ...newOkr,
      id: `okr-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      progress: 0,
      status: 'on-track',
      keyResults: newOkr.keyResults.map((kr, index) => ({
        ...kr,
        id: `kr-${Date.now()}-${index}`,
        current: 0,
        progress: 0,
        status: 'on-track' as const,
        lastUpdate: now,
      })),
    };
    setObjectives(prev => [objective, ...prev]);
    addNotification(`OKR "${objective.title}" criado com sucesso!`, 'success');
  };

  const updateObjectiveProgress = (id: string, progress: number) => {
    setObjectives(prev => prev.map(obj => {
      if (obj.id === id) {
        const status = progress >= 70 ? 'on-track' : progress >= 40 ? 'attention' : 'critical';
        return { ...obj, progress, status, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return obj;
    }));
  };

  const archiveObjective = (id: string) => {
    const objToArchive = objectives.find(o => o.id === id);
    if (objToArchive) {
      setObjectives(prev => prev.filter(o => o.id !== id));
      setArchivedObjectives(prev => [...prev, { 
        ...objToArchive, 
        isArchived: true, 
        archivedAt: new Date().toISOString().split('T')[0] 
      }]);
      addNotification(`OKR "${objToArchive.title}" foi arquivado.`, 'success');
    }
  };

  const restoreObjective = (id: string) => {
    const objToRestore = archivedObjectives.find(o => o.id === id);
    if (objToRestore) {
      setArchivedObjectives(prev => prev.filter(o => o.id !== id));
      setObjectives(prev => [...prev, { ...objToRestore, isArchived: false, archivedAt: undefined }]);
      addNotification(`OKR "${objToRestore.title}" foi restaurado.`, 'success');
    }
  };

  // Task management
  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    addNotification(`Tarefa "${task.title}" criada!`, 'success');
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { 
          ...t, 
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    }));
  };

  // Sector management
  const addSector = (sector: Omit<SectorConfig, 'id' | 'createdAt'>) => {
    const newSector: SectorConfig = {
      ...sector,
      id: `sector-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSectors(prev => [...prev, newSector]);
  };

  const updateSector = (id: string, data: Partial<SectorConfig>) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSector = (id: string) => {
    setSectors(prev => prev.filter(s => s.id !== id));
  };

  // Cycle management functions
  const addCycle = (cycle: Omit<OKRCycle, 'id' | 'createdAt'>) => {
    const newCycle: OKRCycle = {
      ...cycle,
      id: `cycle-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCycles(prev => [...prev, newCycle]);
  };

  const updateCycle = (id: string, data: Partial<OKRCycle>) => {
    setCycles(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCycle = (id: string) => {
    setCycles(prev => prev.filter(c => c.id !== id));
  };

  const archiveCycle = (id: string) => {
    const cycleToArchive = cycles.find(c => c.id === id);
    if (cycleToArchive) {
      setCycles(prev => prev.filter(c => c.id !== id));
      setArchivedCycles(prev => [...prev, { ...cycleToArchive, isArchived: true }]);
    }
  };

  const addDataSource = (source: Omit<DataSource, 'id'>) => {
    const newSource: DataSource = {
      ...source,
      id: `ds-${Date.now()}`,
    };
    setDataSources(prev => [...prev, newSource]);
    addNotification(`Fonte "${source.name}" adicionada com sucesso!`, 'success');
  };

  const removeDataSource = (id: string) => {
    const source = dataSources.find(ds => ds.id === id);
    setDataSources(prev => prev.filter(ds => ds.id !== id));
    if (source) {
      addNotification(`Fonte "${source.name}" removida.`, 'warning');
    }
  };

  const syncDataSource = (id: string) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    
    setDataSources(prev => prev.map(ds => {
      if (ds.id === id) {
        const newRecords = ds.records + Math.floor(Math.random() * 50);
        const record: ImportHistory = {
          id: `imp-${Date.now()}`,
          source: ds.name,
          date: formattedDate,
          records: Math.floor(Math.random() * 100) + 10,
          status: 'success',
          user: 'Sistema',
        };
        setImportHistory(prev => [record, ...prev]);
        return { ...ds, lastSync: formattedDate, records: newRecords, status: 'connected' as const };
      }
      return ds;
    }));
    
    const source = dataSources.find(ds => ds.id === id);
    if (source) {
      addNotification(`"${source.name}" sincronizada com sucesso!`, 'success');
    }
  };

  const addImportRecord = (record: Omit<ImportHistory, 'id'>) => {
    const newRecord: ImportHistory = {
      ...record,
      id: `imp-${Date.now()}`,
    };
    setImportHistory(prev => [newRecord, ...prev]);
  };

  const addNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  };

  return (
    <AppContext.Provider value={{
      objectives,
      archivedObjectives,
      addObjective,
      updateObjectiveProgress,
      archiveObjective,
      restoreObjective,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      sectors,
      addSector,
      updateSector,
      deleteSector,
      users,
      cycles,
      archivedCycles,
      addCycle,
      updateCycle,
      deleteCycle,
      archiveCycle,
      dataSources,
      addDataSource,
      removeDataSource,
      syncDataSource,
      importHistory,
      addImportRecord,
      notifications,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
