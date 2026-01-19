interface Props {
  groups?: any[];
}

export const GroupsSection = ({ groups = [] }: Props) => {
  if (!groups.length) return <p>No hay grupos</p>;

  return (
    <div>
      <h2>Grupos</h2>
      {groups.map((group) => (
        <div key={group.id}>👥 {group.name}</div>
      ))}
    </div>
  );
};
