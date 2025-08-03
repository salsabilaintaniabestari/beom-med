import React, { useEffect, useState } from 'react';
import { Users, Pill, FileText, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DoctorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    myPatients: 0,
    activeMedications: 0,
    todaySchedules: 0,
    complianceRate: 0,
  });

  useEffect(() => {
    fetchDoctorData();
  }, [userProfile]);

  const fetchDoctorData = async () => {
    if (!userProfile) return;

    try {
      // Fetch patients under this doctor
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_doctor_id', userProfile.id);

      // Fetch active medications for doctor's patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .eq('assigned_doctor_id', userProfile.id);

      const patientIds = patients?.map(p => p.id) || [];

      if (patientIds.length > 0) {
        const { count: medicationsCount } = await supabase
          .from('medications')
          .select('*', { count: 'exact', head: true })
          .in('patient_id', patientIds)
          .eq('is_active', true);

        setStats(prev => ({
          ...prev,
          myPatients: patientsCount || 0,
          activeMedications: medicationsCount || 0,
        }));
      } else {
        setStats(prev => ({
          ...prev,
          myPatients: 0,
          activeMedications: 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Dokter</h1>
        <p className="text-gray-600 mt-2">Pantau pasien dan konsumsi obat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pasien Saya"
          value={stats.myPatients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Obat Aktif"
          value={stats.activeMedications}
          icon={Pill}
          color="green"
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={stats.todaySchedules}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Tingkat Kepatuhan"
          value={`${stats.complianceRate}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pasien Terbaru</h3>
        <div className="text-gray-500 text-center py-8">
          Data pasien akan ditampilkan di sini
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;