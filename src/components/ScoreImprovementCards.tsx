
import { Link } from "react-router-dom"
import { Book, GraduationCap, FileCheck, Users, Award, Calculator, BookOpen } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RecommendationProps {
  englishScore?: number
  frenchScore?: number
  spouseLanguageScore?: number
  totalScore: number
  eligiblePrograms: string[]
  lastDrawScore?: number
}

export function ScoreImprovementCards({
  englishScore,
  frenchScore,
  spouseLanguageScore,
  totalScore,
  eligiblePrograms,
  lastDrawScore
}: RecommendationProps) {
  const recommendations = []

  // Verificar puntaje de inglés
  if (englishScore && englishScore < 8) {
    recommendations.push({
      title: "Mejora tu Inglés con CELPIP",
      description: "Prepárate para el examen CELPIP y aumenta tus posibilidades de éxito",
      icon: <Book className="h-6 w-6" />,
      link: "https://www.planeta-immiland-education.com/store-celpip-preparation"
    })
  }

  // Solo francés sin inglés mínimo
  if (frenchScore && (!englishScore || englishScore < 5)) {
    recommendations.push({
      title: "Aprende Inglés",
      description: "Incrementa tus puntos aprendiendo inglés con nuestros programas especializados",
      icon: <GraduationCap className="h-6 w-6" />,
      link: "https://www.planeta-immiland-education.com/programas-ingles"
    })
  }

  // Puntaje competitivo
  if (eligiblePrograms.length > 0 && lastDrawScore && (totalScore >= lastDrawScore - 50)) {
    recommendations.push({
      title: "¡Comienza tu Proceso!",
      description: "Tu puntaje es competitivo. Inicia tu proceso de inmigración con nosotros",
      icon: <Award className="h-6 w-6" />,
      link: "https://flow.immiland.app/flow/4e52566e-eefe-41e4-8123-5d51910c9402"
    })
  }

  // Elegible pero puntos bajos
  if (eligiblePrograms.length > 0 && lastDrawScore && (totalScore < lastDrawScore - 50)) {
    recommendations.push({
      title: "Consulta Migratoria",
      description: "Agenda una consulta para explorar cómo mejorar tu perfil",
      icon: <Calculator className="h-6 w-6" />,
      link: "https://en.immilandcanada.com/migration/consultations"
    })
  }

  // Proceso por sí mismo
  recommendations.push({
    title: "Revisión Previa",
    description: "Asegura tu aplicación con nuestro servicio de revisión previa",
    icon: <FileCheck className="h-6 w-6" />,
    link: "https://en.immilandcanada.com/migration/revision-previa-a-envio"
  })

  recommendations.push({
    title: "Guía de Aplicación",
    description: "Obtén nuestra guía detallada para aplicar por ti mismo",
    icon: <BookOpen className="h-6 w-6" />,
    link: "https://en.immilandcanada.com/migration/other-services"
  })

  // Recomendaciones para la pareja
  if (spouseLanguageScore !== undefined && spouseLanguageScore < 7) {
    recommendations.push({
      title: "Mejora el Idioma de tu Pareja",
      description: "Cursos de inglés y francés disponibles para maximizar sus puntos",
      icon: <Users className="h-6 w-6" />,
      links: {
        english: "https://www.planeta-immiland-education.com/programas-ingles",
        french: "https://www.planeta-immiland-education.com/cursos-frances"
      }
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Recomendaciones Personalizadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  {rec.icon}
                </div>
                <CardTitle className="text-xl">{rec.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">{rec.description}</CardDescription>
              {'links' in rec ? (
                <div className="space-y-2">
                  <Link 
                    to={rec.links.english}
                    className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Curso de Inglés
                  </Link>
                  <Link 
                    to={rec.links.french}
                    className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Curso de Francés
                  </Link>
                </div>
              ) : (
                <Link 
                  to={rec.link}
                  className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Más Información
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
