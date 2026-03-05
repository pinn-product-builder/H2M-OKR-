import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Database, Bell, Shield, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SectorManager } from '@/components/settings/SectorManager';
import { toast } from '@/hooks/use-toast';

const TEMPLATE_COLUMNS: Record<string, string[]> = {
  'Faturamento': ['data', 'cliente', 'produto', 'quantidade', 'valor_unitario', 'valor_total', 'regiao'],
  'Custos Operacionais': ['data', 'categoria', 'descricao', 'valor', 'centro_custo', 'tipo'],
  'Estoque': ['data', 'produto', 'sku', 'quantidade', 'valor_unitario', 'localizacao', 'lote'],
  'Metas OKR': ['objetivo', 'key_result', 'tipo', 'meta', 'baseline', 'unidade', 'responsavel', 'setor'],
  'Leads Marketing': ['data', 'nome', 'email', 'telefone', 'origem', 'status', 'valor_estimado'],
};

function generateCSVTemplate(templateName: string): string {
  const columns = TEMPLATE_COLUMNS[templateName] || ['coluna1', 'coluna2', 'coluna3'];
  const header = columns.join(';');
  const exampleRow = columns.map(() => '').join(';');
  return `${header}\n${exampleRow}\n`;
}

function downloadTemplate(templateName: string) {
  const csv = generateCSVTemplate(templateName);
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `template_${templateName.toLowerCase().replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ConfiguracoesSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Aba Geral - state
  const [companyName, setCompanyName] = useState('H2M Embalagens');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [okrCycle, setOkrCycle] = useState('trimestral');
  const [timezone, setTimezone] = useState('america-sao-paulo');
  const [savingGeral, setSavingGeral] = useState(false);

  // Aba Integracao - state
  const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');
  const [csvSeparator, setCsvSeparator] = useState('semicolon');
  const [fileEncoding, setFileEncoding] = useState('utf8');
  const [savingIntegracao, setSavingIntegracao] = useState(false);

  // Aba Notificacoes - state
  const [notifications, setNotifications] = useState({
    criticalOkr: true,
    checkpointNear: true,
    newCycle: true,
    krUpdate: false,
    weeklyReport: true,
  });

  // Aba Seguranca - state
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState('8h');
  const [auditActions, setAuditActions] = useState(true);
  const [logRetention, setLogRetention] = useState('1ano');

  const handleSaveGeral = async () => {
    setSavingGeral(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingGeral(false);
    toast({
      title: 'Configurações salvas',
      description: 'As informações da empresa foram atualizadas com sucesso.',
    });
  };

  const handleSaveIntegracao = async () => {
    setSavingIntegracao(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingIntegracao(false);
    toast({
      title: 'Configurações salvas',
      description: 'As configurações de importação foram atualizadas.',
    });
  };

  const handleDownloadTemplate = (templateName: string) => {
    downloadTemplate(templateName);
    toast({
      title: 'Download iniciado',
      description: `Template "${templateName}" baixado com sucesso.`,
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: value ? 'Notificação ativada' : 'Notificação desativada',
      description: `Preferência atualizada com sucesso.`,
    });
  };

  const handleSecuritySwitch = (setter: (v: boolean) => void, label: string, value: boolean) => {
    setter(value);
    toast({
      title: 'Segurança atualizada',
      description: `${label} foi ${value ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleSecuritySelect = (setter: (v: string) => void, label: string, value: string) => {
    setter(value);
    toast({
      title: 'Segurança atualizada',
      description: `${label} atualizado com sucesso.`,
    });
  };

  const notificationItems = [
    { key: 'criticalOkr' as const, label: 'OKR atinge status crítico', desc: 'Quando um OKR fica abaixo de 30% do esperado' },
    { key: 'checkpointNear' as const, label: 'Checkpoint próximo', desc: 'Lembrete 2 dias antes de um checkpoint agendado' },
    { key: 'newCycle' as const, label: 'Novo ciclo de OKRs', desc: 'Quando um novo ciclo trimestral começa' },
    { key: 'krUpdate' as const, label: 'Atualização de KR', desc: 'Quando um Key Result é atualizado por outro usuário' },
    { key: 'weeklyReport' as const, label: 'Relatório semanal', desc: 'Resumo semanal do progresso dos OKRs' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          {isAdmin && <TabsTrigger value="setores">Setores</TabsTrigger>}
        </TabsList>

        <TabsContent value="geral" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>Dados gerais da organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ciclo de OKRs Padrão</Label>
                <Select value={okrCycle} onValueChange={setOkrCycle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao-paulo">América/São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-manaus">América/Manaus (GMT-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="gradient-accent text-accent-foreground border-0"
                onClick={handleSaveGeral}
                disabled={savingGeral}
              >
                {savingGeral ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5" />
                Importação de Planilhas
              </CardTitle>
              <CardDescription>Configure a importação de dados via arquivos CSV/Excel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">Sistema Configurado</p>
                    <p className="text-sm text-muted-foreground">Última importação: 28/01/2026 às 09:15</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-success border-success">Ativo</Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Formato de Data Padrão</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Separador de CSV</Label>
                <Select value={csvSeparator} onValueChange={setCsvSeparator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semicolon">Ponto e vírgula (;)</SelectItem>
                    <SelectItem value="comma">Vírgula (,)</SelectItem>
                    <SelectItem value="tab">Tabulação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Codificação de Arquivo</Label>
                <Select value={fileEncoding} onValueChange={setFileEncoding}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utf8">UTF-8</SelectItem>
                    <SelectItem value="latin1">ISO-8859-1 (Latin-1)</SelectItem>
                    <SelectItem value="windows">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="gradient-accent text-accent-foreground border-0"
                onClick={handleSaveIntegracao}
                disabled={savingIntegracao}
              >
                {savingIntegracao ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Templates de Importação</CardTitle>
              <CardDescription>Baixe os modelos padronizados para cada tipo de dado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.keys(TEMPLATE_COLUMNS).map((template) => (
                  <Button
                    key={template}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    <Download className="w-4 h-4 mr-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{template}</div>
                      <div className="text-xs text-muted-foreground">template_{template.toLowerCase().replace(/\s+/g, '_')}.csv</div>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Use estes templates para garantir que seus dados sejam importados corretamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-6 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Políticas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de dois fatores (2FA)</p>
                  <p className="text-sm text-muted-foreground">Exigir 2FA para todos os usuários</p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={(v) => handleSecuritySwitch(setTwoFactor, 'Autenticação 2FA', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expiração de sessão</p>
                  <p className="text-sm text-muted-foreground">Deslogar após período de inatividade</p>
                </div>
                <Select
                  value={sessionExpiry}
                  onValueChange={(v) => handleSecuritySelect(setSessionExpiry, 'Expiração de sessão', v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="4h">4 horas</SelectItem>
                    <SelectItem value="8h">8 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auditoria de ações</p>
                  <p className="text-sm text-muted-foreground">Registrar todas as alterações em OKRs</p>
                </div>
                <Switch
                  checked={auditActions}
                  onCheckedChange={(v) => handleSecuritySwitch(setAuditActions, 'Auditoria de ações', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Retenção de logs</p>
                  <p className="text-sm text-muted-foreground">Período de armazenamento dos logs de auditoria</p>
                </div>
                <Select
                  value={logRetention}
                  onValueChange={(v) => handleSecuritySelect(setLogRetention, 'Retenção de logs', v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3meses">3 meses</SelectItem>
                    <SelectItem value="6meses">6 meses</SelectItem>
                    <SelectItem value="1ano">1 ano</SelectItem>
                    <SelectItem value="2anos">2 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="setores" className="mt-6 space-y-6">
            <SectorManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
