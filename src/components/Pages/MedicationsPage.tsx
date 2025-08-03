import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Medication, Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MedicationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [medications, setMedications] = useState<any[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: 1,
    duration_days: 7,
    instructions: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    fetchMedications();
    fetchPatients();
  }, []);

  const fetchMedications = async () => {
    try {
      let query = supabase
        .from('medications')
        .select(`
          *,
          patients:patient_id (
            full_name,
            email
          )
        `);
      
      // If user is a doctor, only show medications for their patients
      if (userProfile?.role === 'dokter') {
        const { data: doctorPatients } = await supabase
          .from('patients')
          .select('id')
          .eq('assigned_doctor_id', userProfile.id);
        
        const patientIds = doctorPatients?.map(p => p.id) || [];
        query = query.in('patient_id', patientIds);
      }
      
      const { data, error } = await query
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      let query = supabase.from('patients').select('*');
      
      if (userProfile?.role === 'dokter') {
        query = query.eq('assigned_doctor_id', userProfile.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + formData.duration_days);
      
      const medicationData = {
        ...formData,
        end_date: endDate.toISOString().split('T')[0],
        prescribed_by: userProfile?.full_name || '',
      };

      if (editingMedication) {
        const { error } = await supabase
          .from('medications')
          .update(medicationData)
          .eq('id', editingMedication.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('medications')
          .insert([medicationData])
          .select()
          .single();
        
        if (error) throw error;
        
        // Create medication schedules
        await createMedicationSchedules(data);
      }

      resetForm();
      fetchMedications();
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const createMedicationSchedules = async (medication: Medication) => {
    const schedules = [];
    const startDate = new Date(medication.start_date);
    const endDate = new Date(medication.end_date);
    
    // Create daily schedules based on frequency
    const hoursInterval = 24 / medication.frequency;
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (let i = 0; i < medication.frequency; i++) {
        const scheduleTime = new Date(date);
        scheduleTime.setHours(8 + (i * hoursInterval), 0, 0, 0);
        
        schedules.push({
          medication_id: medication.id,
          scheduled_time: scheduleTime.toISOString(),
          is_taken: false,
        });
      }
    }
    
    if (schedules.length > 0) {
      const { error } = await supabase
        .from('medication_schedules')
        .insert(schedules);
      
      if (error) throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      medication_name: '',
      dosage: '',
      frequency: 1,
      duration_days: 7,
      instructions: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
    setShowAddForm(false);
    setEditingMedication(null);
  };

  const filteredMedications = medications.filter(med =>
    med.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {userProfile?.role === 'administrator' ? 'Manajemen Obat & Jadwal' : 'Data Obat & Jadwal'}
          </h1>
          <p className="text-gray-600 mt-2">Kelola obat dan jadwal pengingat pasien</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          <span>Tambah Obat</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari obat atau pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingMedication ? 'Edit Obat' : 'Tambah Obat Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pasien
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Pasien</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Obat
                  </label>
                  <input
                    type="text"
                    value={formData.medication_name}
                    onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosis
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frekuensi (per hari)
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={1}>1x sehari</option>
                    <option value={2}>2x sehari</option>
                    <option value={3}>3x sehari</option>
                    <option value={4}>4x sehari</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi (hari)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruksi Penggunaan
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Diminum setelah makan"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {editingMedication ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-800">Pasien</th>
                  <th className="pb-3 font-semibold text-gray-800">Obat</th>
                  <th className="pb-3 font-semibold text-gray-800">Dosis</th>
                  <th className="pb-3 font-semibold text-gray-800">Frekuensi</th>
                  <th className="pb-3 font-semibold text-gray-800">Durasi</th>
                  <th className="pb-3 font-semibold text-gray-800">Status</th>
                  <th className="pb-3 font-semibold text-gray-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedications.map((medication) => (
                  <tr key={medication.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {medication.patients?.full_name}
                    </td>
                    <td className="py-4 text-gray-600">{medication.medication_name}</td>
                    <td className="py-4 text-gray-600">{medication.dosage}</td>
                    <td className="py-4 text-gray-600">{medication.frequency}x/hari</td>
                    <td className="py-4 text-gray-600">{medication.duration_days} hari</td>
                    <td className="py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        medication.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {medication.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMedications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data obat
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationsPage;