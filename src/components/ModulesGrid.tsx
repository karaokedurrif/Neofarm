'use client';

import { ModuleConfig } from '@/config/variants';
import { ArrowRight } from 'lucide-react';

interface ModulesGridProps {
  modules: ModuleConfig[];
  themeColor: string;
}

export default function ModulesGrid({ modules, themeColor }: ModulesGridProps) {
  return (
    <section className="section-container bg-white">
      <div className="text-center mb-16">
        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: themeColor }}>
          Módulos
        </span>
        <h2 className="text-4xl font-bold mt-2 mb-4">Todo lo que necesitas en un solo lugar</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          De 5 apps que no se hablan a una plataforma integrada. Todos tus datos conectados.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, idx) => (
          <div
            key={idx}
            className="group p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 
                     hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div
                className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300"
              >
                {module.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-gray-900">{module.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>

              {/* Features */}
              <ul className="space-y-2 text-sm text-gray-700 flex-grow">
                {module.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: themeColor }}>
                      •
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium flex items-center gap-1" style={{ color: themeColor }}>
                  Ver más <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
