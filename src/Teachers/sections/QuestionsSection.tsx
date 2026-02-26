import { useEffect, useState } from "react";
import {
  getAllUnits,
  getLessonsByUnit,
  getQuestionsByLesson,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionTypes,
} from "../../api/auth.service";
import { QuestionType, QuestionData } from "../../api/auth.types";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";

interface Unit {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
}

export function QuestionsSection() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  // Estados del Formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [textSource, setTextSource] = useState("");
  const [textTarget, setTextTarget] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [questionTypeId, setQuestionTypeId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Estados de Archivos
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null]);

  /* ===================== LOADERS ===================== */

  useEffect(() => {
    // Cargamos unidades de profesor e tipos de pregunta
    (async () => {
      try {
        const u = await getAllUnits();
        console.log("📚 Unidades desde API:", u);
        if (Array.isArray(u)) {
          setUnits(u as Unit[]);
        } else {
          setUnits([]);
        }
      } catch (err) {
        console.error("❌ Error cargando unidades:", err);
        setUnits([]);
      }

      try {
        const types = await getQuestionTypes();
        setQuestionTypes(types);
      } catch (err) {
        console.error("❌ Error cargando tipos de preguntas:", err);
        setQuestionTypes([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedUnitId) {
      setLessons([]);
      setSelectedLessonId("");
      setQuestions([]);
      return;
    }

    getLessonsByUnit(selectedUnitId)
      .then((ls) => {
        console.log("📘 Lecciones por unidad:", ls);
        setLessons(ls as Lesson[]);
      })
      .catch((err) => {
        console.error("❌ Error cargando lecciones:", err);
        setLessons([]);
      });
  }, [selectedUnitId]);

  useEffect(() => {
    if (!selectedLessonId) {
      setQuestions([]);
      return;
    }
    loadQuestions();
  }, [selectedLessonId]);

  const loadQuestions = async () => {
    try {
      const data = await getQuestionsByLesson(selectedLessonId);
      console.log("📥 Preguntas desde API:", data);

      if (Array.isArray(data)) {
        setQuestions(data as QuestionData[]);
      } else {
        console.warn("⚠️ getQuestionsByLesson NO devolvió un array:", data);
        setQuestions([]);
      }
    } catch (error) {
      console.error("❌ Error cargando preguntas:", error);
      setQuestions([]);
    }
  };

  /* ===================== HELPERS ===================== */

  const resetForm = () => {
    setEditingId(null);
    setTextSource("");
    setTextTarget("");
    setOptions(["", ""]);
    setImageFiles([null, null]);
    setAudioFile(null);
    setQuestionTypeId("");
    setIsActive(true);

    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach((i: any) => (i.value = ""));
  };

  const selectedType = questionTypes.find((t) => t.id === questionTypeId);
  const typeName = (selectedType?.typeName || "").toUpperCase();

  const usesOptions = [
    "IMAGE_SELECT",
    "TRANSLATION_TO_TARGET",
    "TRANSLATION_TO_SOURCE",
    "MATCHING",
    "MULTIPLE_CHOICE",
    "LISTENING",
    "AUDIO_SELECT",
    "ORDERING",
  ].includes(typeName);

  const usesAudio = ["LISTENING", "AUDIO_SELECT", "SPEAKING","WRITING"].includes(typeName);

  /* ===================== SAVE (API CALL) ===================== */

  const handleSave = async () => {
    if (!selectedLessonId || !questionTypeId) {
      alert("Por favor selecciona lección y tipo de pregunta");
      return;
    }

    const formData = new FormData();
    formData.append("lessonId", selectedLessonId);
    formData.append("questionTypeId", questionTypeId);
    formData.append("textSource", textSource);
    formData.append("textTarget", textTarget);
    formData.append("active", String(isActive));

    if (usesOptions) {
      options.forEach((opt) => formData.append("options", opt));
    }

    if (typeName === "IMAGE_SELECT") {
      imageFiles.forEach((file) => {
        if (file) {
          formData.append("imageFiles", file);
        } else {
          // placeholder para mantener índice
          formData.append("imageFiles", new Blob(), "placeholder.txt");
        }
      });
    }

    if (usesAudio && audioFile) {
      formData.append("audioFile", audioFile);
    }

    try {
      if (editingId) {
        await updateQuestion(editingId, formData);
      } else {
        await createQuestion(formData);
      }
      alert("¡Guardado con éxito!");
      resetForm();
      loadQuestions();
    } catch (err) {
      console.error("❌ Error al guardar pregunta:", err);
      alert("Error al procesar la solicitud.");
    }
  };

  /* ===================== ACTIONS ===================== */

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    setTextSource(q.textSource);
    setTextTarget(q.textTarget || "");
    setQuestionTypeId(q.questionType.id);
    setIsActive(q.active);

    if (q.options && q.options.length > 0) {
      const parsed = q.options.map((opt: string) => {
        try {
          return JSON.parse(opt).value || opt;
        } catch {
          return opt;
        }
      });
      setOptions(parsed);
      setImageFiles(new Array(parsed.length).fill(null));
    } else {
      setOptions(["", ""]);
      setImageFiles([null, null]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta pregunta?")) {
      await deleteQuestion(id);
      loadQuestions();
    }
  };

  const IconEdit = FiEdit2 as any;
  const IconTrash = FiTrash2 as any;
  const IconPlus = FiPlus as any;
  const IconX = FiX as any;
  const IconUpload = FiUploadCloud as any;

  // ✅ Arrays seguros
  const safeUnits: Unit[] = Array.isArray(units) ? units : [];
  const safeQuestions: QuestionData[] = Array.isArray(questions)
    ? questions
    : [];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 800,
        }}
      >
        <IconPlus /> Gestión de Contenido Académico
      </h2>

      {/* SELECTORES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontWeight: "bold", fontSize: 14 }}>Unidad</label>
          <select
            style={{
              padding: 12,
              borderRadius: 10,
              border: "2px solid #e5e5e5",
            }}
            value={selectedUnitId}
            onChange={(e) => {
              setSelectedUnitId(e.target.value);
              setSelectedLessonId("");
              setQuestions([]);
            }}
          >
            <option value="">Selecciona Unidad</option>
            {safeUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontWeight: "bold", fontSize: 14 }}>Lección</label>
          <select
            style={{
              padding: 12,
              borderRadius: 10,
              border: "2px solid #e5e5e5",
            }}
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            disabled={!selectedUnitId}
          >
            <option value="">Selecciona Lección</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMULARIO */}
      {selectedLessonId && (
        <div
          style={{
            background: "#fff",
            padding: 30,
            borderRadius: 20,
            border: "2px solid #e5e5e5",
            marginBottom: 40,
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {editingId ? "Editando Pregunta" : "Nueva Pregunta"}
          </h3>

          <div style={{ display: "grid", gap: 15 }}>
            <input
              placeholder={
                typeName === "SPEAKING"
                  ? "Frase que el alumno debe leer (Inglés)"
                  : "Texto Fuente (Lo que el alumno verá)"
              }
              style={{
                padding: 12,
                borderRadius: 10,
                border: "2px solid #e5e5e5",
              }}
              value={textSource}
              onChange={(e) => setTextSource(e.target.value)}
            />

            <input
              placeholder={
                typeName === "SPEAKING"
                  ? "Repite la misma frase (Para validar pronunciación)"
                  : "Respuesta Correcta"
              }
              style={{
                padding: 12,
                borderRadius: 10,
                border: "2px solid #e5e5e5",
              }}
              value={textTarget}
              onChange={(e) => setTextTarget(e.target.value)}
            />

            <select
              style={{
                padding: 12,
                borderRadius: 10,
                border: "2px solid #e5e5e5",
              }}
              value={questionTypeId}
              onChange={(e) => setQuestionTypeId(e.target.value)}
            >
              <option value="">-- Tipo de Dinámica --</option>
              {questionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeName}
                </option>
              ))}
            </select>

            {/* SECCIÓN DE AUDIO */}
            {usesAudio && (
              <div
                style={{
                  padding: 15,
                  background: "#f0f7ff",
                  borderRadius: 12,
                  border: "1px dashed #2b70c9",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "bold",
                    color: "#2b70c9",
                  }}
                >
                  <IconUpload />{" "}
                  {typeName === "SPEAKING"
                    ? "Subir Audio de Pronunciación Correcta"
                    : "Subir Audio de Referencia"}
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    e.target.files && setAudioFile(e.target.files[0])
                  }
                />
                {audioFile && (
                  <p style={{ fontSize: 12, marginTop: 5 }}>
                    Archivo: {audioFile.name}
                  </p>
                )}
                {typeName === "SPEAKING" && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#555",
                      marginTop: 5,
                    }}
                  >
                    * Sube un audio donde se escuche la frase para que el
                    alumno pueda imitarla.
                  </p>
                )}
              </div>
            )}

            {/* SECCIÓN DE OPCIONES */}
            {usesOptions && (
              <div
                style={{
                  marginTop: 10,
                  background: "#f9f9f9",
                  padding: 20,
                  borderRadius: 15,
                }}
              >
                <label
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  {typeName === "ORDERING"
                    ? "Banco de Palabras (Separadas):"
                    : "Opciones de respuesta:"}
                </label>
                {options.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 10,
                      alignItems: "center",
                    }}
                  >
                    <input
                      placeholder={
                        typeName === "ORDERING"
                          ? `Palabra ${i + 1}`
                          : `Opción ${i + 1}`
                      }
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                      }}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                    />

                    {typeName === "IMAGE_SELECT" && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (!e.target.files?.[0]) return;
                          const newFiles = [...imageFiles];
                          newFiles[i] = e.target.files[0];
                          setImageFiles(newFiles);
                        }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (options.length > 1) {
                          setOptions(options.filter((_, idx) => idx !== i));
                          setImageFiles(
                            imageFiles.filter((_, idx) => idx !== i)
                          );
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff4b4b",
                        cursor: "pointer",
                      }}
                    >
                      <IconX />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  style={{
                    background: "#fff",
                    border: "2px solid #e5e5e5",
                    padding: "8px 15px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setOptions([...options, ""]);
                    setImageFiles([...imageFiles, null]);
                  }}
                >
                  + Añadir {typeName === "ORDERING" ? "Palabra" : "Opción"}
                </button>
              </div>
            )}

            <button
              style={{
                background: "#58cc02",
                color: "#fff",
                padding: 15,
                borderRadius: 15,
                border: "none",
                fontWeight: "bold",
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 0 #46a302",
              }}
              onClick={handleSave}
            >
              {editingId ? "ACTUALIZAR PREGUNTA" : "GUARDAR PREGUNTA"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                style={{
                  background: "none",
                  border: "none",
                  color: "#afafaf",
                  cursor: "pointer",
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>
      )}

      {/* LISTADO DE PREGUNTAS */}
      <div style={{ display: "grid", gap: 15 }}>
        {safeQuestions.length === 0 && selectedLessonId && (
          <p style={{ textAlign: "center", color: "#afafaf" }}>
            No hay preguntas en esta lección.
          </p>
        )}

        {safeQuestions.map((q) => (
          <div
            key={q.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderRadius: 15,
              border: "2px solid #e5e5e5",
              background: q.active ? "#fff" : "#f5f5f5",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  background: "#e5e5e5",
                  padding: "2px 8px",
                  borderRadius: 5,
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                {q.questionType.typeName.toUpperCase()}
              </span>
              <h4 style={{ margin: "5px 0" }}>{q.textSource}</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#777",
                }}
              >
                Respuesta: {q.textTarget}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleEdit(q)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <IconEdit />
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#ff4b4b",
                }}
              >
                <IconTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
