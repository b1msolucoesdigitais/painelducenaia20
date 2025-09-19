import React, { useState, useEffect } from 'react';
import { useSectionsStore } from '../../store';
import { sectionsService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { X, Save, Loader, Edit3 } from 'lucide-react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: any;
  onSave: () => void;
}

const SectionModal: React.FC<SectionModalProps> = ({ isOpen, onClose, section, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addSection, updateSection } = useSectionsStore();

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setContent(section.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [section, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      if (section) {
        // Atualizar seção existente
        const updatedSection = await sectionsService.updateSection(section.id, title, content);
        updateSection(section.id, updatedSection);
        toast.success('Seção atualizada com sucesso!');
      } else {
        // Criar nova seção
        const newSection = await sectionsService.createSection(title, content);
        addSection(newSection);
        toast.success('Seção criada com sucesso!');
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar seção: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section ? 'Editar Seção' : 'Nova Seção'}
                </h2>
                <p className="text-sm text-gray-500">
                  {section ? 'Modifique o conteúdo da seção' : 'Crie uma nova seção de prompt'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                Título da Seção
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                placeholder="Ex: Introdução, Instruções Gerais, Formato de Resposta..."
                disabled={isLoading}
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-3">
                Conteúdo da Seção
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-80 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-200"
                placeholder="Digite o conteúdo desta seção do prompt..."
                disabled={isLoading}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Use Markdown para formatação. O conteúdo será concatenado com outras seções.
                </p>
                <span className="text-xs text-gray-400">
                  {content.length} caracteres
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-8 py-6 border-t border-gray-100 space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 border border-transparent rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Seção
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
