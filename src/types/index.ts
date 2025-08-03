export interface User {
  id: string;
  email: string;
  role: 'administrator' | 'dokter' | 'pasien';
  full_name: string;
  created_at: string;
}

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  address: string;
  medical_condition: string;
  emergency_contact: string;
  assigned_doctor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: number; // times per day
  duration_days: number;
  instructions: string;
  prescribed_by: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  scheduled_time: string;
  is_taken: boolean;
  taken_at?: string;
  notes?: string;
  created_at: string;
}

export interface ConsumptionLog {
  id: string;
  patient_id: string;
  medication_id: string;
  scheduled_time: string;
  actual_time?: string;
  status: 'taken' | 'missed' | 'late';
  notes?: string;
  created_at: string;
}