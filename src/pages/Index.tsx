
import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Canada Express Entry CRS Calculator Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive tool for immigration professionals and applicants to calculate and manage 
            Comprehensive Ranking System (CRS) scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-blue-600"></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                CRS Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                A customizable admin panel to configure and maintain all parameters that affect 
                the CRS calculation. Perfect for immigration consultants to stay current with 
                policy changes.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update age, education, and language points</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Configure test score to CLB equivalency tables</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Maintain cut-off scores and program requirements</span>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  to="/dashboard" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-green-600"></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                CRS Calculator
              </h2>
              <p className="text-gray-600 mb-6">
                An intuitive calculator that helps applicants determine their CRS score based 
                on the latest scoring criteria. Includes detailed breakdowns and eligibility checks.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Calculate core, spouse, and transferability points</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Check eligibility for FSW, CEC, and FST programs</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Compare your score to recent draw cut-offs</span>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  to="/calculator" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Start Calculating
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500">
            Stay up-to-date with the latest Canadian immigration requirements and maximize your CRS score.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
