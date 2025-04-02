
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
  <div className="flex space-x-1 border-b border-gray-200 mb-6">
    {tabs.map((tab) => (
      <button
        key={tab}
        className={`px-4 py-2 focus:outline-none ${
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
);

const Card = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
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

// Initial state for the CRS configuration
const initialCRSConfig = {
  agePoints: [
    { age: 18, withSpouse: 90, withoutSpouse: 110 },
    { age: 19, withSpouse: 95, withoutSpouse: 110 },
    { age: 20, withSpouse: 100, withoutSpouse: 110 },
    { age: 29, withSpouse: 100, withoutSpouse: 110 },
    { age: 30, withSpouse: 95, withoutSpouse: 105 },
    { age: 35, withSpouse: 70, withoutSpouse: 80 },
    { age: 40, withSpouse: 35, withoutSpouse: 45 },
    { age: 45, withSpouse: 0, withoutSpouse: 0 },
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
  languagePoints: {
    firstLanguage: {
      clbConversion: {
        IELTS: [
          { speaking: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { listening: [0, 4.5, 5.0, 5.5, 6.0, 7.5, 8.0, 8.5, 9.0], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { reading: [0, 3.5, 4.0, 4.5, 5.0, 6.0, 6.5, 7.0, 8.0, 9.0], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { writing: [0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
        ],
        CELPIP: [
          { speaking: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { listening: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { reading: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { writing: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
        ],
        TEF: [
          { speaking: [0, 181, 226, 271, 310, 349, 371, 393], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { listening: [0, 145, 181, 217, 249, 280, 298, 316], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { reading: [0, 121, 151, 181, 206, 233, 248, 263], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { writing: [0, 181, 226, 271, 310, 349, 371, 393], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
        ],
        TCF: [
          { speaking: [0, 4, 6, 10, 14, 18, 20], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { listening: [0, 331, 369, 397, 457, 503, 523], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { reading: [0, 342, 374, 406, 453, 499, 524], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
          { writing: [0, 4, 6, 10, 14, 18, 20], clb: [0, 4, 5, 6, 7, 8, 9, 10] },
        ],
      },
      points: [
        { skill: "speaking", clb4: 0, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 26, clb10: 32 },
        { skill: "listening", clb4: 0, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 26, clb10: 32 },
        { skill: "reading", clb4: 0, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 26, clb10: 32 },
        { skill: "writing", clb4: 0, clb5: 6, clb6: 8, clb7: 16, clb8: 22, clb9: 26, clb10: 32 },
      ],
      spousePoints: [
        { skill: "speaking", clb4: 0, clb5: 1, clb6: 3, clb7: 5, clb8: 5, clb9: 5, clb10: 5 },
        { skill: "listening", clb4: 0, clb5: 1, clb6: 3, clb7: 5, clb8: 5, clb9: 5, clb10: 5 },
        { skill: "reading", clb4: 0, clb5: 1, clb6: 3, clb7: 5, clb8: 5, clb9: 5, clb10: 5 },
        { skill: "writing", clb4: 0, clb5: 1, clb6: 3, clb7: 5, clb8: 5, clb9: 5, clb10: 5 },
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
      { years: 1, withSpouse: 13, withoutSpouse: 25 },
      { years: 2, withSpouse: 25, withoutSpouse: 50 },
      { years: 3, withSpouse: 38, withoutSpouse: 75 },
    ],
    canadian: [
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
        { years: 2, points: 25 },
        { years: 3, points: 25 },
      ],
      clb9: [
        { years: 1, points: 25 },
        { years: 2, points: 50 },
        { years: 3, points: 50 },
      ]
    },
    canadianWorkExperience: {
      foreignExperience: [
        { canadianYears: 1, foreignYears: 1, points: 13 },
        { canadianYears: 1, foreignYears: 2, points: 25 },
        { canadianYears: 2, foreignYears: 1, points: 13 },
        { canadianYears: 2, foreignYears: 2, points: 25 },
      ],
      educationCombination: [
        { canadianYears: 1, level: "secondary", points: 0 },
        { canadianYears: 1, level: "one_year_post_secondary", points: 13 },
        { canadianYears: 1, level: "two_year_post_secondary", points: 25 },
        { canadianYears: 1, level: "bachelors", points: 25 },
        { canadianYears: 1, level: "two_or_more_degrees", points: 25 },
        { canadianYears: 1, level: "masters", points: 25 },
        { canadianYears: 1, level: "doctoral", points: 25 },
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
      minLanguagePoints: 16, // CLB 7 minimum
      minEducation: "secondary",
      minExperience: 1, // years
      minPoints: 67
    },
    CEC: {
      minLanguagePoints: {
        NOC_0_A: 16, // CLB 7 minimum
        NOC_B: 13    // CLB 5 minimum
      },
      minCanadianExperience: 1 // year
    },
    FST: {
      minLanguagePoints: {
        speaking: 13, // CLB 5 minimum
        listening: 13, // CLB 5 minimum
        reading: 7,    // CLB 4 minimum
        writing: 7     // CLB 4 minimum
      },
      minExperience: 2 // years
    }
  },
  cutOffScores: {
    FSW: 470,
    CEC: 458,
    FST: 375,
    PNP: 720,
    generalDraw: 490
  }
};

// Main CRS Dashboard Component
const CRSDashboard = () => {
  const [crsConfig, setCRSConfig] = useState(initialCRSConfig);
  const [activeTab, setActiveTab] = useState("Age");
  const [saveStatus, setSaveStatus] = useState("");
  
  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('crsConfig');
    if (savedConfig) {
      try {
        setCRSConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error loading saved CRS config:", e);
      }
    }
  }, []);

  // Tabs for different categories
  const tabs = [
    "Age", 
    "Education", 
    "Language", 
    "Work Experience", 
    "Transferability", 
    "Additional Points",
    "Program Requirements"
  ];

  // Generic handler for table row changes
  const handleTableRowChange = (section: string, subsection: string | null = null) => {
    return (rowIndex: number, key: string, value: any) => {
      setCRSConfig(prev => {
        const newConfig = {...prev};
        if (subsection) {
          newConfig[section][subsection][rowIndex][key] = value;
        } else {
          newConfig[section][rowIndex][key] = value;
        }
        return newConfig;
      });
    };
  };

  // Save the configuration
  const handleSave = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('crsConfig', JSON.stringify(crsConfig));
      
      // Simulate API call
      // In a real app, you'd make an actual API request here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus("Configuration saved successfully");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (e) {
      console.error("Error saving configuration:", e);
      setSaveStatus("Error saving configuration");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  // Reset to default configuration
  const handleReset = () => {
    setCRSConfig(initialCRSConfig);
    setSaveStatus("Configuration reset to defaults");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case "Age":
        return (
          <Card title="Age Points Configuration">
            <Table 
              headers={["Age", "With Spouse", "Without Spouse"]}
              data={crsConfig.agePoints}
              onRowChange={handleTableRowChange('agePoints')}
            />
            <p className="text-sm text-gray-500 mt-2">
              Note: Points are interpolated for ages between the values in the table.
            </p>
          </Card>
        );
      
      case "Education":
        return (
          <Card title="Education Points Configuration">
            <Table 
              headers={["Education Level", "With Spouse", "Without Spouse"]}
              data={crsConfig.educationPoints}
              onRowChange={handleTableRowChange('educationPoints')}
            />
            <p className="text-sm text-gray-500 mt-2">
              Note: Foreign education credentials should have an Educational Credential Assessment (ECA).
            </p>
          </Card>
        );
      
      case "Language":
        return (
          <>
            <Card title="Language Tests to CLB Conversion">
              <Tabs 
                tabs={["IELTS", "CELPIP", "TEF", "TCF"]} 
                activeTab="IELTS" 
                onTabChange={() => {}} // Not implemented - would show different test conversions
              />
              <div className="space-y-6">
                {['speaking', 'listening', 'reading', 'writing'].map(skill => (
                  <div key={skill}>
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">{skill}</h4>
                    <Table 
                      headers={["Test Score", "CLB Level"]}
                      data={crsConfig.languagePoints.firstLanguage.clbConversion.IELTS.find(s => Object.keys(s)[0] === skill)[skill].map((score, i) => (
                        { testScore: score, clbLevel: crsConfig.languagePoints.firstLanguage.clbConversion.IELTS[0].clb[i] }
                      ))}
                      onRowChange={() => {}} // Not implemented for this demo
                    />
                  </div>
                ))}
              </div>
            </Card>
            
            <Card title="First Official Language Points">
              <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.firstLanguage.points}
                onRowChange={handleTableRowChange('languagePoints', 'firstLanguage.points')}
              />
            </Card>
            
            <Card title="Second Official Language Points">
              <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.secondLanguage.points}
                onRowChange={handleTableRowChange('languagePoints', 'secondLanguage.points')}
              />
            </Card>
            
            <Card title="Spouse Language Points">
              <Table 
                headers={["Skill", "CLB 4", "CLB 5", "CLB 6", "CLB 7", "CLB 8", "CLB 9", "CLB 10+"]}
                data={crsConfig.languagePoints.firstLanguage.spousePoints}
                onRowChange={handleTableRowChange('languagePoints', 'firstLanguage.spousePoints')}
              />
            </Card>
          </>
        );
      
      case "Work Experience":
        return (
          <>
            <Card title="Foreign Work Experience Points">
              <Table 
                headers={["Years", "With Spouse", "Without Spouse"]}
                data={crsConfig.workExperiencePoints.foreign}
                onRowChange={handleTableRowChange('workExperiencePoints', 'foreign')}
              />
            </Card>
            
            <Card title="Canadian Work Experience Points">
              <Table 
                headers={["Years", "With Spouse", "Without Spouse"]}
                data={crsConfig.workExperiencePoints.canadian}
                onRowChange={handleTableRowChange('workExperiencePoints', 'canadian')}
              />
            </Card>
            
            <Card title="Spouse Work Experience Points">
              <Table 
                headers={["Years", "Points"]}
                data={crsConfig.workExperiencePoints.spouseExperience}
                onRowChange={handleTableRowChange('workExperiencePoints', 'spouseExperience')}
              />
            </Card>
          </>
        );
      
      case "Transferability":
        return (
          <>
            <Card title="Education + Language (CLB 7+) Transferability">
              <Table 
                headers={["Education Level", "Points"]}
                data={crsConfig.transferabilityPoints.education.clb7}
                onRowChange={handleTableRowChange('transferabilityPoints', 'education.clb7')}
              />
            </Card>
            
            <Card title="Education + Language (CLB 9+) Transferability">
              <Table 
                headers={["Education Level", "Points"]}
                data={crsConfig.transferabilityPoints.education.clb9}
                onRowChange={handleTableRowChange('transferabilityPoints', 'education.clb9')}
              />
            </Card>
            
            <Card title="Foreign Work Experience + Language (CLB 7+) Transferability">
              <Table 
                headers={["Years", "Points"]}
                data={crsConfig.transferabilityPoints.foreignWorkExperience.clb7}
                onRowChange={handleTableRowChange('transferabilityPoints', 'foreignWorkExperience.clb7')}
              />
            </Card>
            
            <Card title="Foreign Work Experience + Language (CLB 9+) Transferability">
              <Table 
                headers={["Years", "Points"]}
                data={crsConfig.transferabilityPoints.foreignWorkExperience.clb9}
                onRowChange={handleTableRowChange('transferabilityPoints', 'foreignWorkExperience.clb9')}
              />
            </Card>
            
            <Card title="Foreign + Canadian Work Experience Transferability">
              <Table 
                headers={["Canadian Years", "Foreign Years", "Points"]}
                data={crsConfig.transferabilityPoints.canadianWorkExperience.foreignExperience}
                onRowChange={handleTableRowChange('transferabilityPoints', 'canadianWorkExperience.foreignExperience')}
              />
            </Card>
            
            <Card title="Education + Canadian Work Experience Transferability">
              <Table 
                headers={["Canadian Years", "Education Level", "Points"]}
                data={crsConfig.transferabilityPoints.canadianWorkExperience.educationCombination}
                onRowChange={handleTableRowChange('transferabilityPoints', 'canadianWorkExperience.educationCombination')}
              />
            </Card>
          </>
        );
      
      case "Additional Points":
        return (
          <>
            <Card title="Canadian Education">
              <Table 
                headers={["Level", "Points"]}
                data={crsConfig.additionalPoints.canadianEducation}
                onRowChange={handleTableRowChange('additionalPoints', 'canadianEducation')}
              />
            </Card>
            
            <Card title="Other Additional Points">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Provincial Nomination" 
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
                    label="Arranged Employment (NOC 00)" 
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
                    label="Arranged Employment (NOC 0, A, B)" 
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
                    label="Canadian Sibling" 
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
                    label="French Language (NCLC 7+)" 
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
                    label="French (NCLC 7+) and English (CLB 4+)" 
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
      
      case "Program Requirements":
        return (
          <>
            <Card title="Minimum Requirements for FSW">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Minimum Language Points (CLB 7)" 
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
                  label="Minimum Education" 
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
                    { value: "less_than_secondary", label: "Less than Secondary" },
                    { value: "secondary", label: "Secondary" },
                    { value: "one_year_post_secondary", label: "One-year Post-secondary" },
                    { value: "two_year_post_secondary", label: "Two-year Post-secondary" },
                    { value: "bachelors", label: "Bachelor's Degree" },
                    { value: "masters", label: "Master's Degree" },
                    { value: "doctoral", label: "Doctoral Degree" },
                  ]}
                />
                <Input 
                  label="Minimum Experience (years)" 
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
                  label="Minimum Points" 
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
            
            <Card title="Minimum Requirements for CEC">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Minimum Language - NOC 0, A (CLB 7)" 
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
                  label="Minimum Language - NOC B (CLB 5)" 
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
                  label="Minimum Canadian Experience (years)" 
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
            
            <Card title="Minimum Requirements for FST">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Minimum Speaking (CLB 5)" 
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
                  label="Minimum Listening (CLB 5)" 
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
                  label="Minimum Reading (CLB 4)" 
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
                  label="Minimum Writing (CLB 4)" 
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
                  label="Minimum Experience (years)" 
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
            
            <Card title="Cut-off Scores">
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
                  label="General Draw" 
                  type="number"
                  value={crsConfig.cutOffScores.generalDraw}
                  onChange={(e) => setCRSConfig(prev => ({
                    ...prev,
                    cutOffScores: {
                      ...prev.cutOffScores,
                      generalDraw: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
            </Card>
          </>
        );
        
      default:
        return <div>Please select a tab</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">CRS Dashboard</h1>
          <p className="text-gray-600 mb-6">Configure parameters for the Comprehensive Ranking System calculator</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Save Configuration
            </Button>
            <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Reset to Defaults
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
