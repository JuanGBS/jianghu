import React from "react";
import { CLANS_DATA } from "../data/clans";
import characterArt from "../assets/character-art.png";
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';

function CharacterSheet({ character, onDelete }) {
  const clan = CLANS_DATA[character.clanId];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <h1
        className="text-6xl font-bold text-center text-brand-primary mb-10"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}
      >
        Tales of Jianghu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-grow">
        {/* --- COLUNA ESQUERDA --- */}
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg space-y-4 w-full self-start">
          <div>
            <h2 className="text-4xl font-bold text-brand-text">
              {character.name}
            </h2>
            <p className="text-lg text-gray-500">{clan.name}</p>
          </div>
          <hr />
          <div>
            <h3 className="text-xl font-semibold text-brand-text">
              Atributos Finais
            </h3>
            <div className="space-y-2 mt-3">
              {Object.entries(character.attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                >
                  <span className="font-bold text-gray-700">
                    {ATTRIBUTE_TRANSLATIONS[key]}
                  </span>
                  <span className="text-2xl font-bold text-purple-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* --- IMAGEM CENTRAL --- */}
        <div className="lg:col-span-1 flex justify-center -mx-8 hidden lg:flex self-end">
          <img
            src={characterArt}
            alt="Arte do Personagem"
            // A MÁGICA ESTÁ AQUI: Esta classe cria a máscara de gradiente.
            className="max-h-[75vh] object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
          />
        </div>

        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xl font-semibold text-brand-text mb-4">
              Status de Combate
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg flex justify-around text-center">
              <div>
                <span className="block text-sm text-gray-500">PV</span>
                <span className="block text-3xl font-bold text-green-600">
                  {character.stats.currentHp}/{character.stats.maxHp}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Chi</span>
                <span className="block text-3xl font-bold text-blue-500">
                  {character.stats.currentChi}/{character.stats.maxChi}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">CA</span>
                <span className="block text-3xl font-bold text-red-600">
                  {character.stats.armorClass}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onDelete}
            className="w-full text-gray-500 hover:text-red-600 hover:bg-red-100 font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Apagar Personagem
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterSheet;
