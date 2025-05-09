import React, { useState, useEffect } from 'react';
import { Book, GraduationCap, FileCheck, Users, Award, Calculator, BookOpen } from "lucide-react";
import * as cheerio from 'cheerio';
import axios from 'axios';
import type { AnyNode } from 'domhandler';

import { Link } from "react-router-dom"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import flagImage from '../images/flag.png';
// Self-contained UI components
const Button = ({
  children,
  onClick,
  className = "",
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}) => (
  <button
    type={type}
    className={`px-4 py-2 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] focus:outline-none focus:ring-2 focus:ring-[#262628] focus:ring-opacity-50 transition-colors ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Input = ({ label, type = "text", value, onChange, className = "", min, max, step, ...props }: { label: string, type?: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string, min?: number, max?: number, step?: number, [key: string]: any }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[], className?: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const educationLevels = [
  "less_than_secondary", // Menor que secundario
  "secondary",           // Secundario
  "one_year_post_secondary", // Post-secundario de 1 año
  "two_year_post_secondary", // Post-secundario de 2 años
  "bachelors",            // Licenciatura
  "two_or_more_degrees",  // Dos o más títulos
  "masters",              // Maestría
  "doctoral"              // Doctorado
];

const meetsEducationRequirement = (userEducation: string, minEducation: string): boolean => {
  const userEducationIndex = educationLevels.indexOf(userEducation);
  const minEducationIndex = educationLevels.indexOf(minEducation);

  // Si el nivel de educación del usuario es igual o superior al mínimo requerido, cumple con el requisito
  return userEducationIndex >= minEducationIndex;
};


const Checkbox = ({ label, checked, onChange, className = "" }: { label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string }) => (
  <div className="flex items-center mb-4">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
    />
    <label className="ml-2 block text-sm text-gray-700">{label}</label>
  </div>
);

const Card = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <h3 className="text-lg font-medium text-black-900 mb-4">{title}</h3>
    {children}
  </div>
);

// Fixed type issues for language test input by ensuring values are numbers
const LanguageTestInput = ({ languageTest, values, onChange }: { 
  languageTest: string, 
  values: {
    speaking: number,
    listening: number,
    reading: number,
    writing: number,
    [key: string]: any
  }, 
  onChange: (skill: string, value: number) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Speaking"
      type="number"
      step={0.5}
      min={0}
      value={values.speaking}
      onChange={(e) => onChange("speaking", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Listening"
      type="number"
      step={0.5}
      min={0}
      value={values.listening}
      onChange={(e) => onChange("listening", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Reading"
      type="number"
      step={0.5}
      min={0}
      value={values.reading}
      onChange={(e) => onChange("reading", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Writing"
      type="number"
      step={0.5}
      min={0}
      value={values.writing}
      onChange={(e) => onChange("writing", parseFloat(e.target.value) || 0)}
    />
  </div>
);

// New LanguageSelectInput component to handle language test selection and CLB level input
const LanguageSelectInput = ({
  languageTest,
  values,
  onChange,
  crsConfig
}: {
  languageTest: string,
  values: CLBLevels,
  onChange: (skill: string, value: number) => void,
  crsConfig: CRSConfig | null
}) => {
  if (!crsConfig) return null;
  const conversion =
    crsConfig.languagePoints.firstLanguage.clbConversion[
      languageTest as keyof typeof crsConfig.languagePoints.firstLanguage.clbConversion
    ];

  const renderSkillDropdown = (skill: keyof CLBLevels) => {
    const skillData = conversion.find((row) => row.skill === skill);
    if (!skillData) return null;

    const uniqueValues: number[] = [...new Set(skillData.values)].filter((v): v is number => typeof v === "number" && v !== 0);
    uniqueValues.sort((a, b) => Number(a) - Number(b));

    let options: { value: number; label: string }[] = [];

    const hasEqualSteps = uniqueValues.every((val, i, arr) => {
      if (i === 0) return true;
      return Number(val) - Number(arr[i - 1]) === Number(arr[1]) - Number(arr[0]);
    });

    if (hasEqualSteps && uniqueValues.length < 15) {
      // Ejemplo: CELPIP (valores fijos)
      options = uniqueValues.map((val) => ({
        value: val as number,
        label: val.toString()
      }));
    } else {
      // Ejemplo: TEF / TCF → Mostrar como rangos
      for (let i = 0; i < uniqueValues.length; i++) {
        const current = uniqueValues[i];
        const next = uniqueValues[i + 1];
        if (next !== undefined) {
          options.push({
            value: current,
            label: `${current} - ${next - 1}`
          });
        } else {
          options.push({
            value: current,
            label: `${current}+`
          });
        }
      }
    }

    return (
      <Select
        key={skill}
        label={skill.charAt(0).toUpperCase() + skill.slice(1)}
        value={values[skill] === 0 ? "" : values[skill].toString()}
        onChange={(e) => onChange(skill, parseFloat(e.target.value))}
        options={[
          { value: "", label: "Select..." },
          ...options.map((opt) => ({
            value: opt.value.toString(),
            label: opt.label
          }))
        ]}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(["speaking", "listening", "reading", "writing"] as (keyof CLBLevels)[]).map((skill) =>
        renderSkillDropdown(skill)
      )}
    </div>
  );
};


//Calculo CLB de la persona
const checkLanguagePoints = (
  speaking: number,
  listening: number,
  reading: number,
  writing: number
) => {
  const lowestCLB = Math.min(speaking, listening, reading, writing);
  return lowestCLB
};


// Define the interface for CRS configurations and profiles
interface CRSConfig {
  agePoints: { age: number, withSpouse: number, withoutSpouse: number }[];
  educationPoints: { level: string, withSpouse: number, withoutSpouse: number }[];
  spouseEducationPoints: { level: string, points: number }[];
  languagePoints: {
    firstLanguage: {
      clbConversion: {
        IELTS: { [key: string]: any }[];
        CELPIP: { [key: string]: any }[];
        PTE: { [key: string]: any }[];
        TEF: { [key: string]: any }[];
        TCF: { [key: string]: any }[];
      },
      points: { skill: string, [key: string]: any }[];
      pointsWithSpouse: { skill: string, [key: string]: any }[];
      spousePoints: { skill: string, [key: string]: any }[];
    },
    secondLanguage: {
      points: { skill: string, [key: string]: any }[];
    }
  };
  workExperiencePoints: {
    foreign: { years: number, withSpouse: number, withoutSpouse: number }[];
    canadian: { years: number, withSpouse: number, withoutSpouse: number }[];
    spouseExperience: { years: number, points: number }[];
  };
  transferabilityPoints: {
    education: {
      clb7: { level: string, points: number }[];
      clb9: { level: string, points: number }[];
    };
    foreignWorkExperience: {
      clb7: { years: number, points: number }[];
      clb9: { years: number, points: number }[];
    };
    canadianWorkExperience: {
      foreignExperience: { canadianYears: number, foreignYears: number, points: number }[];
      educationCombination: { canadianYears: number, level: string, points: number }[];
    };
    tradesCertification: {
      clb5: number;
      clb7: number;
    };
  };
  additionalPoints: {
    canadianEducation: { level: string, points: number }[];
    provincialNomination: number;
    arrangedEmployment: {
      noc_00: number;
      noc_0_A_B: number;
      other: number;
    };
    canadianSibling: number;
    frenchLanguage: {
      nclc7: number;
      nclc7_english_clb4: number;
    };
  };
  programMinimums: {
    FSW: {
      minLanguagePoints: number;
      minEducation: string;
      minExperience: number;
      minPoints: number;
    };
    CEC: {
      minLanguagePoints: {
        NOC_0_A: number;
        NOC_B: number;
      };
      minCanadianExperience: number;
    };
    FST: {
      minLanguagePoints: {
        speaking: number;
        listening: number;
        reading: number;
        writing: number;
      };
      minExperience: number;
    };
  };
}

// Define proper typing for CLB levels
interface CLBLevels {
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
}

interface UserProfile {
  age: number;
  maritalStatus: string;
  education: string;
  canadianEducation: string;
  firstLanguage: {
    test: string;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  secondLanguage: {
    test: string;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  canadianWorkExperience: number;
  foreignWorkExperience: number;
  spouseEducation: string;
  spouseLanguage: {
    test: string;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  spouseWorkExperience: number;
  provincialNomination: boolean;
  jobOffer: string;
  canadianSibling: boolean;
  frenchOnly: boolean;
  frenchAndEnglish: boolean;
  tradesCertification: boolean;
  nocCategory: string;
}

// Initial empty profile
const initialProfile: UserProfile = {
  age: 30,
  maritalStatus: "single",
  education: "bachelors",
  canadianEducation: "none",
  firstLanguage: {
    test: "IELTS",
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0
  },
  secondLanguage: {
    test: "TEF",
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0
  },
  canadianWorkExperience: 0,
  foreignWorkExperience: 0,
  spouseEducation: "bachelors",
  spouseLanguage: {
    test: "IELTS",
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0
  },
  spouseWorkExperience: 0,
  provincialNomination: false,
  jobOffer: "none",
  canadianSibling: false,
  frenchOnly: false,
  frenchAndEnglish: false,
  tradesCertification: false,
  nocCategory: "0"
};

//FSW eligibility check
// Función para calcular puntos según la edad (máximo 12 puntos)
const getAgePoints = (age: number): number => {
  if (age < 18 || age > 47) return 0;
  if (age <= 35) return 12;
  if (age === 36) return 11;
  if (age === 37) return 10;
  if (age === 38) return 9;
  if (age === 39) return 8;
  if (age === 40) return 7;
  if (age === 41) return 6;
  if (age === 42) return 5;
  if (age === 43) return 4;
  if (age === 44) return 3;
  if (age === 45) return 2;
  if (age === 46) return 1;
  return 0;
};

// Función para calcular los puntos de idioma (máximo 24 puntos)
const getLanguagePoints = (
  speaking: number,
  listening: number,
  reading: number,
  writing: number
): number => {
  const languageThresholds = [7, 8, 9]; // CLB 7, 8, 9

  let points = 0;

  // Calculamos puntos de cada habilidad basada en los umbrales
  if (speaking >= 7) points += 6;
  if (listening >= 7) points += 6;
  if (reading >= 7) points += 6;
  if (writing >= 7) points += 6;

  return points; // Retorna los puntos obtenidos
};


// Función para calcular puntos de educación (máximo 25 puntos)
const getEducationPoints = (education: string): number => {
  const educationPoints: { [key: string]: number } = {
    secondary: 30,
    one_year_post_secondary: 84,
    two_year_post_secondary: 91,
    bachelors: 112,
    two_or_more_degrees: 119,
    masters: 126,
    doctoral: 140,
  };

  return educationPoints[education] || 0; // Retorna 0 si no coincide con los niveles predefinidos
};

// Función para calcular puntos de experiencia laboral (máximo 15 puntos)
const getWorkExperiencePoints = (experience: number): number => {
  if (experience === 1) return 9;
  if (experience === 2 || experience === 3) return 11;
  if (experience === 4 || experience === 5) return 13;
  if (experience >= 6) return 15;
  return 0; // Si no cumple con los criterios de experiencia, no se asignan puntos
};

// Función para calcular puntos de adaptabilidad (máximo 10 puntos)
const getAdaptabilityPoints = (profile: any): number => {
  let points = 0;

  // Ejemplo de adaptabilidad: si el cónyuge tiene un nivel CLB 5 en todos los aspectos
  if (profile.spouseLanguage.speaking >= 5 && profile.spouseLanguage.listening >= 5 &&
      profile.spouseLanguage.reading >= 5 && profile.spouseLanguage.writing >= 5) {
    points += 5;
  }

  // Estudio pasado en Canadá (debe estar presente en el perfil)
  if (profile.pastStudiesInCanada) points += 5;

  return points; // Retorna los puntos de adaptabilidad
};




// Recommendations

interface RecommendationProps {
  englishScore?: number
  frenchScore?: number
  spouseLanguageScore?: number
  totalScore: number
  eligiblePrograms: string[]
  lastDrawScore?: number
  maritalStatus: string;
}

export function ScoreImprovementCards({
  englishScore,
  frenchScore,
  spouseLanguageScore,
  totalScore,
  eligiblePrograms,
  lastDrawScore,
  maritalStatus,
  crsConfig,
  results
}: RecommendationProps & { crsConfig: CRSConfig, results: any }) {
  console.log(englishScore, frenchScore, spouseLanguageScore, totalScore, eligiblePrograms, lastDrawScore, maritalStatus)
  const recommendations = [];

  const getEnglishImprovement = (currentCLB: CLBLevels, targetCLB: number): number => {
    const pointsTable = maritalStatus === "married"
      ? crsConfig.languagePoints.firstLanguage.pointsWithSpouse
      : crsConfig.languagePoints.firstLanguage.points;
  
    let currentPoints = 0;
    let targetPoints = 0;
  
    pointsTable.forEach((row) => {
      const skill = row.skill as keyof CLBLevels;
      const currentLevel = currentCLB[skill];
      const currentKey = `clb${currentLevel}`;
      const targetKey = `clb${Math.max(currentLevel, targetCLB)}`; // no bajes de lo que ya tiene
  
      currentPoints += row[currentKey] || 0;
      targetPoints += row[targetKey] || 0;
    });
  
    const gain = targetPoints - currentPoints;
  
    console.log(`[English] From CLB ${Math.min(...Object.values(currentCLB))} → ${targetCLB}`);
    console.log(`- First Language CRS: from ${currentPoints} → ${targetPoints} = +${gain}`);
  
    return gain;
  };
  

  const getFrenchImprovement = (currentCLB: CLBLevels, targetCLB: number): number => {
    const pointsTable = crsConfig.languagePoints.secondLanguage.points;
  
    let currentPoints = 0;
    let targetPoints = 0;
  
    pointsTable.forEach((row) => {
      const skill = row.skill;
      const currentLevel = currentCLB[skill as keyof CLBLevels];
      const currentKey = `clb${currentLevel}`;
      const targetKey = `clb${targetCLB}`;
  
      currentPoints += row[currentKey] || 0;
      targetPoints += row[targetKey] || 0;
    });
  
    let coreImprovement = targetPoints - currentPoints;
  
    const baseBonus = crsConfig.additionalPoints.frenchLanguage.nclc7;
    const extendedBonus = crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;
  
    const hadBonus = Object.values(currentCLB).every((v) => v >= 7);
    const willHaveBonus = targetCLB >= 7;
  
    // Bonos por francés
    coreImprovement += extendedBonus + baseBonus;
  
    console.log(`[French] From CLB ${Math.min(...Object.values(currentCLB))} → ${targetCLB}`);
    console.log(`- Second Language CRS: from ${currentPoints} → ${targetPoints} = +${targetPoints - currentPoints}`);
    console.log(`- Bonus CRS Points: ${coreImprovement - (targetPoints - currentPoints)}`);
    console.log(`- TOTAL Gain: ${coreImprovement}`);
  
    return coreImprovement;
  };
  
   

  // Verificar puntaje de inglés
  if (englishScore !== undefined && englishScore < 9) {
    const extraPoints = getEnglishImprovement(results.clbLevels.firstLanguage, 9);
    recommendations.push({
      title: "Mejora tu nivel de Inglés",
      description: `Con los cursos de preparación CELPIP de Planeta Immiland Education puedes mejorar tu nivel de inglés. Si llegas a CLB 9, podrías ganar aproximadamente ${extraPoints} puntos CRS adicionales, alcanzando un total de ${extraPoints + totalScore} puntos CRS.`,
      icon: <Book className="h-6 w-6" />,
      link: "https://www.planeta-immiland-education.com/store-celpip-preparation"
    });
  }
  
  if (frenchScore !== undefined && frenchScore !== 0 && frenchScore < 7) {
    const extraPoints = getFrenchImprovement(results.clbLevels.secondLanguage, 7);
    recommendations.push({
      title: "Mejora tu Francés",
      description: `Al alcanzar CLB 7 en francés, podrías sumar hasta ${extraPoints} puntos adicionales (incluyendo bonificaciones si también hablas inglés), alcanzando un total de ${extraPoints + totalScore} puntos CRS. Ademas, podrias ser elegible a las rondas de FLP.`,
      icon: <GraduationCap className="h-6 w-6" />,
      link: "https://www.planeta-immiland-education.com/cursos-frances"
    });
  }
  

  // Nada de francés
if (!frenchScore) {
  const baseBonus = crsConfig.additionalPoints.frenchLanguage.nclc7;
  const extendedBonus = crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;

  const currentCLB = { speaking: 0, listening: 0, reading: 0, writing: 0 };
  const corePoints = getFrenchImprovement(currentCLB, 7);
  const bonus = englishScore && englishScore >= 5 ? extendedBonus : baseBonus;

  const totalGain = corePoints + bonus;

  recommendations.push({
    title: "Aprende Francés",
    description: `Si aprendes francés y alcanzas CLB 7, podrías sumar hasta ${totalGain} puntos CRS (incluye bonificación por inglés en CLB 5) alcanzando un total de ${totalGain + totalScore} puntos CRS. Ademas, podrias ser elegible a las rondas de FLP.`,
    icon: <GraduationCap className="h-6 w-6" />,
    link: "https://www.planeta-immiland-education.com/cursos-frances"
  });
}

// Solo francés sin inglés mínimo
if (frenchScore && (!englishScore || englishScore < 5)) {
  const bonus = crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;
  const englishCore = getEnglishImprovement(results.clbLevels.firstLanguage, 5); // Usa el idioma que tenga inglés

  const totalGain = bonus + englishCore;

  recommendations.push({
    title: "Aprende Inglés",
    description: `Si alcanzas CLB 5 en inglés junto con tu francés, podrías sumar hasta ${totalGain} puntos CRS (incluye bonificación combinada por ambos idiomas).`,
    icon: <GraduationCap className="h-6 w-6" />,
    link: "https://www.planeta-immiland-education.com/programas-ingles"
  });
}

  

  // Puntaje competitivo
  if (eligiblePrograms.length > 0 && lastDrawScore && totalScore >= lastDrawScore - 50) {
    recommendations.push({
      title: "¡Comienza tu Proceso!",
      description: "Tu puntaje es competitivo. Cotiza tu proceso de inmigración con nosotros.",
      icon: <Award className="h-6 w-6" />,
      link: "https://flow.immiland.app/flow/4e52566e-eefe-41e4-8123-5d51910c9402"
    });
  }

  // Elegible pero puntos bajos
  if (totalScore < lastDrawScore - 50) {
    recommendations.push({
      title: "Consulta Migratoria",
      description: "Agenda una consulta para explorar cómo mejorar tu perfil y aumentar tus posibilidades.",
      icon: <Calculator className="h-6 w-6" />,
      link: "https://en.immilandcanada.com/migration/consultations"
    });
  }

  // Recomendaciones para la pareja
  if (maritalStatus === "married" && spouseLanguageScore !== undefined && spouseLanguageScore < 7) {
    recommendations.push({
      title: "Mejora el Idioma de tu Pareja",
      description: "Cursos de inglés y francés disponibles para maximizar sus puntos.",
      icon: <Users className="h-6 w-6" />,
      links: {
        english: "https://www.planeta-immiland-education.com/programas-ingles",
        french: "https://www.planeta-immiland-education.com/cursos-frances"
      }
    });
  }

  // Si puede aplicar a algún programa, agregar opciones de guía/revisión
  if (eligiblePrograms.length > 0) {
    recommendations.push({
      title: "Revisión Previa",
      description: "¿Tienes tus documentos listos? Asegura tu aplicación con nuestro servicio de revisión previa.",
      icon: <FileCheck className="h-6 w-6" />,
      link: "https://en.immilandcanada.com/migration/revision-previa-a-envio"
    });

    recommendations.push({
      title: "Guía de Aplicación",
      description: "Obtén nuestra guía detallada para aplicar por ti mismo.",
      icon: <BookOpen className="h-6 w-6" />,
      link: "https://en.immilandcanada.com/migration/other-services"
    });
  }

  return (
    <Card title="Recomendaciones Personalizadas">
      {recommendations.length === 0 ? (
        <p className="text-center text-gray-600">No se encontraron recomendaciones basadas en tu perfil.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={index} title={rec.title} className="h-full flex flex-col justify-between">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">{rec.icon}</div>
                <p className="text-gray-700">{rec.description}</p>
              </div>

              {"links" in rec ? (
                <div className="space-y-2">
                  <a
                    href={rec.links.english}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 px-4 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] transition"
                  >
                    Curso de Inglés ↗
                  </a>
                  <a
                    href={rec.links.french}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 px-4 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] transition"
                  >
                    Curso de Francés ↗
                  </a>
                </div>
              ) : (
                <a
                  href={rec.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 px-4 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] transition"
                >
                  Más Información ↗
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}

// Main calculator component
const CRSCalculator = () => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [crsConfig, setCRSConfig] = useState<CRSConfig | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);
  const [agregarPareja, setAgregarPareja] = useState("no");

  type CutOffScores = {
    FSW: number | null;
    CEC: number | null;
    FST: number | null;
    PNP: number | null;
    FLP: number | null;
    General: number | null;
  };
  
  const [cutOffScores, setCutOffScores] = useState<CutOffScores>({
    FSW: null,
    CEC: null,
    FST: null,
    PNP: null,
    FLP: null,
    General: null,
  });

  useEffect(() => {
    const getLatestCutOffScores = (rounds: any[]): CutOffScores => {
      const scores: CutOffScores = {
        FSW: null,
        CEC: null,
        FST: null,
        PNP: null,
        FLP: null,
        General: null,
      };

      for (const round of rounds) {
        const name = round.drawName.toLowerCase();
        const text = round.drawText2.toLowerCase();
        const crs = parseInt(round.drawCRS);
        if (isNaN(crs)) continue;
    
        // FLP: French language proficiency
        if (name.includes('french language proficiency') && scores.FLP === null) {
          scores.FLP = crs;
          continue;
        }
    
        // PNP: Provincial Nominee Program
        if (name.includes('provincial nominee program') && scores.PNP === null) {
          scores.PNP = crs;
          continue;
        }
    
        // FST: buscar "occupations" en drawName o drawText2
        if ((name.includes('occupations') || text.includes('occupations')) && scores.FST === null) {
          scores.FST = crs;
          continue;
        }
    
        // General: debe incluir los tres programas
        if (
          name.includes('general') &&
          scores.General === null
        ) {
          scores.General = crs;
          continue;
        }
    
        // FSW: solo si es exclusivo
        if (
          text.includes('federal skilled worker') &&
          !text.includes('canadian experience class') &&
          !text.includes('federal skilled trades') &&
          scores.FSW === null
        ) {
          scores.FSW = crs;
          continue;
        }
    
        // CEC: solo si es exclusivo
        if (
          text.includes('canadian experience class') &&
          !text.includes('federal skilled worker') &&
          !text.includes('federal skilled trades') &&
          scores.CEC === null
        ) {
          scores.CEC = crs;
          continue;
        }
    
        if (Object.values(scores).every((v) => v !== null)) break;
      }
      console.log(scores)
      return scores;
    }

    fetch('https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json')
      .then((res) => res.json())
      .then((data) => {
        const scores = getLatestCutOffScores(data.rounds);
        setCutOffScores(scores);
      })
      .catch((err) => console.error('Failed to fetch cut-off scores:', err));
  }, []);


  const url = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html';
  

  function extractTableData($: cheerio.CheerioAPI, table: cheerio.Cheerio<AnyNode>) {
    const rows = table.find('tbody tr');
    const data: { label: string; values: string[] }[] = [];
  
    rows.each((_, row) => {
      const cols = $(row).find('td');
      const label = $(cols[0]).text().trim();
      const values = [...cols]
        .slice(1)
        .map((td) => $(td).text().trim().replace(/\u00a0/g, ' ')); // reemplazo de &nbsp;
  
      data.push({ label, values });
    });
  
    return data;
  }

  (async () => {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
  
    const findTablesFromDetails = (id: string): cheerio.Cheerio<AnyNode>[] => {
      const section = $(`#${id}`).nextAll('details').first();
      const tables: cheerio.Cheerio<AnyNode>[] = [];
      section.find('table').each((_, table) => {
        tables.push($(table));
      });
      return tables;
    };

  // Core/human capital factors
  const coreTables = findTablesFromDetails('core');
  const coreHumanCapital = {
    age: extractTableData($, coreTables[0]),
    education: extractTableData($, coreTables[1]),
    firstLanguage: extractTableData($, coreTables[2]),
    secondLanguage: extractTableData($, coreTables[3]),
    canadianExperience: extractTableData($, coreTables[4]),
  };

  // Spouse or common-law partner factors
  const spouseTables = findTablesFromDetails('spouse');
  const spouseFactors = {
    education: extractTableData($, spouseTables[0]),
    language: extractTableData($, spouseTables[1]),
    canadianExperience: extractTableData($, spouseTables[2]),
  };

  // Skill transferability factors
  const skillTables = findTablesFromDetails('skill');
  const skillTransferability = {
    educationCLB: extractTableData($, skillTables[0]),
    educationWork: extractTableData($, skillTables[1]),
    foreignExpCLB: extractTableData($, skillTables[2]),
    foreignExpWork: extractTableData($, skillTables[3]),
    certificate: extractTableData($, skillTables[4]),
  };

  // Additional points
  const extraTables = findTablesFromDetails('extra');
  const additionalPoints = extractTableData($, extraTables[0]);

  // Output JSON structure
  const crsConfig = {
    coreHumanCapital,
    spouseFactors,
    skillTransferability,
    additionalPoints,
  };

  console.log(crsConfig, { depth: null });
})();

