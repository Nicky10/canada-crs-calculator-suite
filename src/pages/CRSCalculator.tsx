import React, { useState, useEffect } from 'react';

// Self-contained UI components
const Button = ({ children, onClick, className = "", type = "button" }: { children: React.ReactNode, onClick?: () => void, className?: string, type?: "button" | "submit" | "reset" }) => (
  <button
    type={type}
    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${className}`}
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
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
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
      step="0.5"
      min={0}
      value={values.speaking}
      onChange={(e) => onChange("speaking", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Listening"
      type="number"
      step="0.5"
      min={0}
      value={values.listening}
      onChange={(e) => onChange("listening", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Reading"
      type="number"
      step="0.5"
      min={0}
      value={values.reading}
      onChange={(e) => onChange("reading", parseFloat(e.target.value) || 0)}
    />
    <Input
      label="Writing"
      type="number"
      step="0.5"
      min={0}
      value={values.writing}
      onChange={(e) => onChange("writing", parseFloat(e.target.value) || 0)}
    />
  </div>
);

// Define the interface for CRS configurations and profiles
interface CRSConfig {
  agePoints: { age: number, withSpouse: number, withoutSpouse: number }[];
  educationPoints: { level: string, withSpouse: number, withoutSpouse: number }[];
  languagePoints: {
    firstLanguage: {
      clbConversion: {
        IELTS: { [key: string]: any }[];
        CELPIP: { [key: string]: any }[];
        TEF: { [key: string]: any }[];
        TCF: { [key: string]: any }[];
      },
      points: { skill: string, [key: string]: any }[];
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
    tradesCertification: number;
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
  cutOffScores: {
    FSW: number;
    CEC: number;
    FST: number;
    PNP: number;
    generalDraw: number;
  };
}

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

const CRSCalculator = () => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [crsConfig, setCRSConfig] = useState<CRSConfig | null>(null);
  const [results, setResults] = useState<{
    coreHumanCapitalPoints: number;
    spousePoints: number;
    skillTransferabilityPoints: number;
    additionalPoints: number;
    totalCRSScore: number;
    detailedBreakdown: {
      age: number;
      education: number;
      firstLanguage: number;
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
      generalEligible: boolean;
    };
    scoreComparison: {
      FSW: number;
      CEC: number;
      FST: number;
      PNP: number;
      generalDraw: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        const savedConfig = localStorage.getItem('crsConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setCRSConfig(parsedConfig);
          setLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        throw new Error("No CRS configuration found. Please set up the CRS Dashboard first.");
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load CRS configuration.");
        }
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (!crsConfig) return;

    const calculateCLB = (
      language: 'firstLanguage' | 'secondLanguage' | 'spouseLanguage', 
      test: string, 
      scores: {speaking: number, listening: number, reading: number, writing: number}
    ): CLBLevels => {
      const testType = language === 'spouseLanguage' ? profile.spouseLanguage.test : 
                      (language === 'firstLanguage' ? profile.firstLanguage.test : profile.secondLanguage.test);
      const result: CLBLevels = { speaking: 0, listening: 0, reading: 0, writing: 0 };
      
      let conversionTable: any[] = [];
      if (testType === 'IELTS') {
        conversionTable = crsConfig.languagePoints.firstLanguage.clbConversion.IELTS;
      } else if (testType === 'CELPIP') {
        conversionTable = crsConfig.languagePoints.firstLanguage.clbConversion.CELPIP;
      } else if (testType === 'TEF') {
        conversionTable = crsConfig.languagePoints.firstLanguage.clbConversion.TEF;
      } else if (testType === 'TCF') {
        conversionTable = crsConfig.languagePoints.firstLanguage.clbConversion.TCF;
      } else {
        return result;
      }

      Object.keys(scores).forEach(skill => {
        const skillKey = skill as keyof typeof scores;
        if (!scores[skillKey]) return;
        
        const skillTable = conversionTable.find(t => t && typeof t === 'object' && Object.keys(t)[0] === skill);
        if (!skillTable) return;
        
        const scoreArray = skillTable[skill as keyof typeof skillTable];
        const clbArrayObj = conversionTable.find(t => t && typeof t === 'object' && 'clb' in t);
        const clbArray = clbArrayObj ? clbArrayObj.clb : [];
        
        for (let i = scoreArray.length - 1; i >= 0; i--) {
          if (scores[skillKey] >= scoreArray[i]) {
            result[skillKey as keyof CLBLevels] = clbArray[i] || 0;
            break;
          }
        }
      });

      return result;
    };

    setClbLevels({
      firstLanguage: calculateCLB('firstLanguage', profile.firstLanguage.test, profile.firstLanguage),
      secondLanguage: calculateCLB('secondLanguage', profile.secondLanguage.test, profile.secondLanguage),
      spouseLanguage: calculateCLB('spouseLanguage', profile.spouseLanguage.test, profile.spouseLanguage)
    });
  }, [profile.firstLanguage, profile.secondLanguage, profile.spouseLanguage, crsConfig]);

  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageChange = (languageField: string, skill: string, value: number) => {
    setProfile(prev => {
      const updatedProfile = { ...prev };
      const languageObj = updatedProfile[languageField as keyof UserProfile];
      if (languageObj && typeof languageObj === 'object') {
        (languageObj as any)[skill] = value;
      }
      return updatedProfile;
    });
  };

  const calculateCRS = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crsConfig) {
      setError("CRS configuration is not loaded. Please set up the CRS Dashboard first.");
      return;
    }

    try {
      let coreHumanCapitalPoints = 0;
      
      const withSpouse = profile.maritalStatus === 'married';
      const agePoints = interpolatePoints(
        crsConfig.agePoints, 
        'age', 
        profile.age, 
        withSpouse ? 'withSpouse' : 'withoutSpouse'
      );
      
      const educationPoints = crsConfig.educationPoints.find(e => e.level === profile.education);
      
      let firstLanguagePoints = 0;
      const firstLangCLB = clbLevels.firstLanguage;
      
      crsConfig.languagePoints.firstLanguage.points.forEach(point => {
        const skill = point.skill;
        const clbLevel = firstLangCLB[skill as keyof CLBLevels];
        if (clbLevel >= 4) {
          const clbKey = `clb${clbLevel}`;
          firstLanguagePoints += point[clbKey] || 0;
        }
      });
      
      const canadianExpPoints = interpolatePoints(
        crsConfig.workExperiencePoints.canadian,
        'years',
        Math.min(profile.canadianWorkExperience, 5),
        withSpouse ? 'withSpouse' : 'withoutSpouse'
      );
      
      coreHumanCapitalPoints = agePoints + 
        (educationPoints ? (withSpouse ? educationPoints.withSpouse : educationPoints.withoutSpouse) : 0) + 
        firstLanguagePoints + 
        canadianExpPoints;
      
      let spousePoints = 0;
      let spouseLangPoints = 0;
      
      if (withSpouse) {
        const spouseEduPoints = crsConfig.educationPoints.find(e => e.level === profile.spouseEducation);
        
        spouseLangPoints = 0;
        const spouseLangCLB = clbLevels.spouseLanguage;
        crsConfig.languagePoints.firstLanguage.spousePoints.forEach(point => {
          const skill = point.skill;
          const clbLevel = spouseLangCLB[skill as keyof CLBLevels];
          if (clbLevel >= 4) {
            const clbKey = `clb${clbLevel}`;
            spouseLangPoints += point[clbKey] || 0;
          }
        });
        
        const spouseExpEntry = crsConfig.workExperiencePoints.spouseExperience.find(
          e => e.years === Math.min(profile.spouseWorkExperience, 5)
        );
        
        spousePoints = (spouseEduPoints ? (spouseEduPoints.withSpouse || 0) : 0) + 
                         spouseLangPoints + 
                        (spouseExpEntry ? spouseExpEntry.points : 0);
      }
      
      let skillTransferabilityPoints = 0;
      
      const meetsCLB7 = Object.values(firstLangCLB).every(clb => clb >= 7);
      const meetsCLB9 = Object.values(firstLangCLB).every(clb => clb >= 9);
      
      if (profile.education !== 'less_than_secondary') {
        const eduTransferTable = meetsCLB9 ? 
          crsConfig.transferabilityPoints.education.clb9 : 
          crsConfig.transferabilityPoints.education.clb7;
          
        const eduTransferPoints = eduTransferTable.find(e => e.level === profile.education);
        if (eduTransferPoints && meetsCLB7) {
          skillTransferabilityPoints += eduTransferPoints.points;
        }
      }
      
      if (profile.foreignWorkExperience > 0) {
        const fweCLBTable = meetsCLB9 ? 
          crsConfig.transferabilityPoints.foreignWorkExperience.clb9 : 
          crsConfig.transferabilityPoints.foreignWorkExperience.clb7;
          
        const fwePoints = fweCLBTable.find(
          e => e.years === Math.min(profile.foreignWorkExperience, 3)
        );
        
        if (fwePoints && meetsCLB7) {
          skillTransferabilityPoints += fwePoints.points;
        }
      }
      
      if (profile.canadianWorkExperience > 0 && profile.foreignWorkExperience > 0) {
        const combinedExpEntry = crsConfig.transferabilityPoints.canadianWorkExperience.foreignExperience.find(
          e => e.canadianYears === Math.min(profile.canadianWorkExperience, 2) && 
               e.foreignYears === Math.min(profile.foreignWorkExperience, 2)
        );
        
        if (combinedExpEntry) {
          skillTransferabilityPoints += combinedExpEntry.points;
        }
      }
      
      if (profile.canadianWorkExperience > 0 && profile.education !== 'less_than_secondary') {
        const eduExpCombination = crsConfig.transferabilityPoints.canadianWorkExperience.educationCombination.find(
          e => e.canadianYears === Math.min(profile.canadianWorkExperience, 1) && 
               e.level === profile.education
        );
        
        if (eduExpCombination) {
          skillTransferabilityPoints += eduExpCombination.points;
        }
      }
      
      skillTransferabilityPoints = Math.min(skillTransferabilityPoints, 100);
      
      let additionalPoints = 0;
      
      if (profile.canadianEducation !== 'none') {
        const canadianEduPoints = crsConfig.additionalPoints.canadianEducation.find(
          e => e.level === profile.canadianEducation
        );
        
        if (canadianEduPoints) {
          additionalPoints += canadianEduPoints.points;
        }
      }
      
      if (profile.provincialNomination) {
        additionalPoints += crsConfig.additionalPoints.provincialNomination;
      }
      
      if (profile.jobOffer === 'noc_00') {
        additionalPoints += crsConfig.additionalPoints.arrangedEmployment.noc_00;
      } else if (profile.jobOffer === 'noc_0_A_B') {
        additionalPoints += crsConfig.additionalPoints.arrangedEmployment.noc_0_A_B;
      }
      
      if (profile.canadianSibling) {
        additionalPoints += crsConfig.additionalPoints.canadianSibling;
      }
      
      if (profile.frenchOnly) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7;
      } else if (profile.frenchAndEnglish) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;
      }
      
      if (profile.tradesCertification) {
        additionalPoints += crsConfig.additionalPoints.tradesCertification;
      }
      
      const totalCRSScore = coreHumanCapitalPoints + spousePoints + skillTransferabilityPoints + additionalPoints;
      
      let eligibilityStatus = {
        FSW: false,
        CEC: false,
        FST: false,
        generalEligible: true
      };
      
      const allFirstLangCLB = Object.values(firstLangCLB).every(clb => clb >= crsConfig.programMinimums.FSW.minLanguagePoints);
      const meetsEduReq = profile.education !== 'less_than_secondary';
      const meetsForeignExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FSW.minExperience;
      
      eligibilityStatus.FSW = allFirstLangCLB && meetsEduReq && meetsForeignExpReq && totalCRSScore >= crsConfig.programMinimums.FSW.minPoints;
      
      const minCLBForNOC = profile.nocCategory === '0' || profile.nocCategory === 'A' 
        ? crsConfig.programMinimums.CEC.minLanguagePoints.NOC_0_A 
        : crsConfig.programMinimums.CEC.minLanguagePoints.NOC_B;
      
      const meetsCECLangReq = Object.values(firstLangCLB).every(clb => clb >= minCLBForNOC);
      const meetsCECExpReq = profile.canadianWorkExperience >= crsConfig.programMinimums.CEC.minCanadianExperience;
      
      eligibilityStatus.CEC = meetsCECLangReq && meetsCECExpReq;
      
      const meetsFSTSpeakingReq = firstLangCLB.speaking >= crsConfig.programMinimums.FST.minLanguagePoints.speaking;
      const meetsFSTListeningReq = firstLangCLB.listening >= crsConfig.programMinimums.FST.minLanguagePoints.listening;
      const meetsFSTReadingReq = firstLangCLB.reading >= crsConfig.programMinimums.FST.minLanguagePoints.reading;
      const meetsFSTWritingReq = firstLangCLB.writing >= crsConfig.programMinimums.FST.minLanguagePoints.writing;
      const meetsFSTExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FST.minExperience;
      
      eligibilityStatus.FST = meetsFSTSpeakingReq && meetsFSTListeningReq && 
                              meetsFSTReadingReq && meetsFSTWritingReq && meetsFSTExpReq;
      
      const scoreComparison = {
        FSW: totalCRSScore - crsConfig.cutOffScores.FSW,
        CEC: totalCRSScore - crsConfig.cutOffScores.CEC,
        FST: totalCRSScore - crsConfig.cutOffScores.FST,
        PNP: totalCRSScore - crsConfig.cutOffScores.PNP,
        generalDraw: totalCRSScore - crsConfig.cutOffScores.generalDraw
      };
      
      setResults({
        coreHumanCapitalPoints,
        spousePoints,
        skillTransferabilityPoints,
        additionalPoints,
        totalCRSScore,
        detailedBreakdown: {
          age: agePoints,
          education: educationPoints ? (withSpouse ? educationPoints.withSpouse : educationPoints.withoutSpouse) : 0,
          firstLanguage: firstLanguagePoints,
          canadianExperience: canadianExpPoints,
          spouseEducation: withSpouse ? (crsConfig.educationPoints.find(e => e.level === profile.spouseEducation)?.withSpouse || 0) : 0,
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

  const interpolatePoints = (pointsTable: any[], keyField: string, value: number, pointsField: string): number => {
    const sortedTable = [...pointsTable].sort((a, b) => a[keyField] - b[keyField]);
    
    if (value <= sortedTable[0][keyField]) {
      return sortedTable[0][pointsField];
    }
    
    if (value >= sortedTable[sortedTable.length - 1][keyField]) {
      return sortedTable[sortedTable.length - 1][pointsField];
    }
    
    for (let i = 0; i < sortedTable.length - 1; i++) {
      const lowerKey = sortedTable[i][keyField];
      const upperKey = sortedTable[i + 1][keyField];
      
      if (value >= lowerKey && value <= upperKey) {
        if (value === lowerKey) return sortedTable[i][pointsField];
        if (value === upperKey) return sortedTable[i + 1][pointsField];
        
        const ratio = (value - lowerKey) / (upperKey - lowerKey);
        return Math.round(
          sortedTable[i][pointsField] + 
          ratio * (sortedTable[i + 1][pointsField] - sortedTable[i][pointsField])
        );
      }
    }
    
    return 0;
  };

  const resetForm = () => {
    setProfile(initialProfile);
    setResults(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading CRS configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !crsConfig) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-2">Configuration Error</h2>
        <p>{error}</p>
        <p className="mt-4">Please set up the CRS Dashboard first before using the calculator.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Express Entry CRS Calculator</h1>
          <p className="text-gray-600 mb-6">Calculate your Comprehensive Ranking System score for Canadian immigration</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {!results ? (
            <form onSubmit={calculateCRS}>
              <Card title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Age"
                    type="number"
                    min={18}
                    max={55}
                    value={profile.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  />
                  
                  <Select
                    label="Marital Status"
                    value={profile.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    options={[
                      { value: "single", label: "Single" },
                      { value: "married", label: "Married/Common Law" }
                    ]}
                  />
                </div>
              </Card>

              <Card title="Education">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Highest Level of Education"
                    value={profile.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    options={[
                      { value: "less_than_secondary", label: "Less than Secondary/High School" },
                      { value: "secondary", label: "Secondary/High School Diploma" },
                      { value: "one_year_post_secondary", label: "One-year Post-secondary Program" },
                      { value: "two_year_post_secondary", label: "Two-year Post-secondary Program" },
                      { value: "bachelors", label: "Bachelor's Degree" },
                      { value: "two_or_more_degrees", label: "Two or more Post-secondary Credentials" },
                      { value: "masters", label: "Master's Degree" },
                      { value: "doctoral", label: "Doctoral Degree (PhD)" }
                    ]}
                  />

                  <Select
                    label="Canadian Education (if any)"
                    value={profile.canadianEducation}
                    onChange={(e) => handleChange('canadianEducation', e.target.value)}
                    options={[
                      { value: "none", label: "None" },
                      { value: "one_or_two_year", label: "One or Two-year Credential" },
                      { value: "three_year_or_masters", label: "Three+ year Degree or Master's" },
                      { value: "doctoral", label: "Doctoral Degree" }
                    ]}
                  />
                </div>
              </Card>

              <Card title="First Official Language">
                <Select
                  label="Language Test"
                  value={profile.firstLanguage.test}
                  onChange={(e) => handleLanguageChange('firstLanguage', 'test', e.target.value)}
                  options={[
                    { value: "IELTS", label: "IELTS - International English Language Testing System" },
                    { value: "CELPIP", label: "CELPIP - Canadian English Language Proficiency Index Program" },
                    { value: "TEF", label: "TEF - Test d'évaluation de français" },
                    { value: "TCF", label: "TCF - Test de connaissance du français" }
                  ]}
                />

                <LanguageTestInput
                  languageTest={profile.firstLanguage.test}
                  values={profile.firstLanguage}
                  onChange={(skill, value) => handleLanguageChange('firstLanguage', skill, value)}
                />

                {clbLevels.firstLanguage && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">CLB Equivalence</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.firstLanguage.speaking}</div>
                        <div className="text-xs text-gray-500">Speaking</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.firstLanguage.listening}</div>
                        <div className="text-xs text-gray-500">Listening</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.firstLanguage.reading}</div>
                        <div className="text-xs text-gray-500">Reading</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.firstLanguage.writing}</div>
                        <div className="text-xs text-gray-500">Writing</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Second Official Language (if applicable)">
                <Select
                  label="Language Test"
                  value={profile.secondLanguage.test}
                  onChange={(e) => handleLanguageChange('secondLanguage', 'test', e.target.value)}
                  options={[
                    { value: "IELTS", label: "IELTS - International English Language Testing System" },
                    { value: "CELPIP", label: "CELPIP - Canadian English Language Proficiency Index Program" },
                    { value: "TEF", label: "TEF - Test d'évaluation de français" },
                    { value: "TCF", label: "TCF - Test de connaissance du français" }
                  ]}
                />

                <LanguageTestInput
                  languageTest={profile.secondLanguage.test}
                  values={profile.secondLanguage}
                  onChange={(skill, value) => handleLanguageChange('secondLanguage', skill, value)}
                />

                {clbLevels.secondLanguage && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">CLB Equivalence</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.secondLanguage.speaking}</div>
                        <div className="text-xs text-gray-500">Speaking</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.secondLanguage.listening}</div>
                        <div className="text-xs text-gray-500">Listening</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.secondLanguage.reading}</div>
                        <div className="text-xs text-gray-500">Reading</div>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm">
                        <div className="font-bold text-lg">{clbLevels.secondLanguage.writing}</div>
                        <div className="text-xs text-gray-500">Writing</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Work Experience">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Canadian Work Experience (years)"
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={profile.canadianWorkExperience}
                    onChange={(e) => handleChange('canadianWorkExperience', parseFloat(e.target.value) || 0)}
                  />
                  
                  <Input
                    label="Foreign Work Experience (years)"
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={profile.foreignWorkExperience}
                    onChange={(e) => handleChange('foreignWorkExperience', parseFloat(e.target.value) || 0)}
                  />

                  <Select
                    label="NOC Category"
                    value={profile.nocCategory}
                    onChange={(e) => handleChange('nocCategory', e.target.value)}
                    options={[
                      { value: "0", label: "NOC Skill Level 0 - Management" },
                      { value: "A", label: "NOC Skill Level A - Professional" },
                      { value: "B", label: "NOC Skill Level B - Technical/Trades" },
                      { value: "C", label: "NOC Skill Level C - Intermediate" },
                      { value: "D", label: "NOC Skill Level D - Labour" }
                    ]}
                  />
                </div>
              </Card>

              {profile.maritalStatus === 'married' && (
                <Card title="Spouse Factors">
                  <Select
                    label="Spouse Education"
                    value={profile.spouseEducation}
                    onChange={(e) => handleChange('spouseEducation', e.target.value)}
                    options={[
                      { value: "less_than_secondary", label: "Less than Secondary/High School" },
                      { value: "secondary", label: "Secondary/High School Diploma" },
                      { value: "one_year_post_secondary", label: "One-year Post-secondary Program" },
                      { value: "two_year_post_secondary", label: "Two-year Post-secondary Program" },
                      { value: "bachelors", label: "Bachelor's Degree" },
                      { value: "two_or_more_degrees", label: "Two or more Post-secondary Credentials" },
                      { value: "masters", label: "Master's Degree" },
                      { value: "doctoral", label: "Doctoral Degree (PhD)" }
                    ]}
                  />

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Spouse Language</h4>
                    <Select
                      label="Language Test"
                      value={profile.spouseLanguage.test}
                      onChange={(e) => handleLanguageChange('spouseLanguage', 'test', e.target.value)}
                      options={[
                        { value: "IELTS", label: "IELTS - International English Language Testing System" },
                        { value: "CELPIP", label: "CELPIP - Canadian English Language Proficiency Index Program" },
                        { value: "TEF", label: "TEF - Test d'évaluation de français" },
                        { value: "TCF", label: "TCF - Test de connaissance du français" }
                      ]}
                    />

                    <LanguageTestInput
                      languageTest={profile.spouseLanguage.test}
                      values={profile.spouseLanguage}
                      onChange={(skill, value) => handleLanguageChange('spouseLanguage', skill, value)}
                    />
                  </div>

                  <Input
                    label="Spouse Canadian Work Experience (years)"
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={profile.spouseWorkExperience}
                    onChange={(e) => handleChange('spouseWorkExperience', parseFloat(e.target.value) || 0)}
                  />
                </Card>
              )}

              <Card title="Additional Points">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Checkbox
                      label="Provincial Nomination"
                      checked={profile.provincialNomination}
                      onChange={(e) => handleChange('provincialNomination', e.target.checked)}
                    />
                    
                    <Checkbox
                      label="Sibling in Canada (citizen or PR)"
                      checked={profile.canadianSibling}
                      onChange={(e) => handleChange('canadianSibling', e.target.checked)}
                    />
                    
                    <Checkbox
                      label="French Only (NCLC 7+ in all skills)"
                      checked={profile.frenchOnly}
                      onChange={(e) => {
                        if (e.target.checked && profile.frenchAndEnglish) {
                          handleChange('frenchAndEnglish', false);
                        }
                        handleChange('frenchOnly', e.target.checked);
                      }}
                    />
                    
                    <Checkbox
                      label="French (NCLC 7+) and English (CLB 4+)"
                      checked={profile.frenchAndEnglish}
                      onChange={(e) => {
                        if (e.target.checked && profile.frenchOnly) {
                          handleChange('frenchOnly', false);
                        }
                        handleChange('frenchAndEnglish', e.target.checked);
                      }}
                    />
                    
                    <Checkbox
                      label="Certification in a trade occupation"
                      checked={profile.tradesCertification}
                      onChange={(e) => handleChange('tradesCertification', e.target.checked)}
                    />
                  </div>
                  
                  <div>
                    <Select
                      label="Arranged Employment"
                      value={profile.jobOffer}
                      onChange={(e) => handleChange('jobOffer', e.target.value)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "noc_00", label: "NOC 00 - Senior Management" },
                        { value: "noc_0_A_B", label: "NOC 0, A, or B" },
                        { value: "other", label: "Other NOC" }
                      ]}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={resetForm} className="bg-gray-600">
                  Reset Form
                </Button>
                <Button type="submit">
                  Calculate CRS Score
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Your CRS Score</h2>
                    <p className="text-3xl font-bold">{results.totalCRSScore}</p>
                  </div>
                  <Button onClick={() => setResults(null)} className="bg-blue-700">
                    Recalculate
                  </Button>
                </div>
              </div>
              
              <Card title="Score Breakdown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">Core/Human Capital: <span className="float-right">{results.coreHumanCapitalPoints}</span></p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Age: <span className="float-right">{results.detailedBreakdown.age}</span></p>
                      <p>Education: <span className="float-right">{results.detailedBreakdown.education}</span></p>
                      <p>First Language: <span className="float-right">{results.detailedBreakdown.firstLanguage}</span></p>
                      <p>Canadian Experience: <span className="float-right">{results.detailedBreakdown.canadianExperience}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">Spouse Factors: <span className="float-right">{results.spousePoints}</span></p>
                    {profile.maritalStatus === 'married' && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Education: <span className="float-right">{results.detailedBreakdown.spouseEducation}</span></p>
                        <p>Language: <span className="float-right">{results.detailedBreakdown.spouseLanguage}</span></p>
                        <p>Experience: <span className="float-right">{results.detailedBreakdown.spouseExperience}</span></p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">Skill Transferability: <span className="float-right">{results.skillTransferabilityPoints}</span></p>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-medium">Additional Points: <span className="float-right">{results.additionalPoints}</span></p>
                  </div>
                </div>
              </Card>
              
              <Card title="Program Eligibility">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-md ${results.eligibilityStatus.FSW ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <h3 className="font-medium mb-2">Federal Skilled Worker</h3>
                    <p>{results.eligibilityStatus.FSW ? 'Eligible' : 'Not Eligible'}</p>
                  </div>
                  
                  <div className={`p-4 rounded-md ${results.eligibilityStatus.CEC ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <h3 className="font-medium mb-2">Canadian Experience Class</h3>
                    <p>{results.eligibilityStatus.CEC ? 'Eligible' : 'Not Eligible'}</p>
                  </div>
                  
                  <div className={`p-4 rounded-md ${results.eligibilityStatus.FST ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <h3 className="font-medium mb-2">Federal Skilled Trades</h3>
                    <p>{results.eligibilityStatus.FST ? 'Eligible' : 'Not Eligible'}</p>
                  </div>
                </div>
              </Card>
              
              <Card title="Comparison to Recent Draw Scores">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(results.scoreComparison).map(([program, difference]) => (
                        <tr key={program}>
                          <td className="px-6 py-4 whitespace-nowrap">{program}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{(crsConfig?.cutOffScores as any)[program]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{results.totalCRSScore}</td>
                          <td className={`px-6 py-4 whitespace-nowrap font-medium ${Number(difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(difference) >= 0 ? `+${difference}` : difference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <div className="mt-6">
                <Button onClick={() => setResults(null)} className="bg-blue-700 w-full md:w-auto">
                  Adjust Profile & Recalculate
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
