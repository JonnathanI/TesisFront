import { useEffect, useState } from "react";
import {
  getAllUnits,
  getLessonsByUnit,
  getQuestionsByLesson,
  createQuestion,
  deleteQuestion
} from "../../api/auth.service";

export function QuestionsSection() {
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [textSource, setTextSource] = useState("");
  const [textTarget, setTextTarget] = useState("");

  // 🔹 cargar unidades
  useEffect(() => {
    getAllUnits().then(setUnits);
  }, []);

  // 🔹 cargar lecciones por unidad
  useEffect(() => {
    if (!selectedUnitId) return;
    getLessonsByUnit(selectedUnitId).then(setLessons);
    setSelectedLessonId("");
    setQuestions([]);
  }, [selectedUnitId]);

  // 🔹 cargar preguntas por lección
  useEffect(() => {
    if (!selectedLessonId) return;
    loadQuestions();
  }, [selectedLessonId]);

  const loadQuestions = async () => {
    const data = await getQuestionsByLesson(selectedLessonId);
    setQuestions(data);
  };

  const handleCreateQuestion = async () => {
    if (!textSource || !textTarget) return;

    await createQuestion({
      lessonId: selectedLessonId,
      questionTypeId: "TEXT",
      textSource,
      textTarget,
      options: [],
      category: "GRAMMAR"
    });

    setTextSource("");
    setTextTarget("");
    loadQuestions();
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    loadQuestions();
  };

  return (
    <div>
      <h2>❓ Preguntas</h2>

      {/* SELECT UNIDAD */}
      <select
        value={selectedUnitId}
        onChange={(e) => setSelectedUnitId(e.target.value)}
      >
        <option value="">Selecciona una unidad</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.title}
          </option>
        ))}
      </select>

      {/* SELECT LECCIÓN */}
      {lessons.length > 0 && (
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
        >
          <option value="">Selecciona una lección</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      )}

      {/* CRUD */}
      {selectedLessonId && (
        <>
          <h3>Crear pregunta</h3>

          <input
            placeholder="Texto origen"
            value={textSource}
            onChange={(e) => setTextSource(e.target.value)}
          />

          <input
            placeholder="Respuesta correcta"
            value={textTarget}
            onChange={(e) => setTextTarget(e.target.value)}
          />

          <button onClick={handleCreateQuestion}>➕ Crear</button>

          <hr />

          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                {q.textSource}
                <button onClick={() => handleDeleteQuestion(q.id)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
