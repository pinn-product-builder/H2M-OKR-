import { useSectors, useCycles, useObjectives, useArchivedObjectives, useUpdateObjective, useProfiles } from '@/hooks/useSupabaseData';
import { useUserViews, useDefaultView, useUpdateView } from '@/hooks/useViews';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { NewOKRForm } from '@/components/okr/NewOKRForm';
import { CycleManager } from '@/components/okr/CycleManager';
import { ViewSelector } from '@/components/views/ViewSelector';
import { SaveViewDialog } from '@/components/views/SaveViewDialog';
import { ViewManager } from '@/components/views/ViewManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, LayoutGrid, List, Target, CheckCircle, AlertTriangle, AlertCircle, FolderArchive, RotateCcw, Loader2, User, GitBranch } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { OKRTreeView } from '@/components/okr/OKRTreeView';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { calculateKRProgress, calculateOKRProgressFromKRs, getStatusFromProgress } from '@/lib/okr-calculations';
import type { OKRViewFilters, UserView } from '@/types/views';

export function OKRsSection() {
  const { data: sectors = [], isLoading: sectorsLoading } = useSectors();
  const { data: profiles = [] } = useProfiles();
  const { data: cycles = [], isLoading: cyclesLoading } = useCycles();
  const { data: archivedObjectives = [] } = useArchivedObjectives();
  const { data: defaultView } = useDefaultView('okr');
  const updateView = useUpdateView();
  const updateObjective = useUpdateObjective();
  const queryClient = useQueryClient();
  const [unarchivingCycleId, setUnarchivingCycleId] = useState<string | null>(null);

  const handleUnarchiveCycle = async (cycleId: string, cycleName: string) => {
    setUnarchivingCycleId(cycleId);
    try {
      const { error: cycleError } = await supabase
        .from('okr_cycles')
        .update({ is_archived: false })
        .eq('id', cycleId);

      if (cycleError) throw cycleError;

      const { error: objError } = await supabase
        .from('objectives')
        .update({ is_archived: false })
        .eq('cycle_id', cycleId);

      if (objError) throw objError;

      await queryClient.invalidateQueries({ queryKey: ['cycles'] });
      await queryClient.invalidateQueries({ queryKey: ['archived-objectives'] });
      await queryClient.invalidateQueries({ queryKey: ['objectives'] });

      setSelectedCycleId(cycleId);
      setActiveTab('ativos');

      toast({
        title: 'Ciclo restaurado',
        description: `"${cycleName}" e seus OKRs foram restaurados com sucesso.`,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível desarquivar o ciclo.',
        variant: 'destructive',
      });
    } finally {
      setUnarchivingCycleId(null);
    }
  };

  const getOKRCountForCycle = useCallback((cycleId: string) => {
    return archivedObjectives.filter((obj) => obj.cycle_id === cycleId).length;
  }, [archivedObjectives]);

  // View state
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('ativos');
  
  const activeCycles = useMemo(() => cycles.filter(c => !c.is_archived), [cycles]);
  const archivedCycles = useMemo(() => cycles.filter(c => c.is_archived), [cycles]);
  
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // Load default view on mount
  useEffect(() => {
    if (defaultView && !selectedViewId) {
      applyViewFilters(defaultView);
      setSelectedViewId(defaultView.id);
    }
  }, [defaultView]);

  // Set default cycle when cycles load
  useEffect(() => {
    if (activeCycles.length > 0 && !selectedCycleId) {
      const activeCycle = activeCycles.find(c => c.is_active);
      setSelectedCycleId(activeCycle?.id || activeCycles[0]?.id || '');
    }
  }, [activeCycles, selectedCycleId]);

  // Apply filters from a saved view
  const applyViewFilters = useCallback((view: UserView) => {
    const filters = view.filters as OKRViewFilters;
    if (filters.cycleId) setSelectedCycleId(filters.cycleId);
    if (filters.status && filters.status.length === 1) {
      setStatusFilter(filters.status[0]);
    } else {
      setStatusFilter('all');
    }
    if (filters.search !== undefined) setSearchTerm(filters.search);
    if (filters.viewMode) setViewMode(filters.viewMode);
    setHasUnsavedChanges(false);
  }, []);

  // Get current filters as object
  const getCurrentFilters = useCallback((): OKRViewFilters => ({
    cycleId: selectedCycleId,
    status: statusFilter === 'all' ? [] : [statusFilter as OKRViewFilters['status'][0]],
    search: searchTerm,
    viewMode,
  }), [selectedCycleId, statusFilter, searchTerm, viewMode]);

  // Handle view selection
  const handleSelectView = useCallback((view: UserView | null) => {
    if (view) {
      setSelectedViewId(view.id);
      applyViewFilters(view);
    } else {
      setSelectedViewId(null);
      // Reset to defaults
      setStatusFilter('all');
      setSearchTerm('');
      setViewMode('grid');
      setHasUnsavedChanges(false);
    }
  }, [applyViewFilters]);

  // Track changes
  const handleFilterChange = useCallback(() => {
    if (selectedViewId) {
      setHasUnsavedChanges(true);
    }
  }, [selectedViewId]);

  const { data: objectives = [], isLoading: objectivesLoading } = useObjectives(selectedCycleId);

  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
      const matchesOwner = ownerFilter === 'all' || obj.owner_id === ownerFilter;
      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [objectives, searchTerm, statusFilter, ownerFilter]);

  const filteredArchivedObjectives = useMemo(() => {
    return archivedObjectives.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [archivedObjectives, searchTerm]);

  const stats = useMemo(() => {
    const withCalc = objectives.map(o => {
      const progress = calculateOKRProgressFromKRs(o.key_results || []);
      return getStatusFromProgress(progress);
    });
    return {
      total: objectives.length,
      onTrack: withCalc.filter(s => s === 'on-track' || s === 'completed').length,
      attention: withCalc.filter(s => s === 'attention').length,
      critical: withCalc.filter(s => s === 'critical').length,
    };
  }, [objectives]);

  const restoreObjective = async (id: string) => {
    await updateObjective.mutateAsync({ id, is_archived: false });
  };

  const getSectorLabel = (sectorId?: string) => {
    if (!sectorId) return '';
    const sector = sectors.find(s => s.id === sectorId);
    return sector?.name || '';
  };

  const getSelectedCycleName = () => {
    const cycle = activeCycles.find(c => c.id === selectedCycleId);
    return cycle?.name || '';
  };

  const isLoading = sectorsLoading || cyclesLoading || objectivesLoading;

  if (isLoading && objectives.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total de OKRs</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.onTrack}</p>
              <p className="text-sm text-muted-foreground">No Prazo</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.attention}</p>
              <p className="text-sm text-muted-foreground">Atenção</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-critical">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-critical/10">
              <AlertCircle className="w-5 h-5 text-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-critical">{stats.critical}</p>
              <p className="text-sm text-muted-foreground">Crítico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="ativos" className="gap-2">
            <Target className="w-4 h-4" />
            Ativos ({objectives.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <FolderArchive className="w-4 h-4" />
            Histórico ({archivedObjectives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="mt-4 space-y-4">
          {/* View Selector Row */}
          <div className="flex items-center gap-3">
            <ViewSelector
              type="okr"
              selectedViewId={selectedViewId}
              onSelectView={handleSelectView}
              onSaveView={() => setSaveDialogOpen(true)}
              onManageViews={() => setManagerOpen(true)}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            <Select value={selectedCycleId} onValueChange={(value) => {
              setSelectedCycleId(value);
              handleFilterChange();
            }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {activeCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    <div className="flex items-center gap-2">
                      <span>{cycle.name}</span>
                      {cycle.is_active && (
                        <span className="w-2 h-2 rounded-full bg-success" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CycleManager />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar OKRs..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="on-track">No Prazo</SelectItem>
                  <SelectItem value="attention">Atenção</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ownerFilter} onValueChange={(value) => {
                setOwnerFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger className="w-[190px]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Responsável" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => {
                    setViewMode('grid');
                    handleFilterChange();
                  }}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => {
                    setViewMode('list');
                    handleFilterChange();
                  }}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <NewOKRForm />
            </div>
          </div>

          {/* OKRs Content */}
          <div>
            {filteredObjectives.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredObjectives.map((objective, index) => (
                  <OKRCard 
                    key={objective.id}
                    rawObjective={objective}
                    objective={(() => {
                      const krs = objective.key_results || [];
                      const okrProgress = calculateOKRProgressFromKRs(krs);
                      return {
                        id: objective.id,
                        title: objective.title,
                        description: objective.description || '',
                        sector: objective.sector_id || '',
                        owner: objective.owner?.name || '',
                        period: getSelectedCycleName(),
                        priority: (objective.priority as 'high' | 'medium' | 'low') || 'medium',
                        progress: okrProgress,
                        status: getStatusFromProgress(okrProgress) as any,
                        createdAt: objective.created_at,
                        updatedAt: objective.updated_at,
                        keyResults: krs.map(kr => {
                          const krProgress = calculateKRProgress(kr.current_value, kr.target_value, kr.type, kr.tasks);
                          return {
                            id: kr.id,
                            title: kr.title,
                            type: kr.type as any,
                            current: kr.current_value,
                            target: kr.target_value,
                            baseline: kr.baseline_value ?? 0,
                            unit: kr.unit || '',
                            owner: kr.owner?.name || '',
                            progress: krProgress,
                            status: getStatusFromProgress(krProgress) as any,
                            lastUpdate: kr.updated_at,
                            tasks: (kr.tasks || []).map(t => ({
                              id: t.id,
                              title: t.title,
                              description: t.description,
                              assignedTo: t.assignee_id || '',
                              assignedToName: t.assignee?.name || '',
                              dueDate: t.due_date,
                              priority: t.priority as any,
                              status: t.status as any,
                              createdAt: t.created_at,
                              completedAt: t.completed_at,
                              parentKRId: t.key_result_id,
                              parentOKRId: objective.id,
                            })),
                          };
                        }),
                      };
                    })()} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <p>Nenhum OKR encontrado para este ciclo.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar no histórico..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredArchivedObjectives.length > 0 ? (
            <div className="space-y-3">
              {filteredArchivedObjectives.map((objective) => (
                <div
                  key={objective.id}
                  className="card-elevated p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {getSectorLabel(objective.sector_id)}
                      </span>
                    </div>
                    <p className="font-medium truncate">{objective.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Progresso final: {objective.progress}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => restoreObjective(objective.id)}
                    disabled={updateObjective.isPending}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <FolderArchive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum OKR arquivado.</p>
              <p className="text-sm">OKRs concluídos (100%) podem ser arquivados para histórico.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {archivedCycles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderArchive className="w-4 h-4" />
            <span>
              {archivedCycles.length} ciclo{archivedCycles.length !== 1 ? 's' : ''} arquivado{archivedCycles.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {archivedCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed"
              >
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{cycle.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getOKRCountForCycle(cycle.id)} OKR{getOKRCountForCycle(cycle.id) !== 1 ? 's' : ''})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs"
                  disabled={unarchivingCycleId === cycle.id}
                  onClick={() => handleUnarchiveCycle(cycle.id, cycle.name)}
                >
                  {unarchivingCycleId === cycle.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Desarquivar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <SaveViewDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        type="okr"
        filters={getCurrentFilters()}
        onSuccess={() => setHasUnsavedChanges(false)}
      />

      <ViewManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        type="okr"
        onSelectView={handleSelectView}
      />
    </div>
  );
}
