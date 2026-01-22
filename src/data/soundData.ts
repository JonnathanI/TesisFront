export interface SoundItem {
  icon: string;
  name: string;        // Lo que se muestra en la tarjeta
  translation: string; // Traducción al español (opcional para mostrar)
  pronunciation?: string; // Guía para el motor de voz
}

export interface SoundCategory {
  category: string;
  items: SoundItem[];
}

export const SOUND_DATA: SoundCategory[] = [
  {
    category: "The Alphabet (Abecedario)",
    items: [
      { icon: "A", name: "A", translation: "a", pronunciation: "ay" },
      { icon: "B", name: "B", translation: "be", pronunciation: "bee" },
      { icon: "C", name: "C", translation: "ce", pronunciation: "see" },
      { icon: "D", name: "D", translation: "de", pronunciation: "dee" },
      { icon: "E", name: "E", translation: "e", pronunciation: "ee" },
    ]
  },
  {
    category: "Numbers (Números)",
    items: [
      { icon: "1️⃣", name: "One", translation: "Uno" },
      { icon: "2️⃣", name: "Two", translation: "Dos" },
      { icon: "3️⃣", name: "Three", translation: "Tres", pronunciation: "th-ree" },
      { icon: "4️⃣", name: "Four", translation: "Cuatro" },
      { icon: "5️⃣", name: "Five", translation: "Cinco" },
    ]
  },
  {
    category: "Animals (Animales)",
    items: [
      { icon: "🐶", name: "Dog", translation: "Perro" },
      { icon: "🐱", name: "Cat", translation: "Gato" },
      { icon: "🦁", name: "Lion", translation: "León" },
      { icon: "🐘", name: "Elephant", translation: "Elefante" },
      { icon: "🐵", name: "Monkey", translation: "Mono" },
      { icon: "🐦", name: "Bird", translation: "Pájaro" },
    ]
  },
  {
    category: "Colors (Colores)",
    items: [
      { icon: "🔴", name: "Red", translation: "Rojo" },
      { icon: "🔵", name: "Blue", translation: "Azul" },
      { icon: "🟢", name: "Green", translation: "Verde" },
      { icon: "🟡", name: "Yellow", translation: "Amarillo" },
    ]
  }
];