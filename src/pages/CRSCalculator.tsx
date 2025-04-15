import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreImprovementCards } from "@/components/ScoreImprovementCards";

const CRSCalculator = () => {
  const [firstLanguage, setFirstLanguage] = useState("english");
  const [firstLanguageScore, setFirstLanguageScore] = useState("");
  const [secondLanguageScore, setSecondLanguageScore] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [canadianWorkExperience, setCanadianWorkExperience] = useState("");
  const [age, setAge] = useState("");
  const [spouseEducationLevel, setSpouseEducationLevel] = useState("");
  const [spouseLanguageScore, setSpouseLanguageScore] = useState("");
  const [spouseCanadianWorkExperience, setSpouseCanadianWorkExperience] =
    useState("");
  const [hasJobOffer, setHasJobOffer] = useState(false);
  const [hasNomination, setHasNomination] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [eligiblePrograms, setEligiblePrograms] = useState<string[]>([]);

  useEffect(() => {
    calculateTotalPoints();
  }, [
    firstLanguageScore,
    secondLanguageScore,
    educationLevel,
    canadianWorkExperience,
    age,
    spouseEducationLevel,
    spouseLanguageScore,
    spouseCanadianWorkExperience,
    hasJobOffer,
    hasNomination,
  ]);

  const calculateTotalPoints = () => {
    let points = 0;

    // Language Proficiency (First Language)
    points += parseInt(firstLanguageScore || "0");

    // Language Proficiency (Second Language)
    points += parseInt(secondLanguageScore || "0");

    // Education
    switch (educationLevel) {
      case "secondary":
        points += 22;
        break;
      case "one-year":
        points += 15;
        break;
      case "two-year":
        points += 19;
        break;
      case "bachelor":
        points += 120;
        break;
      case "two-or-more-degrees":
        points += 128;
        break;
      case "masters":
        points += 135;
        break;
      case "phd":
        points += 150;
        break;
      default:
        break;
    }

    // Canadian Work Experience
    switch (canadianWorkExperience) {
      case "one-year":
        points += 40;
        break;
      case "two-years":
        points += 53;
        break;
      case "three-years":
        points += 64;
        break;
      case "four-years":
        points += 72;
        break;
      case "five-years":
        points += 80;
        break;
      default:
        break;
    }

    // Age
    const ageValue = parseInt(age || "0");
    if (ageValue >= 18 && ageValue <= 35) {
      points += 100;
    } else if (ageValue === 17 || ageValue === 36) {
      points += 95;
    } else if (ageValue === 16 || ageValue === 37) {
      points += 90;
    } else if (ageValue === 15 || ageValue === 38) {
      points += 85;
    } else if (ageValue === 14 || ageValue === 39) {
      points += 80;
    } else if (ageValue === 40) {
      points += 75;
    } else if (ageValue === 41) {
      points += 70;
    } else if (ageValue === 42) {
      points += 65;
    } else if (ageValue === 43) {
      points += 60;
    } else if (ageValue === 44) {
      points += 55;
    } else if (ageValue === 45) {
      points += 50;
    } else if (ageValue === 46) {
      points += 45;
    } else if (ageValue === 47) {
      points += 40;
    } else if (ageValue >= 48) {
      points += 0;
    }

    // Spouse Factors
    switch (spouseEducationLevel) {
      case "secondary":
        points += 2;
        break;
      case "one-year":
        points += 6;
        break;
      case "two-year":
        points += 7;
        break;
      case "bachelor":
        points += 10;
        break;
      case "two-or-more-degrees":
        points += 11;
        break;
      case "masters":
        points += 12;
        break;
      case "phd":
        points += 13;
        break;
      default:
        break;
    }

    points += parseInt(spouseLanguageScore || "0");

    switch (spouseCanadianWorkExperience) {
      case "one-year":
        points += 5;
        break;
      case "two-years":
        points += 8;
        break;
      case "three-years":
        points += 11;
        break;
      case "four-years":
        points += 14;
        break;
      case "five-years":
        points += 15;
        break;
      default:
        break;
    }

    // Additional Points
    if (hasJobOffer) {
      points += 50;
    }

    if (hasNomination) {
      points += 600;
    }

    setTotalPoints(points);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotalPoints();
    setShowResults(true);

    let programs: string[] = [];
    if (totalPoints >= 400) {
      programs.push("Federal Skilled Worker Program (FSWP)");
    }
    if (totalPoints >= 350) {
      programs.push("Canadian Experience Class (CEC)");
    }
    setEligiblePrograms(programs);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="container mx-auto mt-8 p-8">
        <div className="mb-6">
          <Label htmlFor="firstLanguage" className="block text-sm font-medium">
            First Official Language
          </Label>
          <RadioGroup
            defaultValue="english"
            className="mt-2"
            onValueChange={setFirstLanguage}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="english" id="r1" />
              <Label htmlFor="r1">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="french" id="r2" />
              <Label htmlFor="r2">French</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mb-6">
          <Label
            htmlFor="firstLanguageScore"
            className="block text-sm font-medium"
          >
            First Language Score (CLB)
          </Label>
          <Input
            type="number"
            id="firstLanguageScore"
            className="mt-1 p-2 w-full"
            value={firstLanguageScore}
            onChange={(e) => setFirstLanguageScore(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Label
            htmlFor="secondLanguageScore"
            className="block text-sm font-medium"
          >
            Second Language Score (CLB)
          </Label>
          <Input
            type="number"
            id="secondLanguageScore"
            className="mt-1 p-2 w-full"
            value={secondLanguageScore}
            onChange={(e) => setSecondLanguageScore(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="educationLevel" className="block text-sm font-medium">
            Education Level
          </Label>
          <Select onValueChange={setEducationLevel}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="secondary">Secondary (high school)</SelectItem>
              <SelectItem value="one-year">One-year degree</SelectItem>
              <SelectItem value="two-year">Two-year degree</SelectItem>
              <SelectItem value="bachelor">Bachelor's degree</SelectItem>
              <SelectItem value="two-or-more-degrees">
                Two or more degrees
              </SelectItem>
              <SelectItem value="masters">Master's degree</SelectItem>
              <SelectItem value="phd">Ph.D.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label
            htmlFor="canadianWorkExperience"
            className="block text-sm font-medium"
          >
            Canadian Work Experience (Years)
          </Label>
          <Select onValueChange={setCanadianWorkExperience}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select work experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="one-year">1 Year</SelectItem>
              <SelectItem value="two-years">2 Years</SelectItem>
              <SelectItem value="three-years">3 Years</SelectItem>
              <SelectItem value="four-years">4 Years</SelectItem>
              <SelectItem value="five-years">5+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label htmlFor="age" className="block text-sm font-medium">
            Age
          </Label>
          <Input
            type="number"
            id="age"
            className="mt-1 p-2 w-full"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Label
            htmlFor="spouseEducationLevel"
            className="block text-sm font-medium"
          >
            Spouse Education Level
          </Label>
          <Select onValueChange={setSpouseEducationLevel}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="secondary">Secondary (high school)</SelectItem>
              <SelectItem value="one-year">One-year degree</SelectItem>
              <SelectItem value="two-year">Two-year degree</SelectItem>
              <SelectItem value="bachelor">Bachelor's degree</SelectItem>
              <SelectItem value="two-or-more-degrees">
                Two or more degrees
              </SelectItem>
              <SelectItem value="masters">Master's degree</SelectItem>
              <SelectItem value="phd">Ph.D.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label
            htmlFor="spouseLanguageScore"
            className="block text-sm font-medium"
          >
            Spouse Language Score (CLB)
          </Label>
          <Input
            type="number"
            id="spouseLanguageScore"
            className="mt-1 p-2 w-full"
            value={spouseLanguageScore}
            onChange={(e) => setSpouseLanguageScore(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Label
            htmlFor="spouseCanadianWorkExperience"
            className="block text-sm font-medium"
          >
            Spouse Canadian Work Experience (Years)
          </Label>
          <Select onValueChange={setSpouseCanadianWorkExperience}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select work experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="one-year">1 Year</SelectItem>
              <SelectItem value="two-years">2 Years</SelectItem>
              <SelectItem value="three-years">3 Years</SelectItem>
              <SelectItem value="four-years">4 Years</SelectItem>
              <SelectItem value="five-years">5+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasJobOffer"
              checked={hasJobOffer}
              onCheckedChange={setHasJobOffer}
            />
            <Label htmlFor="hasJobOffer">Has Job Offer</Label>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasNomination"
              checked={hasNomination}
              onCheckedChange={setHasNomination}
            />
            <Label htmlFor="hasNomination">Has Nomination</Label>
          </div>
        </div>

        <Button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Calculate
        </Button>
      </form>

      {showResults && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <Table>
            <TableCaption>
              Comprehensive Ranking System (CRS) Score
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Category</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Language Proficiency
                </TableCell>
                <TableCell>{firstLanguageScore}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">Education</TableCell>
                <TableCell>{educationLevel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Canadian Work Experience
                </TableCell>
                <TableCell>{canadianWorkExperience}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">Age</TableCell>
                <TableCell>{age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Spouse Education
                </TableCell>
                <TableCell>{spouseEducationLevel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Spouse Language
                </TableCell>
                <TableCell>{spouseLanguageScore}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Spouse Canadian Work Experience
                </TableCell>
                <TableCell>{spouseCanadianWorkExperience}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Job Offer
                </TableCell>
                <TableCell>{hasJobOffer ? "Yes" : "No"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Provincial Nomination
                </TableCell>
                <TableCell>{hasNomination ? "Yes" : "No"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-right">
                  Total Points
                </TableCell>
                <TableCell>{totalPoints}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">
              Eligible Programs:
            </h3>
            <ul>
              {eligiblePrograms.map((program, index) => (
                <li key={index}>{program}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Agregar la sección de recomendaciones después de la comparación de puntajes */}
      {showResults && (
        <div className="mt-8">
          <ScoreImprovementCards
            englishScore={Number(firstLanguageScore)}
            frenchScore={Number(secondLanguageScore)}
            spouseLanguageScore={Number(spouseLanguageScore)}
            totalScore={Number(totalPoints)}
            eligiblePrograms={eligiblePrograms}
            lastDrawScore={445} // Este valor debería ser dinámico basado en el último draw
          />
        </div>
      )}
    </div>
  );
};

export default CRSCalculator;
