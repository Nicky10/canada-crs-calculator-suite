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
  onChange: (skill: string, value: any) => void 
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
        IELTS: any[];
        CELPIP: any[];
        TEF: any[];
        TCF: any[];
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

// Main calculator component
const CRSCalculator = () => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [crsConfig, setCRSConfig] = useState<CRSConfig | null>(null);
  const [results, setResults] = useState<any>(null);
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

  // Load CRS configuration from localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        // Try to get from localStorage first
        const savedConfig = localStorage.getItem('crsConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setCRSConfig(parsedConfig);
          setLoading(false);
          return;
        }

        // Fallback: Mock API call if localStorage is empty
        // In a real app, you'd make an actual API request here
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

  // Calculate CLB levels whenever language scores change
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
      
      // Find the correct test conversion table
      let conversionTable;
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

      // For each skill, find the CLB level based on the test score
      Object.keys(scores).forEach(skill => {
        if (!scores[skill as keyof typeof scores]) return;
        
        const skillTable = conversionTable.find(t => Object.keys(t)[0] === skill);
        if (!skillTable) return;
        
        const scoreArray = skillTable[skill as keyof typeof skillTable];
        const clbArrayObj = conversionTable.find(t => 'clb' in t);
        const clbArray = clbArrayObj ? clbArrayObj.clb : [];
        
        // Find the highest CLB level where the test score meets or exceeds the requirement
        for (let i = scoreArray.length - 1; i >= 0; i--) {
          if (scores[skill as keyof typeof scores] >= scoreArray[i]) {
            result[skill as keyof CLBLevels] = clbArray[i] || 0;
            break;
          }
        }
      });

      return result;
    };

    // Calculate CLB levels for all languages
    setClbLevels({
      firstLanguage: calculateCLB('firstLanguage', profile.firstLanguage.test, profile.firstLanguage),
      secondLanguage: calculateCLB('secondLanguage', profile.secondLanguage.test, profile.secondLanguage),
      spouseLanguage: calculateCLB('spouseLanguage', profile.spouseLanguage.test, profile.spouseLanguage)
    });
  }, [profile.firstLanguage, profile.secondLanguage, profile.spouseLanguage, crsConfig]);

  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested language field changes
  const handleLanguageChange = (languageField: string, skill: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [languageField]: {
        ...prev[languageField as keyof UserProfile],
        [skill]: value
      }
    }));
  };

  // Handle form submission and calculate CRS score
  const calculateCRS = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // 3. Language points
      let firstLanguagePoints = 0;
      const firstLangCLB = clbLevels.firstLanguage;
      
      crsConfig.languagePoints.firstLanguage.points.forEach(point => {
        const skill = point.skill;
        const clbLevel = firstLangCLB[skill as keyof CLBLevels];
        if (clbLevel >= 4) {
          // Find the correct points for this CLB level
          const clbKey = `clb${clbLevel}`;
          firstLanguagePoints += point[clbKey] || 0;
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
        firstLanguagePoints + 
        canadianExpPoints;
      
      // B. Spouse Factors (if applicable)
      let spousePoints = 0;
      let spouseLangPoints = 0; // Define this variable for later use
      
      if (withSpouse) {
        // 1. Spouse education
        const spouseEduPoints = crsConfig.educationPoints.find(e => e.level === profile.spouseEducation);
        
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
        
        spousePoints = (spouseEduPoints ? (spouseEduPoints.withSpouse || 0) : 0) + 
                         spouseLangPoints + 
                        (spouseExpEntry ? spouseExpEntry.points : 0);
      }
      
      // C. Skill Transferability Factors
      let skillTransferabilityPoints = 0;
      
      // Check if all first language CLB scores meet minimum threshold
      const meetsCLB7 = Object.values(firstLangCLB).every(clb => clb >= 7);
      const meetsCLB9 = Object.values(firstLangCLB).every(clb => clb >= 9);
      
      // 1. Education + Language
      if (profile.education !== 'less_than_secondary') {
        const eduTransferTable = meetsCLB9 ? 
          crsConfig.transferabilityPoints.education.clb9 : 
          crsConfig.transferabilityPoints.education.clb7;
          
        const eduTransferPoints = eduTransferTable.find(e => e.level === profile.education);
        if (eduTransferPoints && meetsCLB7) {
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
          skillTransferabilityPoints += fwePoints.points;
        }
      }
      
      // 3. Canadian Work Experience + Foreign Work Experience
      if (profile.canadianWorkExperience > 0 && profile.foreignWorkExperience > 0) {
        const combinedExpEntry = crsConfig.transferabilityPoints.canadianWorkExperience.foreignExperience.find(
          e => e.canadianYears === Math.min(profile.canadianWorkExperience, 2) && 
               e.foreignYears === Math.min(profile.foreignWorkExperience, 2)
        );
        
        if (combinedExpEntry) {
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
          skillTransferabilityPoints += eduExpCombination.points;
        }
      }
      
      // Cap transferability points at 100
      skillTransferabilityPoints = Math.min(skillTransferabilityPoints, 100);
      
      // D. Additional Points
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
      
      // 2. Provincial Nomination
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
      if (profile.frenchOnly) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7;
      } else if (profile.frenchAndEnglish) {
        additionalPoints += crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4;
      }
      
      // 6. Trades Certification
      if (profile.tradesCertification) {
        additionalPoints += crsConfig.additionalPoints.tradesCertification;
      }
      
      // Calculate total CRS score
      const totalCRSScore = coreHumanCapitalPoints + spousePoints + skillTransferabilityPoints + additionalPoints;
      
      // Check eligibility for various programs
      let eligibilityStatus = {
        FSW: false,
        CEC: false,
        FST: false,
        generalEligible: true
      };
      
      // FSW Eligibility
      const allFirstLangCLB = Object.values(firstLangCLB).every(clb => clb >= crsConfig.programMinimums.FSW.minLanguagePoints);
      const meetsEduReq = profile.education !== 'less_than_secondary';
      const meetsForeignExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FSW.minExperience;
      
      eligibilityStatus.FSW = allFirstLangCLB && meetsEduReq && meetsForeignExpReq && totalCRSScore >= crsConfig.programMinimums.FSW.minPoints;
      
      // CEC Eligibility
      const minCLBForNOC = profile.nocCategory === '0' || profile.nocCategory === 'A' 
        ? crsConfig.programMinimums.CEC.minLanguagePoints.NOC_0_A 
        : crsConfig.programMinimums.CEC.minLanguagePoints.NOC_B;
      
      const meetsCECLangReq = Object.values(firstLangCLB).every(clb => clb >= minCLBForNOC);
      const meetsCECExpReq = profile.canadianWorkExperience >= crsConfig.programMinimums.CEC.minCanadianExperience;
      
      eligibilityStatus.CEC = meetsCECLangReq && meetsCECExpReq;
      
      // FST Eligibility
      const meetsFSTSpeakingReq = firstLangCLB.speaking >= crsConfig.programMinimums.FST.minLanguagePoints.speaking;
      const meetsFSTListeningReq = firstLangCLB.listening >= crsConfig.programMinimums.FST.minLanguagePoints.listening;
      const meetsFSTReadingReq = firstLangCLB.reading >= crsConfig.programMinimums.FST.minLanguagePoints.reading;
      const meetsFSTWritingReq = firstLangCLB.writing >= crsConfig.programMinimums.FST.minLanguagePoints.writing;
      const meetsFSTExpReq = profile.foreignWorkExperience >= crsConfig.programMinimums.FST.minExperience;
      
      eligibilityStatus.FST = meetsFSTSpeakingReq && meetsFSTListeningReq && 
                              meetsFSTReadingReq && meetsFSTWritingReq && meetsFSTExpReq;
      
      // Compare scores to cut-offs
      const scoreComparison = {
        FSW: totalCRSScore - crsConfig.cutOffScores.FSW,
        CEC: totalCRSScore - crsConfig.cutOffScores.CEC,
        FST: totalCRSScore - crsConfig.cutOffScores.FST,
        PNP: totalCRSScore - crsConfig.cutOffScores.PNP,
        generalDraw: totalCRSScore - crsConfig.cutOffScores.generalDraw
      };
      
      // Set the results
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

              <Card title="First Official Language
