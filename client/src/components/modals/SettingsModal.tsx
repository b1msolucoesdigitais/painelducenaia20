import React, { useState, useEffect } from 'react';
import { useWebhooksStore } from '../../store';
import { webhooksService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { X, Save, Loader, Trash2, Settings, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [saveWebhookUrl, setSaveWebhookUrl] = useState('');
  const [updateWebhookUrl, setUpdateWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { webhooks } = useWebhooksStore();

  useEffect(() => {
    if (isOpen) {
      // Buscar webhooks existentes
      const saveWebhook = webhooks.find((w: any) => w.type === 'save');
      const updateWebhook = webhooks.find((w: any) => w.type === 'update');
      
      setSaveWebhookUrl(saveWebhook?.url || '');
      setUpdateWebhookUrl(updateWebhook?.url || '');
    }
  }, [isOpen, webhooks]);

  const handleSaveWebhook = async (type: 'save' | 'update', url: string) => {
    if (!url.trim()) {
      toast.error('Por favor, informe a URL do webhook');
      return;
    }

    // Validação básica de URL
    try {
      new URL(url);
    } catch {
      toast.error('Por favor, informe uma URL válida');
      return;
    }

    setIsLoading(true);
    
    try {
      await webhooksService.saveWebhook(type, url);
      toast.success(`Webhook de ${type === 'save' ? 'salvamento' : 'atualização'} configurado com sucesso!`);
      onSave();
    } catch (error: any) {
      toast.error('Erro ao salvar webhook: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este webhook?')) {
      setIsLoading(true);
      
      try {
        await webhooksService.deleteWebhook(id);
        toast.success('Webhook excluído com sucesso!');
        onSave();
      } catch (error: any) {
        toast.error('Erro ao excluir webhook: ' + (error.response?.data?.error || error.message));
      } finally {
        setIsLoading(false);
      }
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
        
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Configurações de Webhooks
                </h2>
                <p className="text-sm text-gray-500">
                  Configure as URLs para integração com sistemas externos
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
          <div className="px-8 py-6 space-y-8">
            {/* Webhook de Salvamento */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Save className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Webhook de Salvamento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Disparado ao salvar configuração. Recebe seções individuais e prompt completo.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="save-webhook" className="block text-sm font-semibold text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <input
                    id="save-webhook"
                    type="url"
                    value={saveWebhookUrl}
                    onChange={(e) => setSaveWebhookUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="https://exemplo.com/webhook/save"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleSaveWebhook('save', saveWebhookUrl)}
                    disabled={isLoading || !saveWebhookUrl.trim()}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Webhook
                      </>
                    )}
                  </button>
                  
                  {webhooks.find((w: any) => w.type === 'save') && (
                    <button
                      onClick={() => handleDeleteWebhook(webhooks.find((w: any) => w.type === 'save')!.id)}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Webhook de Atualização */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Webhook de Atualização
                  </h3>
                  <p className="text-sm text-gray-600">
                    Disparado ao atualizar produtos. Recebe apenas um POST simples.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="update-webhook" className="block text-sm font-semibold text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <input
                    id="update-webhook"
                    type="url"
                    value={updateWebhookUrl}
                    onChange={(e) => setUpdateWebhookUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="https://exemplo.com/webhook/update"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleSaveWebhook('update', updateWebhookUrl)}
                    disabled={isLoading || !updateWebhookUrl.trim()}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Webhook
                      </>
                    )}
                  </button>
                  
                  {webhooks.find((w: any) => w.type === 'update') && (
                    <button
                      onClick={() => handleDeleteWebhook(webhooks.find((w: any) => w.type === 'update')!.id)}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-8 py-6 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;