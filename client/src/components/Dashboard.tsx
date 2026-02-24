import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useSectionsStore, useWebhooksStore, useUIStore } from '../store';
import { sectionsService, webhooksService, configService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Settings,
  Save,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Edit3,
  Trash2,
  GripVertical,
  Users,
  Loader
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionModal from './modals/SectionModal';
import SettingsModal from './modals/SettingsModal';
import UsersModal from './modals/UsersModal';
import StatsModal from './modals/StatsModal';

interface SortableSectionProps {
  section: any;
  onEdit: (section: any) => void;
  onDelete: (id: number) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden"
    >
      {/* Header com drag handle */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Arrastar para reordenar"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
            <span className="text-xs font-medium text-gray-500">#{section.order}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(section)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            title="Editar seção"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Excluir seção"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-1">
          {section.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
          {section.content}
        </p>
      </div>

      {/* Footer com indicador de tamanho */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{section.content.length} caracteres</span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sections, setSections, removeSection, reorderSections, setLoading } = useSectionsStore();
  const { setWebhooks } = useWebhooksStore();
  const { isModalOpen, modalType, selectedSection, setModalOpen } = useUIStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionsData, webhooksData] = await Promise.all([
        sectionsService.getSections(),
        webhooksService.getWebhooks()
      ]);
      setSections(sectionsData);
      setWebhooks(webhooksData);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }, [setSections, setWebhooks, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSection = () => {
    setModalOpen(true, 'section', null);
  };

  const handleEditSection = (section: any) => {
    setModalOpen(true, 'section', section);
  };

  const handleDeleteSection = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta seção?')) {
      try {
        await sectionsService.deleteSection(id);
        removeSection(id);
        toast.success('Seção excluída com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao excluir seção: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);

      // Atualizar ordem localmente primeiro
      reorderSections(newSections);

      try {
        // Enviar apenas os IDs e ordem para o backend
        const sectionsToSend: { id: number; order: number }[] = newSections.map((section, index) => ({
          id: section.id,
          order: index + 1
        }));

        await sectionsService.reorderSections(sectionsToSend);
        toast.success('Seções reordenadas com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao reordenar seções: ' + (error.response?.data?.error || error.message));
        // Reverter mudanças em caso de erro
        loadData();
      }
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const response = await configService.saveConfiguration();
      toast.success('Configuração salva e webhook disparado com sucesso!');
      console.log('Resposta do webhook:', response);
    } catch (error: any) {
      toast.error('Erro ao salvar configuração: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProducts = async () => {
    setIsUpdating(true);
    try {
      await configService.updateProducts();
      toast.success('Produtos atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar produtos: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 lg:hidden transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Painel Ducena IA
                  </h1>
                  <p className="text-xs text-gray-500">Configuração de Prompts</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600 font-medium">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-100`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-8 px-6 space-y-8">
            {/* AGENTE DE IA */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                AGENTE DE IA
              </h3>

              <button
                onClick={handleCreateSection}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-3" />
                Nova Seção
              </button>

              <button
                onClick={handleSaveConfiguration}
                disabled={isSaving || sections.length === 0}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-3 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-3" />
                )}
                Salvar Prompt
              </button>
            </div>

            {/* PRODUTOS */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                PRODUTOS
              </h3>

              <button
                onClick={handleUpdateProducts}
                disabled={isUpdating}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader className="h-4 w-4 mr-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-3" />
                )}
                Atualizar Produtos
              </button>
            </div>

            {/* CONFIGURAÇÕES */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                CONFIGURAÇÕES
              </h3>

              <button
                onClick={() => setModalOpen(true, 'settings')}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-3" />
                Configurar Webhooks
              </button>

              <button
                onClick={() => setModalOpen(true, 'users')}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-3" />
                Usuários
              </button>
            </div>


            {/* Estatísticas */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Estatísticas
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Seções:</span>
                  <span className="font-medium text-gray-900">{sections.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total caracteres:</span>
                  <span className="font-medium text-gray-900">
                    {sections.reduce((acc, section) => acc + section.content.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-72">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Seções do Prompt
              </h2>
              <p className="text-gray-600">
                Gerencie as seções que compõem o prompt do seu agente de IA
              </p>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-6">
                  <Edit3 className="h-16 w-16" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma seção criada
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Comece criando sua primeira seção de prompt para configurar seu agente de IA
                </p>
                <button
                  onClick={handleCreateSection}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Seção
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onEdit={handleEditSection}
                        onDelete={handleDeleteSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <SectionModal
        isOpen={isModalOpen && modalType === 'section'}
        onClose={() => setModalOpen(false)}
        section={selectedSection}
        onSave={loadData}
      />

      <SettingsModal
        isOpen={isModalOpen && modalType === 'settings'}
        onClose={() => setModalOpen(false)}
        onSave={loadData}
      />

      <UsersModal
        isOpen={isModalOpen && modalType === 'users'}
        onClose={() => setModalOpen(false)}
      />

      <StatsModal
        isOpen={isModalOpen && modalType === 'stats'}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
