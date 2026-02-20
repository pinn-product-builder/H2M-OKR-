import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock,
  Webhook
} from 'lucide-react';
import { ImportLog } from '@/types/dataHub';

interface ImportMonitorDashboardProps {
  logs: ImportLog[];
}

export function ImportMonitorDashboard({ logs }: ImportMonitorDashboardProps) {
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const partial = logs.filter(l => l.status === 'partial').length;
    const error = logs.filter(l => l.status === 'error').length;
    const rolledBack = logs.filter(l => l.status === 'rolled_back').length;
    const totalRows = logs.reduce((sum, l) => sum + l.totalRows, 0);
    const processedRows = logs.reduce((sum, l) => sum + l.processedRows, 0);
    const errorRows = logs.reduce((sum, l) => sum + l.errorRows, 0);
    const successRate = total > 0 ? ((success / total) * 100) : 0;
    
    // By type
    const byType: Record<string, number> = {};
    logs.forEach(l => {
      byType[l.importType] = (byType[l.importType] || 0) + 1;
    });

    // By target table
    const byTable: Record<string, number> = {};
    logs.forEach(l => {
      byTable[l.targetTable] = (byTable[l.targetTable] || 0) + 1;
    });

    // Recent errors (last 5)
    const recentErrors = logs
      .filter(l => l.status === 'error' || l.status === 'partial')
      .slice(0, 5);

    // Last 7 days volume
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const volumeByDay = last7Days.map(day => {
      const dayLogs = logs.filter(l => l.startedAt.startsWith(day));
      return {
        day: day.slice(5), // MM-DD
        count: dayLogs.length,
        rows: dayLogs.reduce((s, l) => s + l.processedRows, 0),
      };
    });

    return { total, success, partial, error, rolledBack, totalRows, processedRows, errorRows, successRate, byType, byTable, recentErrors, volumeByDay };
  }, [logs]);

  const maxVolume = Math.max(...stats.volumeByDay.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Importações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processedRows.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">Linhas Processadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-critical/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-critical" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.errorRows.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">Linhas com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Volume Chart (simplified bar chart) */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Volume (últimos 7 dias)</CardTitle>
            <CardDescription>Importações por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {stats.volumeByDay.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{day.count}</span>
                  <div 
                    className="w-full rounded-t bg-primary/80 transition-all min-h-[4px]"
                    style={{ height: `${(day.count / maxVolume) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status das Importações</CardTitle>
            <CardDescription>Distribuição por resultado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow label="Sucesso" count={stats.success} total={stats.total} color="bg-success" />
            <StatusRow label="Parcial" count={stats.partial} total={stats.total} color="bg-warning" />
            <StatusRow label="Erro" count={stats.error} total={stats.total} color="bg-critical" />
            <StatusRow label="Revertido" count={stats.rolledBack} total={stats.total} color="bg-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* By type and recent errors */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por Tipo de Arquivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {type === 'webhook' ? (
                      <Webhook className="w-4 h-4 text-accent" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm uppercase">{type}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {Object.keys(stats.byType).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma importação registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Erros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentErrors.map(log => (
                <div key={log.id} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${log.status === 'error' ? 'text-critical' : 'text-warning'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{log.sourceFile}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.errorRows} erro(s) • {new Date(log.startedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentErrors.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Nenhum erro recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}