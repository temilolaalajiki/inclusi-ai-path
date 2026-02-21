export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accessibility_logs: {
        Row: {
          created_at: string
          feature_type: string
          feature_value: string | null
          id: string
          page_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: string
          feature_value?: string | null
          id?: string
          page_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          feature_value?: string | null
          id?: string
          page_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      accessibility_profiles: {
        Row: {
          assistive_devices_available: string[] | null
          assistive_devices_needed: string[] | null
          auditory_needs: string[] | null
          cognitive_needs: string[] | null
          created_at: string
          environmental_accommodations: string[] | null
          id: string
          language_support_needs: string[] | null
          learner_id: string
          notes: string | null
          physical_needs: string[] | null
          updated_at: string
          visual_needs: string[] | null
        }
        Insert: {
          assistive_devices_available?: string[] | null
          assistive_devices_needed?: string[] | null
          auditory_needs?: string[] | null
          cognitive_needs?: string[] | null
          created_at?: string
          environmental_accommodations?: string[] | null
          id?: string
          language_support_needs?: string[] | null
          learner_id: string
          notes?: string | null
          physical_needs?: string[] | null
          updated_at?: string
          visual_needs?: string[] | null
        }
        Update: {
          assistive_devices_available?: string[] | null
          assistive_devices_needed?: string[] | null
          auditory_needs?: string[] | null
          cognitive_needs?: string[] | null
          created_at?: string
          environmental_accommodations?: string[] | null
          id?: string
          language_support_needs?: string[] | null
          learner_id?: string
          notes?: string | null
          physical_needs?: string[] | null
          updated_at?: string
          visual_needs?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "accessibility_profiles_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: true
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_reasoning_logs: {
        Row: {
          ai_model: string
          confidence_score: number | null
          created_at: string
          data_sources_used: Json
          id: string
          learner_id: string
          reasoning_chain: Json
          recommendation_id: string | null
          rule_based_fallback: boolean | null
        }
        Insert: {
          ai_model: string
          confidence_score?: number | null
          created_at?: string
          data_sources_used?: Json
          id?: string
          learner_id: string
          reasoning_chain?: Json
          recommendation_id?: string | null
          rule_based_fallback?: boolean | null
        }
        Update: {
          ai_model?: string
          confidence_score?: number | null
          created_at?: string
          data_sources_used?: Json
          id?: string
          learner_id?: string
          reasoning_chain?: Json
          recommendation_id?: string | null
          rule_based_fallback?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_reasoning_logs_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_reasoning_logs_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_frameworks: {
        Row: {
          assessment_components: Json
          created_at: string
          examination_body: string | null
          excellence_mark: number
          framework_type: string
          grade_levels: string[]
          grading_scale: Json
          id: string
          name: string
          pass_mark: number
          subjects: string[]
          updated_at: string
          weighting: Json
        }
        Insert: {
          assessment_components?: Json
          created_at?: string
          examination_body?: string | null
          excellence_mark?: number
          framework_type: string
          grade_levels: string[]
          grading_scale?: Json
          id?: string
          name: string
          pass_mark?: number
          subjects: string[]
          updated_at?: string
          weighting?: Json
        }
        Update: {
          assessment_components?: Json
          created_at?: string
          examination_body?: string | null
          excellence_mark?: number
          framework_type?: string
          grade_levels?: string[]
          grading_scale?: Json
          id?: string
          name?: string
          pass_mark?: number
          subjects?: string[]
          updated_at?: string
          weighting?: Json
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          learner_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          learner_id: string
          notes?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          learner_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      class_capacity: {
        Row: {
          created_at: string
          current_count: number
          id: string
          max_capacity: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          id?: string
          max_capacity?: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_count?: number
          id?: string
          max_capacity?: number
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      curriculum_standards: {
        Row: {
          assessment_criteria: Json
          code: string
          competency_areas: string[] | null
          created_at: string
          examination_body: string
          grade_level: string
          id: string
          learning_objectives: Json
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          assessment_criteria?: Json
          code: string
          competency_areas?: string[] | null
          created_at?: string
          examination_body: string
          grade_level: string
          id?: string
          learning_objectives?: Json
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          assessment_criteria?: Json
          code?: string
          competency_areas?: string[] | null
          created_at?: string
          examination_body?: string
          grade_level?: string
          id?: string
          learning_objectives?: Json
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_usage_logs: {
        Row: {
          consent_given: boolean | null
          consent_required: boolean | null
          created_at: string
          data_fields: string[]
          data_type: string
          id: string
          processing_context: string | null
          purpose: string
          user_id: string
        }
        Insert: {
          consent_given?: boolean | null
          consent_required?: boolean | null
          created_at?: string
          data_fields: string[]
          data_type: string
          id?: string
          processing_context?: string | null
          purpose: string
          user_id: string
        }
        Update: {
          consent_given?: boolean | null
          consent_required?: boolean | null
          created_at?: string
          data_fields?: string[]
          data_type?: string
          id?: string
          processing_context?: string | null
          purpose?: string
          user_id?: string
        }
        Relationships: []
      }
      equity_metrics: {
        Row: {
          avg_recommendation_priority: number | null
          created_at: string
          demographic_category: string
          demographic_value: string
          id: string
          interventions_implemented: number
          metric_date: string
          recommendations_count: number
          resource_allocation_score: number | null
          success_rate: number | null
          total_learners: number
          updated_at: string
        }
        Insert: {
          avg_recommendation_priority?: number | null
          created_at?: string
          demographic_category: string
          demographic_value: string
          id?: string
          interventions_implemented?: number
          metric_date?: string
          recommendations_count?: number
          resource_allocation_score?: number | null
          success_rate?: number | null
          total_learners?: number
          updated_at?: string
        }
        Update: {
          avg_recommendation_priority?: number | null
          created_at?: string
          demographic_category?: string
          demographic_value?: string
          id?: string
          interventions_implemented?: number
          metric_date?: string
          recommendations_count?: number
          resource_allocation_score?: number | null
          success_rate?: number | null
          total_learners?: number
          updated_at?: string
        }
        Relationships: []
      }
      ethical_compliance_checks: {
        Row: {
          actions_taken: Json | null
          check_date: string
          check_type: string
          created_at: string
          findings: Json | null
          id: string
          resolved_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          actions_taken?: Json | null
          check_date?: string
          check_type: string
          created_at?: string
          findings?: Json | null
          id?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          actions_taken?: Json | null
          check_date?: string
          check_type?: string
          created_at?: string
          findings?: Json | null
          id?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: string | null
          recommendation_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: string | null
          recommendation_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: string | null
          recommendation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_curriculum_alignment: {
        Row: {
          alignment_status: string | null
          competency_progress: Json | null
          created_at: string
          curriculum_standard_id: string
          grade_level: string
          id: string
          last_assessment_date: string | null
          learner_id: string
          next_assessment_date: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          alignment_status?: string | null
          competency_progress?: Json | null
          created_at?: string
          curriculum_standard_id: string
          grade_level: string
          id?: string
          last_assessment_date?: string | null
          learner_id: string
          next_assessment_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          alignment_status?: string | null
          competency_progress?: Json | null
          created_at?: string
          curriculum_standard_id?: string
          grade_level?: string
          id?: string
          last_assessment_date?: string | null
          learner_id?: string
          next_assessment_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_curriculum_alignment_curriculum_standard_id_fkey"
            columns: ["curriculum_standard_id"]
            isOneToOne: false
            referencedRelation: "curriculum_standards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_curriculum_alignment_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_demographics: {
        Row: {
          access_to_technology: string | null
          created_at: string
          distance_to_school_km: number | null
          family_income_bracket: string | null
          guardian_education_level: string | null
          has_electricity: boolean | null
          has_internet_access: boolean | null
          household_size: number | null
          id: string
          learner_id: string
          lga: string | null
          location_type: string | null
          meals_per_day: number | null
          state: string | null
          transportation_method: string | null
          updated_at: string
        }
        Insert: {
          access_to_technology?: string | null
          created_at?: string
          distance_to_school_km?: number | null
          family_income_bracket?: string | null
          guardian_education_level?: string | null
          has_electricity?: boolean | null
          has_internet_access?: boolean | null
          household_size?: number | null
          id?: string
          learner_id: string
          lga?: string | null
          location_type?: string | null
          meals_per_day?: number | null
          state?: string | null
          transportation_method?: string | null
          updated_at?: string
        }
        Update: {
          access_to_technology?: string | null
          created_at?: string
          distance_to_school_km?: number | null
          family_income_bracket?: string | null
          guardian_education_level?: string | null
          has_electricity?: boolean | null
          has_internet_access?: boolean | null
          household_size?: number | null
          id?: string
          learner_id?: string
          lga?: string | null
          location_type?: string | null
          meals_per_day?: number | null
          state?: string | null
          transportation_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_demographics_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: true
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_documents: {
        Row: {
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          learner_id: string
          teacher_id: string
          uploaded_at: string
        }
        Insert: {
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          learner_id: string
          teacher_id: string
          uploaded_at?: string
        }
        Update: {
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          learner_id?: string
          teacher_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_documents_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          accessibility_needs: string[] | null
          created_at: string | null
          demographics: Json | null
          id: string
          learning_challenges: string[] | null
          teacher_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessibility_needs?: string[] | null
          created_at?: string | null
          demographics?: Json | null
          id?: string
          learning_challenges?: string[] | null
          teacher_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessibility_needs?: string[] | null
          created_at?: string | null
          demographics?: Json | null
          id?: string
          learning_challenges?: string[] | null
          teacher_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_materials: {
        Row: {
          content_text: string | null
          content_type: string
          created_at: string
          description: string | null
          external_url: string | null
          file_url: string | null
          grade_level: string
          id: string
          is_published: boolean
          metadata: Json | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          grade_level: string
          id?: string
          is_published?: boolean
          metadata?: Json | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          grade_level?: string
          id?: string
          is_published?: boolean
          metadata?: Json | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_accessed_at: string | null
          learner_id: string
          material_id: string
          progress_percent: number
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          learner_id: string
          material_id: string
          progress_percent?: number
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          learner_id?: string
          material_id?: string
          progress_percent?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_progress_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "learning_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      nigerian_learning_contexts: {
        Row: {
          community_support_level: string | null
          created_at: string
          cultural_considerations: string[] | null
          home_languages: string[] | null
          id: string
          language_proficiency: Json | null
          learner_id: string
          primary_language: string
          resource_constraints: string[] | null
          updated_at: string
        }
        Insert: {
          community_support_level?: string | null
          created_at?: string
          cultural_considerations?: string[] | null
          home_languages?: string[] | null
          id?: string
          language_proficiency?: Json | null
          learner_id: string
          primary_language?: string
          resource_constraints?: string[] | null
          updated_at?: string
        }
        Update: {
          community_support_level?: string | null
          created_at?: string
          cultural_considerations?: string[] | null
          home_languages?: string[] | null
          id?: string
          language_proficiency?: Json | null
          learner_id?: string
          primary_language?: string
          resource_constraints?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nigerian_learning_contexts_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: true
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_learner_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_learner_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_learner_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_learner_id_fkey"
            columns: ["related_learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_records: {
        Row: {
          assessment_date: string
          competency_scores: Json | null
          created_at: string | null
          curriculum_standard_id: string | null
          examination_body: string | null
          grade_level: string | null
          id: string
          learner_id: string
          notes: string | null
          score: number
          subject: string
        }
        Insert: {
          assessment_date: string
          competency_scores?: Json | null
          created_at?: string | null
          curriculum_standard_id?: string | null
          examination_body?: string | null
          grade_level?: string | null
          id?: string
          learner_id: string
          notes?: string | null
          score: number
          subject: string
        }
        Update: {
          assessment_date?: string
          competency_scores?: Json | null
          created_at?: string | null
          curriculum_standard_id?: string | null
          examination_body?: string | null
          grade_level?: string | null
          id?: string
          learner_id?: string
          notes?: string | null
          score?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_records_curriculum_standard_id_fkey"
            columns: ["curriculum_standard_id"]
            isOneToOne: false
            referencedRelation: "curriculum_standards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_records_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id: string
          last_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string
          id: string
          learner_id: string
          max_score: number | null
          quiz_id: string
          score: number | null
          started_at: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          learner_id: string
          max_score?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          max_score?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json | null
          order_index: number
          points: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          grade_level: string
          id: string
          is_published: boolean
          material_id: string | null
          pass_score: number
          subject: string
          teacher_id: string
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_level: string
          id?: string
          is_published?: boolean
          material_id?: string | null
          pass_score?: number
          subject: string
          teacher_id: string
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_level?: string
          id?: string
          is_published?: boolean
          material_id?: string | null
          pass_score?: number
          subject?: string
          teacher_id?: string
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "learning_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string | null
          description: string
          id: string
          implemented_at: string | null
          intervention_triggered: boolean | null
          learner_id: string
          priority: string | null
          recommendation_type: string
          status: string | null
          teacher_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          implemented_at?: string | null
          intervention_triggered?: boolean | null
          learner_id: string
          priority?: string | null
          recommendation_type: string
          status?: string | null
          teacher_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          implemented_at?: string | null
          intervention_triggered?: boolean | null
          learner_id?: string
          priority?: string | null
          recommendation_type?: string
          status?: string | null
          teacher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      state_education_policies: {
        Row: {
          created_at: string
          description: string
          effective_date: string | null
          id: string
          implementation_guidelines: string | null
          policy_name: string
          policy_type: string
          requirements: Json | null
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          effective_date?: string | null
          id?: string
          implementation_guidelines?: string | null
          policy_name: string
          policy_type: string
          requirements?: Json | null
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          effective_date?: string | null
          id?: string
          implementation_guidelines?: string | null
          policy_name?: string
          policy_type?: string
          requirements?: Json | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_feedback: {
        Row: {
          category: string
          created_at: string
          feedback_text: string
          id: string
          learner_id: string
          teacher_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          feedback_text: string
          id?: string
          learner_id: string
          teacher_id: string
        }
        Update: {
          category?: string
          created_at?: string
          feedback_text?: string
          id?: string
          learner_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_feedback_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_training: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          teacher_id: string
          training_description: string | null
          training_title: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          teacher_id: string
          training_description?: string | null
          training_title: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          teacher_id?: string
          training_description?: string | null
          training_title?: string
        }
        Relationships: []
      }
      training_resources: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string | null
          duration: string
          id: string
          resource_url: string | null
          target_skills: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level?: string | null
          duration: string
          id?: string
          resource_url?: string | null
          target_skills?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string | null
          duration?: string
          id?: string
          resource_url?: string | null
          target_skills?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          teacher_id: string
          training_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          teacher_id: string
          training_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          teacher_id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_reviews_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_data_consent: {
        Row: {
          ai_processing_consent: boolean | null
          analytics_consent: boolean | null
          consent_date: string | null
          created_at: string
          demographic_sharing_consent: boolean | null
          id: string
          research_participation_consent: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_processing_consent?: boolean | null
          analytics_consent?: boolean | null
          consent_date?: string | null
          created_at?: string
          demographic_sharing_consent?: boolean | null
          id?: string
          research_participation_consent?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_processing_consent?: boolean | null
          analytics_consent?: boolean | null
          consent_date?: string | null
          created_at?: string
          demographic_sharing_consent?: boolean | null
          id?: string
          research_participation_consent?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_attendance_rate: {
        Args: { _days?: number; _learner_id: string }
        Returns: number
      }
      get_low_attendance_learners: {
        Args: { _days?: number; _teacher_id: string; _threshold?: number }
        Returns: {
          absent_days: number
          attendance_rate: number
          learner_id: string
          total_days: number
        }[]
      }
      get_overcrowded_classes: {
        Args: never
        Returns: {
          current_count: number
          max_capacity: number
          overflow: number
          teacher_id: string
          utilization_rate: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_class_counts: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "learner" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["learner", "teacher", "admin"],
    },
  },
} as const
