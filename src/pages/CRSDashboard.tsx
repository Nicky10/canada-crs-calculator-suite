import React, { useState, useEffect } from 'react';
import { get } from 'lodash';

type LegacyCLBEntry = {
  [key: string]: number[];
  clb: number[];
};

type NewCLBEntry = {
  skill: 'speaking' | 'listening' | 'reading' | 'writing';
  values: number[];
  clb: number[];
};

function isNewCLBEntry(entry: any): entry is NewCLBEntry {
  return 'skill' in entry && 'values' in entry && Array.isArray(entry.clb);
}


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


const Input = ({ label, type = "text", value, onChange, className = "", ...props }: { label: string, type?: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string, [key: string]: any }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
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

const Tabs = ({ tabs, activeTab, onTabChange }: { tabs: string[], activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="overflow-x-auto no-scrollbar mb-6">
    <div className="flex gap-2 min-w-max border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 whitespace-nowrap focus:outline-none ${
            activeTab === tab
              ? "border-b-2 border-blue-500 font-medium text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);


const Card = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <h3 className="text-lg font-medium text-black-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Table = ({ headers, data, onRowChange }: { headers: string[], data: any[], onRowChange: (index: number, key: string, value: any) => void }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, i) => (
            <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.keys(row).map((key) => (
              <td key={key} className="px-6 py-4 whitespace-nowrap">
                {typeof row[key] === 'boolean' ? (
                  <input 
                    type="checkbox" 
                    checked={row[key]} 
                    onChange={(e) => onRowChange(rowIndex, key, e.target.checked)} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                ) : (
                  <input 
                    type={typeof row[key] === 'number' ? 'number' : 'text'} 
                    value={row[key]} 
                    onChange={(e) => onRowChange(rowIndex, key, typeof row[key] === 'number' ? parseFloat(e.target.value) : e.target.value)} 
                    className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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
            reading: [0,3.5, 4.0, 5.0, 6.0, 6.5, 7.0, 8.0],
            clb:     [0,4,   5,   6,   7,   8,   9,   10]
          },
          {
            writing: [0,4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5],
            clb:     [0,4,   5,   6,   7,   8,   9,   10]
          },
          {
            listening: [0,4.5, 5.0, 5.5, 6.0, 7.5, 8.0, 8.5],
            clb:       [0,4,   5,   6,   7,   8,   9,   10]
          },
          {
            speaking: [0,4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5],
            clb:      [0,4,   5,   6,   7,   8,   9,   10]
          },
        ],
        CELPIP: [
          {
            reading: [0,4, 5, 6, 7, 8, 9, 10],
            clb:     [0,4, 5, 6, 7, 8, 9, 10]
          },
          {
            writing: [0,4, 5, 6, 7, 8, 9, 10],
            clb:     [0,4, 5, 6, 7, 8, 9, 10]
          },
          {
            listening: [0,4, 5, 6, 7, 8, 9, 10],
            clb:       [0,4, 5, 6, 7, 8, 9, 10]
          },
          {
            speaking: [0,4, 5, 6, 7, 8, 9, 10],
            clb:      [0,4, 5, 6, 7, 8, 9, 10]
          },
        ],
        TEF: [
          {
            reading: [0, 306, 352, 393, 434, 462, 503, 546],
            clb:     [0,   4,   5,   6,   7,   8,   9,  10]
          },
          {
            writing: [0, 268, 330, 379, 428, 472, 512, 558],
            clb:     [0,   4,   5,   6,   7,   8,   9,  10]
          },
          {
            listening: [0, 306, 352, 393, 434, 462, 503, 546],
            clb:       [0,   4,   5,   6,   7,   8,   9,  10]
          },
          {
            speaking: [0, 328, 387, 422, 456, 494, 518, 556],
            clb:      [0,   4,   5,   6,   7,   8,   9,  10]
          },
        ],
        TCF: [
          {
            reading: [0, 342, 375, 406, 453, 499, 524, 549],
            clb:     [0,   4,   5,   6,   7,   8,   9,  10]
          },
          {
            writing: [0, 4, 6, 7, 10, 12, 14, 16],
            clb:     [0, 4, 5, 6, 7, 8, 9, 10]
          },
          {
            listening: [0, 331, 369, 398, 458, 503, 523, 549],
            clb:        [0,   4,   5,   6,   7,   8,   9,  10]
          },
          {
            speaking: [0, 4, 6, 7, 10, 12, 14, 16],
            clb:      [0, 4, 5, 6, 7, 8, 9, 10]
          }
        ],
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
    FST: 436,
    PNP: 736,
    FLP: 379,
    General: 529
  }
}; 



const CRSDashboard = () => {
  const [crsConfig, setCRSConfig] = useState(initialCRSConfig);
  const [activeTab, setActiveTab] = useState("Edad");
  const [saveStatus, setSaveStatus] = useState("");
  const [activeLanguageTestTab, setActiveLanguageTestTab] = useState("IELTS");
  const [educationActiveTab, setEducationActiveTab] = useState("Solicitante Principal");
  const educationTabs = ["Solicitante Principal", "Esposo(a)"];
  const [firstLanguageActiveTab, setFirstLanguageActiveTab] = useState("Soltero(a)");
  const firstLanguageTabs = ["Soltero(a)", "Con Esposo(a)"];

  useEffect(() => {
    const loadConfig = async () => {
        console.log('Data cargada desde el archivo JSON:');
        setCRSConfig(initialCRSConfig);
    };
    loadConfig();
  }, []);

  const normalizeCLBArray = (arr: any[]) => {
    return arr.map(obj => {
      const skill = Object.keys(obj).find(k => k !== 'clb');
      return {
        skill,
        values: skill ? obj[skill] : undefined,
        clb: obj.clb
      };
    });
  };
  
  

  const prepareCRSConfig = (config: any) => {
    const newConfig = { ...config };
    const clbConv = config.languagePoints.firstLanguage.clbConversion;
  
    for (const exam of Object.keys(clbConv)) {
      newConfig.languagePoints.firstLanguage.clbConversion[exam] =
        normalizeCLBArray(clbConv[exam]);
    }
  
    return newConfig;
  };

  const tabs = [
    "Edad", 
    "Educacion", 
    "Idioma", 
    "Experiencia Laboral", 
    "Transferibilidad", 
    "Puntos Adicionales",
    "Requisitos de Programa"
  ];

  const languageTestTabs = ["IELTS", "CELPIP", "TEF", "TCF"];

  const handleTableRowChange = (section: string, subsection: string | null = null) => {
    return (rowIndex: number, key: string, value: any) => {
      setCRSConfig(prev => {
        const newConfig = {...prev};
        if (subsection) {
          const subsectionParts = subsection.split('.');
          let target = newConfig[section as keyof typeof newConfig];
          
          for (let i = 0; i < subsectionParts.length - 1; i++) {
            target = target[subsectionParts[i] as keyof typeof target];
          }
          
          ((target as Record<string, any>)[subsectionParts[subsectionParts.length - 1]] as any)[rowIndex][key] = value;
        } else {
          (newConfig[section as keyof typeof newConfig] as { [key: string]: any }[])[rowIndex][key] = value;
        }
        return newConfig;
      });
    };
  };

  const handleLanguageConversionChange = (testName: string, skillType: string, rowIndex: number, key: string, value: any) => {
    setCRSConfig(prev => {
      const newConfig = {...prev};
      const conversionTable = newConfig.languagePoints.firstLanguage.clbConversion[testName as keyof typeof newConfig.languagePoints.firstLanguage.clbConversion];
      
      const skillTableIndex = conversionTable.findIndex(item => Object.keys(item)[0] === skillType);
      if (skillTableIndex !== -1) {
        const skillTable = conversionTable[skillTableIndex];
        if (key === 'testScore') {
          if (skillTable && Array.isArray(skillTable[skillType as keyof typeof skillTable])) {
            (skillTable[skillType as keyof typeof skillTable] as any[])[rowIndex] = value;
          }
        } else if (key === 'clbLevel') {
          const clbArrayIndex = conversionTable.findIndex(item => 'clb' in item);
          if (clbArrayIndex !== -1) {
            conversionTable[clbArrayIndex].clb[rowIndex] = value;
          }
        }
      }
      
      return newConfig;
    });
  };

  const handleLanguageTestTabChange = (tab: string) => {
    setActiveLanguageTestTab(tab);
  };

  const handleSave = async () => {
    try {
      //handleSaveToDatabase();
      localStorage.setItem('crsConfig', JSON.stringify(crsConfig));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus("Configuration saved successfully");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (e) {
      console.error("Error saving configuration:", e);
      setSaveStatus("Error saving configuration");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleReset = () => {
    setCRSConfig(initialCRSConfig);
    setSaveStatus("Configuration reset to defaults");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case "Edad":
        return (
          <Card title="Configuracion de Puntos de Edad">
            <Table 
              headers={["Edad", "Con Esposo(a)", "Sin Esposo(a)"]}
              data={crsConfig.agePoints}
              onRowChange={handleTableRowChange('agePoints')}
            />
            <p className="text-sm text-black-500 mt-2">
              Nota: Los puntos son interpolados para las edades que estan entre los valores de la tabla.
            </p>
          </Card>
        );
      
        case "Educacion":
          return (
            <Card title="Configuracion de Puntos de Educacion">
              <Tabs 
                tabs={educationTabs} 
                activeTab={educationActiveTab} 
                onTabChange={(tab) => setEducationActiveTab(tab)}
              />
              {educationActiveTab === "Solicitante Principal" ? (
                <Table 
                  headers={["Nivel Educativo", "Con Esposo(a)", "Sin Esposo(a)"]}
                  data={crsConfig.educationPoints}
                  onRowChange={handleTableRowChange('educationPoints')}
                />
              ) : (
                <Table 
                  headers={["Nivel Educativo", "Puntos"]}
                  data={crsConfig.spouseEducationPoints}
                  onRowChange={handleTableRowChange('spouseEducationPoints')}
                />
              )}
              <p className="text-sm text-black-500 mt-2">
                Nota: Las Credenciales de Educacion Superior Extranjeras Requieren un ECA.
              </p>
            </Card>
          );
        
      case "Idioma":
        return (
          <>
            <Card title="Conversion de Examen de Idioma a CLB">
              <Tabs 
                tabs={languageTestTabs} 
                activeTab={activeLanguageTestTab} 
                onTabChange={handleLanguageTestTabChange}
              />
              <div className="space-y-6">
                {['speaking', 'listening', 'reading', 'writing'].map(skill => {
                  const rawData = crsConfig.languagePoints.firstLanguage.clbConversion[activeLanguageTestTab as keyof typeof crsConfig.languagePoints.firstLanguage.clbConversion];

                  const skillEntry = rawData.find(entry =>
                    (isNewCLBEntry(entry) && entry.skill === skill) ||
                    (!isNewCLBEntry(entry) && skill in entry)
                  );
                  
                  const values = isNewCLBEntry(skillEntry) ? skillEntry.values : skillEntry?.[skill as keyof typeof skillEntry];
                  const clb = skillEntry?.clb ?? [];
                  
                  const tableData = values?.map((score: number, i: number) => ({
                    testScore: score,
                    clbLevel: clb[i] || 0
                  })) ?? [];
                  
                    
                  return (
                    <div key={skill}>
                      <h4 className="font-medium text-gray-700 mb-2 capitalize">{skill}</h4>
                      <Table 
                        headers={["Test Score", "CLB Nivel"]}
                        data={tableData}
                        onRowChange={(rowIndex, key, value) => 
                          handleLanguageConversionChange(activeLanguageTestTab, skill, rowIndex, key, value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card title="Puntos del primer Idioma">
            <Tabs 
                tabs={firstLanguageTabs} 
                activeTab={firstLanguageActiveTab} 
                onTabChange={(tab) => setFirstLanguageActiveTab(tab)}
              />
              {firstLanguageActiveTab === "Soltero(a)" ? (
                <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.firstLanguage.points}
                onRowChange={handleTableRowChange('languagePoints', 'firstLanguage.points')}
              />
              ) : (
                <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.firstLanguage.pointsWithSpouse}
                onRowChange={handleTableRowChange('languagePoints', 'firstLanguage.points')}
              />
              )}
              
            </Card>
            
            <Card title="Puntos del segundo Idioma">
              <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.secondLanguage.points}
                onRowChange={handleTableRowChange('languagePoints', 'secondLanguage.points')}
              />
            </Card>
            
            <Card title="Puntos de Idioma del/de la Esposo(a)">
              <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.firstLanguage.spousePoints}
                onRowChange={handleTableRowChange('languagePoints', 'firstLanguage.spousePoints')}
              />
            </Card>
          </>
        );
      
      case "Experiencia Laboral":
        return (
          <>
            <Card title="Puntos Experiencia Laboral Extranjera">
              <Table 
                headers={["Años", "Con Esposo(a)", "Sin Esposo(a)"]}
                data={crsConfig.workExperiencePoints.foreign}
                onRowChange={handleTableRowChange('workExperiencePoints', 'foreign')}
              />
            </Card>
            
            <Card title="Puntos Experiencia Laboral Canadiense">
              <Table 
                headers={["Años", "Con Esposo(a)", "Sin Esposo(a)"]}
                data={crsConfig.workExperiencePoints.canadian}
                onRowChange={handleTableRowChange('workExperiencePoints', 'canadian')}
              />
            </Card>
            
            <Card title="Puntos Experiencia Laboral del/de la Esposo(a)">
              <Table 
                headers={["Años", "Puntos"]}
                data={crsConfig.workExperiencePoints.spouseExperience}
                onRowChange={handleTableRowChange('workExperiencePoints', 'spouseExperience')}
              />
            </Card>
          </>
        );
      
      case "Transferibilidad":
        return (
          <>
            <Card title="Transferibilidad Educacion + Idioma (CLB 7+)">
              <Table 
                headers={["Nivel Educativo", "Puntos"]}
                data={crsConfig.transferabilityPoints.education.clb7}
                onRowChange={handleTableRowChange('transferabilityPoints', 'education.clb7')}
              />
            </Card>
            
            <Card title="Transferibilidad Educacion + Idioma (CLB 9+)">
              <Table 
                headers={["Nivel Educativo", "Puntos"]}
                data={crsConfig.transferabilityPoints.education.clb9}
                onRowChange={handleTableRowChange('transferabilityPoints', 'education.clb9')}
              />
            </Card>
            
            <Card title="Transferibilidad Experiencia Laboral Extranjera + Idioma (CLB 7+)">
              <Table 
                headers={["Años", "Puntos"]}
                data={crsConfig.transferabilityPoints.foreignWorkExperience.clb7}
                onRowChange={handleTableRowChange('transferabilityPoints', 'foreignWorkExperience.clb7')}
              />
            </Card>
            
            <Card title="Transferibilidad Experiencia Laboral Extranjera + Idioma (CLB 9+)">
              <Table 
                headers={["Años", "Puntos"]}
                data={crsConfig.transferabilityPoints.foreignWorkExperience.clb9}
                onRowChange={handleTableRowChange('transferabilityPoints', 'foreignWorkExperience.clb9')}
              />
            </Card>
            
            <Card title="Transferibilidad Experiencia Laboral Extranjera + Experiencia Laboral Canadiense">
              <Table 
                headers={["Canadiense(Años)", "Extranjera(Años)", "Puntos"]}
                data={crsConfig.transferabilityPoints.canadianWorkExperience.foreignExperience}
                onRowChange={handleTableRowChange('transferabilityPoints', 'canadianWorkExperience.foreignExperience')}
              />
            </Card>
            
            <Card title="Transferibilidad Educacion + Experiencia Laboral Canadiense">
              <Table 
                headers={["Canadiense(Años)", "Extranjera(Años)", "Puntos"]}
                data={crsConfig.transferabilityPoints.canadianWorkExperience.educationCombination}
                onRowChange={handleTableRowChange('transferabilityPoints', 'canadianWorkExperience.educationCombination')}
              />
            </Card>
          </>
        );
      
      case "Puntos Adicionales":
        return (
          <>
            <Card title="Educacion Canadiense">
              <Table 
                headers={["Nivel", "Puntos"]}
                data={crsConfig.additionalPoints.canadianEducation}
                onRowChange={handleTableRowChange('additionalPoints', 'canadianEducation')}
              />
            </Card>
            
            <Card title="Otros Puntos Adicionales">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Nominacion Provincial" 
                    type="number"
                    value={crsConfig.additionalPoints.provincialNomination}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        provincialNomination: parseInt(e.target.value)
                      }
                    }))}
                  />
                  <Input 
                    label="Oferta de Empleo (NOC 00)" 
                    type="number"
                    value={crsConfig.additionalPoints.arrangedEmployment.noc_00}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        arrangedEmployment: {
                          ...prev.additionalPoints.arrangedEmployment,
                          noc_00: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                  <Input 
                    label="Oferta de Empleo (NOC 0, A, B)" 
                    type="number"
                    value={crsConfig.additionalPoints.arrangedEmployment.noc_0_A_B}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        arrangedEmployment: {
                          ...prev.additionalPoints.arrangedEmployment,
                          noc_0_A_B: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                  <Input 
                    label="Hermano(a) Canadiense" 
                    type="number"
                    value={crsConfig.additionalPoints.canadianSibling}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        canadianSibling: parseInt(e.target.value)
                      }
                    }))}
                  />
                  <Input 
                    label="Frances (CLB 7+)" 
                    type="number"
                    value={crsConfig.additionalPoints.frenchLanguage.nclc7}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        frenchLanguage: {
                          ...prev.additionalPoints.frenchLanguage,
                          nclc7: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                  <Input 
                    label="Frances (CLB 7+) e Ingles (CLB 5+)" 
                    type="number"
                    value={crsConfig.additionalPoints.frenchLanguage.nclc7_english_clb4}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        frenchLanguage: {
                          ...prev.additionalPoints.frenchLanguage,
                          nclc7_english_clb4: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                  <Input 
                    label="Trades Certification" 
                    type="number"
                    value={crsConfig.additionalPoints.tradesCertification}
                    onChange={(e) => setCRSConfig(prev => ({
                      ...prev,
                      additionalPoints: {
                        ...prev.additionalPoints,
                        tradesCertification: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
              </div>
            </Card>
          </>
        );
      
      case "Requisitos de Programa":
        return (
          <>
            <Card title="Requisitos Minimos para FSW">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Puntos Minimos de Idioma (CLB 7)" 
                  type="number"
                  value={crsConfig.programMinimums.FSW.minLanguagePoints}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FSW: {
                        ...prev.programMinimums.FSW,
                        minLanguagePoints: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
                <Select 
                  label="Educacion Minima" 
                  value={crsConfig.programMinimums.FSW.minEducation}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FSW: {
                        ...prev.programMinimums.FSW,
                        minEducation: e.target.value
                      }
                    }
                  }))}
                  options={[
                    { value: "less_than_secondary", label: "Menos que Secundaria" },
                    { value: "secondary", label: "Secundaria" },
                    { value: "one_year_post_secondary", label: "Un año Post-Secundario" },
                    { value: "two_year_post_secondary", label: "Dos Años Post-Secundarios" },
                    { value: "bachelors", label: "Bachelor's (Pregrado)" },
                    { value: "masters", label: "Master's" },
                    { value: "doctoral", label: "Doctorado " },
                  ]}
                />
                <Input 
                  label="Experiencia Minima (Años)" 
                  type="number"
                  value={crsConfig.programMinimums.FSW.minExperience}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FSW: {
                        ...prev.programMinimums.FSW,
                        minExperience: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
                <Input 
                  label="Puntos Minimos" 
                  type="number"
                  value={crsConfig.programMinimums.FSW.minPoints}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FSW: {
                        ...prev.programMinimums.FSW,
                        minPoints: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
              </div>
            </Card>
            
            <Card title="Requisitos Minimos para CEC">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Idioma Minimo - NOC 0, A (CLB 7)" 
                  type="number"
                  value={crsConfig.programMinimums.CEC.minLanguagePoints.NOC_0_A}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      CEC: {
                        ...prev.programMinimums.CEC,
                        minLanguagePoints: {
                          ...prev.programMinimums.CEC.minLanguagePoints,
                          NOC_0_A: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Idioma Minimo - NOC B (CLB 5)" 
                  type="number"
                  value={crsConfig.programMinimums.CEC.minLanguagePoints.NOC_B}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      CEC: {
                        ...prev.programMinimums.CEC,
                        minLanguagePoints: {
                          ...prev.programMinimums.CEC.minLanguagePoints,
                          NOC_B: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Experiencia Canadiense Minima (años)" 
                  type="number"
                  value={crsConfig.programMinimums.CEC.minCanadianExperience}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      CEC: {
                        ...prev.programMinimums.CEC,
                        minCanadianExperience: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
              </div>
            </Card>
            
            <Card title="Requisitos Minimos para FST">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Speaking Minimo (CLB 5)" 
                  type="number"
                  value={crsConfig.programMinimums.FST.minLanguagePoints.speaking}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FST: {
                        ...prev.programMinimums.FST,
                        minLanguagePoints: {
                          ...prev.programMinimums.FST.minLanguagePoints,
                          speaking: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Listening Minimo (CLB 5)" 
                  type="number"
                  value={crsConfig.programMinimums.FST.minLanguagePoints.listening}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FST: {
                        ...prev.programMinimums.FST,
                        minLanguagePoints: {
                          ...prev.programMinimums.FST.minLanguagePoints,
                          listening: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Reading Minimo (CLB 4)" 
                  type="number"
                  value={crsConfig.programMinimums.FST.minLanguagePoints.reading}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FST: {
                        ...prev.programMinimums.FST,
                        minLanguagePoints: {
                          ...prev.programMinimums.FST.minLanguagePoints,
                          reading: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Writing Minimo (CLB 4)" 
                  type="number"
                  value={crsConfig.programMinimums.FST.minLanguagePoints.writing}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FST: {
                        ...prev.programMinimums.FST,
                        minLanguagePoints: {
                          ...prev.programMinimums.FST.minLanguagePoints,
                          writing: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                />
                <Input 
                  label="Experiencia Minima (Años)" 
                  type="number"
                  value={crsConfig.programMinimums.FST.minExperience}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    programMinimums: {
                      ...prev.programMinimums,
                      FST: {
                        ...prev.programMinimums.FST,
                        minExperience: parseInt(e.target.value)
                      }
                    }
                  }))}
                />
              </div>
            </Card>
            
            <Card title="Puntajes de Corte por Programa">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="FSW Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.FSW}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      FSW: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input 
                  label="CEC Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.CEC}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      CEC: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input 
                  label="FST Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.FST}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      FST: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input 
                  label="PNP Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.PNP}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      PNP: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input 
                  label="FLP Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.FLP}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      PNP: parseInt(e.target.value)
                    }
                  }))}
                />
                <Input 
                  label="Draw General" 
                  type="number"
                  value={crsConfig.cutOffScores.General}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      General: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
            </Card>
          </>
        );
        
      default:
        return <div>Seleccione una Tab Por Favor</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard CRS</h1>
          <p className="text-gray-600 mb-6">Configure los Parametros de la Calculadora CRS</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Guardar Configuracion
            </Button>
            <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Valores Predeterminados
            </Button>
            {saveStatus && (
              <div className={`px-4 py-2 rounded-md ${saveStatus.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {saveStatus}
              </div>
            )}
          </div>
          
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CRSDashboard;