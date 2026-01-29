'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Edit2, Save, X, Crown,
  Clock, Mail, Shield, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { useAuth, adminFetch } from '../layout';

interface Usuario {
  id: number;
  email: string;
  plan: string;
  suscripcion_hasta: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', suscripcion_hasta: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { accessToken, csrfToken, refreshCsrf } = useAuth();

  const perPage = 20;

  useEffect(() => {
    loadUsuarios();
  }, [accessToken, currentPage]);

  const loadUsuarios = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await adminFetch(`/api/admin/usuarios?${params}`, {}, accessToken, csrfToken);
      const data = await response.json();
      
      setUsuarios(data.usuarios);
      setTotalUsuarios(data.total);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsuarios();
  };

  const startEditing = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setEditForm({
      plan: usuario.plan,
      suscripcion_hasta: usuario.suscripcion_hasta?.split('T')[0] || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ plan: '', suscripcion_hasta: '' });
  };

  const saveUsuario = async (id: number) => {
    if (!accessToken) return;
    
    setIsSaving(true);
    try {
      const newCsrf = await refreshCsrf();
      
      const response = await adminFetch(
        `/api/admin/usuarios/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            plan: editForm.plan,
            suscripcion_hasta: editForm.suscripcion_hasta || null
          })
        },
        accessToken,
        newCsrf
      );

      const data = await response.json();

      if (data.success) {
        setUsuarios(prev => prev.map(u => 
          u.id === id 
            ? { ...u, plan: editForm.plan, suscripcion_hasta: editForm.suscripcion_hasta }
            : u
        ));
        setEditingId(null);
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const extenderSuscripcion = async (usuario: Usuario, dias: number) => {
    if (!accessToken) return;
    
    try {
      const newCsrf = await refreshCsrf();
      
      const fechaActual = usuario.suscripcion_hasta 
        ? new Date(usuario.suscripcion_hasta)
        : new Date();
      
      if (fechaActual < new Date()) {
        fechaActual.setTime(new Date().getTime());
      }
      
      fechaActual.setDate(fechaActual.getDate() + dias);
      const nuevaFecha = fechaActual.toISOString().split('T')[0];

      await adminFetch(
        `/api/admin/usuarios/${usuario.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            plan: 'PREMIUM',
            suscripcion_hasta: nuevaFecha
          })
        },
        accessToken,
        newCsrf
      );

      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id 
          ? { ...u, plan: 'PREMIUM', suscripcion_hasta: nuevaFecha }
          : u
      ));
    } catch (error) {
      console.error('Error extendiendo suscripción:', error);
    }
  };

  const getPlanBadge = (plan: string, suscripcionHasta: string | null) => {
    const isExpired = suscripcionHasta && new Date(suscripcionHasta) < new Date();
    
    if (isExpired) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Expirado</span>;
    }
    
    switch (plan) {
      case 'PREMIUM':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</span>;
      case 'FREE_TRIAL':
        return <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-medium">Trial</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">{plan}</span>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const diasRestantes = (suscripcionHasta: string | null) => {
    if (!suscripcionHasta) return null;
    const dias = Math.ceil((new Date(suscripcionHasta).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (isLoading && usuarios.length === 0) {
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
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400">{totalUsuarios} usuarios registrados</p>
        </div>
        <button
          onClick={loadUsuarios}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalUsuarios}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {usuarios.filter(u => u.plan === 'PREMIUM').length}
              </div>
              <div className="text-gray-400 text-sm">Premium</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {usuarios.filter(u => u.plan === 'FREE_TRIAL').length}
              </div>
              <div className="text-gray-400 text-sm">En Trial</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {usuarios.filter(u => u.is_admin).length}
              </div>
              <div className="text-gray-400 text-sm">Admins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-lg text-white font-medium transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Vence</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Registro</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const dias = diasRestantes(usuario.suscripcion_hasta);
                
                return (
                  <tr key={usuario.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{usuario.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-white">{usuario.email}</span>
                        {usuario.is_admin && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === usuario.id ? (
                        <select
                          value={editForm.plan}
                          onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                          className="px-3 py-1.5 bg-slate-900 border border-teal-500 rounded text-white text-sm"
                        >
                          <option value="FREE_TRIAL">Trial</option>
                          <option value="PREMIUM">Premium</option>
                          <option value="EXPIRED">Expirado</option>
                        </select>
                      ) : (
                        getPlanBadge(usuario.plan, usuario.suscripcion_hasta)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === usuario.id ? (
                        <input
                          type="date"
                          value={editForm.suscripcion_hasta}
                          onChange={(e) => setEditForm({ ...editForm, suscripcion_hasta: e.target.value })}
                          className="px-3 py-1.5 bg-slate-900 border border-teal-500 rounded text-white text-sm"
                        />
                      ) : (
                        <div>
                          <div className="text-white">{formatDate(usuario.suscripcion_hasta)}</div>
                          {dias !== null && (
                            <div className={`text-xs ${dias > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {dias > 0 ? `${dias} días restantes` : 'Expirado'}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(usuario.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === usuario.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveUsuario(usuario.id)}
                            disabled={isSaving}
                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(usuario)}
                            className="p-2 bg-slate-700 text-gray-400 rounded hover:bg-slate-600 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => extenderSuscripcion(usuario, 30)}
                            className="p-2 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors"
                            title="Extender 30 días"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <div className="text-sm text-gray-400">
            Mostrando {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalUsuarios)} de {totalUsuarios}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-700 text-gray-400 rounded hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white px-4">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-700 text-gray-400 rounded hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
