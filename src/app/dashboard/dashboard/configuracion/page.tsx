'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Bell, ChevronLeft, Smartphone, Mail, MessageCircle,
  Clock, Volume2, VolumeX, Loader2, CheckCircle, Copy, ExternalLink
} from 'lucide-react';
import { notificacionesAPI, miBancaAPI } from '@/lib/api';

interface NotifConfig {
  telegram_verificado: boolean;
  telegram_username: string | null;
  push_enabled: boolean;
  email_enabled: boolean;
  telegram_enabled: boolean;
  alertas: {
    pick_alto: boolean;
    pick_medio: boolean;
    racha_tipster: boolean;
    resultado: boolean;
    recordatorio: boolean;
    drawdown: boolean;
    meta: boolean;
  };
  horario_inicio: string;
  horario_fin: string;
  silenciar_fines_semana: boolean;
}

interface BancaConfig {
  perfil_riesgo: string;
  meta_mensual: number;
  casa_apuestas: string;
}

// Toggle switch component
const Toggle = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative w-12 h-6 rounded-full transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${enabled ? 'bg-[#00D1B2]' : 'bg-[#334155]'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
      enabled ? 'left-7' : 'left-1'
    }`} />
  </button>
);

export default function ConfiguracionPage() {
  const [notifConfig, setNotifConfig] = useState<NotifConfig | null>(null);
  const [bancaConfig, setBancaConfig] = useState<BancaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Telegram vinculación
  const [telegramModal, setTelegramModal] = useState(false);
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [notifData, bancaData] = await Promise.all([
          notificacionesAPI.getConfig(),
          miBancaAPI.getEstado()
        ]);
        setNotifConfig(notifData);
        if (bancaData.onboarding_completo) {
          setBancaConfig({
            perfil_riesgo: bancaData.perfil_riesgo,
            meta_mensual: bancaData.meta_mensual,
            casa_apuestas: bancaData.casa_apuestas
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleToggle = (key: keyof NotifConfig | string) => {
    if (!notifConfig) return;
    
    if (key.startsWith('alertas.')) {
      const alertaKey = key.replace('alertas.', '') as keyof NotifConfig['alertas'];
      setNotifConfig({
        ...notifConfig,
        alertas: {
          ...notifConfig.alertas,
          [alertaKey]: !notifConfig.alertas[alertaKey]
        }
      });
    } else {
      setNotifConfig({
        ...notifConfig,
        [key]: !notifConfig[key as keyof NotifConfig]
      });
    }
  };

  const handleSave = async () => {
    if (!notifConfig) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await notificacionesAPI.updateConfig(notifConfig);
      setSaveMessage('✓ Configuración guardada');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVincularTelegram = async () => {
    setTelegramLoading(true);
    try {
      const response = await notificacionesAPI.vincularTelegram();
      setTelegramCode(response.codigo);
      setTelegramModal(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleDesvincularTelegram = async () => {
    try {
      await notificacionesAPI.desvincularTelegram();
      setNotifConfig(prev => prev ? {
        ...prev,
        telegram_verificado: false,
        telegram_username: null,
        telegram_enabled: false
      } : null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(telegramCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!notifConfig) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mi-banca" className="p-2 rounded-lg hover:bg-[#1E293B] transition-all">
          <ChevronLeft className="h-5 w-5 text-[#94A3B8]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#94A3B8]" />
            Configuración
          </h1>
          <p className="text-[#94A3B8] mt-1">Personaliza tu experiencia</p>
        </div>
      </div>

      {/* Canales de Notificación */}
      <div className="card-elite">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#00D1B2]" />
          Canales de Notificación
        </h2>
        
        <div className="space-y-4">
          {/* Push */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0F172A]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Smartphone className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Push del navegador</p>
                <p className="text-xs text-[#64748B]">Notificaciones en tiempo real</p>
              </div>
            </div>
            <Toggle enabled={notifConfig.push_enabled} onChange={() => handleToggle('push_enabled')} />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0F172A]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-xs text-[#64748B]">Resumen diario y alertas importantes</p>
              </div>
            </div>
            <Toggle enabled={notifConfig.email_enabled} onChange={() => handleToggle('email_enabled')} />
          </div>

          {/* Telegram */}
          <div className="p-3 rounded-lg bg-[#0F172A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0088cc]/10">
                  <MessageCircle className="h-5 w-5 text-[#0088cc]" />
                </div>
                <div>
                  <p className="text-white font-medium">Telegram</p>
                  <p className="text-xs text-[#64748B]">
                    {notifConfig.telegram_verificado 
                      ? `Conectado como @${notifConfig.telegram_username}` 
                      : 'Recibe picks al instante'}
                  </p>
                </div>
              </div>
              {notifConfig.telegram_verificado ? (
                <Toggle enabled={notifConfig.telegram_enabled} onChange={() => handleToggle('telegram_enabled')} />
              ) : (
                <button
                  onClick={handleVincularTelegram}
                  disabled={telegramLoading}
                  className="px-4 py-2 rounded-lg bg-[#0088cc] text-white text-sm font-medium hover:bg-[#0088cc]/90 transition-all flex items-center gap-2"
                >
                  {telegramLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vincular'}
                </button>
              )}
            </div>
            {notifConfig.telegram_verificado && (
              <button
                onClick={handleDesvincularTelegram}
                className="mt-3 text-xs text-[#EF4444] hover:underline"
              >
                Desvincular Telegram
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tipos de Alertas */}
      <div className="card-elite">
        <h2 className="text-lg font-bold text-white mb-4">Tipos de Alertas</h2>
        
        <div className="space-y-3">
          {[
            { key: 'pick_alto', label: 'Picks de alta confianza', desc: 'EV mayor a 7%' },
            { key: 'pick_medio', label: 'Picks de media confianza', desc: 'EV entre 4-7%' },
            { key: 'racha_tipster', label: 'Rachas de tipsters', desc: 'Cuando un tipster entra en racha' },
            { key: 'resultado', label: 'Resultados', desc: 'Cuando tus apuestas se resuelven' },
            { key: 'recordatorio', label: 'Recordatorios', desc: 'Antes de que expire un pick' },
            { key: 'drawdown', label: 'Alerta de drawdown', desc: 'Si tu banca baja más del 10%' },
            { key: 'meta', label: 'Meta alcanzada', desc: 'Cuando logras tu meta mensual' },
          ].map((alerta) => (
            <div key={alerta.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-sm">{alerta.label}</p>
                <p className="text-xs text-[#64748B]">{alerta.desc}</p>
              </div>
              <Toggle 
                enabled={notifConfig.alertas[alerta.key as keyof typeof notifConfig.alertas]} 
                onChange={() => handleToggle(`alertas.${alerta.key}`)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Horario */}
      <div className="card-elite">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#FFDD57]" />
          Horario de Notificaciones
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-[#94A3B8] mb-1.5 block">Desde</label>
            <input
              type="time"
              value={notifConfig.horario_inicio}
              onChange={(e) => setNotifConfig({ ...notifConfig, horario_inicio: e.target.value })}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg py-2 px-3 text-white focus:border-[#00D1B2] outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-[#94A3B8] mb-1.5 block">Hasta</label>
            <input
              type="time"
              value={notifConfig.horario_fin}
              onChange={(e) => setNotifConfig({ ...notifConfig, horario_fin: e.target.value })}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg py-2 px-3 text-white focus:border-[#00D1B2] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <VolumeX className="h-4 w-4 text-[#94A3B8]" />
            <span className="text-white text-sm">Silenciar fines de semana</span>
          </div>
          <Toggle 
            enabled={notifConfig.silenciar_fines_semana} 
            onChange={() => handleToggle('silenciar_fines_semana')} 
          />
        </div>
      </div>

      {/* Configuración de Banca */}
      {bancaConfig && (
        <div className="card-elite">
          <h2 className="text-lg font-bold text-white mb-4">Configuración de Banca</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-[#94A3B8]">Perfil de riesgo</span>
              <span className="text-white capitalize">{bancaConfig.perfil_riesgo}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#94A3B8]">Meta mensual</span>
              <span className="text-[#00D1B2]">+{bancaConfig.meta_mensual}%</span>
            </div>
            {bancaConfig.casa_apuestas && (
              <div className="flex justify-between py-2">
                <span className="text-[#94A3B8]">Casa de apuestas</span>
                <span className="text-white">{bancaConfig.casa_apuestas}</span>
              </div>
            )}
          </div>
          
          <Link 
            href="/dashboard/mi-banca/setup" 
            className="mt-4 block text-center text-sm text-[#00D1B2] hover:underline"
          >
            Modificar configuración →
          </Link>
        </div>
      )}

      {/* Botón Guardar */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${saveMessage.includes('Error') ? 'text-[#EF4444]' : 'text-[#00D1B2]'}`}>
          {saveMessage}
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#00D1B2] text-white font-medium hover:bg-[#00D1B2]/90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Guardar cambios
        </button>
      </div>

      {/* Modal Vincular Telegram */}
      {telegramModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] rounded-2xl max-w-md w-full p-6 animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#0088cc]/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-[#0088cc]" />
              </div>
              <h3 className="text-xl font-bold text-white">Vincular Telegram</h3>
              <p className="text-[#94A3B8] text-sm mt-2">
                Envía este código a nuestro bot para vincular tu cuenta
              </p>
            </div>

            {/* Código */}
            <div className="bg-[#0F172A] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-xl font-mono text-[#00D1B2]">{telegramCode}</code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg hover:bg-[#334155] transition-all"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-[#00D1B2]" />
                  ) : (
                    <Copy className="h-5 w-5 text-[#94A3B8]" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mt-2">Expira en 10 minutos</p>
            </div>

            {/* Instrucciones */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-[#94A3B8]">
                <span className="text-white">1.</span> Abre Telegram
              </p>
              <p className="text-sm text-[#94A3B8]">
                <span className="text-white">2.</span> Busca <span className="text-[#0088cc]">@TipsterPortalBot</span>
              </p>
              <p className="text-sm text-[#94A3B8]">
                <span className="text-white">3.</span> Envía el código de arriba
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTelegramModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#334155] text-[#94A3B8] hover:bg-[#334155] transition-all"
              >
                Cerrar
              </button>
              <a
                href="https://t.me/TipsterPortalBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-lg bg-[#0088cc] text-white font-medium hover:bg-[#0088cc]/90 transition-all flex items-center justify-center gap-2"
              >
                Abrir Bot
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
