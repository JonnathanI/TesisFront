import React, { useState, useEffect } from 'react';
import * as AuthService from '../../api/auth.service';

export const GroupsSection = ({ groups = [], onRefresh }: any) => {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔍 LÓGICA DE BÚSQUEDA EN TIEMPO REAL
  useEffect(() => {
    const search = async () => {
      if (emailToAdd.length > 2 && !emailToAdd.includes('@')) {
        setIsSearching(true);
        try {
          const results = await AuthService.searchUsersByQuery(emailToAdd);
          setSuggestions(results);
        } catch (e) {
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [emailToAdd]);

  const handleSelectUser = (user: any) => {
    setEmailToAdd(user.email); // Autocompleta con el email
    setSuggestions([]); // Cierra el menú
  };

  const handleAddStudent = async () => {
    if (!emailToAdd) return;
    setLoading(true);
    try {
      await AuthService.addStudentToClassroom(selectedGroup.id, emailToAdd);
      setEmailToAdd("");
      // Recargamos el grupo para ver al nuevo alumno en la lista
      const updated = await AuthService.getClassroomDetails(selectedGroup.id);
      setSelectedGroup(updated);
    } catch (err) {
      alert("No se pudo agregar al alumno. Verifica si el correo es correcto.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedGroup) {
    return (
      <div className="p-4 animate-in fade-in duration-300">
        <button onClick={() => setSelectedGroup(null)} className="mb-4 text-[#afafaf] font-black text-xs uppercase hover:text-[#1cb0f6]">
          ← Volver a Grupos
        </button>

        <div className="bg-white border-2 border-[#e5e5e5] rounded-[2rem] p-8">
          <h2 className="text-3xl font-black text-[#3c3c3c] mb-6">{selectedGroup.name}</h2>

          {/* BUSCADOR CON SUGERENCIAS */}
          <div className="relative mb-8">
            <label className="block text-[#4b4b4b] font-black uppercase text-xs mb-2">Inscribir Estudiante</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  className="w-full bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl px-6 py-3 font-bold focus:border-[#1cb0f6] outline-none"
                  placeholder="Escribe nombre o correo..."
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                />

                {/* MENÚ DE AUTOCOMPLETADO */}
                {suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-[#e5e5e5] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((user: any) => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="p-4 hover:bg-[#ddf4ff] cursor-pointer flex justify-between items-center border-b last:border-none"
                      >
                        <div>
                          <p className="font-black text-[#4b4b4b]">{user.fullName}</p>
                          <p className="text-xs text-[#afafaf] font-bold">{user.email}</p>
                        </div>
                        <span className="text-[#1cb0f6] font-black text-xs">SELECCIONAR</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={handleAddStudent}
                disabled={loading}
                className="bg-[#58cc02] text-white px-8 rounded-2xl font-black shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
              >
                {loading ? "..." : "AGREGAR"}
              </button>
            </div>
          </div>

          {/* LISTA DE ALUMNOS DEL GRUPO */}
          <div className="space-y-3">
            <h3 className="font-black text-[#afafaf] uppercase text-xs mb-2">Alumnos en este grupo</h3>
            {selectedGroup.students?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4 border-2 border-[#e5e5e5] rounded-2xl bg-[#f7f7f7]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ce82ff] rounded-full flex items-center justify-center text-white font-black shadow-[0_2px_0_#a855f7]">
                    {s.fullName.charAt(0)}
                  </div>
                  <span className="font-black text-[#4b4b4b]">{s.fullName}</span>
                </div>
                <span className="text-[#58cc02] font-black">{s.xpTotal} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista de tarjetas (cuando no hay grupo seleccionado)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {groups.map((group: any) => (
        <div 
          key={group.id} 
          onClick={async () => {
            const data = await AuthService.getClassroomDetails(group.id);
            setSelectedGroup(data);
          }}
          className="bg-white border-2 border-[#e5e5e5] rounded-[2rem] p-6 cursor-pointer hover:border-[#1cb0f6] transition-all group active:scale-95"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏫</div>
          <h3 className="font-black text-xl text-[#3c3c3c]">{group.name}</h3>
          <p className="text-[#afafaf] font-bold text-xs">CÓDIGO: {group.code}</p>
        </div>
      ))}
    </div>
  );
};