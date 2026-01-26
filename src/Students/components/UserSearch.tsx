import React, { useState } from 'react';
import { searchUsers, followUser, StudentData } from '../../api/auth.service';

export const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      setIsSearching(true);
      try {
        const data = await searchUsers(value);
        setResults(data);
      } catch (err) {
        console.error("Error buscando usuarios", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
      alert("¡Solicitud enviada!");
      setQuery('');
      setResults([]);
    } catch (err) {
      alert("No se pudo enviar la solicitud");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f1f4f6',
        borderRadius: '12px',
        padding: '8px 15px',
        border: '2px solid #e5e5e5'
      }}>
        <span style={{ marginRight: '10px' }}>🔍</span>
        <input
          type="text"
          placeholder="Buscar amigos..."
          value={query}
          onChange={handleSearch}
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '14px',
            fontWeight: '600'
          }}
        />
      </div>

      {results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #e5e5e5',
          zIndex: 100,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {results.map(user => (
            <div key={user.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 15px',
              borderBottom: '1px solid #f1f1f1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#1cb0f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {user.fullName.charAt(0)}
                </div>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{user.fullName}</span>
              </div>
              <button
                onClick={() => handleFollow(user.id)}
                style={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1cb0f6'
                }}
              >
                AGREGAR
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch; // <--- Línea importante para evitar TS1208