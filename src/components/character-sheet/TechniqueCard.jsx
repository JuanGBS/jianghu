import React from 'react';
import { PencilSquareIcon, EyeIcon, FireIcon, CubeIcon } from '@heroicons/react/24/solid';

function TechniqueCard({ technique, onDelete, onEdit, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <button 
        onClick={onToggle} 
        className="w-full text-left p-4 focus:outline-none group"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-lg text-brand-text group-hover:text-purple-700 transition-colors">{technique.name}</h4>
              {/* Badges */}
              {technique.concentration && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                      <EyeIcon className="h-3 w-3" /> Conc.
                  </span>
              )}
              {technique.requiresRoll && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                      <CubeIcon className="h-3 w-3" /> Rolagem
                  </span>
              )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
              title="Editar"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Excluir"
            >
              <span className="text-lg font-bold leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
          <div className="flex justify-between border-b border-gray-100 pb-1">
              <span>Tipo:</span> 
              <span className="font-semibold text-gray-800">{technique.type || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
              <span>Custo:</span> 
              <span className="font-semibold text-purple-700 bg-purple-50 px-2 rounded">{technique.cost ? `${technique.cost} PC` : '0 PC'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
              <span>Ação:</span> 
              <span className="font-semibold text-gray-800">{technique.action || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
              <span>Atributo:</span> 
              <span className="font-semibold text-gray-800">{technique.attribute || '-'}</span>
          </div>
          {technique.damage && (
             <div className="col-span-2 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100 mt-1">
                 <FireIcon className="h-4 w-4 text-red-500" />
                 <span className="font-bold text-red-700 text-xs uppercase tracking-wide">Dano:</span>
                 <span className="font-mono font-bold text-red-800 text-base">{technique.damage}</span>
             </div>
          )}
        </div>
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
            <span className="block font-bold text-xs text-gray-400 uppercase mb-1">Efeito:</span>
            {technique.effect}
          </div>
          {technique.requirements && (
              <p className="text-xs text-gray-500 mt-2">
                  <span className="font-bold">Requisitos:</span> {technique.requirements}
              </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechniqueCard;