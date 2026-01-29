'use client';

import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, BarChart3, Users, Trophy, 
  CheckCircle, ArrowRight, Star, Target, ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-hero-gradient noise-overlay">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/50">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-display font-bold text-white">
                Tipster<span className="text-emerald-400">Portal</span>
              </span>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <Link 
                href="/login" 
                className="hidden sm:block text-navy-200 hover:text-white font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/registro" 
                className="btn-primary text-sm lg:text-base"
              >
                Comenzar Gratis
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-40 pb-20 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-2 mb-8 animate-fadeInUp">
              <Star className="h-4 w-4 text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">5 Días de Prueba Gratis</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white mb-6 animate-fadeInUp stagger-1 leading-tight">
              Análisis de Tipsters con{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Inteligencia Artificial
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-navy-300 mb-10 max-w-2xl mx-auto animate-fadeInUp stagger-2">
              Accede a estadísticas detalladas de +24 tipsters profesionales. 
              Nuestro Director de Riesgos analiza cada apuesta para maximizar tus ganancias.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp stagger-3">
              <Link href="/registro" className="btn-gold text-lg px-8 py-4 flex items-center justify-center gap-2">
                Comenzar 5 Días Gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#como-funciona" className="btn-secondary text-lg px-8 py-4">
                ¿Cómo Funciona?
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fadeInUp stagger-4">
              <div className="flex items-center gap-2 text-navy-400">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-navy-400">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2 text-navy-400">
                <Zap className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">Acceso inmediato</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-navy-900/50 border-y border-navy-800/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '24+', label: 'Tipsters Verificados', icon: Users },
              { value: '1000+', label: 'Apuestas Analizadas', icon: BarChart3 },
              { value: '78%', label: 'Tasa de Acierto', icon: Target },
              { value: 'IA', label: 'Director de Riesgos', icon: Shield },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="stat-card text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-display font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-navy-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto">
              Nuestro sistema analiza automáticamente cada apuesta con inteligencia artificial avanzada
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Estadísticas Detalladas',
                description: 'ROI, rachas, porcentaje de aciertos y más métricas de cada tipster en tiempo real.',
                color: 'emerald'
              },
              {
                icon: Shield,
                title: 'Análisis EV+',
                description: 'Cada apuesta analizada con probabilidad real, Expected Value y nivel de riesgo.',
                color: 'gold'
              },
              {
                icon: Zap,
                title: 'Recomendaciones IA',
                description: 'Top tipsters del mes y las apuestas más seguras del día, seleccionadas por IA.',
                color: 'emerald'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="card-light group animate-fadeInUp"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                  feature.color === 'emerald' 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-gold-500/10 text-gold-600'
                }`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-display font-bold text-navy-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-32 bg-navy-900/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              Plan Simple y Accesible
            </h2>
            <p className="text-navy-300">
              Sin sorpresas, todo incluido. Cancela cuando quieras.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="card-light relative overflow-hidden">
              {/* Badge 5 días gratis */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 text-sm font-bold px-4 py-2 rounded-bl-xl">
                  5 DÍAS GRATIS
                </div>
              </div>

              <div className="pt-8 text-center">
                <h3 className="text-2xl font-display font-bold text-navy-900">Premium</h3>
                <div className="my-6">
                  <span className="text-5xl lg:text-6xl font-display font-bold text-navy-900">$15.000</span>
                  <span className="text-navy-500 ml-2">CLP/mes</span>
                </div>
                
                <ul className="text-left space-y-4 mb-8">
                  {[
                    'Acceso a +24 tipsters verificados',
                    'Estadísticas completas en tiempo real',
                    'Apuestas del día filtradas por IA',
                    'Análisis EV+ de cada apuesta',
                    'Recomendaciones diarias personalizadas',
                    'Alertas de tipsters en racha',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-navy-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/registro" 
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 animate-pulse-glow"
                >
                  Comenzar Prueba Gratis
                  <ChevronRight className="h-5 w-5" />
                </Link>
                
                <p className="text-sm text-navy-500 mt-4">
                  Sin tarjeta de crédito • Cancela cuando quieras
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                ¿Listo para mejorar tus apuestas?
              </h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto text-lg">
                Únete a cientos de apostadores que ya usan nuestro Director de Riesgos con IA
              </p>
              <Link 
                href="/registro" 
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-4 px-8 rounded-lg text-lg transition-all hover:bg-emerald-50 hover:scale-105"
              >
                Comenzar Ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 border-t border-navy-800/50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white">
                Tipster<span className="text-emerald-400">Portal</span>
              </span>
            </div>
            <p className="text-navy-500 text-sm">
              © 2026 TipsterPortal. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-navy-400 hover:text-white text-sm transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-navy-400 hover:text-white text-sm transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-navy-400 hover:text-white text-sm transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
