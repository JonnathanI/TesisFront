import React, { useState, useEffect, CSSProperties } from "react";
import {
  FiPlus,
  FiTrash2,
  FiFileText,
  FiX,
  FiLayers,
  FiList,
} from "react-icons/fi";
import {
  getQuestionTypes,
  createFullEvaluation,
  getTeacherEvaluations,
  getTeacherClassrooms,
  assignEvaluationToClassroom,
  assignEvaluationToStudent,
  getStudentList,
  uploadEvaluationFile,
} from "../../api/auth.service";

const IconPlus = FiPlus as any;
const IconTrash = FiTrash2 as any;
const IconFile = FiFileText as any;
const IconLayers = FiLayers as any;
const IconX = FiX as any;
const IconList = FiList as any;

export function EvaluationsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<any[]>([
    {
      textSource: "",
      textTarget: "",
      questionTypeId: "",
      options: ["", "", "", ""],
      category: "GRAMMAR",
      difficultyScore: 1.0,
      audioUrl: "",
      imageUrls: ["", "", "", ""],
    },
  ]);

  const [savedEvaluations, setSavedEvaluations] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [assignmentMode, setAssignmentMode] = useState<"group" | "student">(
    "group"
  );
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [types, evals, groups, students] = await Promise.all([
        getQuestionTypes(),
        getTeacherEvaluations(),
        getTeacherClassrooms(),
        getStudentList(),
      ]);
      setQuestionTypes(types);
      setSavedEvaluations(evals);
      setClassrooms(groups);
      setAllStudents(students);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        textSource: "",
        textTarget: "",
        questionTypeId: "",
        options: ["", "", "", ""],
        category: "GRAMMAR",
        difficultyScore: 1.0,
        audioUrl: "",
        imageUrls: ["", "", "", ""],
      },
    ]);
  };

  const getTypeConfig = (questionTypeId: string) => {
    const t = questionTypes.find((tt) => tt.id === questionTypeId);
    const typeName = (t?.typeName || "").toUpperCase();

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

    const isOrdering = typeName === "ORDERING";
    const isImageSelect = typeName === "IMAGE_SELECT";
    const usesAudio = ["LISTENING", "AUDIO_SELECT", "SPEAKING"].includes(
      typeName
    );

    return { typeName, usesOptions, isOrdering, isImageSelect, usesAudio };
  };

  // 🔊 Subir audio
  const handleAudioFileChange = async (file: File, qIndex: number) => {
    try {
      const url = await uploadEvaluationFile(file, "evaluations_audios");
      setQuestions((prev) => {
        const copy = [...prev];
        copy[qIndex] = {
          ...copy[qIndex],
          audioUrl: url,
        };
        return copy;
      });
      alert("Audio subido correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al subir el audio");
    }
  };

  // 🖼️ Subir imagen para IMAGE_SELECT
  const handleImageFileChange = async (
    file: File,
    qIndex: number,
    optIndex: number
  ) => {
    try {
      const url = await uploadEvaluationFile(file, "evaluations_images");
      setQuestions((prev) => {
        const copy = [...prev];
        const current = copy[qIndex];
        const imageUrls = [...(current.imageUrls || [])];
        imageUrls[optIndex] = url;
        copy[qIndex] = {
          ...current,
          imageUrls,
        };
        return copy;
      });
      alert("Imagen subida correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    }
  };

  const handleSaveAll = async () => {
    if (!title) return alert("El título es obligatorio");
    if (questions.some((q) => !q.questionTypeId))
      return alert("Todas las preguntas deben tener un tipo");

    const payloadQuestions = questions.map((q) => {
      const { isImageSelect } = getTypeConfig(q.questionTypeId);

      let optionsToSend: string[] = q.options || [];

      if (isImageSelect) {
        const imageUrls = q.imageUrls || [];
        optionsToSend = (q.options || []).map((text: string, idx: number) =>
          JSON.stringify({
            value: text,
            imageUrl: imageUrls[idx] || null,
          })
        );
      }

      return {
        textSource: q.textSource,
        textTarget: q.textTarget,
        questionTypeId: q.questionTypeId,
        options: optionsToSend,
        audioUrl: q.audioUrl,
        category: q.category || "EVALUATION",
        difficultyScore:
          typeof q.difficultyScore === "string"
            ? parseFloat(q.difficultyScore) || 1.0
            : q.difficultyScore || 1.0,
        active: true,
      };
    });

    setLoading(true);
    try {
      await createFullEvaluation({
        title,
        description,
        questions: payloadQuestions,
      });
      alert("¡Evaluación creada con éxito!");
      setTitle("");
      setDescription("");
      setQuestions([
        {
          textSource: "",
          textTarget: "",
          questionTypeId: "",
          options: ["", "", "", ""],
          category: "GRAMMAR",
          difficultyScore: 1.0,
          audioUrl: "",
          imageUrls: ["", "", "", ""],
        },
      ]);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEval) return;
    try {
      if (assignmentMode === "group") {
        if (!selectedClassroom) return alert("Selecciona un aula");
        await assignEvaluationToClassroom(selectedEval.id, selectedClassroom);
      } else {
        if (!selectedStudent) return alert("Selecciona un alumno");
        await assignEvaluationToStudent(selectedEval.id, selectedStudent);
      }
      alert("Asignación completada");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error en la asignación");
    }
  };

  return (
    <div style={pageWrapper}>
      {/* CARD 1: CREACIÓN */}
      <div style={cardWrapper}>
        <div style={headerRow}>
          <div style={headerIconBox}>
            <IconFile size={32} />
          </div>
          <div>
            <h1 style={cardTitle}>Crear Evaluaciones</h1>
           
          </div>
        </div>

        <div style={twoCols}>
          {/* Columna izquierda */}
          <div style={leftCol}>
            <div style={stickyBox}>
              <label style={labelSm}>General</label>
              <input
                style={inputMain}
                placeholder="Nombre del Examen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                style={textareaMain}
                placeholder="Descripción o instrucciones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                onClick={handleSaveAll}
                disabled={loading}
                style={{
                  ...primaryButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "PROCESANDO..." : "PUBLICAR EVALUACIÓN"}
              </button>
            </div>
          </div>

          {/* Columna derecha: preguntas */}
          <div style={rightCol}>
            <label style={labelSm}>
              Lista de Reactivos ({questions.length})
            </label>

            {questions.map((q, idx) => {
              const {
                typeName,
                usesOptions,
                isOrdering,
                isImageSelect,
                usesAudio,
              } = getTypeConfig(q.questionTypeId);

              return (
                <div key={idx} style={questionCard}>
                  <div style={questionHeaderRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={pillReactivo}>
                        Reactivo #{idx + 1}
                      </span>
                      {typeName && (
                        <span style={pillType}>
                          {typeName.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setQuestions(questions.filter((_, i) => i !== idx))
                      }
                      style={iconButton}
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>

                  {/* Tipo + dificultad */}
                  <div style={twoColsQuestions}>
                    <div style={fieldGroup}>
                      <label style={labelTiny}>Tipo de dinámica</label>
                      <select
                        style={selectBase}
                        value={q.questionTypeId}
                        onChange={(e) => {
                          const n = [...questions];
                          n[idx].questionTypeId = e.target.value;
                          setQuestions(n);
                        }}
                      >
                        <option value="">Seleccionar tipo...</option>
                        {questionTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.typeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={fieldGroup}>
                      <label style={labelTiny}>Puntos XP</label>
                      <input
                        type="number"
                        step="0.5"
                        style={selectBase}
                        value={q.difficultyScore}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          const n = [...questions];
                          n[idx].difficultyScore = isNaN(value)
                            ? 1.0
                            : value;
                          setQuestions(n);
                        }}
                      />
                    </div>
                  </div>

                  {/* AUDIO */}
                  {usesAudio && (
                    <div style={audioBox}>
                      <label style={audioLabel}>Audio de referencia</label>
                      <div style={fileInlineRow}>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAudioFileChange(file, idx);
                          }}
                          style={nativeFileHidden}
                          id={`audio-${idx}`}
                        />
                        <label htmlFor={`audio-${idx}`} style={fileButton}>
                          Seleccionar audio
                        </label>
                        <span style={fileStatus}>
                          {q.audioUrl ? "Audio subido ✅" : "Ningún archivo"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Enunciado */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelTiny}>Pregunta o instrucción</label>
                    <input
                      style={inputSentence}
                      placeholder="Escribe el enunciado aquí..."
                      value={q.textSource}
                      onChange={(e) => {
                        const n = [...questions];
                        n[idx].textSource = e.target.value;
                        setQuestions(n);
                      }}
                    />
                  </div>

                  {/* Respuesta correcta */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelTinyCorrect}>Respuesta correcta</label>
                    <input
                      style={inputCorrect}
                      placeholder="La respuesta válida"
                      value={q.textTarget}
                      onChange={(e) => {
                        const n = [...questions];
                        n[idx].textTarget = e.target.value;
                        setQuestions(n);
                      }}
                    />
                  </div>

                  {/* Opciones */}
                  {usesOptions && (
                    <div style={optionsBox}>
                      <label style={labelTiny}>
                        {isOrdering
                          ? "Banco de palabras (en orden correcto)"
                          : "Opciones de respuesta"}
                      </label>

                      {q.options.map((opt: string, oIdx: number) => {
                        const fileId = `q${idx}-opt${oIdx}-file`;
                        return (
                          <div key={oIdx} style={optionRow}>
                            <span style={optionIndex}>{oIdx + 1}</span>

                            <input
                              style={optionInput}
                              placeholder={
                                isOrdering
                                  ? `Palabra ${oIdx + 1}`
                                  : `Opción ${oIdx + 1}`
                              }
                              value={opt}
                              onChange={(e) => {
                                const n = [...questions];
                                n[idx].options[oIdx] = e.target.value;
                                setQuestions(n);
                              }}
                            />

                            {isImageSelect && (
                              <div style={fileInputWrapper}>
                                <input
                                  id={fileId}
                                  type="file"
                                  accept="image/*"
                                  style={nativeFileHidden}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageFileChange(file, idx, oIdx);
                                    }
                                  }}
                                />
                                <label htmlFor={fileId} style={fileButtonSm}>
                                  Imagen
                                </label>
                                <span style={fileStatusSm}>
                                  {q.imageUrls?.[oIdx]
                                    ? "Subida ✅"
                                    : "Sin archivo"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        style={addReactivoButton}
                        onClick={() => {
                          const n = [...questions];
                          n[idx].options = [...n[idx].options, ""];
                          n[idx].imageUrls = [
                            ...(n[idx].imageUrls || []),
                            "",
                          ];
                          setQuestions(n);
                        }}
                      >
                        <IconPlus size={18} /> Añadir{" "}
                        {isOrdering ? "palabra" : "opción"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={addQuestion} style={addReactivoButtonBig}>
              <IconPlus size={20} />
              <span>AÑADIR OTRO REACTIVO</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD 2: LISTADO */}
      <div style={cardWrapper}>
        <h2 style={listTitle}>
          <IconList style={{ color: "#1cb0f6" }} />
          <span>Evaluaciones disponibles</span>
        </h2>

        {savedEvaluations.length === 0 ? (
          <div style={emptyState}>No hay evaluaciones.</div>
        ) : (
          <div style={evaluationsGrid}>
            {savedEvaluations.map((ev) => (
              <div key={ev.id} style={evaluationCard}>
                <h4 style={evaluationTitle}>{ev.title}</h4>
                <p style={evaluationMeta}>
                  <IconLayers /> {ev.questions?.length || 0} Preguntas
                </p>
                <button
                  onClick={() => {
                    setSelectedEval(ev);
                    setIsModalOpen(true);
                  }}
                  style={assignButton}
                >
                  Asignar a alumnos
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ASIGNACIÓN */}
      {isModalOpen && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={modalClose}
            >
              <IconX size={22} />
            </button>

            <h3 style={modalTitle}>Asignar reto</h3>

            <div style={tabsContainer}>
              <button
                onClick={() => setAssignmentMode("group")}
                style={{
                  ...tabButton,
                  ...(assignmentMode === "group"
                    ? tabButtonActiveBlue
                    : {}),
                }}
              >
                POR AULA
              </button>
              <button
                onClick={() => setAssignmentMode("student")}
                style={{
                  ...tabButton,
                  ...(assignmentMode === "student"
                    ? tabButtonActiveGreen
                    : {}),
                }}
              >
                POR ALUMNO
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              {assignmentMode === "group" ? (
                <select
                  style={selectBase}
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                >
                  <option value="">Selecciona aula...</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  style={selectBase}
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Selecciona alumno...</option>
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleAssign}
              style={{
                ...primaryButton,
                background:
                  assignmentMode === "group" ? "#1cb0f6" : "#58cc02",
                boxShadow:
                  assignmentMode === "group"
                    ? "0 4px 0 #1899d6"
                    : "0 4px 0 #46a302",
              }}
            >
              ENVIAR EXAMEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   ESTILOS
============================ */

const pageWrapper: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "32px 16px 64px",
  background:
    "linear-gradient(180deg, #f3f7ff 0%, #f7f7f7 32%, #f7f7f7 100%)",
  minHeight: "100vh",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardWrapper: CSSProperties = {
  background: "white",
  borderRadius: 32,
  padding: 32,
  marginBottom: 32,
  border: "1px solid #e4e4e4",
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
};

const headerRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 32,
};

const headerIconBox: CSSProperties = {
  background: "#1cb0f6",
  padding: 16,
  borderRadius: 24,
  color: "white",
  boxShadow: "0 4px 0 #1899d6",
};

const cardTitle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: "#3c3c3c",
  textTransform: "uppercase",
};

const cardSubtitle: CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 2,
  color: "#afafaf",
  fontWeight: 700,
};

const twoCols: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
  gap: 40,
  alignItems: "flex-start",
  marginTop: 12,
};

const leftCol: CSSProperties = {
  paddingRight: 8,
};

const rightCol: CSSProperties = {};

const stickyBox: CSSProperties = {
  position: "sticky",
  top: 24,
  paddingBottom: 16,
};

const labelSm: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  color: "#afafaf",
  textTransform: "uppercase",
  marginLeft: 8,
  marginBottom: 8,
  display: "block",
};

const inputMain: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 18,
  border: "2px solid #e5e5e5",
  background: "#fdfdfd",
  fontWeight: 700,
  marginBottom: 12,
  outline: "none",
};

const textareaMain: CSSProperties = {
  ...inputMain,
  minHeight: 110,
  fontWeight: 500,
  fontSize: 14,
};

const primaryButton: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 18,
  border: "none",
  background: "#58cc02",
  color: "white",
  fontWeight: 900,
  textTransform: "uppercase",
  boxShadow: "0 4px 0 #46a302",
};

const labelTiny: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  color: "#afafaf",
  textTransform: "uppercase",
  marginLeft: 4,
  marginBottom: 4,
  display: "block",
};

const labelTinyCorrect: CSSProperties = {
  ...labelTiny,
  color: "#58cc02",
};

const twoColsQuestions: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 16,
};

const fieldGroup: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const selectBase: CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "2px solid #e5e5e5",
  background: "#fafafa",
  fontWeight: 700,
  fontSize: 14,
};

const inputSentence: CSSProperties = {
  ...selectBase,
  padding: 14,
};

const inputCorrect: CSSProperties = {
  ...selectBase,
  padding: 14,
  background: "#f0fff4",
  borderColor: "#58cc02",
  color: "#2b612b",
};

const questionCard: CSSProperties = {
  background: "#ffffff",
  borderRadius: 26,
  padding: 22,
  border: "1px solid #e5e5e5",
  marginBottom: 18,
  boxShadow: "0 6px 16px rgba(0,0,0,0.02)",
};

const questionHeaderRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const pillReactivo: CSSProperties = {
  background: "#eef3ff",
  color: "#4a67d8",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 10,
  fontWeight: 900,
  textTransform: "uppercase",
};

const pillType: CSSProperties = {
  background: "#f8f8f8",
  color: "#888",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
};

const iconButton: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#c4c4c4",
  cursor: "pointer",
};

const audioBox: CSSProperties = {
  marginBottom: 16,
  padding: 12,
  borderRadius: 18,
  background: "#f4f8ff",
  border: "1px dashed #2b70c9",
};

const audioLabel: CSSProperties = {
  ...labelTiny,
  color: "#2b70c9",
  marginBottom: 6,
};

const optionsBox: CSSProperties = {
  marginTop: 8,
  padding: 14,
  borderRadius: 20,
  background: "#fafafa",
  border: "1px dashed #e0e0e0",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const optionRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "24px minmax(0,1fr) auto",
  gap: 8,
  alignItems: "center",
};

const optionIndex: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: "#cccccc",
  textAlign: "center",
};

const optionInput: CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 14,
  border: "2px solid #e5e5e5",
  fontSize: 14,
  fontWeight: 600,
};

const addReactivoButton: CSSProperties = {
  marginTop: 10,
  borderRadius: 18,
  border: "2px dashed #d0d0d0",
  background: "transparent",
  color: "#999",
  fontWeight: 800,
  fontSize: 12,
  padding: "8px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};

const addReactivoButtonBig: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 24,
  border: "3px dashed #dedede",
  background: "transparent",
  color: "#afafaf",
  fontWeight: 900,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  marginTop: 8,
};

const listTitle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#3c3c3c",
  textTransform: "uppercase",
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const emptyState: CSSProperties = {
  textAlign: "center",
  padding: "40px 0",
  color: "#afafaf",
  fontWeight: 700,
  fontStyle: "italic",
};

const evaluationsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16,
};

const evaluationCard: CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: "1px solid #e5e5e5",
  background: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
};

const evaluationTitle: CSSProperties = {
  fontWeight: 900,
  fontSize: 18,
  color: "#3c3c3c",
  marginBottom: 4,
};

const evaluationMeta: CSSProperties = {
  fontSize: 12,
  color: "#afafaf",
  fontWeight: 700,
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 16,
};

const assignButton: CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 18,
  border: "none",
  background: "#1cb0f6",
  color: "white",
  fontWeight: 900,
  textTransform: "uppercase",
  fontSize: 12,
  boxShadow: "0 4px 0 #1899d6",
  cursor: "pointer",
};

const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(60,60,60,0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  zIndex: 9999,
};

const modalCard: CSSProperties = {
  position: "relative",
  background: "white",
  borderRadius: 32,
  width: "100%",
  maxWidth: 420,
  padding: 28,
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
};

const modalClose: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  border: "none",
  background: "transparent",
  color: "#afafaf",
  cursor: "pointer",
};

const modalTitle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#3c3c3c",
  marginBottom: 20,
};

const tabsContainer: CSSProperties = {
  display: "flex",
  gap: 6,
  padding: 4,
  borderRadius: 24,
  background: "#f7f7f7",
  border: "1px solid #e5e5e5",
  marginBottom: 20,
};

const tabButton: CSSProperties = {
  flex: 1,
  padding: 10,
  borderRadius: 18,
  border: "none",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
  background: "transparent",
  color: "#afafaf",
};

const tabButtonActiveBlue: CSSProperties = {
  background: "white",
  color: "#1cb0f6",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
};

const tabButtonActiveGreen: CSSProperties = {
  background: "white",
  color: "#58cc02",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
};

const fileInputWrapper: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const nativeFileHidden: CSSProperties = {
  display: "none",
};

const fileButton: CSSProperties = {
  borderRadius: 16,
  border: "none",
  background: "#1cb0f6",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
  padding: "6px 12px",
  cursor: "pointer",
  boxShadow: "0 2px 0 #1899d6",
};

const fileStatus: CSSProperties = {
  fontSize: 11,
  color: "#666",
};

const fileInlineRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const fileButtonSm: CSSProperties = {
  ...fileButton,
  padding: "4px 10px",
  fontSize: 11,
};

const fileStatusSm: CSSProperties = {
  ...fileStatus,
  fontSize: 10,
};