function expandAgeLabel(label: string): number[] {
  if (label.includes('to')) {
    const [start, end] = label.match(/\d+/g)!.map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  if (label.includes('or less')) return [17];
  if (label.includes('or more')) return [45];
  const match = label.match(/\d+/);
  return match ? [parseInt(match[0])] : [];
}

function normalizeEducation(label: string): string {
  if (/less than|none/i.test(label)) return 'less_than_secondary';
  if (/secondary/i.test(label)) return 'secondary';
  if (/one[- ]year/i.test(label)) return 'one_year_post_secondary';
  if (/two[- ]year/i.test(label)) return 'two_year_post_secondary';
  if (/bachelor/i.test(label)) return 'bachelors';
  if (/two or more certificates|degrees/i.test(label)) return 'two_or_more_degrees';
  if (/master|professional/i.test(label)) return 'masters';
  if (/doctoral|phd/i.test(label)) return 'doctoral';
  return 'unknown';
}

function expandCLBLabel(label: string): number[] {
  if (label.match(/\d+\s*or more/)) {
    const val = parseInt(label.match(/\d+/)![0]);
    return [val, 10];
  } else if (label.match(/less than CLB\s*\d+/i)) {
    const max = parseInt(label.match(/\d+/)![0]);
    return Array.from({ length: max - 1 }, (_, i) => i + 1);
  } else if (label.match(/CLB\s*\d+\s*or less/)) {
    const max = parseInt(label.match(/\d+/)![0]);
    return Array.from({ length: max }, (_, i) => i + 1);
  } else if (label.match(/CLB\s*\d+\s*or more/)) {
    const val = parseInt(label.match(/\d+/)![0]);
    return [val, 10];
  } else if (label.includes('to')) {
    const [start, end] = label.match(/\d+/g)!.map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else if (label.includes('or')) {
    return label.match(/\d+/g)!.map(Number);
  } else {
    const single = label.match(/\d+/);
    return single ? [parseInt(single[0])] : [];
  }
}

function extractCLBFromLabel(label: string): number[] {
  return expandCLBLabel(label);
}

function parseCLBPointsToSkillBased(clbData: any[], skill: string) {
  const clbMap: any = { skill };
  clbData.forEach((row: any) => {
    const clbs = extractCLBFromLabel(row.label);
    clbs.forEach(clb => {
      clbMap[`clb${clb}`] = parseInt(row.values[1]);
    });
  });
  return clbMap;
}

function parseCLBPointsToSkillBasedWithSpouse(clbData: any[], skill: string) {
  const clbMap: any = { skill };
  clbData.forEach((row: any) => {
    const clbs = extractCLBFromLabel(row.label);
    clbs.forEach(clb => {
      clbMap[`clb${clb}`] = parseInt(row.values[0]);
    });
  });
  return clbMap;
}

function parseSpouseCLBPointsToSkills(clbData: any[], skill: string) {
  const clbMap: any = { skill };
  clbData.forEach((row: any) => {
    const clbs = extractCLBFromLabel(row.label);
    clbs.forEach(clb => {
      clbMap[`clb${clb}`] = parseInt(row.values[0]);
    });
  });
  return clbMap;
}

function generateLanguagePoints(first: any[], second: any[], spouse: any[]) {
  const skills = ['speaking', 'listening', 'reading', 'writing'];

  return {
    firstLanguage: {
      clbConversion: {
        IELTS: [
          { skill: 'reading', values: [0, 3.5, 4.0, 5.0, 6.0, 6.5, 7.0, 8.0], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'writing', values: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'listening', values: [0, 4.5, 5.0, 5.5, 6.0, 7.5, 8.0, 8.5], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'speaking', values: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5], clb: [0, 4, 5, 6, 7, 8, 9, 10] }
        ],
        CELPIP: [
          { skill: 'reading', values: [0, 4, 5, 6, 7, 8, 9, 10], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'writing', values: [0, 4, 5, 6, 7, 8, 9, 10], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'listening', values: [0, 4, 5, 6, 7, 8, 9, 10], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'speaking', values: [0, 4, 5, 6, 7, 8, 9, 10], clb: [0, 4, 5, 6, 7, 8, 9, 10] }
        ],
        TEF: [
          { skill: 'reading', values: [0, 306, 352, 393, 434, 462, 503, 546], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'writing', values: [0, 268, 330, 379, 428, 472, 512, 558], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'listening', values: [0, 306, 352, 393, 434, 462, 503, 546], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'speaking', values: [0, 328, 387, 422, 456, 494, 518, 556], clb: [0, 4, 5, 6, 7, 8, 9, 10] }
        ],
        TCF: [
          { skill: 'reading', values: [0, 342, 375, 406, 453, 499, 524, 549], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'writing', values: [0, 4, 6, 7, 10, 12, 14, 16], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'listening', values: [0, 331, 369, 398, 458, 503, 523, 549], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'speaking', values: [0, 4, 6, 7, 10, 12, 14, 16], clb: [0, 4, 5, 6, 7, 8, 9, 10] }
        ],
        PTE: [
          { skill: 'listening', values: [18, 28, 39, 50, 60, 71, 82, 89], clb: [3, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'reading', values: [24, 33, 42, 51, 60, 69, 78, 88], clb: [3, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'speaking', values: [34, 42, 51, 59, 68, 76, 84, 89], clb: [3, 4, 5, 6, 7, 8, 9, 10] },
          { skill: 'writing', values: [32, 41, 51, 60, 69, 79, 88, 90], clb: [3, 4, 5, 6, 7, 8, 9, 10] }
        ]
      },
      points: skills.map(skill => parseCLBPointsToSkillBased(first, skill)),
      pointsWithSpouse: skills.map(skill => parseCLBPointsToSkillBasedWithSpouse(first, skill)),
      spousePoints: skills.map(skill => parseSpouseCLBPointsToSkills(spouse, skill))
    },
    secondLanguage: {
      points: skills.map(skill => parseCLBPointsToSkillBased(second, skill))
    }
  };
}

function parseExperiencePoints(coreExp: any[], spouseExp: any[]): any {
  const foreign = [
    { years: 0, withSpouse: 0, withoutSpouse: 0 },
    { years: 1, withSpouse: 13, withoutSpouse: 25 },
    { years: 2, withSpouse: 25, withoutSpouse: 50 },
    { years: 3, withSpouse: 38, withoutSpouse: 75 },
  ];

  const canadian = coreExp.map((row: any) => {
    const yearMatch = row.label.match(/(\d+)/);
    const years = yearMatch ? parseInt(yearMatch[1]) : 0;
    return {
      years,
      withSpouse: parseInt(row.values[0]),
      withoutSpouse: parseInt(row.values[1])
    };
  });

  const spouseExperience = spouseExp.map((row: any) => {
    const yearMatch = row.label.match(/(\d+)/);
    const years = yearMatch ? parseInt(yearMatch[1]) : 0;
    return {
      years,
      points: parseInt(row.values[0])
    };
  });

  return {
    foreign,
    canadian,
    spouseExperience
  };
}

function parseTransferabilityPoints(skill: any) {
  const labelsMap: Record<string, string> = {
    'Secondary school (high school) credential or less': 'secondary',
    'Post-secondary program credential of one year or longer': 'one_year_post_secondary',
    'Two or more post-secondary program credentials AND at least one of these credentials was issued on completion of a post-secondary program of three years or longer': 'two_or_more_degrees',
    "A university-level credential at the master’s level or at the level of an entry-to-practice professional degree for an occupation listed in the National Occupational Classification matrix at Skill Level A for which licensing by a provincial regulatory body is required": 'masters',
    'A university-level credential at the doctoral level': 'doctoral'
  };

  const education = {
    clb7: skill.educationCLB.map((row: any) => ({
      level: labelsMap[row.label] || 'unknown',
      points: parseInt(row.values[0])
    })),
    clb9: skill.educationCLB.map((row: any) => ({
      level: labelsMap[row.label] || 'unknown',
      points: parseInt(row.values[1])
    })),
  };

  const foreignWorkExperience = {
    clb7: [
      { years: 1, points: parseInt(skill.foreignExpCLB[1].values[0]) },
      { years: 2, points: parseInt(skill.foreignExpCLB[1].values[0]) },
      { years: 3, points: parseInt(skill.foreignExpCLB[2].values[0]) }
    ],
    clb9: [
      { years: 1, points: parseInt(skill.foreignExpCLB[1].values[1]) },
      { years: 2, points: parseInt(skill.foreignExpCLB[1].values[1]) },
      { years: 3, points: parseInt(skill.foreignExpCLB[2].values[1]) }
    ]
  };

  const canadianWorkExperience = {
    foreignExperience: skill.foreignExpWork.flatMap((row: any) => {
      const years = row.label.includes('3') ? 3 : row.label.includes('2') ? 2 : 1;
      return [1, 2].map(canadianYears => ({
        canadianYears,
        foreignYears: years,
        points: parseInt(row.values[canadianYears - 1])
      }));
    }),
    educationCombination: skill.educationWork.flatMap((row: any) => {
      const level = labelsMap[row.label] || 'unknown';
      return [1, 2].map(canadianYears => ({
        canadianYears,
        level,
        points: parseInt(row.values[canadianYears - 1])
      }));
    })
  };

  console.log('Canadian Work Experience:', canadianWorkExperience)

  const tradesCertification = {
    clb5: skill.certificate?.[0]?.values?.[0] ? parseInt(skill.certificate[0].values[0]) : 0,
    clb7: skill.certificate?.[0]?.values?.[1] ? parseInt(skill.certificate[0].values[1]) : 0
  };

  return {
    education,
    foreignWorkExperience,
    canadianWorkExperience,
    tradesCertification
  };
}



function parseAdditionalPoints(extra: any[]) {
  const points: any = {
    canadianEducation: [],
    provincialNomination: 0,
    arrangedEmployment: {
      noc_00: 0,
      noc_0_A_B: 0,
      other: 0
    },
    canadianSibling: 0,
    frenchLanguage: {
      nclc7: 0,
      nclc7_english_clb4: 0
    }
  };

  extra.forEach(row => {
    const label = row.label.toLowerCase();
    const val = parseInt(row.values[0]);

    if (label.includes('brother or sister')) points.canadianSibling = val;
    else if (label.includes('post-secondary education in canada') && label.includes('one or two')) points.canadianEducation.push({ level: 'one_or_two_year', points: val });
    else if (label.includes('post-secondary education in canada') && label.includes('three') || label.includes('master')) points.canadianEducation.push({ level: 'three_year_or_masters', points: val });
    else if (label.includes('doctoral')) points.canadianEducation.push({ level: 'doctoral', points: val });
    else if (label.includes('provincial or territorial nomination')) points.provincialNomination = val;
    else if (label.includes('certificate of qualification')) points.tradesCertification = val;
    else if (label.includes('french') && label.includes('clb 4 or lower')) points.frenchLanguage.nclc7 = val;
    else if (label.includes('french') && label.includes('clb 5 or higher')) points.frenchLanguage.nclc7_english_clb4 = val;
  });

  return points;
}

function parseProgramMinimums() {
  return {
    FSW: {
      minLanguagePoints: 7,
      minEducation: 'secondary',
      minExperience: 1,
      minPoints: 67
    },
    CEC: {
      minLanguagePoints: {
        NOC_0_A: 7,
        NOC_B: 5
      },
      minCanadianExperience: 1
    },
    FST: {
      minLanguagePoints: {
        speaking: 5,
        listening: 5,
        reading: 4,
        writing: 4
      },
      minExperience: 2
    }
  };
}

 function transformCRSConfig(crsConfig: any) {
  const agePoints = crsConfig.coreHumanCapital.age.flatMap((item: any) => {
    const ages = expandAgeLabel(item.label);
    return ages.map(age => ({
      age,
      withSpouse: parseInt(item.values[0]),
      withoutSpouse: parseInt(item.values[1])
    }));
  });

  const educationPoints = crsConfig.coreHumanCapital.education.map((item: any) => ({
    level: normalizeEducation(item.label),
    withSpouse: parseInt(item.values[0]),
    withoutSpouse: parseInt(item.values[1])
  }));
  educationPoints.push({ level: "none", withSpouse: 0, withoutSpouse: 0 });

  const spouseEducationPoints = crsConfig.spouseFactors.education.map((item: any) => ({
    level: normalizeEducation(item.label),
    points: parseInt(item.values[0])
  }));

  spouseEducationPoints.push({ level: "none", points: 0 });

  const workExperiencePoints = parseExperiencePoints(
    crsConfig.coreHumanCapital.canadianExperience,
    crsConfig.spouseFactors.canadianExperience
  );

  const transferabilityPoints = parseTransferabilityPoints(crsConfig.skillTransferability);
  const additionalPoints = parseAdditionalPoints(crsConfig.additionalPoints);
  const programMinimums = parseProgramMinimums();
  const languagePoints = generateLanguagePoints(
    crsConfig.coreHumanCapital.firstLanguage,
    crsConfig.coreHumanCapital.secondLanguage,
    crsConfig.spouseFactors.language
  );

  return {
    agePoints,
    educationPoints,
    spouseEducationPoints,
    languagePoints,
    workExperiencePoints,
    transferabilityPoints,
    additionalPoints,
    programMinimums
  };
}

(async () => {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const findTablesFromDetails = (id: string): cheerio.Cheerio<AnyNode>[] => {
    const section = $(`#${id}`).nextAll('details').first();
    const tables: cheerio.Cheerio<AnyNode>[] = [];
    section.find('table').each((_, table) => {
      tables.push($(table));
    });
    return tables;
  };

  const coreTables = findTablesFromDetails('core');
  const coreHumanCapital = {
    age: extractTableData($, coreTables[0]),
    education: extractTableData($, coreTables[1]),
    firstLanguage: extractTableData($, coreTables[2]),
    secondLanguage: extractTableData($, coreTables[3]),
    canadianExperience: extractTableData($, coreTables[4]),
  };

  const spouseTables = findTablesFromDetails('spouse');
  const spouseFactors = {
    education: extractTableData($, spouseTables[0]),
    language: extractTableData($, spouseTables[1]),
    canadianExperience: extractTableData($, spouseTables[2]),
  };

  const skillTables = findTablesFromDetails('skill');
  const skillTransferability = {
    educationCLB: extractTableData($, skillTables[0]),
    educationWork: extractTableData($, skillTables[1]),
    foreignExpCLB: extractTableData($, skillTables[2]),
    foreignExpWork: extractTableData($, skillTables[3]),
    certificate: extractTableData($, skillTables[4]),
  };

  const extraTables = findTablesFromDetails('extra');
  const additionalPoints = extractTableData($, extraTables[0]);

  const crsConfig = {
    coreHumanCapital,
    spouseFactors,
    skillTransferability,
    additionalPoints,
  };


})(); 



  const fetchCRSConfig = async () => {
    const url = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
  
    const parsePoints = (str: string) => parseInt(str.replace(/[^0-9]/g, '') || '0', 10);
  
    const parseAgePoints = () => {
      const result: { age: number, withSpouse: number, withoutSpouse: number }[] = [];
      $('table').each((_, table) => {
        const headers = $(table).find('thead th');
        const firstCol = $(headers[0]).text().toLowerCase();
        if (firstCol.includes('age')) {
          $(table).find('tbody tr').each((_, tr) => {
            const cols = $(tr).find('td');
            if (cols.length === 3) {
              const label = $(cols[0]).text().trim();
              const withSpouse = parsePoints($(cols[1]).text());
              const withoutSpouse = parsePoints($(cols[2]).text());
  
              if (/17.*less/i.test(label)) {
                result.push({ age: 17, withSpouse, withoutSpouse });
              } else if (/to/.test(label)) {
                const match = label.match(/(\d+)\s*to\s*(\d+)/);
                if (match) {
                  const start = parseInt(match[1]);
                  const end = parseInt(match[2]);
                  for (let age = start; age <= end; age++) {
                    result.push({ age, withSpouse, withoutSpouse });
                  }
                }
              } else if (/45/.test(label)) {
                result.push({ age: 45, withSpouse, withoutSpouse });
              } else if (/\d+/.test(label)) {
                const age = parseInt(label.match(/\d+/)![0]);
                result.push({ age, withSpouse, withoutSpouse });
              }
            }
          });
        }
      });
      return result;
    };
  
    const parseEducationPoints = () => {
      const educationMap: Record<string, string> = {
        'Less than secondary school (high school)': 'less_than_secondary',
        'Secondary diploma (high school graduation)': 'secondary',
        'One-year degree, diploma or certificate from \u00a0a university, college, trade or technical school, or other institute': 'one_year_post_secondary',
        'Two-year program at a university, college, trade or technical school, or other institute': 'two_year_post_secondary',
        "Bachelor's degree OR\u00a0 a three or more year program at a university, college, trade or technical school, or other institute": 'bachelors',
        'Two or more certificates, diplomas, or degrees. One must be for a program of three or more years': 'two_or_more_degrees',
        "Master's degree, OR professional degree needed to practice in a licensed profession": 'masters',
        'Doctoral level university degree (Ph.D.)': 'doctoral',
      };
  
      const result: { level: string, withSpouse: number, withoutSpouse: number }[] = [];
      const seen = new Set<string>();
  
      $('table').each((_, table) => {
        const headers = $(table).find('thead th');
        const firstCol = $(headers[0]).text().toLowerCase();
        if (firstCol.includes('level of education')) {
          $(table).find('tbody tr').each((_, tr) => {
            const cols = $(tr).find('td');
            if (cols.length === 3) {
              const label = $(cols[0]).text().trim();
              const mappedKey = Object.keys(educationMap).find(k => label.startsWith(k));
              if (mappedKey && !seen.has(mappedKey)) {
                seen.add(mappedKey);
                result.push({
                  level: educationMap[mappedKey],
                  withSpouse: parsePoints($(cols[1]).text()),
                  withoutSpouse: parsePoints($(cols[2]).text())
                });
              }
            }
          });
        }
      });
      return result;
    };
  
    const config = {
      agePoints: parseAgePoints(),
      educationPoints: parseEducationPoints(),
      spouseEducationPoints: [],
      languagePoints: {
        firstLanguage: {
          points: [],
          pointsWithSpouse: [],
          spousePoints: [],
          clbConversion: {},
        },
        secondLanguage: {
          points: [],
        },
      },
      workExperiencePoints: {
        canadian: [],
        spouseExperience: [],
        foreign: [],
      },
      transferabilityPoints: {
        foreignWorkExperience: {
          clb7: [],
          clb9: [],
        },
        education: {
          clb7: [],
          clb9: [],
        },
        canadianWorkExperience: {
          foreignExperience: [],
          educationCombination: [],
        },
      },
      additionalPoints: {
        arrangedEmployment: {},
        frenchLanguage: {},
        canadianEducation: [],
        canadianSibling: 0,
        tradesCertification: 0,
      },
      programMinimums: {
        FSW: {
          minLanguagePoints: 0,
          minEducation: 'other',
          minExperience: 0,
          minPoints: 0,
        },
        CEC: {
          minLanguagePoints: {},
          minCanadianExperience: 0,
        },
        FST: {
          minLanguagePoints: {},
          minExperience: 0,
        },
      },
      cutOffScores: {
        FSW: 0,
        CEC: 0,
        FST: 0,
        PNP: 0,
        FLP: 0,
        General: 0
      }
    };
    console.log(config)
    return config;
  };

useEffect(() => {
  console.log("Valor de agregarPareja cambió:", agregarPareja);
  // Puedes poner aquí lógica condicional o actualizaciones relacionadas
}, [agregarPareja]);

  // Función para calcular el total de puntos y verificar la elegibilidad
const checkFSWEligibility = () => {
  const agePoints = getAgePoints(profile.age);
  const languagePoints = getLanguagePoints(profile.firstLanguage.speaking, profile.firstLanguage.listening, profile.firstLanguage.reading, profile.firstLanguage.writing);
  const educationPoints = getEducationPoints(profile.education);
  const workExperiencePoints = getWorkExperiencePoints(profile.foreignWorkExperience);
  const jobOfferPoints = profile.jobOffer === 'noc_00' ? 10 : 0; // Oferta de trabajo
  const adaptabilityPoints = getAdaptabilityPoints(profile); // Adaptabilidad

  const totalPoints = agePoints + languagePoints + educationPoints + workExperiencePoints + jobOfferPoints + adaptabilityPoints;

  const meetsRequirements = totalPoints >= (crsConfig?.programMinimums?.FSW?.minPoints ?? 67);

  return {
    totalPoints,
    meetsRequirements
  };
};

  const [results, setResults] = useState<{
    coreHumanCapitalPoints: number;
    spousePoints: number;
    skillTransferabilityPoints: number;
    transferabilityBreakdown: {
      eduLangPointsUsed: number,
      foreignLangPointsUsed: number,
      canadianForeignExpPointsUsed: number,
      canadianEduExpPointsUsed: number
    }
    additionalPoints: number;
    totalCRSScore: number;
    detailedBreakdown: {
      age: number;
      education: number;
      firstLanguage: number;
      secondLanguage: number;
      canadianExperience: number;
      spouseEducation: number;
      spouseLanguage: number;
      spouseExperience: number;
    };
    clbLevels: {
      firstLanguage: CLBLevels;
      secondLanguage: CLBLevels;
      spouseLanguage: CLBLevels;
    };
    eligibilityStatus: {
      FSW: boolean;
      CEC: boolean;
      FST: boolean;
      frenchLanguageProficiency: boolean;
      generalEligible: boolean;
    };
    scoreComparison: {
      FSW: number;
      CEC: number;
      FST: number;
      PNP: number;
      FLP: number;
      General: number;
    };
  } | null>(null);
  const [clbLevels, setClbLevels] = useState<{
    firstLanguage: CLBLevels,
    secondLanguage: CLBLevels,
    spouseLanguage: CLBLevels
  }>({
    firstLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 },
    secondLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 },
    spouseLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const initialCRSConfig = {
    agePoints: [
      { age: 17, withSpouse: 0, withoutSpouse: 0 },
      { age: 18, withSpouse: 90, withoutSpouse: 99 },
      { age: 19, withSpouse: 95, withoutSpouse: 105 },
      { age: 20, withSpouse: 100, withoutSpouse: 110 },
      { age: 21, withSpouse: 100, withoutSpouse: 110 },
      { age: 22, withSpouse: 100, withoutSpouse: 110 },
      { age: 23, withSpouse: 100, withoutSpouse: 110 },
      { age: 24, withSpouse: 100, withoutSpouse: 110 },
      { age: 25, withSpouse: 100, withoutSpouse: 110 },
      { age: 26, withSpouse: 100, withoutSpouse: 110 },
      { age: 27, withSpouse: 100, withoutSpouse: 110 },
      { age: 28, withSpouse: 100, withoutSpouse: 110 },
      { age: 29, withSpouse: 100, withoutSpouse: 110 },
      { age: 30, withSpouse: 95, withoutSpouse: 105 },
      { age: 31, withSpouse: 90, withoutSpouse: 99 },
      { age: 32, withSpouse: 85, withoutSpouse: 94 },
      { age: 33, withSpouse: 80, withoutSpouse: 88 },
      { age: 34, withSpouse: 75, withoutSpouse: 83 },
      { age: 35, withSpouse: 70, withoutSpouse: 77 },
      { age: 36, withSpouse: 65, withoutSpouse: 72 },
      { age: 37, withSpouse: 60, withoutSpouse: 66 },
      { age: 38, withSpouse: 55, withoutSpouse: 61 },
      { age: 39, withSpouse: 50, withoutSpouse: 55 },
      { age: 40, withSpouse: 45, withoutSpouse: 50 },
      { age: 41, withSpouse: 35, withoutSpouse: 39 },
      { age: 42, withSpouse: 25, withoutSpouse: 28 },
      { age: 43, withSpouse: 15, withoutSpouse: 17 },
      { age: 44, withSpouse: 5, withoutSpouse: 6 },
      { age: 45, withSpouse: 0, withoutSpouse: 0 }
    ],
    educationPoints: [
      { level: "less_than_secondary", withSpouse: 0, withoutSpouse: 0 },
      { level: "none", withSpouse: 0, withoutSpouse: 0 },
      { level: "secondary", withSpouse: 28, withoutSpouse: 30 },
      { level: "one_year_post_secondary", withSpouse: 84, withoutSpouse: 90 },
      { level: "two_year_post_secondary", withSpouse: 91, withoutSpouse: 98 },
      { level: "bachelors", withSpouse: 112, withoutSpouse: 120 },
      { level: "two_or_more_degrees", withSpouse: 119, withoutSpouse: 128 },
      { level: "masters", withSpouse: 126, withoutSpouse: 135 },
      { level: "doctoral", withSpouse: 140, withoutSpouse: 150 },
    ],
    spouseEducationPoints: [
      { level: "less_than_secondary", points: 0 },
      { level: "none", points: 0 },
      { level: "secondary", points: 2 },
      { level: "one_year_post_secondary", points: 6 },
      { level: "two_year_post_secondary", points: 7 },
      { level: "bachelors", points: 8 },
      { level: "two_or_more_degrees", points: 9 },
      { level: "masters", points: 10 },
      { level: "doctoral", points: 10 },
    ],
    languagePoints: {
      firstLanguage: {
        clbConversion: {
          IELTS: [
            {
              skill: "reading",
              values: [0, 3.5, 4.0, 5.0, 6.0, 6.5, 7.0, 8.0],
              clb:    [0, 4,   5,   6,   7,   8,   9,   10]
            },
            {
              skill: "writing",
              values: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5],
              clb:    [0, 4,   5,   6,   7,   8,   9,   10]
            },
            {
              skill: "listening",
              values: [0, 4.5, 5.0, 5.5, 6.0, 7.5, 8.0, 8.5],
              clb:    [0, 4,   5,   6,   7,   8,   9,   10]
            },
            {
              skill: "speaking",
              values: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5],
              clb:    [0, 4,   5,   6,   7,   8,   9,   10]
            }
          ],
          CELPIP: [
            {
              skill: "reading",
              values: [0, 4, 5, 6, 7, 8, 9, 10],
              clb:    [0, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "writing",
              values: [0, 4, 5, 6, 7, 8, 9, 10],
              clb:    [0, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "listening",
              values: [0, 4, 5, 6, 7, 8, 9, 10],
              clb:    [0, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "speaking",
              values: [0, 4, 5, 6, 7, 8, 9, 10],
              clb:    [0, 4, 5, 6, 7, 8, 9, 10]
            }
          ],
          TEF: [
            {
              skill: "reading",
              values: [0, 306, 352, 393, 434, 462, 503, 546],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            },
            {
              skill: "writing",
              values: [0, 268, 330, 379, 428, 472, 512, 558],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            },
            {
              skill: "listening",
              values: [0, 306, 352, 393, 434, 462, 503, 546],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            },
            {
              skill: "speaking",
              values: [0, 328, 387, 422, 456, 494, 518, 556],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            }
          ],
          TCF: [
            {
              skill: "reading",
              values: [0, 342, 375, 406, 453, 499, 524, 549],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            },
            {
              skill: "writing",
              values: [0, 4, 6, 7, 10, 12, 14, 16],
              clb:    [0, 4, 5, 6, 7,  8,  9,  10]
            },
            {
              skill: "listening",
              values: [0, 331, 369, 398, 458, 503, 523, 549],
              clb:    [0, 4,   5,   6,   7,   8,   9,  10]
            },
            {
              skill: "speaking",
              values: [0, 4, 6, 7, 10, 12, 14, 16],
              clb:    [0, 4, 5, 6, 7,  8,  9,  10]
            }
          ],
          PTE: [
            {
              skill: "listening",
              values: [18, 28, 39, 50, 60, 71, 82, 89],
              clb:    [3, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "reading",
              values: [24, 33, 42, 51, 60, 69, 78, 88],
              clb:    [3, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "speaking",
              values: [34, 42, 51, 59, 68, 76, 84, 89],
              clb:    [3, 4, 5, 6, 7, 8, 9, 10]
            },
            {
              skill: "writing",
              values: [32, 41, 51, 60, 69, 79, 88, 90],
              clb:    [3, 4, 5, 6, 7, 8, 9, 10]
            }
          ]
          
        },
        points: [
          { skill: "speaking", clb4: 6, clb5: 6, clb6: 9, clb7: 17, clb8: 23, clb9: 31, clb10: 34 },
          { skill: "listening", clb4: 6, clb5: 6, clb6: 9, clb7: 17, clb8: 23, clb9: 31, clb10: 34 },
          { skill: "reading", clb4: 6, clb5: 6, clb6: 9, clb7: 17, clb8: 23, clb9: 31, clb10: 34 },
          { skill: "writing", clb4: 6, clb5: 6, clb6: 9, clb7: 17, clb8: 23, clb9: 31, clb10: 34 },
        ],
        pointsWithSpouse: [
          { skill: "speaking", clb4: 6, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 29, clb10: 32 },
          { skill: "listening", clb4: 6, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 29, clb10: 32 },
          { skill: "reading", clb4: 6, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 29, clb10: 32 },
          { skill: "writing", clb4: 6, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 29, clb10: 32 },
        ],
        spousePoints: [
          { skill: "speaking", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 5, clb10: 5 },
          { skill: "listening", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 5, clb10: 5 },
          { skill: "reading", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 5, clb10: 5 },
          { skill: "writing", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 5, clb10: 5 },
        ]
      },
      secondLanguage: {
        points: [
          { skill: "speaking", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 6, clb10: 6 },
          { skill: "listening", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 6, clb10: 6 },
          { skill: "reading", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 6, clb10: 6 },
          { skill: "writing", clb4: 0, clb5: 1, clb6: 1, clb7: 3, clb8: 3, clb9: 6, clb10: 6 },
        ]
      }
    },
    workExperiencePoints: {
      foreign: [
        { years: 0, withSpouse: 0, withoutSpouse: 0 },
        { years: 1, withSpouse: 13, withoutSpouse: 25 },
        { years: 2, withSpouse: 25, withoutSpouse: 50 },
        { years: 3, withSpouse: 38, withoutSpouse: 75 },
      ],
      canadian: [
        { years: 0, withSpouse: 0, withoutSpouse: 0 },
        { years: 1, withSpouse: 35, withoutSpouse: 40 },
        { years: 2, withSpouse: 46, withoutSpouse: 53 },
        { years: 3, withSpouse: 56, withoutSpouse: 64 },
        { years: 4, withSpouse: 63, withoutSpouse: 72 },
        { years: 5, withSpouse: 70, withoutSpouse: 80 },
      ],
      spouseExperience: [
        { years: 0, points: 0 },
        { years: 1, points: 5 },
        { years: 2, points: 7 },
        { years: 3, points: 8 },
        { years: 4, points: 9 },
        { years: 5, points: 10 },
      ]
    },
    transferabilityPoints: {
      education: {
        clb7: [
          { level: "secondary", points: 0 },
          { level: "one_year_post_secondary", points: 13 },
          { level: "two_year_post_secondary", points: 25 },
          { level: "bachelors", points: 25 },
          { level: "two_or_more_degrees", points: 25 },
          { level: "masters", points: 25 },
          { level: "doctoral", points: 25 },
        ],
        clb9: [
          { level: "secondary", points: 0 },
          { level: "one_year_post_secondary", points: 25 },
          { level: "two_year_post_secondary", points: 50 },
          { level: "bachelors", points: 50 },
          { level: "two_or_more_degrees", points: 50 },
          { level: "masters", points: 50 },
          { level: "doctoral", points: 50 },
        ]
      },
      foreignWorkExperience: {
        clb7: [
          { years: 1, points: 13 },
          { years: 2, points: 13 },
          { years: 3, points: 25 },
        ],
        clb9: [
          { years: 1, points: 25 },
          { years: 2, points: 25 },
          { years: 3, points: 50 },
        ]
      },
      canadianWorkExperience: {
        foreignExperience: [
          { canadianYears: 1, foreignYears: 1, points: 13 },
          { canadianYears: 1, foreignYears: 2, points: 25 },
          { canadianYears: 2, foreignYears: 1, points: 13 },
          { canadianYears: 2, foreignYears: 2, points: 25 },
          { canadianYears: 1, foreignYears: 3, points: 25 },
          { canadianYears: 3, foreignYears: 2, points: 50 },
          { canadianYears: 2, foreignYears: 3, points: 50 },
        ],
        educationCombination: [
          { canadianYears: 1, level: "secondary", points: 0 },
          { canadianYears: 1, level: "one_year_post_secondary", points: 13 },
          { canadianYears: 1, level: "two_year_post_secondary", points: 25 },
          { canadianYears: 1, level: "bachelors", points: 25 },
          { canadianYears: 1, level: "two_or_more_degrees", points: 25 },
          { canadianYears: 1, level: "masters", points: 25 },
          { canadianYears: 1, level: "doctoral", points: 25 },
          { canadianYears: 2, level: "one_year_post_secondary", points: 25 },
          { canadianYears: 2, level: "two_year_post_secondary", points: 50 },
          { canadianYears: 2, level: "bachelors", points: 50 },
          { canadianYears: 2, level: "two_or_more_degrees", points: 50 },
          { canadianYears: 2, level: "masters", points: 50 },
          { canadianYears: 2, level: "doctoral", points: 50 },
        ]
      }
    },
    additionalPoints: {
      canadianEducation: [
        { level: "one_or_two_year", points: 15 },
        { level: "three_year_or_masters", points: 30 },
        { level: "doctoral", points: 30 },
      ],
      provincialNomination: 600,
      arrangedEmployment: {
        noc_00: 200,
        noc_0_A_B: 50,
        other: 0
      },
      canadianSibling: 15,
      frenchLanguage: {
        nclc7: 25,
        nclc7_english_clb4: 50
      },
      tradesCertification: 50,
    },
    programMinimums: {
      FSW: {
        minLanguagePoints: 7, // CLB 7 minimum
        minEducation: "secondary",
        minExperience: 1, // years
        minPoints: 67
      },
      CEC: {
        minLanguagePoints: {
          NOC_0_A: 7, // CLB 7 minimum
          NOC_B: 5    // CLB 5 minimum
        },
        minCanadianExperience: 1 // year
      },
      FST: {
        minLanguagePoints: {
          speaking: 5, // CLB 5 minimum
          listening: 5, // CLB 5 minimum
          reading: 4,    // CLB 4 minimum
          writing: 4     // CLB 4 minimum
        },
        minExperience: 2 // years
      }
    },
    cutOffScores: {
      FSW: 489,
      CEC: 521,
      FST: 463,
      PNP: 764,
      FLP: 379,
      General: 529
    }
  };

  const [newCRSConfig, setNewCRSConfig] = useState<CRSConfig | null>(null);

useEffect(() => {
  const fetchAndTransformCRSConfig = async () => {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const findTablesFromDetails = (id: string): cheerio.Cheerio<AnyNode>[] => {
      const section = $(`#${id}`).nextAll('details').first();
      const tables: cheerio.Cheerio<AnyNode>[] = [];
      section.find('table').each((_, table) => {
        tables.push($(table));
      });
      return tables;
    };

    const coreTables = findTablesFromDetails('core');
    const coreHumanCapital = {
      age: extractTableData($, coreTables[0]),
      education: extractTableData($, coreTables[1]),
      firstLanguage: extractTableData($, coreTables[2]),
      secondLanguage: extractTableData($, coreTables[3]),
      canadianExperience: extractTableData($, coreTables[4]),
    };

    const spouseTables = findTablesFromDetails('spouse');
    const spouseFactors = {
      education: extractTableData($, spouseTables[0]),
      language: extractTableData($, spouseTables[1]),
      canadianExperience: extractTableData($, spouseTables[2]),
    };

    const skillTables = findTablesFromDetails('skill');
    const skillTransferability = {
      educationCLB: extractTableData($, skillTables[0]),
      educationWork: extractTableData($, skillTables[1]),
      foreignExpCLB: extractTableData($, skillTables[2]),
      foreignExpWork: extractTableData($, skillTables[3]),
      certificate: extractTableData($, skillTables[4]),
    };

    const extraTables = findTablesFromDetails('extra');
    const additionalPoints = extractTableData($, extraTables[0]);

    const crsConfig = {
      coreHumanCapital,
      spouseFactors,
      skillTransferability,
      additionalPoints,
    };

    const transformedConfig = transformCRSConfig(crsConfig);
    console.log("Configuración CRS transformada:", transformedConfig);
    setNewCRSConfig(transformedConfig); // Guarda el resultado en el estado
  };

  fetchAndTransformCRSConfig();
}, []);

useEffect(() => {
  const loadConfig = async () => {
    if (newCRSConfig) {
      console.log("Data cargada desde el objeto newCRSConfig:");
      setCRSConfig(newCRSConfig);
      console.log("new crs",newCRSConfig);
    } else {
      console.error("newCRSConfig no está disponible.");
    }
  };

  loadConfig();
}, [newCRSConfig]);

    useEffect(() => {
      const handleScroll = () => {
        const iframeWindow = window.parent;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
    
        if (scrollTop + clientHeight >= scrollHeight) {
          // Envía un mensaje al padre para permitir el scroll
          iframeWindow.postMessage("scrollToParent", "*");
        }
      };
    
      window.addEventListener("scroll", handleScroll);
    
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);

  // Calculate CLB levels whenever language scores change
  useEffect(() => {
    if (!crsConfig) return;
  
    const calculateCLB = (
      test: string,
      scores: { speaking: number; listening: number; reading: number; writing: number },
      isSpouse = false
    ): CLBLevels => {
      const result: CLBLevels = { speaking: 0, listening: 0, reading: 0, writing: 0 };
  
      // Obtener la conversión según si es cónyuge o no
      const conversionSource = crsConfig.languagePoints.firstLanguage.clbConversion;
      const conversion = conversionSource[test as keyof typeof conversionSource];
  
      if (!conversion) return result;
  
      // skills: speaking, listening, reading, writing
      ["speaking", "listening", "reading", "writing"].forEach((skill) => {
        const skillData = conversion.find(row => row.skill === skill);
        if (!skillData) return;
  
        const thresholds = skillData.values; // ✅ así está definido
        const clbLevels = skillData.clb;
  
        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (scores[skill as keyof CLBLevels] >= thresholds[i]) {
            result[skill as keyof CLBLevels] = clbLevels[i];
            break;
          }
        }
      });
  
      return result;
    };

    console.log(calculateCLB("TEF", { speaking: 400, listening: 400, reading: 400, writing: 400 }));

    setClbLevels({
      firstLanguage: calculateCLB(profile.firstLanguage.test, profile.firstLanguage),
      secondLanguage: calculateCLB(profile.secondLanguage.test, profile.secondLanguage),
      spouseLanguage: calculateCLB(profile.spouseLanguage.test, profile.spouseLanguage, true)
    });
  
  }, [JSON.stringify(profile), crsConfig]);
  
  const meetsFrenchCLB7 = (
    (["TEF", "TCF"].includes(profile.firstLanguage.test) &&
      clbLevels.firstLanguage.speaking >= 7 &&
      clbLevels.firstLanguage.listening >= 7 &&
      clbLevels.firstLanguage.reading >= 7 &&
      clbLevels.firstLanguage.writing >= 7)
    ||
    (["TEF", "TCF"].includes(profile.secondLanguage.test) &&
      clbLevels.secondLanguage.speaking >= 7 &&
      clbLevels.secondLanguage.listening >= 7 &&
      clbLevels.secondLanguage.reading >= 7 &&
      clbLevels.secondLanguage.writing >= 7)
  );
  

  

  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested language field changes
  const handleLanguageChange = (languageField: string, skill: string, value: any) => {
    setProfile(prev => {
      const updatedProfile = { ...prev };
      // Type assertion to access dynamic properties
      const languageObj = updatedProfile[languageField as keyof UserProfile];
      if (languageObj && typeof languageObj === 'object') {
        (languageObj as any)[skill] = value;
      }
      return updatedProfile;
    });
  };

  // Handle form submission and calculate CRS score
  const calculateCRS = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToTop();
    
    if (!crsConfig) {
      setError("CRS configuration is not loaded. Please set up the CRS Dashboard first.");
      return;
    }

    try {
      // A. Core/Human Capital Factors
      let coreHumanCapitalPoints = 0;
      
      // 1. Age points
      const withSpouse = profile.maritalStatus === 'married';
      // Find the closest age bracket
      const agePoints = interpolatePoints(
        crsConfig.agePoints, 
        'age', 
        profile.age, 
        withSpouse ? 'withSpouse' : 'withoutSpouse'
      );
      
      // 2. Education points
      const educationPoints = crsConfig.educationPoints.find(e => e.level === profile.education);
      
      // 3. Puntos de Idioma
      let firstLanguagePoints = 0;
      const firstLangCLB = clbLevels.firstLanguage;
      
      const firstLangPointsData =
      profile.maritalStatus === "married"
        ? crsConfig.languagePoints.firstLanguage.pointsWithSpouse
        : crsConfig.languagePoints.firstLanguage.points;

      firstLangPointsData.forEach(point => {
        const skill = point.skill;
        const clbLevel = firstLangCLB[skill as keyof CLBLevels];
        if (clbLevel >= 4) {
          const clbKey = `clb${clbLevel}`;
          firstLanguagePoints += point[clbKey] || 0;
        }
      });
      // 3b. Second Puntos de Idioma
      let secondLanguagePoints = 0;
      const secondLangCLB = clbLevels.secondLanguage;

      crsConfig.languagePoints.secondLanguage.points.forEach(point => {
        const skill = point.skill;
        const clbLevel = secondLangCLB[skill as keyof CLBLevels];
        if (clbLevel >= 4) {
          const clbKey = `clb${clbLevel}`;
          secondLanguagePoints += point[clbKey] || 0;
        }
      });

      
      // 4. Canadian work experience
      const canadianExpPoints = interpolatePoints(
        crsConfig.workExperiencePoints.canadian,
        'years',
        Math.min(profile.canadianWorkExperience, 5), // Cap at 5 years
        withSpouse ? 'withSpouse' : 'withoutSpouse'
      );
      
      coreHumanCapitalPoints = agePoints + 
        (educationPoints ? (withSpouse ? educationPoints.withSpouse : educationPoints.withoutSpouse) : 0) + 
        firstLanguagePoints + secondLanguagePoints +
        canadianExpPoints;
      
      // B. Spouse Factors (if applicable)
      let spousePoints = 0;
      let spouseLangPoints = 0; // Define this variable for later use
      
      if (withSpouse) {
        // 1. Spouse education
        const spouseEduPoints = crsConfig.spouseEducationPoints.find(e => e.level === profile.spouseEducation);
        
        // 2. Spouse language
        spouseLangPoints = 0; // Reset before calculating
        const spouseLangCLB = clbLevels.spouseLanguage;
        crsConfig.languagePoints.firstLanguage.spousePoints.forEach(point => {
          const skill = point.skill;
          const clbLevel = spouseLangCLB[skill as keyof CLBLevels];
          if (clbLevel >= 4) {
            const clbKey = `clb${clbLevel}`;
            spouseLangPoints += point[clbKey] || 0;
          }
        });
        
        // 3. Spouse work experience
        const spouseExpEntry = crsConfig.workExperiencePoints.spouseExperience.find(
          e => e.years === Math.min(profile.spouseWorkExperience, 5) // Cap at 5 years
        );
        
        spousePoints = (spouseEduPoints ? (spouseEduPoints.points || 0) : 0) + 
                         spouseLangPoints + 
                        (spouseExpEntry ? spouseExpEntry.points : 0);
      }
      
      // C. Skill Transferability Factors
      let skillTransferabilityPoints = 0;
      
      // Check if all first language CLB scores meet minimum threshold
      const meetsCLB7 = Object.values(firstLangCLB).every(clb => clb >= 7);
      const meetsCLB9 = Object.values(firstLangCLB).every(clb => clb >= 9);

      // transferability points variables

      let eduLangPointsUsed = 0;
      let foreignLangPointsUsed = 0;
      let canadianForeignExpPointsUsed = 0;
      let canadianEduExpPointsUsed = 0;

      
      // 1. Education + Language
      if (profile.education !== 'less_than_secondary') {
        const eduTransferTable = meetsCLB9 ? 
          crsConfig.transferabilityPoints.education.clb9 : 
          crsConfig.transferabilityPoints.education.clb7;
          
        const eduTransferPoints = eduTransferTable.find(e => e.level === profile.education);
        if (eduTransferPoints && meetsCLB7) {
          eduLangPointsUsed += eduTransferPoints.points;
          skillTransferabilityPoints += eduTransferPoints.points;
        }
      }
      
      // 2. Foreign Work Experience + Language
      if (profile.foreignWorkExperience > 0) {
        const fweCLBTable = meetsCLB9 ? 
          crsConfig.transferabilityPoints.foreignWorkExperience.clb9 : 
          crsConfig.transferabilityPoints.foreignWorkExperience.clb7;
          
        const fwePoints = fweCLBTable.find(
          e => e.years === Math.min(profile.foreignWorkExperience, 3) // Cap at 3 years
        );
        
        if (fwePoints && meetsCLB7) {
          foreignLangPointsUsed += fwePoints.points;
          skillTransferabilityPoints += fwePoints.points;
        }
      }
      
      // 3. Canadian Work Experience + Foreign Work Experience
      if (profile.canadianWorkExperience > 0 && profile.foreignWorkExperience > 0) {
        const combinedExpEntry = crsConfig.transferabilityPoints.canadianWorkExperience.foreignExperience.find(
          e => e.canadianYears === Math.min(profile.canadianWorkExperience, 2) && 
               e.foreignYears === Math.min(profile.foreignWorkExperience, 3)
        );

        if (combinedExpEntry) {
          canadianForeignExpPointsUsed += combinedExpEntry.points;
          skillTransferabilityPoints += combinedExpEntry.points;
        }
      }
      
      // 4. Canadian Work Experience + Education
      if (profile.canadianWorkExperience > 0 && profile.education !== 'less_than_secondary') {
        const eduExpCombination = crsConfig.transferabilityPoints.canadianWorkExperience.educationCombination.find(
          e => e.canadianYears === Math.min(profile.canadianWorkExperience, 1) && 
               e.level === profile.education
        );
        
        if (eduExpCombination) {
          canadianEduExpPointsUsed += eduExpCombination.points;
          skillTransferabilityPoints += eduExpCombination.points;
        }
      }

      // 6. Trades Certification
      if (profile.tradesCertification) {
        if(clbLevels.firstLanguage.speaking >= 7 &&
          clbLevels.firstLanguage.listening >= 7 &&
          clbLevels.firstLanguage.reading >= 7 &&
          clbLevels.firstLanguage.writing >= 7){
          skillTransferabilityPoints += crsConfig.transferabilityPoints.tradesCertification["clb7"];
          }
        else if(clbLevels.firstLanguage.speaking >= 5 &&
          clbLevels.firstLanguage.listening >= 5 &&
          clbLevels.firstLanguage.reading >= 5 &&
          clbLevels.firstLanguage.writing >= 5){
          skillTransferabilityPoints += crsConfig.transferabilityPoints.tradesCertification["clb5"];
          }
          else{
            skillTransferabilityPoints += 0;
          }
      }
      
      // Cap transferability points at 100
      skillTransferabilityPoints = Math.min(skillTransferabilityPoints, 100);
      
      // D. Puntos Adicionales
      let additionalPoints = 0;
      
      // 1. Canadian Education
      if (profile.canadianEducation !== 'none') {
        const canadianEduPoints = crsConfig.additionalPoints.canadianEducation.find(
          e => e.level === profile.canadianEducation
        );
        
        if (canadianEduPoints) {
          additionalPoints += canadianEduPoints.points;
        }
      }
      
      // 2. Nominacion Provincial
      if (profile.provincialNomination) {
        additionalPoints += crsConfig.additionalPoints.provincialNomination;
      }
      
      // 3. Job Offer
      if (profile.jobOffer === 'noc_00') {
        additionalPoints += crsConfig.additionalPoints.arrangedEmployment.noc_00;
      } else if (profile.jobOffer === 'noc_0_A_B') {
        additionalPoints += crsConfig.additionalPoints.arrangedEmployment.noc_0_A_B;
      }
      
      // 4. Canadian Sibling
      if (profile.canadianSibling) {
        additionalPoints += crsConfig.additionalPoints.canadianSibling;
      }
      
      // 5. French Language

      // Solo Frances

      const frenchLanguageProficiency =
        (
          // Caso 1: primer idioma francés y segundo idioma inglés
          (profile.firstLanguage.test === "TEF" || profile.firstLanguage.test === "TCF") &&
          clbLevels.firstLanguage.speaking >= 7 &&
          clbLevels.firstLanguage.listening >= 7 &&
          clbLevels.firstLanguage.reading >= 7 &&
          clbLevels.firstLanguage.writing >= 7 
         ||
        (
          // Caso 2: segundo idioma francés y primer idioma inglés
          (profile.secondLanguage.test === "TEF" || profile.secondLanguage.test === "TCF") &&
          clbLevels.secondLanguage.speaking >= 7 &&
          clbLevels.secondLanguage.listening >= 7 &&
          clbLevels.secondLanguage.reading >= 7 &&
          clbLevels.secondLanguage.writing >= 7 
        )
      );
      // Agregar la verificación para French-Language Proficiency
      const frenchLanguageProficiencyEligible =
      (
        (
          // Caso 1: primer idioma francés y segundo idioma inglés
          (profile.firstLanguage.test === "TEF" || profile.firstLanguage.test === "TCF") &&
          clbLevels.firstLanguage.speaking >= 7 &&
          clbLevels.firstLanguage.listening >= 7 &&
          clbLevels.firstLanguage.reading >= 7 &&
          clbLevels.firstLanguage.writing >= 7 &&
          (profile.secondLanguage.test === "IELTS" || profile.secondLanguage.test === "CELPIP"|| profile.secondLanguage.test === "PTE") &&
          clbLevels.secondLanguage.speaking >= 5 &&
          clbLevels.secondLanguage.listening >= 5 &&
          clbLevels.secondLanguage.reading >= 5 &&
          clbLevels.secondLanguage.writing >= 5
        ) ||
        (
          // Caso 2: segundo idioma francés y primer idioma inglés
          (profile.secondLanguage.test === "TEF" || profile.secondLanguage.test === "TCF") &&
          clbLevels.secondLanguage.speaking >= 7 &&
          clbLevels.secondLanguage.listening >= 7 &&
          clbLevels.secondLanguage.reading >= 7 &&
          clbLevels.secondLanguage.writing >= 7 &&
          (profile.firstLanguage.test === "IELTS" || profile.firstLanguage.test === "CELPIP" || profile.firstLanguage.test === "PTE") &&
          clbLevels.firstLanguage.speaking >= 5 &&
          clbLevels.firstLanguage.listening >= 5 &&
          clbLevels.firstLanguage.reading >= 5 &&
          clbLevels.firstLanguage.writing >= 5
        )
      ) ;

      if (frenchLanguageProficiency) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7;
        handleChange('frenchOnly', frenchLanguageProficiency)
      } if (frenchLanguageProficiencyEligible) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;
        handleChange('frenchAndEnglish', frenchLanguageProficiencyEligible)
      }
      
      // Calculate total CRS score
      const totalCRSScore = coreHumanCapitalPoints + spousePoints + skillTransferabilityPoints + additionalPoints;
      
      // Check eligibility for various programs
      const eligibilityStatus = {
        FSW: false,
        CEC: false,
        FST: false,
        frenchLanguageProficiency: false,
        generalEligible: true
      };
      
      // FSW Eligibility
      // Verificar si se cumplen los requisitos para FSW
      const meetsFSWLang = 
      firstLangCLB.speaking >= crsConfig.programMinimums.FSW.minLanguagePoints &&
      firstLangCLB.listening >= crsConfig.programMinimums.FSW.minLanguagePoints &&
      firstLangCLB.reading >= crsConfig.programMinimums.FSW.minLanguagePoints &&
      firstLangCLB.writing >= crsConfig.programMinimums.FSW.minLanguagePoints;

      const meetsEduReq = profile.education !== 'less_than_secondary';
      const meetsForeignExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FSW.minExperience;

      eligibilityStatus.FSW = meetsFSWLang && meetsEduReq && meetsForeignExpReq && totalCRSScore >= crsConfig.programMinimums.FSW.minPoints;
      
      // CEC Eligibility
      // Verificar si se cumplen los requisitos para CEC
      const minCLBForNOC = profile.nocCategory === '0' || profile.nocCategory === 'A' 
      ? crsConfig.programMinimums.CEC.minLanguagePoints.NOC_0_A 
      : crsConfig.programMinimums.CEC.minLanguagePoints.NOC_B;

      const meetsCECLangReq = 
      firstLangCLB.speaking >= minCLBForNOC &&
      firstLangCLB.listening >= minCLBForNOC &&
      firstLangCLB.reading >= minCLBForNOC &&
      firstLangCLB.writing >= minCLBForNOC;

      const meetsCECExpReq = profile.canadianWorkExperience >= crsConfig.programMinimums.CEC.minCanadianExperience;

      eligibilityStatus.CEC = meetsCECLangReq && meetsCECExpReq;


      
      // FST Eligibility
      // Verificar si se cumplen los requisitos para FST
      const meetsFSTSpeakingReq = firstLangCLB.speaking >= crsConfig.programMinimums.FST.minLanguagePoints.speaking;
      const meetsFSTListeningReq = firstLangCLB.listening >= crsConfig.programMinimums.FST.minLanguagePoints.listening;
      const meetsFSTReadingReq = firstLangCLB.reading >= crsConfig.programMinimums.FST.minLanguagePoints.reading;
      const meetsFSTWritingReq = firstLangCLB.writing >= crsConfig.programMinimums.FST.minLanguagePoints.writing;
      const meetsFSTExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FST.minExperience;

      eligibilityStatus.FST = meetsFSTSpeakingReq && meetsFSTListeningReq && 
                              meetsFSTReadingReq && meetsFSTWritingReq && meetsFSTExpReq;

      // Eligibility for French-Language Proficiency

      eligibilityStatus.frenchLanguageProficiency = frenchLanguageProficiencyEligible && (eligibilityStatus.FSW || eligibilityStatus.CEC || eligibilityStatus.FST);

      
      // Compare scores to cut-offs
      const scoreComparison = {
        FSW: totalCRSScore - cutOffScores.FSW,
        CEC: totalCRSScore - cutOffScores.CEC,
        FST: totalCRSScore - cutOffScores.FST,
        PNP: totalCRSScore - cutOffScores.PNP,
        FLP : totalCRSScore - cutOffScores.FLP,
        General: totalCRSScore - cutOffScores.General
      };
      
      // Set the results
      setResults({
        coreHumanCapitalPoints,
        spousePoints,
        skillTransferabilityPoints,
        transferabilityBreakdown: {
          eduLangPointsUsed,
          foreignLangPointsUsed,
          canadianForeignExpPointsUsed,
          canadianEduExpPointsUsed
        },
        additionalPoints,
        totalCRSScore,
        detailedBreakdown: {
          age: agePoints,
          education: educationPoints ? (withSpouse ? educationPoints.withSpouse : educationPoints.withoutSpouse) : 0,
          firstLanguage: firstLanguagePoints,
          secondLanguage: secondLanguagePoints,
          canadianExperience: canadianExpPoints,
          spouseEducation: withSpouse ? (crsConfig.spouseEducationPoints.find(e => e.level === profile.spouseEducation)?.points || 0) : 0,
          spouseLanguage: spouseLangPoints,
          spouseExperience: withSpouse ? (crsConfig.workExperiencePoints.spouseExperience.find(
            e => e.years === Math.min(profile.spouseWorkExperience, 5)
          )?.points || 0) : 0
        },        
        clbLevels,
        eligibilityStatus,
        scoreComparison
      });
    } catch (e) {
      console.error("Error calculating CRS score:", e);
      setError("An error occurred while calculating your CRS score. Please try again.");
    }
  };

  
      // Función auxiliar
      const getLanguageScore = (test: string, clb: CLBLevels): number => {
        if (!clb) return 0;
        return Math.min(clb.speaking, clb.listening, clb.reading, clb.writing) ;
      };

      let englishScore: number | undefined;
      let frenchScore: number | undefined;

      const englishTests = ["IELTS", "CELPIP", "PTE"];
      const frenchTests = ["TEF", "TCF"];

      if (results) {
        if (englishTests.includes(profile.firstLanguage.test)) {
          englishScore = getLanguageScore(profile.firstLanguage.test, results.clbLevels.firstLanguage);
        } else if (englishTests.includes(profile.secondLanguage.test)) {
          englishScore = getLanguageScore(profile.secondLanguage.test, results.clbLevels.secondLanguage);
        }

        if (frenchTests.includes(profile.firstLanguage.test)) {
          frenchScore = getLanguageScore(profile.firstLanguage.test, results.clbLevels.firstLanguage);
        } else if (frenchTests.includes(profile.secondLanguage.test)) {
          frenchScore = getLanguageScore(profile.secondLanguage.test, results.clbLevels.secondLanguage);
        }
      }

      // Spouse score
      const spouseLanguageScore = results
        ? getLanguageScore(profile.spouseLanguage.test, results.clbLevels.spouseLanguage)
        : undefined;

      // Programas a los que es elegible
      const eligiblePrograms: string[] = [];

      if (results?.eligibilityStatus.FSW) eligiblePrograms.push("FSW");
      if (results?.eligibilityStatus.CEC) eligiblePrograms.push("CEC");
      if (results?.eligibilityStatus.FST) eligiblePrograms.push("FST");
      if (results?.eligibilityStatus.frenchLanguageProficiency) eligiblePrograms.push("FLP");
      if (profile.provincialNomination) eligiblePrograms.push("PNP");

      // Último draw score relevante
      const lastDrawScore = Math.min(
        ...eligiblePrograms.map(program => cutOffScores[program] || Infinity)
      );

      

  // Helper function to interpolate points for age or experience
  const interpolatePoints = (pointsTable: any[], keyField: string, value: number, pointsField: string): number => {
    // Sort the table by the key field
    const sortedTable = [...pointsTable].sort((a, b) => a[keyField] - b[keyField]);
    
    // If value is less than the lowest key, return the lowest key's points
    if (value <= sortedTable[0][keyField]) {
      return sortedTable[0][pointsField];
    }
    
    // If value is greater than the highest key, return the highest key's points
    if (value >= sortedTable[sortedTable.length - 1][keyField]) {
      return sortedTable[sortedTable.length - 1][pointsField];
    }
    
    // Find the two neighboring keys
    for (let i = 0; i < sortedTable.length - 1; i++) {
      const lowerKey = sortedTable[i][keyField];
      const upperKey = sortedTable[i + 1][keyField];
      
      if (value >= lowerKey && value <= upperKey) {
        // If value is exactly one of the keys, return that key's points
        if (value === lowerKey) return sortedTable[i][pointsField];
        if (value === upperKey) return sortedTable[i + 1][pointsField];
        
        // Interpolate between the two keys
        const ratio = (value - lowerKey) / (upperKey - lowerKey);
        return Math.round(
          sortedTable[i][pointsField] + 
          ratio * (sortedTable[i + 1][pointsField] - sortedTable[i][pointsField])
        );
      }
    }
    
    // Fallback (should not reach here)
    return 0;
  };

  // Reset the calculator form
  const resetForm = () => {
    setProfile(initialProfile);
    setResults(null);
    setClbLevels({
      firstLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      secondLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      spouseLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 }
    });
    setError(null);
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Cargando Configuracion...</p>
        </div>
      </div>
    );
  }

  if (error && !crsConfig) {
    console.log("Error loading CRS configuration:", error);
    console.log("crsConfig:", crsConfig);
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-2">Error de Configuracion</h2>
        <p>{error}</p>
        <p className="mt-4">Por favor setea el Dashboard CRS antes de usar la Calculadora.</p>
      </div>
    );
  }

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div ref={topRef}></div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 pb-40">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold text-gray-800">
                  Calculadora CRS Express Entry
                </h1>
                <img
              src={flagImage}
              alt="Bandera de Canadá"
              className="w-32 h-auto ml-4"
            />
              </div>
              <div>
                <p className="text-sm text-gray-500 leading-relaxed text-justify">
                  <span className="font-medium">Aviso:</span> Esta calculadora es una herramienta orientativa diseñada únicamente con fines informativos. 
                  Los resultados que proporciona son estimaciones basadas en las regulaciones de inmigración canadienses vigentes y están 
                  sujetos a cambios sin previo aviso. Estos resultados no deben ser considerados como oficiales ni vinculantes.
                  La única fuente oficial para conocer su puntaje en el sistema Express Entry es la calculadora publicada por Immigration, 
                  Refugees and Citizenship Canada (IRCC) en su sitio web. Para obtener información precisa y actualizada, 
                  le recomendamos consultar directamente la&nbsp;
                  <a
                    href="https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    calculadora oficial de Express Entry de Canadá ↗
                  </a>
                  .
                </p>
              </div>
            </div>

            
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {!results ? (
            <form onSubmit={calculateCRS}>
              <Card title="Informacion Basica">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Edad"
                    type="number"
                    min={18}
                    max={55}
                    value={profile.age}
                    onChange={(e) =>
                      handleChange("age", parseInt(e.target.value))
                    }
                  />

                  <Select
                    label="Estado Civil"
                    value={profile.maritalStatus}
                    onChange={(e) =>
                      handleChange("maritalStatus", e.target.value)
                    }
                    options={[
                      { value: "single", label: "Soltero(a)" },
                      { value: "married", label: "Casado(a)/Union Libre" },
                    ]}
                  />
                  {profile.maritalStatus === "married" && (
                    <Select
                      label="¿Su pareja viene con usted a Canada?"
                      value={agregarPareja}
                      onChange={(e) => setAgregarPareja(e.target.value)} // ✅ Cambia el estado real
                      options={[
                        { value: "si", label: "Si" },
                        { value: "no", label: "No" },
                      ]}
                    />
                  )}
                </div>
              </Card>

              <Card title="Educacion">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Maximo Nivel de Educacion"
                    value={profile.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    options={[
                      {
                        value: "less_than_secondary",
                        label:
                          "Ninguno",
                      },
                      {
                        value: "secondary",
                        label:
                          "Diploma de secundaria (graduación de escuela secundaria)",
                      },
                      {
                        value: "one_year_post_secondary",
                        label:
                          "Programa de un año en una universidad, colegio, escuela técnica u otro instituto",
                      },
                      {
                        value: "two_year_post_secondary",
                        label:
                          "Programa de dos años en una universidad, colegio, escuela técnica u otro instituto",
                      },
                      {
                        value: "bachelors",
                        label:
                          "Título de licenciatura o Pregrado (programa de tres o más años en una universidad, colegio, escuela técnica u otro instituto)",
                      },
                      {
                        value: "two_or_more_degrees",
                        label:
                          "Dos o más certificados, diplomas o títulos. Uno debe ser de un programa de tres o más años",
                      },
                      {
                        value: "masters",
                        label:
                          "Maestría o título profesional necesario para ejercer una profesión licenciada",
                      },
                      {
                        value: "doctoral",
                        label: "Título universitario de nivel doctoral (PhD)",
                      },
                    ]}
                  />

                  <Select
                    label="Educacion Canadiense (Si la tiene)"
                    value={profile.canadianEducation}
                    onChange={(e) =>
                      handleChange("canadianEducation", e.target.value)
                    }
                    options={[
                      {
                        value: "none",
                        label: "Ninguna",
                      },
                      {
                        value: "none",
                        label: "Secundaria",
                      },
                      {
                        value: "one_or_two_year",
                        label: "Diploma o certificado de uno o dos años",
                      },
                      {
                        value: "three_year_or_masters",
                        label:
                          "Título, diploma o certificado de tres años o más O un título de maestría, profesional o doctorado de al menos un año académico",
                      },
                    ]}
                  />
                </div>
              </Card>

              <Card title="Primer Idioma Oficial">
                <Select
                  label="Examen de Idioma"
                  value={profile.firstLanguage.test}
                  onChange={(e) => {
                    const newTest = e.target.value;

                    // Cambia el examen
                    handleLanguageChange("firstLanguage", "test", newTest);

                    // Reinicia los valores de habilidades
                    ["speaking", "listening", "reading", "writing"].forEach(
                      (skill) => {
                        handleLanguageChange("firstLanguage", skill, 0); // 0 mostrará "Select..."
                      }
                    );
                  }}
                  options={[
                    {
                      value: "IELTS",
                      label:
                        "IELTS - International English Language Testing System",
                    },
                    {
                      value: "CELPIP",
                      label:
                        "CELPIP - Canadian English Language Proficiency Index Program",
                    },
                    {
                      value: "PTE",
                      label: "PTE Core - Pearson Test of English",
                    },
                    {
                      value: "TEF",
                      label: "TEF - Test d'évaluation de français",
                    },
                    {
                      value: "TCF",
                      label: "TCF - Test de connaissance du français",
                    },
                  ]}
                />

                {/* <LanguageTestInput
                  languageTest={profile.firstLanguage.test}
                  values={profile.firstLanguage}
                  onChange={(skill, value) => handleLanguageChange('firstLanguage', skill, value)}
                /> */}

                <LanguageSelectInput
                  languageTest={profile.firstLanguage.test}
                  values={profile.firstLanguage}
                  onChange={(skill, value) =>
                    handleLanguageChange("firstLanguage", skill, value)
                  }
                  crsConfig={crsConfig}
                />

                {clbLevels.firstLanguage && (
                  <div className="mt-4 p-3 bg-[#D8D7D6] rounded-md">
                    <h4 className="font-medium text-black-800 mb-2">
                      Equivalente en CLB
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.firstLanguage.speaking}
                        </div>
                        <div className="text-xs text-gray-500">Speaking</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.firstLanguage.listening}
                        </div>
                        <div className="text-xs text-gray-500">Listening</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.firstLanguage.reading}
                        </div>
                        <div className="text-xs text-gray-500">Reading</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.firstLanguage.writing}
                        </div>
                        <div className="text-xs text-gray-500">Writing</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Segundo Idioma Oficial(Opcional)">
                <Select
                  label="Examen de Idioma"
                  value={profile.secondLanguage.test}
                  onChange={(e) => {
                    const newTest = e.target.value;
                    handleLanguageChange("secondLanguage", "test", newTest);
                    ["speaking", "listening", "reading", "writing"].forEach(
                      (skill) => {
                        handleLanguageChange("secondLanguage", skill, 0);
                      }
                    );
                  }}
                  options={[
                    {
                      value: "IELTS",
                      label:
                        "IELTS - International English Language Testing System",
                    },
                    {
                      value: "CELPIP",
                      label:
                        "CELPIP - Canadian English Language Proficiency Index Program",
                    },
                    {
                      value: "PTE",
                      label: "PTE Core - Pearson Test of English",
                    },
                    {
                      value: "TEF",
                      label: "TEF - Test d'évaluation de français",
                    },
                    {
                      value: "TCF",
                      label: "TCF - Test de connaissance du français",
                    },
                  ]}
                />

                {/* <LanguageTestInput
                  languageTest={profile.secondLanguage.test}
                  values={profile.secondLanguage}
                  onChange={(skill, value) => handleLanguageChange('secondLanguage', skill, value)}
                /> */}

                <LanguageSelectInput
                  languageTest={profile.secondLanguage.test}
                  values={profile.secondLanguage}
                  onChange={(skill, value) =>
                    handleLanguageChange("secondLanguage", skill, value)
                  }
                  crsConfig={crsConfig}
                />

                {clbLevels.secondLanguage && (
                  <div className="mt-4 p-3 bg-[#D8D7D6] rounded-md">
                    <h4 className="font-medium text-black-800 mb-2">
                      Equivalente en CLB
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.secondLanguage.speaking}
                        </div>
                        <div className="text-xs text-gray-500">Speaking</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.secondLanguage.listening}
                        </div>
                        <div className="text-xs text-gray-500">Listening</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.secondLanguage.reading}
                        </div>
                        <div className="text-xs text-gray-500">Reading</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">
                          {clbLevels.secondLanguage.writing}
                        </div>
                        <div className="text-xs text-gray-500">Writing</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Experiencia Laboral Calificada (En los ultimos 10 años)">
                <p style={{ marginBottom: "30px" }}>
                  Esta experiencia debe ser full time, paga, en un puesto
                  calificado de TEER 0, 1, 2 o 3
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Experiencia Laboral Canadiense (años)"
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={profile.canadianWorkExperience}
                    onChange={(e) =>
                      handleChange(
                        "canadianWorkExperience",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />

                  <Input
                    label="Experiencia Laboral Extranjera (años)"
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={profile.foreignWorkExperience}
                    onChange={(e) =>
                      handleChange(
                        "foreignWorkExperience",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />

                  {/* <div style={{display: 'flex', flexDirection: 'column'}}>
                  <Select
                    label='Categoría NOC'
                    value={profile.nocCategory}
                    onChange={(e) => handleChange('nocCategory', e.target.value)}
                    options={[
                      {value: '0', label: 'TEER 0'},
                      {value: 'A', label: 'TEER 1'},
                      {value: 'B', label: 'TEER 2'},
                      {value: 'C', label: 'TEER 3'},
                      {value: 'D', label: 'TEER 4'},
                      {value: 'E', label: 'TEER 5'},
                    ]}
                  />
                  <p>Para saber cual es tu TEER haz <a style={{color:"blue", textDecoration: "underline"}} href='https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/find-national-occupation-code.html' target='_blank' rel="noreferrer"> Click Aqui</a></p>
                  </div>
                 */}
                </div>
              </Card>

              {profile.maritalStatus === "married" && agregarPareja == "si" && (
                <Card title="Factores del/de la Esposo(a)">
                  <Select
                    label="Educacion del/de la Esposo(a)"
                    value={profile.spouseEducation}
                    onChange={(e) =>
                      handleChange("spouseEducation", e.target.value)
                    }
                    options={[
                      {
                        value: "less_than_secondary",
                        label:
                          "Ninguno",
                      },
                      {
                        value: "secondary",
                        label:
                          "Diploma de secundaria (graduación de escuela secundaria)",
                      },
                      {
                        value: "one_year_post_secondary",
                        label:
                          "Programa de un año en una universidad, colegio, escuela técnica u otro instituto",
                      },
                      {
                        value: "two_year_post_secondary",
                        label:
                          "Programa de dos años en una universidad, colegio, escuela técnica u otro instituto",
                      },
                      {
                        value: "bachelors",
                        label:
                          "Título de licenciatura o Pregrado (programa de tres o más años en una universidad, colegio, escuela técnica u otro instituto)",
                      },
                      {
                        value: "two_or_more_degrees",
                        label:
                          "Dos o más certificados, diplomas o títulos. Uno debe ser de un programa de tres o más años",
                      },
                      {
                        value: "masters",
                        label:
                          "Maestría o título profesional necesario para ejercer una profesión licenciada",
                      },
                      {
                        value: "doctoral",
                        label: "Título universitario de nivel doctoral (PhD)",
                      },
                    ]}
                  />

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">
                      Idioma del/de la Esposo(a)
                    </h4>
                    <Select
                      label="Examen de Idioma"
                      value={profile.spouseLanguage.test}
                      onChange={(e) => {
                        const newTest = e.target.value;
                        handleLanguageChange("spouseLanguage", "test", newTest);
                        ["speaking", "listening", "reading", "writing"].forEach(
                          (skill) => {
                            handleLanguageChange("spouseLanguage", skill, 0);
                          }
                        );
                      }}
                      options={[
                        {
                          value: "IELTS",
                          label:
                            "IELTS - International English Language Testing System",
                        },
                        {
                          value: "CELPIP",
                          label:
                            "CELPIP - Canadian English Language Proficiency Index Program",
                        },
                        {
                          value: "PTE",
                          label: "PTE Core - Pearson Test of English",
                        },
                        {
                          value: "TEF",
                          label: "TEF - Test d'évaluation de français",
                        },
                        {
                          value: "TCF",
                          label: "TCF - Test de connaissance du français",
                        },
                      ]}
                    />

                    {/* <LanguageTestInput
                      languageTest={profile.spouseLanguage.test}
                      values={profile.spouseLanguage}
                      onChange={(skill, value) =>
                        handleLanguageChange('spouseLanguage', skill, value)
                      }
                    /> */}

                    <LanguageSelectInput
                      languageTest={profile.spouseLanguage.test}
                      values={profile.spouseLanguage}
                      onChange={(skill, value) =>
                        handleLanguageChange("spouseLanguage", skill, value)
                      }
                      crsConfig={crsConfig}
                    />
                  </div>

                  <Input
                    label="Experiencia Laboral Canadiense en los ultimos 10 años del/de la Esposo(a) (años)"
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={profile.spouseWorkExperience}
                    onChange={(e) =>
                      handleChange(
                        "spouseWorkExperience",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p>
                      Esta experiencia debe ser full time, paga, en un puesto
                      calificado de TEER 0, 1, 2 o 3
                    </p>
                </Card>
              )}

              <Card title="Puntos Adicionales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Checkbox
                      label="Nominacion Provincial"
                      checked={profile.provincialNomination}
                      onChange={(e) =>
                        handleChange("provincialNomination", e.target.checked)
                      }
                    />

                    <Checkbox
                      label="Hermana/o Canadiense (Residente o Ciudadano(a))"
                      checked={profile.canadianSibling}
                      onChange={(e) =>
                        handleChange("canadianSibling", e.target.checked)
                      }
                    />

                    {/* <Checkbox
                      label='French Only (NCLC 7+ in all skills)'
                      checked={profile.frenchOnly}
                      onChange={(e) => {
                        if (e.target.checked && profile.frenchAndEnglish) {
                          handleChange('frenchAndEnglish', false)
                        }
                        handleChange('frenchOnly', e.target.checked)
                      }}
                    /> */}

                    {/* <Checkbox
                      label='French (NCLC 7+) and English (CLB 4+)'
                      checked={profile.frenchAndEnglish}
                      onChange={(e) => {
                        if (e.target.checked && profile.frenchOnly) {
                          handleChange('frenchOnly', false)
                        }
                        handleChange('frenchAndEnglish', e.target.checked)
                      }}
                    /> */}

                     <Checkbox
                      label="Certificado de Trade Occupation"
                      checked={profile.tradesCertification}
                      onChange={(e) =>
                        handleChange("tradesCertification", e.target.checked)
                      }
                    /> 
                  </div>

                  <div>
                    {/* <Select
                      label='Oferta de Trabajo'
                      value={profile.jobOffer}
                      onChange={(e) => handleChange('jobOffer', e.target.value)}
                      options={[
                        {value: 'none', label: 'None'},
                        {value: 'noc_00', label: 'NOC 00 - Senior Management'},
                        {value: 'noc_0_A_B', label: 'NOC 0, A, or B'},
                        {value: 'other', label: 'Otro NOC'},
                      ]}
                    /> */}
                  </div>
                </div>
              </Card>

              <div
                className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mt-6 
                fixed md:static bottom-0 left-0 w-full bg-white px-6 py-4 
                shadow-inner z-50"
              >
                <Button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600"
                >
                  Reiniciar Formulario
                </Button>
                <Button type="submit">Calcular Puntaje CRS</Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="bg-[#D8D7D6] border border-blue-400 text-blue-800 px-4 py-3 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Tu Puntaje CRS Es:
                    </h2>
                    <p className="text-3xl font-bold">
                      {results.totalCRSScore}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setResults(null);
                      scrollToTop();
                    }}
                    className="px-4 py-2 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] focus:outline-none focus:ring-2 focus:ring-[#262628] focus:ring-opacity-50 transition-colors"
                  >
                    Calcular de Nuevo
                  </Button>
                </div>
              </div>

              <Card title="Detalles de Puntaje">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">
                      Core/Human Capital:{" "}
                      <span className="float-right">
                        {results.coreHumanCapitalPoints}
                      </span>
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Edad:{" "}
                        <span className="float-right">
                          {results.detailedBreakdown.age}
                        </span>
                      </p>
                      <p>
                        Educacion:{" "}
                        <span className="float-right">
                          {results.detailedBreakdown.education}
                        </span>
                      </p>
                      <p>
                        Primer Idioma:{" "}
                        <span className="float-right">
                          {results.detailedBreakdown.firstLanguage}
                        </span>
                      </p>
                      <p>
                        Segundo Idioma:{" "}
                        <span className="float-right">
                          {results.detailedBreakdown.secondLanguage}
                        </span>
                      </p>
                      <p>
                        Experiencia Canadiense:{" "}
                        <span className="float-right">
                          {results.detailedBreakdown.canadianExperience}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">
                      Factores del/de la Esposo(a) :{" "}
                      <span className="float-right">
                        {results.spousePoints}
                      </span>
                    </p>
                    {profile.maritalStatus === "married" && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Educacion:{" "}
                          <span className="float-right">
                            {results.detailedBreakdown.spouseEducation}
                          </span>
                        </p>
                        <p>
                          Idioma:{" "}
                          <span className="float-right">
                            {results.detailedBreakdown.spouseLanguage}
                          </span>
                        </p>
                        <p>
                          Experiencia:{" "}
                          <span className="float-right">
                            {results.detailedBreakdown.spouseExperience}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">
                      Transferibilidad de Skills:{" "}
                      <span className="float-right">
                        {results.skillTransferabilityPoints}
                      </span>
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {/* Education + Language */}
                      {results.transferabilityBreakdown.eduLangPointsUsed >=
                        0 && (
                        <p>
                          <strong>
                            Educacion + Idioma
                            <br />
                            (CLB 7 or 9):
                          </strong>
                          <span className="float-right">
                            {results.transferabilityBreakdown.eduLangPointsUsed}
                          </span>
                        </p>
                      )}

                      {/* Foreign Work Experience + Language */}
                      {results.transferabilityBreakdown.foreignLangPointsUsed >=
                        0 && (
                        <p>
                          <strong>
                            Experiencia Extranjera + Idioma
                            <br />
                            (CLB 7 or 9):
                          </strong>
                          <span className="float-right">
                            {
                              results.transferabilityBreakdown
                                .foreignLangPointsUsed
                            }
                          </span>
                        </p>
                      )}

                      {/* Canadian Work Experience + Foreign Work Experience */}
                      {results.transferabilityBreakdown
                        .canadianForeignExpPointsUsed >= 0 && (
                        <p>
                          <strong>
                            Experiencia Canadiense + Experiencia Extranjera:
                          </strong>
                          <span className="float-right">
                            {
                              results.transferabilityBreakdown
                                .canadianForeignExpPointsUsed
                            }
                          </span>
                        </p>
                      )}

                      {/* Canadian Work Experience + Education */}
                      {results.transferabilityBreakdown
                        .canadianEduExpPointsUsed >= 0 && (
                        <p>
                          <strong>Experiencia Canadiense + Educacion:</strong>
                          <span className="float-right">
                            {
                              results.transferabilityBreakdown
                                .canadianEduExpPointsUsed
                            }
                          </span>
                        </p>
                      )}
                      {/* Trades Certification */}
                      {profile.tradesCertification && (
                        <p>
                          <strong>Trades Certification:</strong>
                          <span className="float-right">
                            {clbLevels.firstLanguage.speaking >= 7 &&
                            clbLevels.firstLanguage.listening >= 7 &&
                            clbLevels.firstLanguage.reading >= 7 &&
                            clbLevels.firstLanguage.writing >= 7
                              ? crsConfig?.transferabilityPoints.tradesCertification.clb7
                              : clbLevels.firstLanguage.speaking >= 5 &&
                                clbLevels.firstLanguage.listening >= 5 &&
                                clbLevels.firstLanguage.reading >= 5 &&
                                clbLevels.firstLanguage.writing >= 5
                              ? crsConfig?.transferabilityPoints.tradesCertification.clb5
                              : 0}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">
                      Puntos Adicionales:{" "}
                      <span className="float-right">
                        {results.additionalPoints}
                      </span>
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {/* Canadian Education */}
                      {profile.canadianEducation !== "none" && (
                        <p>
                          <strong>Educacion Canadiense:</strong>
                          <span className="float-right">
                            {crsConfig?.additionalPoints.canadianEducation.find(
                              (e) => e.level === profile.canadianEducation
                            )?.points || 0}
                          </span>
                        </p>
                      )}

                      {/* Nominacion Provincial */}
                      {profile.provincialNomination && (
                        <p>
                          <strong>Nominacion Provincial:</strong>
                          <span className="float-right">
                            {crsConfig?.additionalPoints.provincialNomination}
                          </span>
                        </p>
                      )}

                      {/* Job Offer */}
                      {profile.jobOffer !== "none" && (
                        <p>
                          <strong>
                            Oferta de Trabajo (NOC {profile.jobOffer}):
                          </strong>
                          <span className="float-right">
                            {profile.jobOffer === "noc_00"
                              ? crsConfig?.additionalPoints.arrangedEmployment
                                  .noc_00
                              : profile.jobOffer === "noc_0_A_B"
                              ? crsConfig?.additionalPoints.arrangedEmployment
                                  .noc_0_A_B
                              : 0}
                          </span>
                        </p>
                      )}

                      {/* Canadian Sibling */}
                      {profile.canadianSibling && (
                        <p>
                          <strong>Hermano Canadiense:</strong>
                          <span className="float-right">
                            {crsConfig?.additionalPoints.canadianSibling}
                          </span>
                        </p>
                      )}

                      {/* French Language */}
                      {profile.frenchOnly && (
                        <p>
                          <strong>Solo Frances (NCLC 7+):</strong>
                          <span className="float-right">
                            {crsConfig?.additionalPoints.frenchLanguage.nclc7}
                          </span>
                        </p>
                      )}
                      {profile.frenchAndEnglish && (
                        <p>
                          <strong>Frances (NCLC 7+) e Ingles (CLB 5+):</strong>
                          <span className="float-right">
                            {
                              crsConfig?.additionalPoints.frenchLanguage
                                .nclc7_english_clb4
                            }
                          </span>
                        </p>
                      )}

                      
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Elegibilidad para Programas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Federal Skilled Worker */}
                  <div
                    className={`p-4 rounded-md ${
                      results.eligibilityStatus.FSW
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <h3 className="font-medium mb-2">Federal Skilled Worker</h3>
                    <p>
                      {results.eligibilityStatus.FSW
                        ? "Elegible"
                        : "No Elegible"}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {/* Verificación de elegibilidad */}
                      <p>
                        <strong>Puntos Minimos de Lenguaje (CLB 7):</strong>{" "}
                        {checkLanguagePoints(
                          profile.firstLanguage.speaking,
                          profile.firstLanguage.listening,
                          profile.firstLanguage.reading,
                          profile.firstLanguage.writing ?? 0
                        ) >=
                        (crsConfig?.programMinimums?.FSW?.minLanguagePoints ??
                          0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>
                      <p>
                        <strong>Educacion Minima:</strong>{" "}
                        {meetsEducationRequirement(
                          profile.education,
                          crsConfig?.programMinimums?.FSW?.minEducation ?? ""
                        )
                          ? "Cumple"
                          : "No Cumple"}
                      </p>
                      <p>
                        <strong>Experiencia Minima (años):</strong>{" "}
                        {profile.foreignWorkExperience >=
                        (crsConfig?.programMinimums?.FSW?.minExperience ?? 0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>
                      <p>
                        <strong>Puntaje CRS Minimo:</strong>{" "}
                        {checkFSWEligibility().totalPoints >=
                        (crsConfig?.programMinimums?.FSW?.minPoints ?? 0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>

                      {/* Valores de comparación impresos */}
                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          <strong>Comparacion:</strong>
                        </p>
                        <p>
                          Puntos de Idioma:{" "}
                          {checkLanguagePoints(
                            profile.firstLanguage.speaking,
                            profile.firstLanguage.listening,
                            profile.firstLanguage.reading,
                            profile.firstLanguage.writing ?? 0
                          )}{" "}
                          vs{" "}
                          {crsConfig?.programMinimums?.FSW?.minLanguagePoints ??
                            0}
                        </p>
                        <p>
                          Educacion: {profile.education} vs{" "}
                          {crsConfig?.programMinimums?.FSW?.minEducation}
                        </p>
                        <p>
                          Experiencia: {profile.foreignWorkExperience} vs{" "}
                          {crsConfig?.programMinimums?.FSW?.minExperience ?? 0}
                        </p>
                        <p>
                          Puntos FSW Core: {checkFSWEligibility().totalPoints}{" "}
                          vs {crsConfig?.programMinimums?.FSW?.minPoints ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Canadian Experience Class */}
                  <div
                    className={`p-4 rounded-md ${
                      results.eligibilityStatus.CEC
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <h3 className="font-medium mb-2">
                      Canadian Experience Class
                    </h3>
                    <p>
                      {results.eligibilityStatus.CEC
                        ? "Elegible"
                        : "No Elegible"}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {/* Verificación de elegibilidad */}
                      <p>
                        <strong>Puntos Minimos de Idioma (NOC 0, A):</strong>{" "}
                        {checkLanguagePoints(
                          profile.firstLanguage.speaking,
                          profile.firstLanguage.listening,
                          profile.firstLanguage.reading,
                          profile.firstLanguage.writing ?? 0
                        ) >=
                        (crsConfig?.programMinimums?.CEC?.minLanguagePoints
                          ?.NOC_0_A ?? 0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>
                      <p>
                        <strong>Puntos Minimos de Idioma (NOC B):</strong>{" "}
                        {checkLanguagePoints(
                          profile.firstLanguage.speaking,
                          profile.firstLanguage.listening,
                          profile.firstLanguage.reading,
                          profile.firstLanguage.writing ?? 0
                        ) >=
                        (crsConfig?.programMinimums?.CEC?.minLanguagePoints
                          ?.NOC_B ?? 0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>
                      <p>
                        <strong>
                          Minimo de Experiencia Canadiense (años):
                        </strong>{" "}
                        {profile.canadianWorkExperience >=
                        (crsConfig?.programMinimums?.CEC
                          ?.minCanadianExperience ?? 0)
                          ? "Cumple"
                          : "No Cumple"}
                      </p>

                      {/* Valores de comparación impresos */}
                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          <strong>Comparacion:</strong>
                        </p>
                        <p>
                          Puntos Minimos de Idioma (NOC 0, A):{" "}
                          {checkLanguagePoints(
                            profile.firstLanguage.speaking,
                            profile.firstLanguage.listening,
                            profile.firstLanguage.reading,
                            profile.firstLanguage.writing ?? 0
                          )}{" "}
                          vs{" "}
                          {crsConfig?.programMinimums?.CEC?.minLanguagePoints
                            ?.NOC_0_A ?? 0}
                        </p>
                        <p>
                          Puntos Minimos de Idioma (NOC B):{" "}
                          {checkLanguagePoints(
                            profile.firstLanguage.speaking,
                            profile.firstLanguage.listening,
                            profile.firstLanguage.reading,
                            profile.firstLanguage.writing ?? 0
                          )}{" "}
                          vs{" "}
                          {crsConfig?.programMinimums?.CEC?.minLanguagePoints
                            ?.NOC_B ?? 0}
                        </p>
                        <p>
                          Experiencia Canadiense:{" "}
                          {profile.canadianWorkExperience} vs{" "}
                          {crsConfig?.programMinimums?.CEC
                            ?.minCanadianExperience ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Federal Skilled Trades */}
                  {/* <div
                    className={`p-4 rounded-md ${
                      results.eligibilityStatus.FST
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <h3 className='font-medium mb-2'>Federal Skilled Trades</h3>
                    <p>{results.eligibilityStatus.FST ? 'Elegible' : 'No Elegible'}</p>
                    <div className='mt-2 text-sm text-gray-600'>
                      <p>
                        <strong>Puntaje Minimo en Speaking (CLB 5):</strong>{' '}
                        {checkLanguagePoints(
                          profile.firstLanguage.speaking,
                          profile.firstLanguage.listening,
                          profile.firstLanguage.reading,
                          profile.firstLanguage.writing ?? 0
                        ) >= (crsConfig?.programMinimums?.FST?.minLanguagePoints?.speaking ?? 0)
                          ? 'Cumple'
                          : 'No Cumple'}
                      </p>
                      <p>
                        <strong>Puntaje Minimo en Listening (CLB 5):</strong>{' '}
                        {profile.firstLanguage.listening >=
                        (crsConfig?.programMinimums?.FST?.minLanguagePoints?.listening ?? 0)
                          ? 'Cumple'
                          : 'No Cumple'}
                      </p>
                      <p>
                        <strong>Puntaje Minimo en Reading (CLB 4):</strong>{' '}
                        {profile.firstLanguage.reading >=
                        (crsConfig?.programMinimums?.FST?.minLanguagePoints?.reading ?? 0)
                          ? 'Cumple'
                          : 'No Cumple'}
                      </p>
                      <p>
                        <strong>Puntaje Minimo en Writing (CLB 4):</strong>{' '}
                        {profile.firstLanguage.writing >=
                        (crsConfig?.programMinimums?.FST?.minLanguagePoints?.writing ?? 0)
                          ? 'Cumple'
                          : 'No Cumple'}
                      </p>
                      <p>
                        <strong>Experiencia Minima (años):</strong>{' '}
                        {profile.foreignWorkExperience >=
                        (crsConfig?.programMinimums?.FST?.minExperience ?? 0)
                          ? 'Cumple'
                          : 'No Cumple'}
                      </p>

                      <div className='mt-4 text-sm text-gray-500'>
                        <p>
                          <strong>Comparacion:</strong>
                        </p>
                        <p>
                          Puntos Speaking:{' '}
                          {checkLanguagePoints(
                            profile.firstLanguage.speaking,
                            profile.firstLanguage.listening,
                            profile.firstLanguage.reading,
                            profile.firstLanguage.writing ?? 0
                          )}{' '}
                          vs {crsConfig?.programMinimums?.FST?.minLanguagePoints?.speaking ?? 0}
                        </p>
                        <p>
                          Puntos Listening: {profile.firstLanguage.listening} vs{' '}
                          {crsConfig?.programMinimums?.FST?.minLanguagePoints?.listening ?? 0}
                        </p>
                        <p>
                          Puntos Reading: {profile.firstLanguage.reading} vs{' '}
                          {crsConfig?.programMinimums?.FST?.minLanguagePoints?.reading ?? 0}
                        </p>
                        <p>
                          Puntos Writing: {profile.firstLanguage.writing} vs{' '}
                          {crsConfig?.programMinimums?.FST?.minLanguagePoints?.writing ?? 0}
                        </p>
                        <p>
                          Experiencia: {profile.foreignWorkExperience} vs{' '}
                          {crsConfig?.programMinimums?.FST?.minExperience ?? 0}
                        </p>
                      </div>
                    </div>
                  </div> */}

                  {/* French Language Proficiency */}
                  {/* French Language Proficiency */}
                  <div
                    className={`p-4 rounded-md ${
                      results.eligibilityStatus.frenchLanguageProficiency
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <h3 className="font-medium mb-2">
                      French Language Proficiency
                    </h3>
                    <p>
                      {results.eligibilityStatus.frenchLanguageProficiency
                        ? "Elegible"
                        : "No Elegible"}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <strong>Puntaje Mínimo en Francés (NCLC 7):</strong>{" "}
                        {meetsFrenchCLB7 ? "Cumple" : "No Cumple"}
                      </p>
                      <p>
                        <strong>Elegible a FSW, CEC o FST:</strong>{" "}
                        {results.eligibilityStatus.FSW ||
                        results.eligibilityStatus.CEC ||
                        results.eligibilityStatus.FST
                          ? "Cumple"
                          : "No Cumple"}
                      </p>

                      {/* Comparaciones */}
                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          <strong>Comparacion:</strong>
                        </p>
                        <p>
                          Francés: Speaking {clbLevels.secondLanguage.speaking},
                          Listening {clbLevels.secondLanguage.listening},
                          Reading {clbLevels.secondLanguage.reading}, Writing{" "}
                          {clbLevels.secondLanguage.writing} vs NCLC 7
                        </p>
                        <p>
                          Programas Base: FSW:{" "}
                          {results.eligibilityStatus.FSW ? "✔️" : "❌"}, CEC:{" "}
                          {results.eligibilityStatus.CEC ? "✔️" : "❌"}, FST:{" "}
                          {results.eligibilityStatus.FST ? "✔️" : "❌"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Comparación de Puntaje Obtenido con los ultimos Draws">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Programa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Puntaje Requerido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Puntaje Calculado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diferencia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(results.scoreComparison).map(
                        ([program, difference]) => (
                          <tr key={program}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {program}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(cutOffScores as any)[program]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {results.totalCRSScore}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap font-medium ${
                                Number(difference) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(difference) >= 0
                                ? `+${difference}`
                                : difference}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
              {results && crsConfig && (
                <ScoreImprovementCards
                  englishScore={englishScore}
                  frenchScore={frenchScore}
                  spouseLanguageScore={spouseLanguageScore}
                  totalScore={results.totalCRSScore}
                  eligiblePrograms={eligiblePrograms}
                  lastDrawScore={lastDrawScore}
                  maritalStatus={profile.maritalStatus}
                  crsConfig={crsConfig}
                  results={results}
                />
              )}

              <div className="mt-6">
                <Button
                  onClick={() => {
                    setResults(null);
                    scrollToTop();
                  }}
                  className="px-4 py-2 bg-[#262628] text-white rounded-md hover:bg-[#3a3a3d] focus:outline-none focus:ring-2 focus:ring-[#262628] focus:ring-opacity-50 transition-colors"
                >
                  Ajustar Perfil y Recalcular
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRSCalculator;