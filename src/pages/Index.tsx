import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OKRsSection } from '@/components/sections/OKRsSection';
import { IndicadoresSection } from '@/components/sections/IndicadoresSection';
import { UsuariosSection } from '@/components/sections/UsuariosSection';
import { ConfiguracoesSection } from '@/components/sections/ConfiguracoesSection';
import { DataSourceSection } from '@/components/sections/DataSourceSection';
import { cn } from '@/lib/utils';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral dos OKRs e indicadores' },
  okrs: { title: 'Gestão de OKRs', subtitle: 'Cadastro e acompanhamento de objetivos' },
  indicadores: { title: 'Indicadores', subtitle: 'KPIs e métricas do negócio' },
  datasource: { title: 'Data Source', subtitle: 'Fontes de dados e importação de métricas' },
  usuarios: { title: 'Usuários', subtitle: 'Gerenciamento de usuários e permissões' },
  configuracoes: { title: 'Configurações', subtitle: 'Configurações do sistema' },
};

const Index = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { title, subtitle } = sectionTitles[currentSection] || sectionTitles.dashboard;

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        "ml-64" // Default sidebar width
      )}>
        <Header title={title} subtitle={subtitle} />
        
        <div className="p-6">
          {currentSection === 'dashboard' && <Dashboard />}
          {currentSection === 'okrs' && <OKRsSection />}
          {currentSection === 'indicadores' && <IndicadoresSection />}
          {currentSection === 'datasource' && <DataSourceSection />}
          {currentSection === 'usuarios' && <UsuariosSection />}
          {currentSection === 'configuracoes' && <ConfiguracoesSection />}
        </div>
      </main>
    </div>
  );
};

export default Index;
