import React from 'react';
import { INNATE_BODIES } from "../../data/innateBodies"; 

function InnateBodySelector({ selectedBody, onBodyChange }) {
  const inputStyle = "w-full p-3 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-gray-700 appearance-none";
  
  return (
    <div>
      <label htmlFor="innateBody" className="text-xl font-semibold text-brand-text mb-2 block">
        Corpo Inato (Opcional)
      </label>
      <div className="relative flex-grow">
        <select 
          id="innateBody" 
          value={selectedBody} 
          onChange={onBodyChange}
          className={inputStyle}
        >
          {INNATE_BODIES.map(body => (
            <option key={body.id} value={body.id}>{body.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
}

export default InnateBodySelector;