import { LessonNode } from "./LessonNode";

interface Lesson {
  id: string;
  title: string;
  isCompleted: boolean;
}

export const LessonPath = ({ lessons }: { lessons: Lesson[] }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          style={{
            marginLeft: index % 2 === 0 ? 0 : 80,
          }}
        >
          <LessonNode
            title={lesson.title}
            status={
              lesson.isCompleted
                ? "completed"
                : index === 0
                ? "active"
                : "locked"
            }
          />
        </div>
      ))}
    </div>
  );
};
