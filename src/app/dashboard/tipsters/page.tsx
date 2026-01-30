'use client';

import { useState, useEffect } from 'react';
import { Trophy, Search, Edit, Save, X, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

interface Tipster {
  id: number;
  nombre_real: string;
  alias: string;
  deporte: string;
  activo: boolean;
  total_apuestas?: number;
  ganadas?: number;
  perdidas?: number;
  roi?: number;
  racha?: number;
}

export default function AdminTipstersPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ alias: '', deporte: '', activo: true });
  const [showRealNames, setShowRealNames] = useState(false);

  useEffect(() => {
    fetchTipsters();
  }, []);

  const fetchTipsters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tipsters`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTipsters(data.tipsters || []);
      }
    } catch (error) {
      console.error('Error fetching tipsters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (tipster: Tipster) => {
    setEditingId(tipster.id);
    setEditForm({
      alias: tipster.alias,
      deporte: tipster.deporte,
      activo: tipster.activo
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ alias: '', deporte: '', activo: true });
  };

  const saveEdit = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tipsters/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editForm)
        }
      );

      if (response.ok) {
        fetchTipsters();
        cancelEdit();
      }
    } catch (error) {
      console.error('Error actualizando tipster:', error);
    }
  };

  const toggleActivo = async (id: number, activo: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tipsters/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activo: !activo })
        }
      );
      fetchTipsters();
    } catch (error) {
      console.error('Error toggling tipster:', error);
    }
  };

  const filteredTipsters = tipsters.filter(t => 
    t.alias.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.nombre_real.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.deporte.toLowerCase().includes(busqueda.toLowerCase())
  );

  const deportes = ['Futbol', 'Tenis', 'NBA', 'Voleibol', 'Mixto'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#FFD700]" />
            Gestión de Tipsters
          </h1>
          <p className="text-[#94A3B8] mt-1">Administra alias, deportes y estado</p>
        </div>
        
        {/* Toggle nombres reales */}
        <button
          onClick={() => setShowRealNames(!showRealNames)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition ${
            showRealNames 
              ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30' 
              : 'bg-white/5 text-[#94A3B8] border border-white/10'
          }`}
        >
          {showRealNames ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showRealNames ? 'Ocultar Nombres Reales' : 'Ver Nombres Reales'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Total Tipsters</p>
          <p className="text-2xl font-bold text-white font-mono">{tipsters.length}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Activos</p>
          <p className="text-2xl font-bold text-[#00FF88] font-mono">
            {tipsters.filter(t => t.activo).length}
          </p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Inactivos</p>
          <p className="text-2xl font-bold text-[#EF4444] font-mono">
            {tipsters.filter(t => !t.activo).length}
          </p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Deportes</p>
          <p className="text-2xl font-bold text-white font-mono">
            {new Set(tipsters.map(t => t.deporte)).size}
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar por alias, nombre real o deporte..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#050505] border border-white/10 rounded pl-10 pr-4 py-2 text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]/50"
          />
        </div>
      </div>

      {/* Tabla de Tipsters */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">ID</th>
                {showRealNames && (
                  <th className="text-left text-[#EF4444] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    🔒 Nombre Real
                  </th>
                )}
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Alias (Público)</th>
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Deporte</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Apuestas</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">ROI</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTipsters.length === 0 ? (
                <tr>
                  <td colSpan={showRealNames ? 8 : 7} className="text-center text-[#94A3B8] py-8">
                    No hay tipsters que coincidan con la búsqueda
                  </td>
                </tr>
              ) : (
                filteredTipsters.map((tipster) => (
                  <tr key={tipster.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-[#64748B] font-mono">{tipster.id}</td>
                    
                    {showRealNames && (
                      <td className="px-4 py-3 text-sm text-[#EF4444] font-medium">
                        {tipster.nombre_real}
                      </td>
                    )}
                    
                    <td className="px-4 py-3">
                      {editingId === tipster.id ? (
                        <input
                          type="text"
                          value={editForm.alias}
                          onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                          className="bg-[#050505] border border-[#00FF88]/50 rounded px-2 py-1 text-white text-sm w-full"
                        />
                      ) : (
                        <span className="text-white font-medium">{tipster.alias}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      {editingId === tipster.id ? (
                        <select
                          value={editForm.deporte}
                          onChange={(e) => setEditForm({ ...editForm, deporte: e.target.value })}
                          className="bg-[#050505] border border-[#00FF88]/50 rounded px-2 py-1 text-white text-sm"
                        >
                          {deportes.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tipster.deporte === 'Futbol' ? 'bg-[#00FF88]/10 text-[#00FF88]' :
                          tipster.deporte === 'Tenis' ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                          tipster.deporte === 'NBA' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                          'bg-white/10 text-white'
                        }`}>
                          {tipster.deporte}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActivo(tipster.id, tipster.activo)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                          tipster.activo 
                            ? 'bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20' 
                            : 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
                        }`}
                      >
                        {tipster.activo ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    
                    <td className="px-4 py-3 text-center text-sm text-white font-mono">
                      {tipster.total_apuestas || 0}
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-mono font-bold ${
                        (tipster.roi || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#EF4444]'
                      }`}>
                        {(tipster.roi || 0) >= 0 ? '+' : ''}{tipster.roi || 0}%
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === tipster.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(tipster.id)}
                              className="p-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 rounded text-[#00FF88] transition"
                              title="Guardar"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded text-[#EF4444] transition"
                              title="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(tipster)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-[#94A3B8] hover:text-white transition"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota de seguridad */}
      {showRealNames && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg p-4">
          <p className="text-[#EF4444] text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Los nombres reales son confidenciales y nunca se muestran a los usuarios del portal.</span>
          </p>
        </div>
      )}
    </div>
  );
}
