import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Home, DollarSign, Accessibility, Languages } from "lucide-react";

interface EnhancedLearnerProfileProps {
  learnerId: string;
  nigerianContext?: any;
  demographics?: any;
  accessibilityProfile?: any;
}

export const EnhancedLearnerProfile = ({ 
  nigerianContext, 
  demographics, 
  accessibilityProfile 
}: EnhancedLearnerProfileProps) => {
  return (
    <Tabs defaultValue="context" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="context">
          <Languages className="h-4 w-4 mr-2" />
          Nigerian Context
        </TabsTrigger>
        <TabsTrigger value="demographics">
          <Home className="h-4 w-4 mr-2" />
          Demographics
        </TabsTrigger>
        <TabsTrigger value="accessibility">
          <Accessibility className="h-4 w-4 mr-2" />
          Accessibility
        </TabsTrigger>
      </TabsList>

      <TabsContent value="context" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language & Cultural Context</CardTitle>
            <CardDescription>Multilingual support and cultural considerations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nigerianContext ? (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Primary Language</p>
                  <Badge variant="secondary">{nigerianContext.primary_language}</Badge>
                </div>
                
                {nigerianContext.home_languages?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Home Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {nigerianContext.home_languages.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {nigerianContext.language_proficiency && (
                  <div>
                    <p className="text-sm font-medium mb-2">Language Proficiency</p>
                    <div className="space-y-1 text-sm">
                      {Object.entries(nigerianContext.language_proficiency).map(([lang, level]: [string, any]) => (
                        <div key={lang} className="flex justify-between">
                          <span className="capitalize">{lang}:</span>
                          <Badge variant="outline" className="capitalize">{level}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {nigerianContext.resource_constraints?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Resource Constraints</p>
                    <div className="flex flex-wrap gap-2">
                      {nigerianContext.resource_constraints.map((constraint: string, idx: number) => (
                        <Badge key={idx} variant="destructive">{constraint}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {nigerianContext.cultural_considerations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Cultural Considerations</p>
                    <div className="flex flex-wrap gap-2">
                      {nigerianContext.cultural_considerations.map((item: string, idx: number) => (
                        <Badge key={idx}>{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">Community Support Level</p>
                  <Badge variant="secondary" className="capitalize">{nigerianContext.community_support_level}</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No Nigerian context data available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="demographics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Socioeconomic Demographics</CardTitle>
            <CardDescription>Family and living situation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demographics ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {demographics.household_size && (
                    <div>
                      <p className="text-sm font-medium mb-1">Household Size</p>
                      <p className="text-sm text-muted-foreground">{demographics.household_size} members</p>
                    </div>
                  )}
                  
                  {demographics.guardian_education_level && (
                    <div>
                      <p className="text-sm font-medium mb-1">Guardian Education</p>
                      <Badge variant="outline">{demographics.guardian_education_level}</Badge>
                    </div>
                  )}
                  
                  {demographics.family_income_bracket && (
                    <div>
                      <p className="text-sm font-medium mb-1">Income Bracket</p>
                      <Badge variant="outline">{demographics.family_income_bracket}</Badge>
                    </div>
                  )}
                  
                  {demographics.access_to_technology && (
                    <div>
                      <p className="text-sm font-medium mb-1">Technology Access</p>
                      <Badge variant="outline">{demographics.access_to_technology}</Badge>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {demographics.location_type && (
                    <div>
                      <p className="text-sm font-medium mb-1">Location Type</p>
                      <p className="text-sm text-muted-foreground capitalize">{demographics.location_type}</p>
                    </div>
                  )}
                  
                  {demographics.state && (
                    <div>
                      <p className="text-sm font-medium mb-1">State</p>
                      <p className="text-sm text-muted-foreground">{demographics.state}</p>
                    </div>
                  )}
                  
                  {demographics.distance_to_school_km && (
                    <div>
                      <p className="text-sm font-medium mb-1">Distance to School</p>
                      <p className="text-sm text-muted-foreground">{demographics.distance_to_school_km} km</p>
                    </div>
                  )}
                  
                  {demographics.transportation_method && (
                    <div>
                      <p className="text-sm font-medium mb-1">Transportation</p>
                      <Badge variant="outline">{demographics.transportation_method}</Badge>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium mb-1">Electricity</p>
                    <Badge variant={demographics.has_electricity ? "default" : "secondary"}>
                      {demographics.has_electricity ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Internet Access</p>
                    <Badge variant={demographics.has_internet_access ? "default" : "secondary"}>
                      {demographics.has_internet_access ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  {demographics.meals_per_day && (
                    <div>
                      <p className="text-sm font-medium mb-1">Meals per Day</p>
                      <p className="text-sm text-muted-foreground">{demographics.meals_per_day}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No demographic data available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="accessibility" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comprehensive Accessibility Profile</CardTitle>
            <CardDescription>Detailed accessibility needs and accommodations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessibilityProfile ? (
              <>
                {accessibilityProfile.visual_needs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Visual Needs</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.visual_needs.map((need: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {accessibilityProfile.auditory_needs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Auditory Needs</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.auditory_needs.map((need: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {accessibilityProfile.physical_needs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Physical Needs</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.physical_needs.map((need: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {accessibilityProfile.cognitive_needs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Cognitive Needs</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.cognitive_needs.map((need: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {accessibilityProfile.language_support_needs?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Language Support Needs</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.language_support_needs.map((need: string, idx: number) => (
                        <Badge key={idx}>{need}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {accessibilityProfile.assistive_devices_available?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Devices Available</p>
                      <div className="flex flex-wrap gap-2">
                        {accessibilityProfile.assistive_devices_available.map((device: string, idx: number) => (
                          <Badge key={idx} variant="default">{device}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {accessibilityProfile.assistive_devices_needed?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Devices Needed</p>
                      <div className="flex flex-wrap gap-2">
                        {accessibilityProfile.assistive_devices_needed.map((device: string, idx: number) => (
                          <Badge key={idx} variant="outline">{device}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {accessibilityProfile.environmental_accommodations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Environmental Accommodations</p>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityProfile.environmental_accommodations.map((acc: string, idx: number) => (
                        <Badge key={idx} variant="outline">{acc}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {accessibilityProfile.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Additional Notes</p>
                    <p className="text-sm text-muted-foreground">{accessibilityProfile.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No accessibility profile data available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
