import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const PatientsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    medical_condition: '',
    emergency_contact: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      let query = supabase.from('patients').select('*');
      
      // If user is a doctor, only show their patients
      if (userProfile?.role === 'dokter') {
        query = query.eq('assigned_doctor_id', userProfile.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', editingPatient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([{
            ...formData,
            assigned_doctor_id: userProfile?.role === 'dokter' ? userProfile.id : null,
          }]);
        if (error) throw error;
      }

      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      medical_condition: '',
      emergency_contact: '',
    });
    setShowAddForm(false);
    setEditingPatient(null);
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone,
      birth_date: patient.birth_date,
      address: patient.address,
      medical_condition: patient.medical_condition,
      emergency_contact: patient.emergency_contact,
    });
    setEditingPatient(patient);
    setShowAddForm(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pasien ini?')) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);
      
      if (error) throw error;
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {userProfile?.role === 'administrator' ? 'Manajemen Pasien' : 'Data Pasien'}
          </h1>
          <p className="text-gray-600 mt-2">Kelola data pasien dan informasi medis</p>
        </div>
        
        {userProfile?.role === 'administrator' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            <span>Tambah Pasien</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={20} />
          <span>Filter</span>
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingPatient ? 'Edit Pasien' : 'Tambah Pasien Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kondisi Medis
                </label>
                <textarea
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontak Darurat
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {editingPatient ? 'Update' : 'Simpan'}
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
                  <th className="pb-3 font-semibold text-gray-800">Nama</th>
                  <th className="pb-3 font-semibold text-gray-800">Email</th>
                  <th className="pb-3 font-semibold text-gray-800">Telepon</th>
                  <th className="pb-3 font-semibold text-gray-800">Kondisi Medis</th>
                  {userProfile?.role === 'administrator' && (
                    <th className="pb-3 font-semibold text-gray-800">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">{patient.full_name}</td>
                    <td className="py-4 text-gray-600">{patient.email}</td>
                    <td className="py-4 text-gray-600">{patient.phone}</td>
                    <td className="py-4 text-gray-600">{patient.medical_condition}</td>
                    {userProfile?.role === 'administrator' && (
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data pasien
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;