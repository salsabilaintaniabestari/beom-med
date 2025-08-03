/*
  # BeomMed Hospital Medication Reminder System - Database Schema

  1. New Tables
    - `users` - User accounts with role-based access (administrator, dokter, pasien)
    - `patients` - Patient information and medical data
    - `medications` - Medication prescriptions for patients
    - `medication_schedules` - Daily medication timing schedules
    - `consumption_logs` - Log of medication consumption tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Ensure data privacy and security compliance

  3. Features
    - Multi-role authentication system
    - Patient-doctor relationships
    - Medication scheduling and tracking
    - Consumption analytics and reporting
*/

-- Users table for role-based authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text CHECK (role IN ('administrator', 'dokter', 'pasien')) NOT NULL DEFAULT 'pasien',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  birth_date date NOT NULL,
  address text NOT NULL,
  medical_condition text NOT NULL,
  emergency_contact text NOT NULL,
  assigned_doctor_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency integer NOT NULL DEFAULT 1, -- times per day
  duration_days integer NOT NULL DEFAULT 7,
  instructions text NOT NULL,
  prescribed_by text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medication schedules table
CREATE TABLE IF NOT EXISTS medication_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  is_taken boolean DEFAULT false,
  taken_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Consumption logs table for analytics
CREATE TABLE IF NOT EXISTS consumption_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  actual_time timestamptz,
  status text CHECK (status IN ('taken', 'missed', 'late')) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for patients table
CREATE POLICY "Admins can manage all patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'administrator'
    )
  );

CREATE POLICY "Doctors can manage their patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dokter'
      AND (patients.assigned_doctor_id = users.id OR patients.assigned_doctor_id IS NULL)
    )
  );

CREATE POLICY "Patients can read own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM users WHERE id = auth.uid()));

-- RLS Policies for medications table
CREATE POLICY "Admins can manage all medications"
  ON medications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'administrator'
    )
  );

CREATE POLICY "Doctors can manage medications for their patients"
  ON medications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN patients ON patients.assigned_doctor_id = users.id
      WHERE users.id = auth.uid() 
      AND users.role = 'dokter'
      AND patients.id = medications.patient_id
    )
  );

CREATE POLICY "Patients can read own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients 
      JOIN users ON users.email = patients.email
      WHERE users.id = auth.uid() 
      AND patients.id = medications.patient_id
    )
  );

-- RLS Policies for medication_schedules table
CREATE POLICY "Admins can manage all schedules"
  ON medication_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'administrator'
    )
  );

CREATE POLICY "Doctors can manage schedules for their patients"
  ON medication_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN patients ON patients.assigned_doctor_id = users.id
      JOIN medications ON medications.patient_id = patients.id
      WHERE users.id = auth.uid() 
      AND users.role = 'dokter'
      AND medications.id = medication_schedules.medication_id
    )
  );

CREATE POLICY "Patients can manage own schedules"
  ON medication_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients 
      JOIN users ON users.email = patients.email
      JOIN medications ON medications.patient_id = patients.id
      WHERE users.id = auth.uid() 
      AND medications.id = medication_schedules.medication_id
    )
  );

-- RLS Policies for consumption_logs table
CREATE POLICY "Admins can read all consumption logs"
  ON consumption_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'administrator'
    )
  );

CREATE POLICY "Doctors can read logs for their patients"
  ON consumption_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN patients ON patients.assigned_doctor_id = users.id
      WHERE users.id = auth.uid() 
      AND users.role = 'dokter'
      AND patients.id = consumption_logs.patient_id
    )
  );

CREATE POLICY "Patients can read own consumption logs"
  ON consumption_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients 
      JOIN users ON users.email = patients.email
      WHERE users.id = auth.uid() 
      AND patients.id = consumption_logs.patient_id
    )
  );

CREATE POLICY "System can insert consumption logs"
  ON consumption_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_schedules_medication ON medication_schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON medication_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_consumption_patient ON consumption_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_consumption_medication ON consumption_logs(medication_id);

-- Functions for automatic consumption log creation
CREATE OR REPLACE FUNCTION create_consumption_log()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_taken = true AND OLD.is_taken = false THEN
    INSERT INTO consumption_logs (
      patient_id,
      medication_id,
      scheduled_time,
      actual_time,
      status
    )
    SELECT 
      m.patient_id,
      NEW.medication_id,
      NEW.scheduled_time,
      NEW.taken_at,
      CASE 
        WHEN NEW.taken_at <= NEW.scheduled_time + INTERVAL '30 minutes' THEN 'taken'
        ELSE 'late'
      END
    FROM medications m
    WHERE m.id = NEW.medication_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic consumption logging
DROP TRIGGER IF EXISTS trigger_create_consumption_log ON medication_schedules;
CREATE TRIGGER trigger_create_consumption_log
  AFTER UPDATE OF is_taken ON medication_schedules
  FOR EACH ROW
  EXECUTE FUNCTION create_consumption_log();