import React, { useEffect, useState } from 'react';
import { Pill, Calendar, Clock, CheckCircle } from 'lucide-react';
import StatCard from './StatCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    todayMedications: 0,
    completedToday: 0,
    missedMedications: 0,
    complianceRate: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    fetchPatientData();
  }, [userProfile]);

  const fetchPatientData = async () => {
    if (!userProfile) return;

    try {
      // Get patient data
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('email', userProfile.email)
        .single();

      if (!patient) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch today's schedules
      const { data: schedules } = await supabase
        .from('medication_schedules')
        .select(`
          *,
          medications:medication_id (
            medication_name,
            dosage,
            instructions
          )
        `)
        .gte('scheduled_time', today)
        .lt('scheduled_time', `${today}T23:59:59`);

      const totalToday = schedules?.length || 0;
      const completedToday = schedules?.filter(s => s.is_taken).length || 0;

      setStats({
        todayMedications: totalToday,
        completedToday,
        missedMedications: totalToday - completedToday,
        complianceRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100,
      });

      setTodaySchedule(schedules || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const markAsTaken = async (scheduleId: string) => {
    try {
      await supabase
        .from('medication_schedules')
        .update({ 
          is_taken: true, 
          taken_at: new Date().toISOString() 
        })
        .eq('id', scheduleId);

      fetchPatientData();
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Pasien</h1>
        <p className="text-gray-600 mt-2">Pantau jadwal obat dan kepatuhan konsumsi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Obat Hari Ini"
          value={stats.todayMedications}
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="Sudah Diminum"
          value={stats.completedToday}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Terlewat"
          value={stats.missedMedications}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Tingkat Kepatuhan"
          value={`${stats.complianceRate}%`}
          icon={Calendar}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Obat Hari Ini</h3>
        <div className="space-y-3">
          {todaySchedule.length > 0 ? (
            todaySchedule.map((schedule) => (
              <div
                key={schedule.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  schedule.is_taken
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    schedule.is_taken ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {schedule.medications?.medication_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {schedule.medications?.dosage} - {new Date(schedule.scheduled_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {!schedule.is_taken && (
                  <button
                    onClick={() => markAsTaken(schedule.id)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Tandai Diminum
                  </button>
                )}
                
                {schedule.is_taken && (
                  <span className="text-green-600 font-medium">Sudah Diminum</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada jadwal obat hari ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;