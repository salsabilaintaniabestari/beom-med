import React, { useEffect, useState } from 'react';
import { Users, Pill, Calendar, Activity } from 'lucide-react';
import StatCard from './StatCard';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeMedications: 0,
    activeSchedules: 0,
    complianceRate: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch patients count
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch active medications count
      const { count: medicationsCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch today's schedules count
      const today = new Date().toISOString().split('T')[0];
      const { count: schedulesCount } = await supabase
        .from('medication_schedules')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_time', today)
        .lt('scheduled_time', `${today}T23:59:59`);

      // Calculate compliance rate
      const { data: consumptionData } = await supabase
        .from('consumption_logs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalLogs = consumptionData?.length || 0;
      const takenLogs = consumptionData?.filter(log => log.status === 'taken').length || 0;
      const complianceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

      setStats({
        totalPatients: patientsCount || 0,
        activeMedications: medicationsCount || 0,
        activeSchedules: schedulesCount || 0,
        complianceRate,
      });

      // Generate mock chart data for demonstration
      const mockChartData = [
        { name: 'Sen', konsumsi: 85 },
        { name: 'Sel', konsumsi: 92 },
        { name: 'Rab', konsumsi: 78 },
        { name: 'Kam', konsumsi: 95 },
        { name: 'Jum', konsumsi: 88 },
        { name: 'Sab', konsumsi: 82 },
        { name: 'Min', konsumsi: 90 },
      ];
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrator</h1>
        <p className="text-gray-600 mt-2">Ringkasan sistem pengingat obat rumah sakit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pasien"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Obat Aktif"
          value={stats.activeMedications}
          icon={Pill}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={stats.activeSchedules}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Tingkat Kepatuhan"
          value={`${stats.complianceRate}%`}
          icon={Activity}
          color="orange"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Konsumsi Obat Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="konsumsi" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Kepatuhan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="konsumsi" stroke="#1e3a8a" strokeWidth={3} dot={{ fill: '#1e3a8a', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;