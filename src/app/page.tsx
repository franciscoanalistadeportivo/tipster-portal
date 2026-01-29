'use client';

import Link from 'next/link';
import { TrendingUp, Shield, Zap, BarChart3, Users, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Tipster Portal</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="text-white hover:text-primary-200 font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/registro" 
              className="bg-yellow-400 hover:bg-yellow-500 text-primary-900 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Prueba Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeIn">
          Análisis de Tipsters con
          <span className="text-yellow-400"> Inteligencia Artificial</span>
        </h1>
        <p className="text-xl text-primary-200 mb-10 max-w-2xl mx-auto">
          Accede a estadísticas detalladas de +24 tipsters profesionales. 
          Nuestro Director de Riesgos con IA analiza cada apuesta para maximizar tus ganancias.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/registro" 
            className="bg-yellow-400 hover:bg-yellow-500 text-primary-900 font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
          >
            Comenzar 5 Días Gratis
          </Link>
          <Link 
            href="#como-funciona" 
            className="border-2 border-white text-white hover:bg-white hover:text-primary-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            ¿Cómo Funciona?
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="animate-fadeIn">
            <div className="text-4xl font-bold text-yellow-400">24+</div>
            <div className="text-primary-200">Tipsters Verificados</div>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl font-bold text-yellow-400">1000+</div>
            <div className="text-primary-200">Apuestas Analizadas</div>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-bold text-yellow-400">78%</div>
            <div className="text-primary-200">Tasa de Acierto</div>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl font-bold text-yellow-400">IA</div>
            <div className="text-primary-200">Director de Riesgos</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Nuestro sistema analiza automáticamente cada apuesta con inteligencia artificial
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Estadísticas Detalladas</h3>
              <p className="text-gray-600">
                ROI, rachas, porcentaje de aciertos y más métricas de cada tipster
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Análisis EV+</h3>
              <p className="text-gray-600">
                Cada apuesta analizada con probabilidad real, EV y nivel de riesgo
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recomendaciones IA</h3>
              <p className="text-gray-600">
                Top tipsters del mes y apuestas más seguras del día
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Plan Simple y Accesible
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Sin sorpresas, todo incluido
          </p>

          <div className="max-w-md mx-auto">
            <div className="card border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  5 DÍAS GRATIS
                </span>
              </div>
              
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                <div className="my-6">
                  <span className="text-5xl font-bold text-primary-600">$15.000</span>
                  <span className="text-gray-500"> CLP/mes</span>
                </div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Acceso a +24 tipsters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Estadísticas completas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Apuestas del día</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Análisis EV+ con IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Recomendaciones diarias</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Alertas de tipsters en racha</span>
                  </li>
                </ul>

                <Link 
                  href="/registro" 
                  className="btn-primary w-full block text-center py-3"
                >
                  Comenzar Prueba Gratis
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Sin tarjeta de crédito requerida para la prueba
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold">Tipster Portal</span>
          </div>
          <p className="text-primary-300 mb-4">
            Director de Riesgos con Inteligencia Artificial
          </p>
          <p className="text-sm text-primary-400">
            © 2026 Tipster Portal. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
