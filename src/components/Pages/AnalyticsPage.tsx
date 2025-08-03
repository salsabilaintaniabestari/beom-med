import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AnalyticsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [medicationData, setMedicationData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [userProfile]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for demonstration
      const mockComplianceData = [
        { name: 'Senin', diminum: 85, terlewat: 15 },
        { name: 'Selasa', diminum: 92, terlewat: 8 },
        { name: 'Rabu', diminum: 78, terlewat: 22 },
        { name: 'Kamis', diminum: 95, terlewat: 5 },
        { name: 'Jumat', diminum: 88, terlewat: 12 },
        { name: 'Sabtu', diminum: 82, terlewat: 18 },
        { name: 'Minggu', diminum: 90, terlewat: 10 },
      ];

      const mockMedicationData = [
        { name: 'Paracetamol', value: 35, fill: '#14b8a6' },
        { name: 'Amoxicillin', value: 25, fill: '#1e3a8a' },
        { name: 'Ibuprofen', value: 20, fill: '#06b6d4' },
        { name: 'Vitamin D', value: 15, fill: '#8b5cf6' },
        { name: 'Lainnya', value: 5, fill: '#f97316' },
      ];

      const mockTrendData = [
        { bulan: 'Jan', kepatuhan: 78 },
        { bulan: 'Feb', kepatuhan: 82 },
        { bulan: 'Mar', kepatuhan: 85 },
        { bulan: 'Apr', kepatuhan: 88 },
        { bulan: 'May', kepatuhan: 92 },
        { bulan: 'Jun', kepatuhan: 89 },
      ];

      setComplianceData(mockComplianceData);
      setMedicationData(mockMedicationData);
      setTrendData(mockTrendData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const getPageTitle = () => {
    switch (userProfile?.role) {
      case 'administrator':
        return 'Analisis Konsumsi Obat';
      case 'dokter':
        return 'Analisis Kepatuhan';
      case 'pasien':
        return 'Analisis Konsumsi Saya';
      default:
        return 'Analisis';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
        <p className="text-gray-600 mt-2">Visualisasi data dan tren konsumsi obat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kepatuhan Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="diminum" stackId="a" fill="#14b8a6" name="Diminum" radius={[4, 4, 0, 0]} />
              <Bar dataKey="terlewat" stackId="a" fill="#f87171" name="Terlewat" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Obat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={medicationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {medicationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {medicationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Kepatuhan 6 Bulan Terakhir</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Kepatuhan']} />
            <Line 
              type="monotone" 
              dataKey="kepatuhan" 
              stroke="#1e3a8a" 
              strokeWidth={3}
              dot={{ fill: '#1e3a8a', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#14b8a6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-2">Kepatuhan Rata-rata</h4>
          <div className="text-3xl font-bold text-teal-600">87%</div>
          <p className="text-sm text-gray-600 mt-1">+5% dari bulan lalu</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-2">Obat Paling Sering Terlewat</h4>
          <div className="text-lg font-bold text-orange-600">Vitamin D</div>
          <p className="text-sm text-gray-600 mt-1">22% tingkat terlewat</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-2">Waktu Terbaik</h4>
          <div className="text-lg font-bold text-green-600">Pagi</div>
          <p className="text-sm text-gray-600 mt-1">95% tingkat kepatuhan</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;