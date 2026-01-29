import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, MoreHorizontal, Shield, User, Eye, Edit, Check, Users } from 'lucide-react';
import { ROLE_CONFIGS, AppRole, getRoleConfig } from '@/types/user';
import { toast } from '@/hooks/use-toast';

interface MockUser {
  id: number;
  nome: string;
  email: string;
  setor: string;
  perfil: AppRole;
  status: 'Ativo' | 'Inativo';
  ultimoAcesso: string;
}

const mockUsers: MockUser[] = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos.silva@h2m.com.br', setor: 'Comercial', perfil: 'admin', status: 'Ativo', ultimoAcesso: '27/01/2026 14:32' },
  { id: 2, nome: 'Roberto Mendes', email: 'roberto.mendes@h2m.com.br', setor: 'Financeiro', perfil: 'gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 11:15' },
  { id: 3, nome: 'Fernanda Alves', email: 'fernanda.alves@h2m.com.br', setor: 'Compras', perfil: 'gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 09:45' },
  { id: 4, nome: 'Bruno Martins', email: 'bruno.martins@h2m.com.br', setor: 'Marketing', perfil: 'gestor', status: 'Ativo', ultimoAcesso: '26/01/2026 18:20' },
  { id: 5, nome: 'André Souza', email: 'andre.souza@h2m.com.br', setor: 'Operações', perfil: 'gestor', status: 'Ativo', ultimoAcesso: '27/01/2026 10:00' },
  { id: 6, nome: 'Ana Costa', email: 'ana.costa@h2m.com.br', setor: 'Comercial', perfil: 'analista', status: 'Ativo', ultimoAcesso: '27/01/2026 13:55' },
  { id: 7, nome: 'Pedro Santos', email: 'pedro.santos@h2m.com.br', setor: 'Comercial', perfil: 'analista', status: 'Ativo', ultimoAcesso: '27/01/2026 12:30' },
  { id: 8, nome: 'Maria Lima', email: 'maria.lima@h2m.com.br', setor: 'Comercial', perfil: 'visualizador', status: 'Inativo', ultimoAcesso: '15/01/2026 16:00' },
];

const perfilIcons: Record<AppRole, React.ReactNode> = {
  admin: <Shield className="w-3 h-3" />,
  gestor: <Edit className="w-3 h-3" />,
  analista: <User className="w-3 h-3" />,
  visualizador: <Eye className="w-3 h-3" />,
};

const perfilColors: Record<AppRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  gestor: 'bg-accent text-accent-foreground',
  analista: 'bg-muted text-muted-foreground',
  visualizador: 'bg-muted/50 text-muted-foreground',
};

export function UsuariosSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserSetor, setNewUserSetor] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('analista');

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsersByRole = (role: AppRole) => users.filter(u => u.perfil === role && u.status === 'Ativo');

  const handleRoleChange = (userId: number, newRole: AppRole) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, perfil: newRole } : u
    ));
    const user = users.find(u => u.id === userId);
    toast({
      title: 'Perfil atualizado',
      description: `${user?.nome} agora é ${getRoleConfig(newRole).label}.`,
    });
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail || !newUserSetor) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }

    const newUser: MockUser = {
      id: Date.now(),
      nome: newUserName,
      email: newUserEmail,
      setor: newUserSetor,
      perfil: newUserRole,
      status: 'Ativo',
      ultimoAcesso: 'Nunca',
    };

    setUsers(prev => [...prev, newUser]);
    setNewUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserSetor('');
    setNewUserRole('analista');
    toast({ title: 'Usuário adicionado', description: `${newUserName} foi adicionado com sucesso.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total de Usuários</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{users.filter(u => u.status === 'Ativo').length}</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{users.filter(u => u.perfil === 'admin').length}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{users.filter(u => u.perfil === 'gestor').length}</p>
            <p className="text-sm text-muted-foreground">Gestores</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Management Board */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Quadro de Grupos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie usuários por grupo de permissão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ROLE_CONFIGS.map((roleConfig) => {
              const roleUsers = getUsersByRole(roleConfig.role);
              return (
                <div
                  key={roleConfig.role}
                  className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`gap-1 ${perfilColors[roleConfig.role]}`}>
                      {perfilIcons[roleConfig.role]}
                      {roleConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {roleUsers.length > 0 ? (
                      roleUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {user.nome.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="truncate flex-1">{user.nome.split(' ')[0]}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum usuário
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                    {roleUsers.length} usuário{roleUsers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar usuários..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-accent text-accent-foreground border-0">
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>Preencha os dados do novo usuário</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Ex: joao.silva@h2m.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={newUserSetor} onValueChange={setNewUserSetor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Compras">Compras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Perfil de Acesso</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_CONFIGS.map((config) => (
                      <SelectItem key={config.role} value={config.role}>
                        <div className="flex items-center gap-2">
                          {perfilIcons[config.role]}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setNewUserOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddUser} className="gradient-accent">Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {user.nome.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.nome}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.setor}</TableCell>
                  <TableCell>
                    <Select
                      value={user.perfil}
                      onValueChange={(value) => handleRoleChange(user.id, value as AppRole)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue>
                          <Badge className={`gap-1 ${perfilColors[user.perfil]}`}>
                            {perfilIcons[user.perfil]}
                            {getRoleConfig(user.perfil).label}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_CONFIGS.map((config) => (
                          <SelectItem key={config.role} value={config.role}>
                            <div className="flex items-center gap-2">
                              {perfilIcons[config.role]}
                              {config.label}
                              {user.perfil === config.role && <Check className="w-4 h-4 ml-auto" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.ultimoAcesso}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legenda de Perfis */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Níveis de Permissão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ROLE_CONFIGS.map((config) => (
              <div key={config.role} className="p-3 rounded-lg border border-border">
                <Badge className={`gap-1 mb-2 ${perfilColors[config.role]}`}>
                  {perfilIcons[config.role]}
                  {config.label}
                </Badge>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
