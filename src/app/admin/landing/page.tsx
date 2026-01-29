'use client';

import { useState, useEffect } from 'react';
import { 
  Save, RefreshCw, FileText, Type, DollarSign, 
  MessageSquare, CheckCircle, AlertCircle, Eye,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth, adminFetch } from '../layout';

interface ConfigItem {
  id: number;
  config_key: string;
  config_value: string;
  config_type: string;
  description: string;
}

interface ConfigSection {
  title: string;
  icon: any;
  keys: string[];
  description: string;
}

const SECTIONS: ConfigSection[] = [
  {
    title: 'Hero Section',
    icon: Type,
    description: 'Título principal, subtítulo y CTAs del hero',
    keys: [
      'landing_hero_badge',
      'landing_hero_titulo_1',
      'landing_hero_titulo_2',
      'landing_hero_subtitulo',
      'landing_cta_principal',
      'landing_cta_secundario'
    ]
  },
  {
    title: 'Estadísticas',
    icon: FileText,
    description: 'Números mostrados en la landing',
    keys: [
      'stats_win_rate',
      'stats_ganancias_total',
      'stats_usuarios_activos',
      'stats_total_tipsters'
    ]
  },
  {
    title: 'Sección "Por Qué Nosotros"',
    icon: MessageSquare,
    description: 'Títulos y textos de las 3 cards',
    keys: [
      'porque_titulo',
      'porque_subtitulo',
      'porque_card1_titulo',
      'porque_card1_texto',
      'porque_card2_titulo',
      'porque_card2_texto',
      'porque_card3_titulo',
      'porque_card3_texto'
    ]
  },
  {
    title: 'Cómo Funciona',
    icon: CheckCircle,
    description: 'Los 3 pasos del proceso',
    keys: [
      'como_funciona_titulo',
      'paso1_titulo',
      'paso1_texto',
      'paso2_titulo',
      'paso2_texto',
      'paso3_titulo',
      'paso3_texto'
    ]
  },
  {
    title: 'Pricing',
    icon: DollarSign,
    description: 'Precios, trial y textos del plan',
    keys: [
      'precio_mensual',
      'precio_canal_individual',
      'dias_trial',
      'pricing_titulo',
      'pricing_badge',
      'pricing_cta',
      'pricing_garantia'
    ]
  },
  {
    title: 'CTA Final',
    icon: FileText,
    description: 'Llamada a la acción al final de la página',
    keys: [
      'cta_final_titulo',
      'cta_final_subtitulo',
      'cta_final_boton'
    ]
  }
];

export default function LandingEditorPage() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem[]>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(['Hero Section']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { accessToken, csrfToken, refreshCsrf } = useAuth();

  useEffect(() => {
    loadConfigs();
  }, [accessToken]);

  const loadConfigs = async () => {
    if (!accessToken) return;
    
    try {
      const response = await adminFetch('/api/admin/config', {}, accessToken, csrfToken);
      const data = await response.json();
      setConfigs(data);
      
      // Inicializar valores editados
      const initial: Record<string, string> = {};
      Object.values(data).flat().forEach((item: any) => {
        initial[item.config_key] = item.config_value;
      });
      setEditedValues(initial);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const saveAllChanges = async () => {
    if (!accessToken) return;
    
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Obtener nuevo CSRF token
      const newCsrf = await refreshCsrf();
      
      // Preparar cambios
      const changes = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value
      }));

      const response = await adminFetch(
        '/api/admin/config/bulk',
        {
          method: 'PUT',
          body: JSON.stringify({ configs: changes })
        },
        accessToken,
        newCsrf
      );

      const data = await response.json();

      if (data.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getConfigByKey = (key: string): ConfigItem | undefined => {
    for (const category of Object.values(configs)) {
      const found = category.find((item: ConfigItem) => item.config_key === key);
      if (found) return found;
    }
    return undefined;
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/^(landing_|stats_|porque_|paso\d_|pricing_|cta_final_|como_funciona_)/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Editor de Landing Page</h1>
          <p className="text-gray-400">Edita todos los textos de la landing en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/" 
            target="_blank"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Landing
          </a>
          <button
            onClick={saveAllChanges}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
              saveStatus === 'success' 
                ? 'bg-emerald-500' 
                : saveStatus === 'error'
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                ¡Guardado!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-teal-400 font-medium">Los cambios se aplican inmediatamente</p>
            <p className="text-teal-400/70 text-sm">Una vez que guardes, la landing page se actualizará al instante.</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div 
            key={section.title}
            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
              </div>
              {expandedSections.includes(section.title) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Section Content */}
            {expandedSections.includes(section.title) && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-700 pt-4">
                {section.keys.map((key) => {
                  const config = getConfigByKey(key);
                  const isLongText = config?.config_type === 'text' && 
                    (key.includes('subtitulo') || key.includes('texto'));
                  
                  return (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {formatLabel(key)}
                        {config?.description && (
                          <span className="ml-2 text-xs text-gray-500">({config.description})</span>
                        )}
                      </label>
                      {isLongText ? (
                        <textarea
                          value={editedValues[key] || ''}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                        />
                      ) : (
                        <input
                          type={config?.config_type === 'number' ? 'number' : 'text'}
                          value={editedValues[key] || ''}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
