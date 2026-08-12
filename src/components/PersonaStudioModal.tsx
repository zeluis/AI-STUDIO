import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Edit3, Check, X, Shield, User } from 'lucide-react';
import { Persona } from '../types';

interface PersonaStudioModalProps {
  personas: Persona[];
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  onSavePersona: (persona: Persona) => void;
  onDeletePersona: (personaId: string) => void;
  onClose: () => void;
}

export const PersonaStudioModal: React.FC<PersonaStudioModalProps> = ({
  personas,
  selectedPersona,
  onSelectPersona,
  onSavePersona,
  onDeletePersona,
  onClose,
}) => {
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleCreateNew = () => {
    const newPersona: Persona = {
      id: `custom_${Date.now()}`,
      name: 'Custom AI Persona',
      avatar: '🤖',
      category: 'Custom',
      description: 'Custom system prompt instructions for personalized AI behavior.',
      systemPrompt: 'You are a helpful AI assistant tailored for specialized tasks.',
      defaultTemp: 0.7,
      defaultTopP: 0.9,
      isBuiltIn: false,
    };
    setEditingPersona(newPersona);
    setIsCreatingNew(true);
  };

  const handleSaveEdit = () => {
    if (editingPersona) {
      onSavePersona(editingPersona);
      onSelectPersona(editingPersona);
      setEditingPersona(null);
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden font-sans">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950"
            >
              ✕
            </button>
            <span className="text-xs font-semibold">System Prompt & Persona Studio</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto">
          {/* Left Column: List of Personas */}
          <div className="space-y-3 border-r border-gray-200 dark:border-neutral-700 pr-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Persona Presets
              </h3>
              <button
                onClick={handleCreateNew}
                className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-semibold rounded-xs hover:bg-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {personas.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    setEditingPersona(null);
                  }}
                  className={`p-2.5 rounded-md border text-left cursor-pointer transition-all flex items-center justify-between ${
                    selectedPersona.id === p.id
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-neutral-750 border-gray-200 dark:border-neutral-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-lg">{p.avatar}</span>
                    <div className="truncate">
                      <h4 className="font-bold text-xs truncate">{p.name}</h4>
                      <p className={`text-[10px] truncate ${selectedPersona.id === p.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {p.category}
                      </p>
                    </div>
                  </div>

                  {selectedPersona.id === p.id && <span className="text-xs">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Persona Inspector / Editor */}
          <div className="md:col-span-2 space-y-4">
            {editingPersona ? (
              /* Editor Mode */
              <div className="bg-white dark:bg-neutral-750 p-4 rounded-md border border-gray-300 dark:border-neutral-700 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm flex items-center space-x-1.5">
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    <span>{isCreatingNew ? 'Create New Persona' : 'Edit Persona'}</span>
                  </h3>
                  <button
                    onClick={() => setEditingPersona(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={editingPersona.name}
                      onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                      className="w-full p-2 border rounded-xs dark:bg-neutral-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Avatar Emoji</label>
                    <input
                      type="text"
                      value={editingPersona.avatar}
                      onChange={(e) => setEditingPersona({ ...editingPersona, avatar: e.target.value })}
                      className="w-full p-2 border rounded-xs dark:bg-neutral-800 text-xs text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Category & Short Description</label>
                  <input
                    type="text"
                    value={editingPersona.description}
                    onChange={(e) => setEditingPersona({ ...editingPersona, description: e.target.value })}
                    className="w-full p-2 border rounded-xs dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">System Instruction Prompt</label>
                  <textarea
                    rows={6}
                    value={editingPersona.systemPrompt}
                    onChange={(e) => setEditingPersona({ ...editingPersona, systemPrompt: e.target.value })}
                    className="w-full p-2 border rounded-xs dark:bg-neutral-800 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-xs font-semibold flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Persona</span>
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="bg-white dark:bg-neutral-750 p-4 rounded-md border border-gray-300 dark:border-neutral-700 space-y-4 text-xs">
                <div className="flex justify-between items-start border-b pb-3 border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 bg-blue-50 dark:bg-neutral-700 rounded-lg">{selectedPersona.avatar}</span>
                    <div>
                      <h3 className="font-bold text-base">{selectedPersona.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPersona.description}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPersona(selectedPersona)}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 rounded-xs font-semibold flex items-center space-x-1 border"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    {!selectedPersona.isBuiltIn && (
                      <button
                        onClick={() => onDeletePersona(selectedPersona.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 rounded-xs font-semibold flex items-center space-x-1 border border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                    Active System Prompt
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md border border-gray-200 dark:border-neutral-700 font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedPersona.systemPrompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-md border">
                    <span className="text-gray-400 font-bold">Default Temperature:</span>
                    <span className="ml-2 font-mono font-bold text-blue-600">{selectedPersona.defaultTemp}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-md border">
                    <span className="text-gray-400 font-bold">Default Top-P:</span>
                    <span className="ml-2 font-mono font-bold text-emerald-600">{selectedPersona.defaultTopP}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-4 py-2 bg-gray-200 dark:bg-neutral-750 border-t border-gray-300 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-sm text-xs font-semibold shadow-2xs hover:from-blue-600 hover:to-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
